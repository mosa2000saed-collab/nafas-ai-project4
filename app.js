// Nafas School Sustainability Platform - Core App Controller
document.addEventListener("DOMContentLoaded", () => {
    NafasApp.init();
});

const NafasApp = (() => {
    let currentPanel = "overview";
    let activeLeaderboardTab = "student";
    let charts = {};
    let loadedImage = null; // Holds the uploaded image element
    let currentAiResult = null; // Holds current simulated analysis

    function init() {
        // Apply initial configurations
        updateNavigationForRole();
        navigate("landing");
        bindEvents();
        initUIElements();
    }

    // Adapt Sidebar Tabs Visibility based on Role Permissions
    function updateNavigationForRole() {
        const currentUser = NafasAuth.getCurrentUser();
        const role = currentUser ? currentUser.role : null;

        document.querySelectorAll(".sidebar-menu-item").forEach(item => {
            const allowedRoles = item.getAttribute("data-role-view");
            if (allowedRoles === "all") {
                item.style.display = "block";
            } else if (currentUser && allowedRoles.includes(role)) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });

        // Hide/Show Admin Actions in tables
        const isAdmin = role === "role_admin";
        document.querySelectorAll(".admin-only-action").forEach(el => {
            el.style.display = isAdmin ? "table-cell" : "none";
        });
    }

    // Main Router View Switcher
    function navigate(screen) {
        const landingSec = document.getElementById("landingSection");
        const dashboardSec = document.getElementById("dashboardSection");
        const currentUser = NafasAuth.getCurrentUser();

        if (screen === "landing") {
            landingSec.style.display = "block";
            dashboardSec.style.display = "none";
            
            // Topbar buttons state sync
            if (currentUser) {
                document.getElementById("btnNavLogin").style.display = "none";
                document.getElementById("btnNavDash").style.display = "inline-flex";
            } else {
                document.getElementById("btnNavLogin").style.display = "inline-flex";
                document.getElementById("btnNavDash").style.display = "none";
            }
            // Hide chatbot on landing
            document.getElementById("aiChatbotWrapper").style.display = "none";
        } else if (screen === "dashboard") {
            if (!currentUser) {
                openModal("loginModal");
                return;
            }
            landingSec.style.display = "none";
            dashboardSec.style.display = "flex";

            // Show chatbot in dashboard
            document.getElementById("aiChatbotWrapper").style.display = "block";

            // Sync user details in sidebar
            document.getElementById("userAvatar").textContent = currentUser.name.charAt(0);
            document.getElementById("userDisplayName").textContent = currentUser.name;
            document.getElementById("userDisplayRole").textContent = NafasData.t(currentUser.role);

            // Populate components
            updateNavigationForRole();
            switchPanel("overview");
        }
    }

    // Dashboard Subpanel Switcher
    function switchPanel(panelId) {
        currentPanel = panelId;

        // Sync sidebar active highlight
        document.querySelectorAll(".sidebar-menu-item").forEach(item => {
            item.classList.remove("active");
            const linkPanel = item.querySelector("a").getAttribute("data-panel");
            if (linkPanel === panelId) item.classList.add("active");
        });

        // Toggle panel DIV visibility
        document.querySelectorAll(".dash-panel").forEach(panel => {
            panel.classList.remove("active");
        });
        const targetPanel = document.getElementById(`panel-${panelId}`);
        if (targetPanel) targetPanel.classList.add("active");

        // Set navbar title
        document.getElementById("currentPanelTitle").textContent = NafasData.t(`nav_${panelId}`);

        // Trigger specific panel loaders
        if (panelId === "overview") loadOverviewPanel();
        if (panelId === "heatmap") loadHeatmapPanel();
        if (panelId === "upload") loadUploadPanel();
        if (panelId === "analytics") setTimeout(loadAnalyticsCharts, 100);
        if (panelId === "recommendations") loadRecommendationsPanel();
        if (panelId === "leaderboard") loadLeaderboardPanel();
        if (panelId === "history") loadHistoryPanel();
        if (panelId === "admin") loadAdminPanel();
        if (panelId === "settings") loadSettingsPanel();

        // Collapse sidebar on mobile viewports after selecting
        document.getElementById("sidebar").classList.remove("active");
    }

    // Initialize generic UI details
    function initUIElements() {
        // Sync theme toggles icons
        updateThemeToggleIcons();

        // Populate search dropdowns inside History
        populateHistoryFilters();

        // Chatbot initial message state
        resetChatLogs();
    }

    // Attach Event Listeners
    function bindEvents() {
        // Screen navigations
        document.querySelectorAll("[data-target]").forEach(elem => {
            elem.addEventListener("click", (e) => {
                e.preventDefault();
                navigate(elem.getAttribute("data-target"));
            });
        });

        // Tab panels navigation
        document.querySelectorAll(".sidebar-menu a").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const panel = link.getAttribute("data-panel");
                if (panel) switchPanel(panel);
            });
        });

        // Mobile sidebar trigger
        document.getElementById("mobileMenuToggle").addEventListener("click", () => {
            document.getElementById("sidebar").classList.toggle("active");
        });

        // Theme Switchers
        document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const currentTheme = document.documentElement.getAttribute("data-theme");
                const newTheme = currentTheme === "dark" ? "light" : "dark";
                document.documentElement.setAttribute("data-theme", newTheme);
                localStorage.setItem("nafas_theme", newTheme);
                updateThemeToggleIcons();
                // re-render charts to fit the colors
                if (currentPanel === "analytics") loadAnalyticsCharts();
            });
        });

        // Language Switchers
        document.querySelectorAll(".lang-toggle-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const newLang = NafasI18n.getLang() === "ar" ? "en" : "ar";
                NafasI18n.setLang(newLang);
                
                // Toggle lang text display
                document.querySelectorAll(".lang-toggle-btn span").forEach(s => {
                    s.textContent = newLang === "ar" ? "English" : "العربية";
                });

                // Update current view text headings
                document.getElementById("currentPanelTitle").textContent = NafasData.t(`nav_${currentPanel}`);
                if (currentPanel === "overview") loadOverviewPanel();
                if (currentPanel === "heatmap") loadHeatmapPanel();
                if (currentPanel === "upload") loadUploadPanel();
                if (currentPanel === "analytics") loadAnalyticsCharts();
                if (currentPanel === "recommendations") loadRecommendationsPanel();
                if (currentPanel === "leaderboard") loadLeaderboardPanel();
                if (currentPanel === "history") loadHistoryPanel();
                if (currentPanel === "admin") loadAdminPanel();
                if (currentPanel === "settings") loadSettingsPanel();
            });
        });

        // Modal overlay clicks (close modal on background click)
        document.querySelectorAll(".modal-overlay").forEach(overlay => {
            overlay.addEventListener("click", (e) => {
                if (e.target === overlay) closeModal(overlay.id);
            });
        });

        // Authentication Submission Forms
        document.getElementById("loginForm").addEventListener("submit", handleLoginSubmit);
        document.getElementById("passwordResetForm").addEventListener("submit", handlePasswordResetSubmit);
        document.getElementById("registerForm").addEventListener("submit", handleRegisterSubmit);

        // SVG Heatmap click listeners
        document.querySelectorAll(".svg-block-group").forEach(group => {
            group.addEventListener("click", () => {
                const area = group.getAttribute("data-area");
                selectHeatmapArea(area);
            });
        });

        // SVG heatmap controls
        document.querySelectorAll("[data-heatmap-view]").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll("[data-heatmap-view]").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                loadHeatmapPanel();
            });
        });

        // Image scan simulation triggers
        document.getElementById("imageFileInput").addEventListener("change", handleCustomImageUpload);
        document.getElementById("btnRunAiAnalysis").addEventListener("click", handleRunAiScan);
        document.getElementById("btnSaveAiReport").addEventListener("click", handleSaveAiReport);

        // Chatbot widgets controls
        document.getElementById("btnAiChatbotToggle").addEventListener("click", () => {
            document.getElementById("aiChatbotWrapper").classList.toggle("active");
        });
        document.getElementById("btnAiChatbotClose").addEventListener("click", () => {
            document.getElementById("aiChatbotWrapper").classList.remove("active");
        });
        document.getElementById("chatbotInputForm").addEventListener("submit", handleChatSubmit);

        // History Filters dropdowns
        document.getElementById("filterArea").addEventListener("change", loadHistoryPanel);
        document.getElementById("filterUser").addEventListener("change", loadHistoryPanel);
        document.getElementById("filterWaste").addEventListener("change", loadHistoryPanel);

        // Admin Panel CRUD Form
        document.getElementById("adminUserForm").addEventListener("submit", handleAdminSaveUser);
        document.getElementById("adminSearchUser").addEventListener("input", loadAdminPanel);

        // Preferences Form Save
        document.getElementById("userPreferencesForm").addEventListener("submit", handleSavePreferences);
    }

    // Helper: Toast alert trigger
    function showToast(messageKey, type = "success", customStr = "") {
        const message = customStr || NafasData.t(messageKey);
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast glass ${type}`;
        
        let icon = "fa-circle-check";
        if (type === "error") icon = "fa-circle-exclamation";
        if (type === "info") icon = "fa-circle-info";

        toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);

        // Auto remove animation
        setTimeout(() => {
            toast.style.animation = "slide-down-bounce 0.35s reverse forwards";
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    // Sync theme icons
    function updateThemeToggleIcons() {
        const theme = document.documentElement.getAttribute("data-theme");
        document.querySelectorAll(".theme-toggle-btn i").forEach(icon => {
            icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
        });
    }

    // Fill Quick Login credentials on modals click
    window.quickFill = (email, password) => {
        document.getElementById("loginEmail").value = email;
        document.getElementById("loginPassword").value = password;
    };

    // Switch between Login and Register tabs inside the auth modal
    window.switchAuthTab = (tab) => {
        const loginPanel  = document.getElementById("loginFormPanel");
        const regPanel    = document.getElementById("registerFormPanel");
        const tabLoginBtn = document.getElementById("tabLoginBtn");
        const tabRegBtn   = document.getElementById("tabRegisterBtn");

        // Clear any previous errors
        document.getElementById("loginErrorText").style.display    = "none";
        document.getElementById("registerErrorText").style.display  = "none";

        if (tab === "login") {
            loginPanel.style.display  = "block";
            regPanel.style.display    = "none";
            tabLoginBtn.classList.add("active");
            tabRegBtn.classList.remove("active");
        } else {
            loginPanel.style.display  = "none";
            regPanel.style.display    = "block";
            tabRegBtn.classList.add("active");
            tabLoginBtn.classList.remove("active");
        }
    };

    // Simulate clicking and demoing a review from landing page
    window.simulateQuickDemo = () => {
        NafasAuth.login("student@nafas.edu", "student123");
        navigate("dashboard");
        switchPanel("history");
        showToast("welcome", "info", "تم استعراض البيانات بنجاح باستخدام حساب زائر افتراضي.");
    };

    // =======================================================
    // AUTHENTICATION LOGIC WRAPPERS
    // =======================================================
    function handleLoginSubmit(e) {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const pass = document.getElementById("loginPassword").value;
        const err = document.getElementById("loginErrorText");

        err.style.display = "none";

        const res = NafasAuth.login(email, pass);
        if (res.success) {
            closeModal("loginModal");
            document.getElementById("loginForm").reset();

            if (res.forcePasswordReset) {
                // Display reset overlay on top
                document.getElementById("resetReasonDesc").textContent = NafasData.t(
                    res.user.oneTimeAccess ? "oneTimeLoginNotice" : "firstLoginDesc"
                );
                document.getElementById("passwordResetOverlay").style.display = "flex";
            } else {
                showToast("welcome", "success", `${NafasData.t("welcome")}, ${res.user.name}!`);
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 800);
            }
        } else {
            err.textContent = NafasData.t("invalidCredentials");
            err.style.display = "block";
        }
    }

    function handlePasswordResetSubmit(e) {
        e.preventDefault();
        const newPass = document.getElementById("resetPassword").value;
        const confPass = document.getElementById("resetConfirmPassword").value;
        const err = document.getElementById("resetErrorText");

        err.style.display = "none";

        if (newPass !== confPass) {
            err.textContent = NafasData.t("passwordsDontMatch");
            err.style.display = "block";
            return;
        }

        if (newPass.length < 6) {
            err.textContent = NafasData.t("passwordTooShort");
            err.style.display = "block";
            return;
        }

        const res = NafasAuth.changePassword(newPass);
        if (res.success) {
            document.getElementById("passwordResetForm").reset();
            document.getElementById("passwordResetOverlay").style.display = "none";
            showToast("settings_saved", "success", "تم تحديث كلمة المرور الشخصية وتفعيل الحساب!");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 800);
        } else {
            err.textContent = "Error updating password.";
            err.style.display = "block";
        }
    }

    // Handle new user self-registration (Admin / Teacher only)
    function handleRegisterSubmit(e) {
        e.preventDefault();

        const name     = document.getElementById("regName").value.trim();
        const email    = document.getElementById("regEmail").value.trim();
        const role     = document.getElementById("regRole").value;
        const password = document.getElementById("regPassword").value;
        const confirm  = document.getElementById("regConfirm").value;
        const err      = document.getElementById("registerErrorText");

        err.style.display = "none";

        // Client-side validation
        if (password !== confirm) {
            err.textContent = NafasI18n.t("passwordsDontMatch");
            err.style.display = "block";
            return;
        }
        if (password.length < 6) {
            err.textContent = NafasI18n.t("passwordTooShort");
            err.style.display = "block";
            return;
        }

        const res = NafasAuth.register(name, email, password, role);

        if (res.success) {
            // Close modal, reset form, redirect to dashboard instantly
            closeModal("loginModal");
            document.getElementById("registerForm").reset();
            switchAuthTab("login"); // reset tab for next open

            showToast("register_success", "success", `${NafasI18n.t("register_success")} ${res.user.name}!`);
            navigate("dashboard");
        } else {
            err.textContent = NafasI18n.t(res.error) || res.error;
            err.style.display = "block";
        }
    }

    function logout() {
        NafasAuth.logout();
        navigate("landing");
        showToast("logout", "info", "تم تسجيل خروجك بأمان من النظام.");
    }
    window.logout = logout;

    // =======================================================
    // OVERVIEW PANEL RENDERING
    // =======================================================
    function loadOverviewPanel() {
        const score = NafasData.getScore();
        const scoreLvl = NafasData.getScoreLevel();

        // 1. Update Radial Indicator
        document.getElementById("scoreTextValue").textContent = score;
        const progressCircle = document.getElementById("scoreProgressCircle");
        const radius = progressCircle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;

        // Change color based on severity
        const levelColors = {
            score_excellent: "#10b981",
            score_good: "#eab308",
            score_needs_improvement: "#f97316",
            score_critical: "#ef4444"
        };
        progressCircle.style.stroke = levelColors[scoreLvl] || "#10b981";

        const badge = document.getElementById("scoreLevelBadge");
        badge.className = `score-level-badge ${scoreLvl.replace("score_", "")}`;
        badge.textContent = NafasData.t(scoreLvl);

        // 2. Cleanliness Stars
        const avgScore = NafasData.getCleanlinessAverage();
        document.getElementById("cleanlinessAverageValue").textContent = avgScore.toFixed(1);
        
        const starsContainer = document.getElementById("cleanlinessStarsContainer");
        starsContainer.innerHTML = "";
        const roundedStars = Math.round(avgScore);
        for (let i = 1; i <= 5; i++) {
            const starIcon = document.createElement("i");
            starIcon.className = i <= roundedStars ? "fas fa-star" : "far fa-star";
            starsContainer.appendChild(starIcon);
        }

        // 3. Worst Area & Dominant Trash
        const worstArea = NafasData.getMostPolluted();
        document.getElementById("mostPollutedAreaText").textContent = NafasData.t(worstArea);

        const dominantTrash = NafasData.getDominantWaste();
        document.getElementById("dominantWasteText").textContent = NafasData.t(dominantTrash);

        // 4. Counts
        const todayStr = new Date().toDateString();
        const reportsToday = NafasData.getReports().filter(r => new Date(r.date).toDateString() === todayStr);
        document.getElementById("reportsTodayCount").textContent = reportsToday.length;
        document.getElementById("imagesScannedCount").textContent = reportsToday.length; // 1 scan = 1 report in MVP

        // 5. Daily Alerts list
        const alertsList = document.getElementById("dashAlertsList");
        alertsList.innerHTML = "";
        
        // Let's generate daily alerts based on area report scores
        const areas = ["area_yard", "area_classrooms", "area_cafeteria", "area_hallways", "area_restrooms"];
        let totalAlerts = 0;
        
        areas.forEach(area => {
            const areaReports = NafasData.getReports().filter(r => r.area === area);
            if (areaReports.length > 0) {
                const latest = areaReports[0];
                const cleanIndex = latest.aiRating || latest.manualRating;
                if (cleanIndex < 3.0) {
                    totalAlerts++;
                    const alertDiv = document.createElement("div");
                    alertDiv.className = "alert-row";
                    alertDiv.innerHTML = `
                        <i class="fas fa-triangle-exclamation"></i>
                        <div>
                            <strong>${NafasData.t("alert_polluted")} ${NafasData.t(area)}:</strong> 
                            ${latest.notes || "تراكم المخلفات بشكل مرتفع يحتاج صيانة وتنظيف عاجل."}
                            <span class="alert-time">${new Date(latest.date).toLocaleTimeString(NafasI18n.getLang() === 'ar' ? 'ar-SA' : 'en-US', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    `;
                    alertsList.appendChild(alertDiv);
                }
            }
        });

        if (totalAlerts === 0) {
            alertsList.innerHTML = `
                <div class="detail-placeholder" style="min-height: 100px;">
                    <i class="fas fa-circle-check text-primary" style="font-size: 2rem;"></i>
                    <p data-i18n="no_alerts_today">${NafasData.t("no_alerts_today")}</p>
                </div>
            `;
        }

        // 6. Recent Action Logs
        const logsBody = document.getElementById("dashActivityLogs");
        logsBody.innerHTML = "";
        const logs = NafasData.getAuditLogs().slice(0, 5);
        logs.forEach(log => {
            const dateStr = new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="color: var(--text-muted); font-size: 0.75rem;">${dateStr}</td>
                <td style="font-weight: 700;">${log.user.split('@')[0]}</td>
                <td>${log.action}</td>
            `;
            logsBody.appendChild(tr);
        });
    }

    // =======================================================
    // HEATMAP PANEL RENDERING
    // =======================================================
    function loadHeatmapPanel() {
        const reports = NafasData.getReports();
        const viewMode = document.querySelector("[data-heatmap-view].active").getAttribute("data-heatmap-view");

        // Filter reports by time window
        const now = Date.now();
        let timeLimit = now - 24 * 60 * 60 * 1000; // Daily default
        if (viewMode === "weekly") timeLimit = now - 7 * 24 * 60 * 60 * 1000;
        if (viewMode === "monthly") timeLimit = now - 30 * 24 * 60 * 60 * 1000;

        const filteredReports = reports.filter(r => new Date(r.date).getTime() >= timeLimit);

        const areas = ["area_yard", "area_classrooms", "area_cafeteria", "area_hallways", "area_restrooms"];

        areas.forEach(area => {
            const areaReports = filteredReports.filter(r => r.area === area);
            const block = document.getElementById(`block-${area}`);
            
            if (block) {
                // Clear existing color classes
                block.classList.remove("clean", "attention", "polluted");
                
                if (areaReports.length > 0) {
                    let totalRating = 0;
                    areaReports.forEach(r => totalRating += (r.aiRating || r.manualRating));
                    const avgRating = totalRating / areaReports.length;

                    // Color thresholds
                    if (avgRating >= 4.0) block.classList.add("clean");
                    else if (avgRating >= 2.5) block.classList.add("attention");
                    else block.classList.add("polluted");
                } else {
                    // Default to clean if no recent reports
                    block.classList.add("clean");
                }
            }
        });

        // Reset detail card
        const cardPlaceholder = document.querySelector("#heatmapDetailCard .detail-placeholder");
        const cardContent = document.querySelector("#heatmapDetailCard .detail-content");
        cardPlaceholder.style.display = "flex";
        cardContent.style.display = "none";
    }

    function selectHeatmapArea(area) {
        const cardPlaceholder = document.querySelector("#heatmapDetailCard .detail-placeholder");
        const cardContent = document.querySelector("#heatmapDetailCard .detail-content");
        
        cardPlaceholder.style.display = "none";
        cardContent.style.display = "block";

        const allReports = NafasData.getReports();
        const areaReports = allReports.filter(r => r.area === area);

        // Compute averages
        let totalScore = 0;
        let totalPollution = 0;
        areaReports.forEach(r => {
            totalScore += (r.aiRating || r.manualRating);
            totalPollution += r.pollutionPercent;
        });

        const avgScore = areaReports.length > 0 ? (totalScore / areaReports.length).toFixed(1) : "5.0";
        const avgPollution = areaReports.length > 0 ? Math.round(totalPollution / areaReports.length) : 0;

        document.getElementById("detailAreaName").textContent = NafasData.t(area);
        document.getElementById("detailAvgRating").textContent = `${avgScore}★`;
        document.getElementById("detailTotalReports").textContent = areaReports.length;
        document.getElementById("detailPollutionPercent").textContent = `${avgPollution}%`;

        // Status Badge
        const statusBadge = document.getElementById("detailCleanlinessStatus");
        statusBadge.className = "score-level-badge";
        const avgScoreNum = parseFloat(avgScore);
        if (avgScoreNum >= 4.0) {
            statusBadge.classList.add("clean");
            statusBadge.textContent = NafasData.t("status_clean");
        } else if (avgScoreNum >= 2.5) {
            statusBadge.classList.add("attention");
            statusBadge.textContent = NafasData.t("status_attention");
        } else {
            statusBadge.classList.add("polluted");
            statusBadge.textContent = NafasData.t("status_polluted");
        }

        // List reports
        const reportsList = document.getElementById("detailReportsList");
        reportsList.innerHTML = "";
        
        const recent = areaReports.slice(0, 3);
        if (recent.length === 0) {
            reportsList.innerHTML = `<li style="font-size:0.75rem; color:var(--text-muted); text-align:center;">No reports logs found</li>`;
        } else {
            recent.forEach(r => {
                const li = document.createElement("li");
                li.className = "detail-report-item";
                li.innerHTML = `
                    <span>${r.submittedBy.split('@')[0]}</span>
                    <span>${(r.aiRating || r.manualRating).toFixed(1)}★</span>
                `;
                reportsList.appendChild(li);
            });
        }
    }

    window.simulateHistoricalComparison = () => {
        showToast("view_history", "info", "جاري مقارنة بيانات الشهر الحالي بالأشهر الـ 3 السابقة لإعداد التقارير السنوية...");
    };

    // =======================================================
    // SCAN & UPLOAD AI SIMULATOR
    // =======================================================
    function loadUploadPanel() {
        // Reset states
        loadedImage = null;
        currentAiResult = null;
        document.getElementById("fileNameLabel").textContent = NafasData.t("upload_btn");
        document.getElementById("manualNotesInput").value = "";
        
        // Hide/Show outputs
        document.getElementById("aiAnalysisOutputPanel").style.display = "none";
        document.getElementById("canvasViewportContainer").style.display = "flex";
        document.getElementById("emptyCanvasPlaceholder").style.display = "block";
        document.getElementById("aiCanvas").style.display = "none";
        document.getElementById("aiScanningLoader").style.display = "none";
    }

    window.selectPresetMock = (type) => {
        const select = document.getElementById("uploadAreaSelect");
        select.value = `area_${type}`;
        
        // Preset titles mapping
        const filenames = {
            yard: "school_yard_recess.jpg",
            cafeteria: "cafeteria_lunchbox_waste.jpg",
            restrooms: "restroom_floor_towels.jpg"
        };

        const canvasPlaceholder = document.getElementById("emptyCanvasPlaceholder");
        canvasPlaceholder.innerHTML = `
            <i class="fas fa-file-image text-primary" style="font-size: 3rem;"></i>
            <p style="font-weight: 700; margin-top: 0.5rem;">Preset Loaded: ${filenames[type]}</p>
        `;

        loadedImage = {
            name: filenames[type],
            preset: true,
            presetType: type
        };
        document.getElementById("fileNameLabel").textContent = filenames[type];
        showToast("success", "info", `تم تحميل نموذج المحاكاة لـ ${NafasData.t("area_" + type)}.`);
    };

    function handleCustomImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        loadedImage = file;
        document.getElementById("fileNameLabel").textContent = file.name;

        // Render preview inside placeholder
        const canvasPlaceholder = document.getElementById("emptyCanvasPlaceholder");
        canvasPlaceholder.innerHTML = `
            <i class="fas fa-file-image text-primary" style="font-size: 3rem;"></i>
            <p style="font-weight: 700; margin-top: 0.5rem;">File Loaded: ${file.name}</p>
        `;
        showToast("success", "info", `تم تحميل ملف الصورة: ${file.name}`);
    }

    function handleRunAiScan() {
        if (!loadedImage) {
            showToast("error", "error", "يرجى تحديد ملف صورة أو اختيار نموذج محاكاة أولاً.");
            return;
        }

        const isCheat = document.getElementById("toggleAntiCheatSimulation").checked;
        const relevance = NafasAI.auditImageRelevance(loadedImage.name, isCheat);

        // 1. Start Loader
        const loader = document.getElementById("aiScanningLoader");
        const loaderText = document.getElementById("scanningLoaderText");
        
        loader.style.display = "flex";
        loaderText.textContent = NafasData.t("relevance_checking");

        setTimeout(() => {
            if (!relevance.valid) {
                // Verification rejected!
                loader.style.display = "none";
                showToast("relevance_failed", "error", NafasData.t(relevance.reasonKey));
                return;
            }

            // Valid context, run object detector
            loaderText.textContent = NafasData.t("analyzing_text");

            setTimeout(() => {
                loader.style.display = "none";
                
                // Get AI Mock Results
                const selectedArea = document.getElementById("uploadAreaSelect").value;
                const result = NafasAI.analyzeImage(selectedArea, !loadedImage.preset, loadedImage.name);
                currentAiResult = result;

                // Render Canvas
                const canvas = document.getElementById("aiCanvas");
                const ctx = canvas.getContext("2d");
                canvas.style.display = "block";
                document.getElementById("emptyCanvasPlaceholder").style.display = "none";

                // Draw mock environment overlay
                const mockImg = new Image();
                mockImg.onload = () => {
                    canvas.width = 400;
                    canvas.height = 300;
                    NafasAI.drawObjects(canvas, ctx, mockImg, result.objects, NafasI18n.getLang());
                };
                
                // We use a dummy canvas placeholder for drawing to avoid CORS or file loading issues in static HTML
                mockImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='400' height='300' fill='%231b2622'/><text x='50%25' y='50%25' fill='%2364748b' font-family='sans-serif' font-size='20' text-anchor='middle'>[ " + NafasData.t(selectedArea) + " Scan ]</text></svg>";

                // Render metrics panel
                document.getElementById("outputPollutionPercent").textContent = `${result.pollutionPercent}%`;
                document.getElementById("outputDensityLevel").textContent = result.densityLevel.toUpperCase();
                document.getElementById("outputCleanlinessRating").textContent = `${result.aiRating.toFixed(1)}★`;
                document.getElementById("outputConfidence").textContent = `${Math.round(result.confidence * 100)}%`;

                const tagsContainer = document.getElementById("outputDetectedObjectsTags");
                tagsContainer.innerHTML = "";
                
                if (result.objects.length === 0) {
                    tagsContainer.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">No waste detected. Facility is perfectly clean!</span>`;
                } else {
                    const colors = { trash_plastic: "#3b82f6", trash_paper: "#eab308", trash_food: "#ef4444", trash_other: "#8b5cf6" };
                    result.objects.forEach(o => {
                        const tag = document.createElement("span");
                        tag.className = "obj-tag";
                        tag.style.backgroundColor = colors[o.type] || "#10b981";
                        tag.textContent = NafasData.t(o.type);
                        tagsContainer.appendChild(tag);
                    });
                }

                document.getElementById("aiAnalysisOutputPanel").style.display = "block";
                showToast("success", "success", "اكتمل تحليل الذكاء الاصطناعي بنجاح!");
            }, 1000);
        }, 1200);
    }

    function handleSaveAiReport() {
        if (!currentAiResult) return;

        const note = document.getElementById("manualNotesInput").value;
        const currentUser = NafasAuth.getCurrentUser();

        const report = {
            id: `R-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString(),
            area: currentAiResult.area,
            submittedBy: currentUser ? currentUser.email : "guest@nafas.edu",
            manualRating: 3, // placeholder
            notes: note || "تحليل تلقائي تم حفظه بواسطة المنصة.",
            aiRating: currentAiResult.aiRating,
            pollutionPercent: currentAiResult.pollutionPercent,
            densityLevel: currentAiResult.densityLevel,
            confidence: currentAiResult.confidence,
            objects: currentAiResult.objects,
            imageName: loadedImage.name
        };

        NafasData.addReport(report);
        showToast("report_saved", "success");
        
        // Re-route to history or refresh
        switchPanel("history");
    }

    // =======================================================
    // ANALYTICS & CHARTS PANEL
    // =======================================================
    function loadAnalyticsCharts() {
        // Destroy existing chart instances to re-render clean
        Object.keys(charts).forEach(key => {
            if (charts[key]) charts[key].destroy();
        });

        const reports = NafasData.getReports();
        const lang = NafasI18n.getLang();
        const theme = document.documentElement.getAttribute("data-theme");
        
        const isDark = theme === "dark";
        const gridColor = isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(0,0,0,0.05)";
        const labelColor = isDark ? "#94a3b8" : "#64748b";

        // Chart 1: Cleanliness Trends Over Time (Last 5 reports)
        const reversedReports = [...reports].reverse().slice(-7);
        const labels1 = reversedReports.map((r, i) => `${NafasData.t(r.area).split(' ')[0]} #${r.id}`);
        const data1 = reversedReports.map(r => r.aiRating || r.manualRating);

        charts.trends = new Chart(document.getElementById("chartCleanlinessTrends").getContext("2d"), {
            type: "line",
            data: {
                labels: labels1,
                datasets: [{
                    label: lang === "ar" ? "معدل النظافة" : "Cleanliness Rating",
                    data: data1,
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    fill: true,
                    tension: 0.35,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: labelColor, font: { family: "Cairo, sans-serif" } } },
                    y: { min: 1, max: 5, grid: { color: gridColor }, ticks: { color: labelColor } }
                }
            }
        });

        // Chart 2: Waste Type Distribution
        const wasteCounts = { trash_plastic: 0, trash_paper: 0, trash_food: 0, trash_other: 0 };
        reports.forEach(r => {
            r.objects.forEach(o => {
                if (wasteCounts[o.type] !== undefined) wasteCounts[o.type]++;
            });
        });

        charts.waste = new Chart(document.getElementById("chartWasteDistribution").getContext("2d"), {
            type: "doughnut",
            data: {
                labels: [NafasData.t("trash_plastic"), NafasData.t("trash_paper"), NafasData.t("trash_food"), NafasData.t("trash_other")],
                datasets: [{
                    data: [wasteCounts.trash_plastic, wasteCounts.trash_paper, wasteCounts.trash_food, wasteCounts.trash_other],
                    backgroundColor: ["#3b82f6", "#eab308", "#ef4444", "#8b5cf6"],
                    borderColor: isDark ? "#09100e" : "#ffffff",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { color: labelColor, font: { family: "Cairo, sans-serif", size: 11 } }
                    }
                }
            }
        });

        // Chart 3: Most Polluted Areas (Avg Pollution %)
        const areas = ["area_yard", "area_classrooms", "area_cafeteria", "area_hallways", "area_restrooms"];
        const areaAvgPollution = areas.map(area => {
            const areaReports = reports.filter(r => r.area === area);
            if (areaReports.length === 0) return 0;
            let total = 0;
            areaReports.forEach(r => total += r.pollutionPercent);
            return Math.round(total / areaReports.length);
        });

        charts.areas = new Chart(document.getElementById("chartPollutedAreas").getContext("2d"), {
            type: "bar",
            data: {
                labels: areas.map(a => NafasData.t(a)),
                datasets: [{
                    label: lang === "ar" ? "نسبة التلوث" : "Pollution %",
                    data: areaAvgPollution,
                    backgroundColor: "rgba(16, 185, 129, 0.65)",
                    borderColor: "#10b981",
                    borderWidth: 1.5,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: labelColor, font: { family: "Cairo, sans-serif", size: 10 } } },
                    y: { max: 100, grid: { color: gridColor }, ticks: { color: labelColor } }
                }
            }
        });

        // Chart 4: Pollution frequency by time of day
        // mock times distributions
        const timeLabels = lang === "ar" ? ["7:00 ص", "9:30 ص", "12:00 م", "2:00 م"] : ["7:00 AM", "9:30 AM", "12:00 PM", "2:00 PM"];
        charts.time = new Chart(document.getElementById("chartPollutionByTime").getContext("2d"), {
            type: "bar",
            data: {
                labels: timeLabels,
                datasets: [
                    {
                        label: NafasData.t("trash_plastic"),
                        data: [15, 25, 45, 10],
                        backgroundColor: "#3b82f6"
                    },
                    {
                        label: NafasData.t("trash_food"),
                        data: [5, 48, 12, 2],
                        backgroundColor: "#ef4444"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { color: labelColor, font: { family: "Cairo, sans-serif", size: 10 } }
                    }
                },
                scales: {
                    x: { stacked: true, grid: { color: gridColor }, ticks: { color: labelColor } },
                    y: { stacked: true, grid: { color: gridColor }, ticks: { color: labelColor } }
                }
            }
        });
    }

    window.exportReportSim = (period) => {
        showToast("report_generated", "success", `تم إصدار التقرير الـ ${period === 'daily' ? 'اليومي' : period === 'weekly' ? 'الأسبوعي' : 'الشهري'} بنجاح وحفظه في السجل.`);
    };

    // =======================================================
    // AI RECOMMENDATIONS PANEL
    // =======================================================
    function loadRecommendationsPanel() {
        const recs = NafasData.getRecommendations();
        const tbody = document.getElementById("recommendationsTableBody");
        const currentUser = NafasAuth.getCurrentUser();
        const role = currentUser ? currentUser.role : "role_student";
        const isAdminOrTeacher = role === "role_admin" || role === "role_teacher";

        tbody.innerHTML = "";
        
        recs.forEach((rec, index) => {
            const tr = document.createElement("tr");
            
            // Priority badge styling
            const priorityClass = rec.priority.replace("priority_", "");
            const statusClass = rec.status.replace("status_", "");
            
            let statusMarkup = "";
            if (isAdminOrTeacher) {
                // Dropdown selector for admins/teachers
                statusMarkup = `
                    <select class="form-control select-control-styled btn-sm" onchange="changeRecStatus('${rec.id}', this.value)" style="width: 130px; font-weight:600;">
                        <option value="status_pending" ${rec.status === 'status_pending' ? 'selected' : ''}>${NafasData.t("status_pending")}</option>
                        <option value="status_in_progress" ${rec.status === 'status_in_progress' ? 'selected' : ''}>${NafasData.t("status_in_progress")}</option>
                        <option value="status_completed" ${rec.status === 'status_completed' ? 'selected' : ''}>${NafasData.t("status_completed")}</option>
                    </select>
                `;
            } else {
                // Read-only text badge for students
                statusMarkup = `<span class="score-level-badge ${statusClass}">${NafasData.t(rec.status)}</span>`;
            }

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td style="font-weight: 700;">${NafasData.getLang() === 'ar' ? rec.title : NafasData.t(rec.titleKey)}</td>
                <td style="color:var(--text-muted); font-size:0.8rem;">${NafasData.getLang() === 'ar' ? rec.reason : NafasData.t(rec.reasonKey)}</td>
                <td><span class="rec-badge ${priorityClass}">${NafasData.t(rec.priority)}</span></td>
                <td>${statusMarkup}</td>
            `;

            tbody.appendChild(tr);
        });
    }

    window.changeRecStatus = (id, newStatus) => {
        const user = NafasAuth.getCurrentUser();
        const success = NafasData.updateRecommendationStatus(id, user ? user.email : "system", newStatus);
        if (success) {
            showToast("settings_saved", "success", "تم تحديث حالة التوصية الاستباقية بنجاح!");
            loadRecommendationsPanel();
        }
    };

    // =======================================================
    // REWARDS & LEADERBOARD PANEL
    // =======================================================
    function loadLeaderboardPanel() {
        const currentUser = NafasAuth.getCurrentUser();
        
        // Sync wallet
        if (currentUser) {
            document.getElementById("walletPointsValue").textContent = currentUser.points;
            document.getElementById("walletStreakValue").textContent = currentUser.streak || 0;
        }

        // Highlights winners
        // Just mock seed names
        document.getElementById("winnerTopStudent").textContent = NafasData.getStudentLeaderboard()[0].name.split(' ')[0];
        document.getElementById("winnerTopClassroom").textContent = NafasData.getClassroomLeaderboard()[0].name;

        renderLeaderboardList();
    }

    function renderLeaderboardList() {
        const tbody = document.getElementById("leaderboardTableBody");
        tbody.innerHTML = "";

        const list = activeLeaderboardTab === "student" 
            ? NafasData.getStudentLeaderboard() 
            : NafasData.getClassroomLeaderboard();

        list.forEach((item, index) => {
            // Gold, Silver, Bronze badges
            let medal = `${index + 1}`;
            if (index === 0) medal = `🥇`;
            if (index === 1) medal = `🥈`;
            if (index === 2) medal = `🥉`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-size: 1.15rem; font-weight:700;">${medal}</td>
                <td style="font-weight: 700;">${item.name}</td>
                <td style="color: var(--primary); font-weight: 800; font-size: 1rem;">${item.points}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.switchLeaderboardType = (type) => {
        activeLeaderboardTab = type;
        
        const btnStud = document.getElementById("btnStudentLeaderboardTab");
        const btnClass = document.getElementById("btnClassroomLeaderboardTab");

        if (type === "student") {
            btnStud.classList.add("active");
            btnClass.classList.remove("active");
        } else {
            btnStud.classList.remove("active");
            btnClass.classList.add("active");
        }
        renderLeaderboardList();
    };

    // =======================================================
    // AUDIT HISTORY PANEL
    // =======================================================
    function populateHistoryFilters() {
        const users = NafasData.getUsers();
        const select = document.getElementById("filterUser");
        
        // Clear except first
        select.innerHTML = `<option value="all" data-i18n="all_users">${NafasData.t("all_users")}</option>`;
        
        users.forEach(u => {
            const opt = document.createElement("option");
            opt.value = u.email;
            opt.textContent = `${u.name} (${u.email.split('@')[0]})`;
            select.appendChild(opt);
        });
    }

    function loadHistoryPanel() {
        const areaF = document.getElementById("filterArea").value;
        const userF = document.getElementById("filterUser").value;
        const wasteF = document.getElementById("filterWaste").value;

        const reports = NafasData.getReports();
        const tbody = document.getElementById("historyTableBody");
        tbody.innerHTML = "";

        // Filters mapping logic
        const filtered = reports.filter(r => {
            if (areaF !== "all" && r.area !== areaF) return false;
            if (userF !== "all" && r.submittedBy !== userF) return false;
            if (wasteF !== "all") {
                const hasWaste = r.objects.some(o => o.type === wasteF);
                if (!hasWaste) return false;
            }
            return true;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No reports matched your filters</td></tr>`;
        } else {
            filtered.forEach(r => {
                const dateStr = new Date(r.date).toLocaleString(NafasI18n.getLang() === 'ar' ? 'ar-SA' : 'en-US', {dateStyle: 'medium', timeStyle: 'short'});
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><strong>${r.id}</strong></td>
                    <td style="color:var(--text-muted); font-size:0.75rem;">${dateStr}</td>
                    <td style="font-weight:700;">${NafasData.t(r.area)}</td>
                    <td style="color:#eab308; font-weight:700;">${(r.aiRating || r.manualRating).toFixed(1)}★</td>
                    <td style="font-weight:700;">${r.pollutionPercent}%</td>
                    <td>${r.submittedBy.split('@')[0]}</td>
                    <td><button class="btn btn-secondary btn-sm" onclick="viewReportDetailsModal('${r.id}')"><i class="fas fa-eye"></i> <span data-i18n="log_details">${NafasData.t("log_details")}</span></button></td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    window.resetHistoryFilters = () => {
        document.getElementById("filterArea").value = "all";
        document.getElementById("filterUser").value = "all";
        document.getElementById("filterWaste").value = "all";
        loadHistoryPanel();
    };

    window.viewReportDetailsModal = (id) => {
        const reports = NafasData.getReports();
        const report = reports.find(r => r.id === id);
        if (!report) return;

        document.getElementById("modalReportTitle").textContent = NafasData.t(report.area);
        document.getElementById("modalReportId").textContent = `ID: ${report.id}`;
        document.getElementById("modalReportDate").textContent = new Date(report.date).toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'});
        document.getElementById("modalReportArea").textContent = NafasData.t(report.area);
        document.getElementById("modalReportBy").textContent = report.submittedBy;
        document.getElementById("modalReportScore").textContent = `${(report.aiRating || report.manualRating).toFixed(1)}/5.0`;
        document.getElementById("modalReportNotes").textContent = report.notes || "لا توجد ملاحظات.";

        openModal("reportDetailModal");

        // Draw bounding boxes inside modal canvas
        setTimeout(() => {
            const canvas = document.getElementById("modalReportCanvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.onload = () => {
                canvas.width = 480;
                canvas.height = 200;
                NafasAI.drawObjects(canvas, ctx, img, report.objects, NafasI18n.getLang());
            };
            img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='200'><rect width='480' height='200' fill='%231b2622'/><text x='50%25' y='50%25' fill='%2364748b' font-family='sans-serif' font-size='20' text-anchor='middle'>[ " + NafasData.t(report.area) + " ]</text></svg>";
        }, 100);
    };

    // =======================================================
    // ADMINISTRATOR CONTROL PANEL
    // =======================================================
    function loadAdminPanel() {
        const users = NafasData.getUsers();
        const filter = document.getElementById("adminSearchUser").value.toLowerCase().trim();
        const tbody = document.getElementById("adminUsersTableBody");
        tbody.innerHTML = "";

        const filtered = users.filter(u => 
            u.name.toLowerCase().includes(filter) || 
            u.email.toLowerCase().includes(filter)
        );

        filtered.forEach(u => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight: 700;">${u.name}</td>
                <td>${u.email}</td>
                <td><small class="score-level-badge ${u.role === 'role_admin' ? 'excellent' : u.role === 'role_teacher' ? 'good' : 'needs_improvement'}" style="box-shadow:none;">${NafasData.t(u.role).split(' ')[0]}</small></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editUserSim('${u.email}')"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-secondary btn-sm" onclick="deleteUserSim('${u.email}')" style="color:var(--color-critical);"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Areas monitoring summary table
        const areas = ["area_yard", "area_classrooms", "area_cafeteria", "area_hallways", "area_restrooms"];
        const summaryTbody = document.getElementById("adminAreaSummaryTableBody");
        summaryTbody.innerHTML = "";

        areas.forEach(area => {
            const areaReports = NafasData.getReports().filter(r => r.area === area);
            let avgClean = 5.0;
            let lastLogDate = "N/A";
            
            if (areaReports.length > 0) {
                let total = 0;
                areaReports.forEach(r => total += (r.aiRating || r.manualRating));
                avgClean = total / areaReports.length;
                lastLogDate = new Date(areaReports[0].date).toLocaleDateString();
            }

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight: 700;">${NafasData.t(area)}</td>
                <td style="color:#eab308; font-weight:800; font-size:1.05rem;">${avgClean.toFixed(1)}★</td>
                <td>${areaReports.length}</td>
                <td style="color:var(--text-muted); font-size:0.75rem;">${lastLogDate}</td>
            `;
            summaryTbody.appendChild(tr);
        });
    }

    window.editUserSim = (email) => {
        const users = NafasData.getUsers();
        const user = users.find(u => u.email === email);
        if (!user) return;

        // Fill form fields
        document.getElementById("adminUserFormTitle").textContent = NafasData.t("edit_user");
        document.getElementById("adminUserEditEmail").value = user.email;
        document.getElementById("adminUserEmail").value = user.email;
        document.getElementById("adminUserEmail").disabled = true; // Email is ID key
        document.getElementById("adminUserFullName").value = user.name;
        document.getElementById("adminUserRole").value = user.role;
        document.getElementById("adminUserAssignedArea").value = user.assignedArea;

        // Show toggle one time access
        document.getElementById("adminOnetimeToggleContainer").style.display = "block";
        document.getElementById("adminUserOnetime").checked = user.oneTimeAccess;
        
        document.getElementById("adminCancelEditBtn").style.display = "inline-flex";
    };

    window.resetAdminUserForm = () => {
        document.getElementById("adminUserFormTitle").textContent = NafasData.t("add_user_btn");
        document.getElementById("adminUserEditEmail").value = "";
        document.getElementById("adminUserEmail").value = "";
        document.getElementById("adminUserEmail").disabled = false;
        document.getElementById("adminUserFullName").value = "";
        document.getElementById("adminUserRole").value = "role_student";
        document.getElementById("adminUserAssignedArea").value = "all";
        
        document.getElementById("adminOnetimeToggleContainer").style.display = "none";
        document.getElementById("adminCancelEditBtn").style.display = "none";
        document.getElementById("adminUserForm").reset();
    };

    function handleAdminSaveUser(e) {
        e.preventDefault();
        
        const editEmail = document.getElementById("adminUserEditEmail").value;
        const email = document.getElementById("adminUserEmail").value;
        const name = document.getElementById("adminUserFullName").value;
        const role = document.getElementById("adminUserRole").value;
        const area = document.getElementById("adminUserAssignedArea").value;
        const oneTime = document.getElementById("adminUserOnetime").checked;

        if (editEmail) {
            // Edit User Action
            NafasData.updateUser(editEmail, {
                name,
                role,
                assignedArea: area,
                oneTimeAccess: oneTime
            });
            showToast("settings_saved", "success", "تم تعديل بيانات المستخدم بنجاح.");
        } else {
            // Add User Action
            // Auto seed default credentials
            const newUser = {
                email,
                password: "temp123", // Default initial password
                name,
                role,
                assignedArea: area,
                firstLogin: true,
                oneTimeAccess: false,
                points: 0,
                streak: 0
            };
            NafasData.addUser(newUser);
            showToast("settings_saved", "success", "تم إنشاء الحساب وإرسال كلمة المرور المؤقتة للبريد الإلكتروني.");
        }

        resetAdminUserForm();
        loadAdminPanel();
        populateHistoryFilters();
    }

    window.deleteUserSim = (email) => {
        const currentUser = NafasAuth.getCurrentUser();
        if (currentUser && currentUser.email === email) {
            showToast("error", "error", "لا يمكنك حذف حسابك الشخصي النشط حالياً!");
            return;
        }

        if (confirm(`هل أنت متأكد من رغبتك بحذف المستخدم: ${email}؟`)) {
            NafasData.deleteUser(email);
            showToast("settings_saved", "success", "تم إقصاء المستخدم من قاعدة البيانات.");
            loadAdminPanel();
            populateHistoryFilters();
        }
    };

    // =======================================================
    // SETTINGS PANEL & PREFERENCES
    // =======================================================
    function loadSettingsPanel() {
        const lang = NafasI18n.getLang();
        const theme = document.documentElement.getAttribute("data-theme") || "dark";

        document.getElementById("settingsLanguage").value = lang;
        document.getElementById("settingsTheme").value = theme;
    }

    function handleSavePreferences(e) {
        e.preventDefault();
        const lang = document.getElementById("settingsLanguage").value;
        const theme = document.getElementById("settingsTheme").value;

        // Apply theme
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("nafas_theme", theme);
        updateThemeToggleIcons();

        // Apply language
        NafasI18n.setLang(lang);
        document.querySelectorAll(".lang-toggle-btn span").forEach(s => {
            s.textContent = lang === "ar" ? "English" : "العربية";
        });

        showToast("settings_saved", "success");
        loadOverviewPanel();
    }

    // =======================================================
    // AI CHATBOT SYSTEM
    // =======================================================
    function resetChatLogs() {
        const logs = document.getElementById("chatbotMessageLogs");
        logs.innerHTML = "";
        
        const welcomeMsg = document.createElement("div");
        welcomeMsg.className = "chat-msg bot";
        welcomeMsg.innerHTML = NafasData.t("chat_welcome");
        logs.appendChild(welcomeMsg);
    }

    function handleChatSubmit(e) {
        e.preventDefault();
        
        const input = document.getElementById("chatbotMessageField");
        const query = input.value.trim();
        if (!query) return;

        const logs = document.getElementById("chatbotMessageLogs");

        // 1. Add User query
        const userMsg = document.createElement("div");
        userMsg.className = "chat-msg user";
        userMsg.textContent = query;
        logs.appendChild(userMsg);

        input.value = "";
        logs.scrollTop = logs.scrollHeight;

        // 2. Show Typing
        const typing = document.getElementById("chatbotTypingIndicator");
        typing.style.display = "flex";
        logs.scrollTop = logs.scrollHeight;

        setTimeout(() => {
            typing.style.display = "none";

            // 3. Add bot reply
            const reply = NafasAI.getChatResponse(query, NafasI18n.getLang());
            const botMsg = document.createElement("div");
            botMsg.className = "chat-msg bot";
            botMsg.innerHTML = reply;
            logs.appendChild(botMsg);
            
            logs.scrollTop = logs.scrollHeight;
        }, 1000);
    }

    // Modal Control Helper
    function openModal(id) {
        document.getElementById(id).classList.add("active");
    }
    function closeModal(id) {
        document.getElementById(id).classList.remove("active");
    }
    window.openModal = openModal;
    window.closeModal = closeModal;

    return {
        init,
        navigate,
        switchPanel
    };
})();
window.NafasApp = NafasApp;
