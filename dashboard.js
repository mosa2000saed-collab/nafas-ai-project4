// Nafas School Sustainability Platform - Authenticated Dashboard Controller
document.addEventListener("DOMContentLoaded", () => {
    NafasDashboard.init();
});

const NafasDashboard = (() => {
    let currentUser = null;
    let activeLeaderboardTab = "student";
    let activeCalendarDay = null;
    let selectedPreset = null;
    let currentAiResult = null;
    let notifications = [];
    let charts = {};

    function init() {
        currentUser = NafasAuth.getCurrentUser();
        // Redirect if no session
        if (!currentUser) {
            window.location.href = "index.html";
            return;
        }

        // Initialize notification bells data from announcements
        loadNotificationsFromDatabase();

        // Bind events
        bindEvents();
        initUIElements();

        // 800ms Skeleton Loader timer
        setTimeout(() => {
            const loader = document.getElementById("skeletonLoader");
            if (loader) {
                loader.style.display = "none";
                loader.classList.remove("active");
            }
            // Trigger SPA routing
            handleRouting();
        }, 800);
    }

    function loadNotificationsFromDatabase() {
        const announcements = NafasData.getAnnouncements();
        notifications = announcements.filter(a => a.target === "all" || a.target === currentUser.role).map(a => ({
            id: a.id,
            title: a.target === "all" ? "إعلان عام" : "إعلان مخصص لدورك",
            text: a.text,
            time: new Date(a.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            read: false
        }));
        updateNotificationBell();
    }

    // Attach Event Listeners
    function bindEvents() {
        // Hash routing listener
        window.addEventListener("hashchange", handleRouting);

        // Sidebar link routing triggers
        document.querySelectorAll(".sidebar-menu-item a").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const targetPanel = link.parentElement.getAttribute("data-panel");
                if (targetPanel) {
                    window.location.hash = targetPanel;
                }
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
                if (window.location.hash === "#analytics") loadAnalyticsCharts();
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

                // Update current panel to translate
                handleRouting();
            });
        });

        // Notification Bell dropdown toggler
        document.getElementById("btnNavNotifications").addEventListener("click", (e) => {
            e.stopPropagation();
            document.getElementById("notificationsDropdown").classList.toggle("active");
        });

        document.getElementById("btnClearNotifications").addEventListener("click", (e) => {
            e.stopPropagation();
            notifications = [];
            updateNotificationBell();
            renderNotificationsDropdownList();
            showToast("settings_saved", "info", "تم مسح كافة التنبيهات.");
        });

        document.addEventListener("click", () => {
            document.getElementById("notificationsDropdown").classList.remove("active");
        });

        // Modal overlay clicks (close modal on background click)
        document.querySelectorAll(".modal-overlay").forEach(overlay => {
            overlay.addEventListener("click", (e) => {
                if (e.target === overlay) closeModal(overlay.id);
            });
        });

        // AI Vision scan triggers
        document.getElementById("imageFileInput").addEventListener("change", handleCustomImageUpload);
        document.getElementById("btnRunAiAnalysis").addEventListener("click", handleRunAiScan);
        document.getElementById("btnSaveAiReport").addEventListener("click", handleSaveAiReport);
        document.getElementById("btnAiVisionAutoTaskTrigger").addEventListener("click", triggerAutoTaskCreation);

        // Daily Reports Submissions Form
        document.getElementById("dailyReportSubmissionForm").addEventListener("submit", handleDailyReportSubmit);

        // Star rating composer helper
        document.querySelectorAll(".rating-composer-star").forEach(star => {
            star.addEventListener("click", () => {
                const rating = parseInt(star.getAttribute("data-rating"));
                document.getElementById("dailyReportRatingInput").value = rating;
                
                // highlight stars
                document.querySelectorAll(".rating-composer-star").forEach(s => {
                    const r = parseInt(s.getAttribute("data-rating"));
                    s.className = r <= rating ? "fas fa-star rating-composer-star" : "far fa-star rating-composer-star";
                });
            });
        });

        // Announcements Broadcast Form (Admin)
        const annForm = document.getElementById("announcementBroadcastForm");
        if (annForm) {
            annForm.addEventListener("submit", handleAnnouncementBroadcast);
        }

        // Preferences Form Save
        document.getElementById("userPreferencesForm").addEventListener("submit", handleSavePreferences);

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

        // Admin User CRUD Form
        document.getElementById("adminUserForm").addEventListener("submit", handleAdminSaveUser);
        document.getElementById("adminSearchUser").addEventListener("input", loadAdminPanel);

        // Task filter selection
        document.getElementById("taskFilterSelect").addEventListener("change", loadTasksPanel);

        // Task Creation Form (Teachers / Admins)
        document.getElementById("taskCreationForm").addEventListener("submit", handleTaskCreation);
    }

    function initUIElements() {
        // Sync theme icons
        updateThemeToggleIcons();

        // Populate search dropdowns inside History
        populateHistoryFilters();

        // Chatbot initial message state
        resetChatLogs();

        // Pre-fill preferences values
        const lang = NafasI18n.getLang();
        document.querySelectorAll(".lang-toggle-btn span").forEach(s => {
            s.textContent = lang === "ar" ? "English" : "العربية";
        });
    }

    // SPA Router Hash Management
    function handleRouting() {
        const hash = window.location.hash.replace("#", "") || "overview";
        
        // Check permissions (RBAC) for this tab
        const allowed = checkTabAccess(hash);
        if (!allowed) {
            window.location.hash = "overview";
            return;
        }

        // Update sidebar highlights
        document.querySelectorAll(".sidebar-menu-item").forEach(item => {
            item.classList.remove("active");
            if (item.getAttribute("data-panel") === hash) {
                item.classList.add("active");
            }
        });

        // Hide all panels
        document.querySelectorAll(".dash-panel").forEach(panel => {
            panel.classList.remove("active");
        });

        // Show target panel
        const targetPanel = document.getElementById(`panel-${hash}`);
        if (targetPanel) {
            targetPanel.classList.add("active");
        }

        // Set top title
        document.getElementById("currentPanelTitle").textContent = NafasData.t(`nav_${hash}`);

        // Sync header details
        document.getElementById("userAvatar").textContent = currentUser.name.charAt(0);
        document.getElementById("userDisplayName").textContent = currentUser.name;
        document.getElementById("userDisplayRole").textContent = NafasI18n.t(currentUser.role);

        // Apply RBAC controls
        applyRBACSidebarRendering();

        // Load content for specific views
        if (hash === "overview") loadOverviewPanel();
        if (hash === "twin") loadTwinPanel();
        if (hash === "aivision") loadAiVisionPanel();
        if (hash === "tasks") loadTasksPanel();
        if (hash === "dailyreports") loadDailyReportsPanel();
        if (hash === "calendar") loadCalendarPanel();
        if (hash === "leaderboard") loadLeaderboardPanel();
        if (hash === "analytics") setTimeout(loadAnalyticsCharts, 100);
        if (hash === "recommendations") loadRecommendationsPanel();
        if (hash === "history") loadHistoryPanel();
        if (hash === "users") loadAdminPanel();
        if (hash === "profile") loadProfilePanel();
        if (hash === "announcements") loadAnnouncementsComposerPanel();
        if (hash === "notifications") loadNotificationsTimelinePanel();
        if (hash === "settings") loadSettingsPanel();

        // Collapse mobile sidebar
        document.getElementById("sidebar").classList.remove("active");
    }

    // Tab Access Checker
    function checkTabAccess(tab) {
        // Teacher hides User Management and Announcements
        // Student/Cleaner hides Analytics, Recommendations, and User Management
        const role = currentUser.role;
        if (tab === "users" || tab === "announcements") {
            return role === "role_admin";
        }
        if (tab === "analytics" || tab === "recommendations") {
            return role === "role_admin" || role === "role_teacher";
        }
        return true;
    }

    // Apply RBAC tab show/hide on sidebar elements
    function applyRBACSidebarRendering() {
        const role = currentUser.role;
        document.querySelectorAll(".sidebar-menu-item").forEach(item => {
            const allowed = item.getAttribute("data-role-view");
            if (!allowed) {
                item.style.display = "block";
            } else if (allowed.includes(role)) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    }

    // Toast triggers
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

        // Slide out after 3.5s
        setTimeout(() => {
            toast.style.animation = "slide-down-bounce 0.35s reverse forwards";
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    function updateThemeToggleIcons() {
        const theme = document.documentElement.getAttribute("data-theme") || "dark";
        document.querySelectorAll(".theme-toggle-btn i").forEach(icon => {
            icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
        });
    }

    // =======================================================
    // OVERVIEW PANEL RENDERING
    // =======================================================
    function loadOverviewPanel() {
        // 1. Welcome Banner Render
        const welcomeBanner = document.getElementById("welcomeBanner");
        const lang = NafasI18n.getLang();
        
        // Points summary based on role
        let detailsText = "";
        if (currentUser.role === "role_student") {
            detailsText = lang === "ar" 
                ? `لديك حالياً <strong>${currentUser.points} نقطة استدامة</strong> مع التزام لـ <strong>${currentUser.streak || 0} أيام متتالية</strong>. ساهم في رفع بلاغات النظافة لتجميع نقاط إضافية وترقية فصلك المتصدر!`
                : `You currently have <strong>${currentUser.points} sustainability points</strong> with a streak of <strong>${currentUser.streak || 0} days</strong>. Submit reports to earn more points and help your class climb the leaderboard!`;
        } else if (currentUser.role === "role_staff") {
            detailsText = lang === "ar"
                ? `لديك <strong>${currentUser.points} نقطة</strong>. تم إسناد مهام جديدة لك في جدول الأعمال، يرجى فحصها والبدء في تنظيف المواقع المعنية.`
                : `You have <strong>${currentUser.points} points</strong>. New cleanup tasks are assigned to you. Check the Tasks checklist to get started!`;
        } else if (currentUser.role === "role_teacher") {
            detailsText = lang === "ar"
                ? `مرحباً بك في لوحة الإشراف والتوجيه. يمكنك فحص مهام الطلاب، رفع بلاغات النظافة الميدانية، ومراجعة مؤشرات كفاءة الفصول الدراسية الموكلة لك.`
                : `Welcome to the supervisor console. You can audit tasks, upload facility pictures, and review classroom environmental statistics under your supervision.`;
        } else {
            detailsText = lang === "ar"
                ? `لوحة التحكم الإدارية جاهزة ومحملة بالكامل. لديك صلاحيات إضافة وحذف الحسابات، بث الإعلانات المدرسية، واعتماد نقاط البلاغات للطلاب.`
                : `System administration dashboard is active. You have full access to manage accounts, broadcast announcements, and approve student cleanliness report submissions.`;
        }

        welcomeBanner.innerHTML = `
            <h2 class="welcome-banner-title">${NafasI18n.t("welcome")}, ${currentUser.name}!</h2>
            <p class="welcome-banner-desc">${detailsText}</p>
        `;

        // 2. Metrics score index radial progress
        const score = NafasData.getScore();
        const scoreLvl = NafasData.getScoreLevel();
        document.getElementById("scoreTextValue").textContent = score;

        const progressCircle = document.getElementById("scoreProgressCircle");
        const radius = progressCircle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;

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

        // 3. Cleanliness Stars
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

        // 4. Worst Area & Dominant Trash
        const worstArea = NafasData.getMostPolluted();
        document.getElementById("mostPollutedAreaText").textContent = NafasData.t(worstArea);

        const dominantTrash = NafasData.getDominantWaste();
        document.getElementById("dominantWasteText").textContent = NafasData.t(dominantTrash);

        // 5. Impact Metrics Animation
        animateImpactStatistics();

        // 6. Mini Digital Twin render
        renderMiniDigitalTwin();

        // 7. AI Insights list loading
        renderAiInsightsList();

        // 8. Trends Chart render
        renderOverviewTrendsChart();

        // 9. Mini Leaderboard Class rankings
        renderMiniTopClassesList();
    }

    function animateImpactStatistics() {
        // Animate counter values
        const co2Val = document.getElementById("impactCo2");
        const waterVal = document.getElementById("impactWater");
        const energyVal = document.getElementById("impactEnergy");
        const recVal = document.getElementById("impactRecycling");

        // mock increment animation
        let count = 0;
        const interval = setInterval(() => {
            count += 10;
            if (count >= 100) {
                clearInterval(interval);
                co2Val.textContent = "240 kg";
                waterVal.textContent = "1,200 L";
                energyVal.textContent = "480 kWh";
                recVal.textContent = "72%";
            } else {
                co2Val.textContent = `${Math.round(240 * (count / 100))} kg`;
                waterVal.textContent = `${Math.round(1200 * (count / 100))} L`;
                energyVal.textContent = `${Math.round(480 * (count / 100))} kWh`;
                recVal.textContent = `${Math.round(72 * (count / 100))}%`;
            }
        }, 30);
    }

    function renderMiniDigitalTwin() {
        const wrapper = document.getElementById("twinMiniMapWrapper");
        // Simply draw school mapping dynamically using draw school Floorplan
        wrapper.innerHTML = "";
        
        // Draw miniature isometric representation
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 600 300");
        svg.style.width = "100%";
        svg.style.height = "100%";
        
        NafasDigitalTwin.drawIsometricSchool(svg, "mini");
        wrapper.appendChild(svg);
    }

    function renderAiInsightsList() {
        const container = document.getElementById("aiInsightsList");
        container.innerHTML = "";

        const insights = [
            { label: "معدل فرز البلاستيك في فناء المدرسة", percent: 74, color: "#10b981" },
            { label: "كفاءة ترشيد طاقة الفصول الدراسية", percent: 89, color: "#10b981" },
            { label: "نسبة خلط بقايا الطعام بالمقصف المدرسي", percent: 43, color: "#ef4444" },
            { label: "معدل تجاوب الصيانة لطلبات دورات المياه", percent: 62, color: "#eab308" },
            { label: "نسبة توفير المياه بالمرافق الصحية", percent: 91, color: "#10b981" },
            { label: "جولات تدقيق النظافة المستكملة اليوم", percent: 55, color: "#eab308" }
        ];

        insights.forEach(ins => {
            const card = document.createElement("div");
            card.className = "insight-bar-card";
            card.innerHTML = `
                <div class="insight-bar-header">
                    <span>${ins.label}</span>
                    <span style="color: ${ins.color}; font-weight: 800;">${ins.percent}%</span>
                </div>
                <div class="insight-progress-track">
                    <div class="insight-progress-bar" style="width: 0%; background-color: ${ins.color};"></div>
                </div>
            `;
            container.appendChild(card);

            // Animate width
            setTimeout(() => {
                card.querySelector(".insight-progress-bar").style.width = `${ins.percent}%`;
            }, 100);
        });
    }

    function renderOverviewTrendsChart() {
        const ctx = document.getElementById("overviewTrendsChart").getContext("2d");
        if (charts.overviewTrends) charts.overviewTrends.destroy();

        const reports = NafasData.getReports();
        const approved = reports.filter(r => r.status === "approved").reverse().slice(-5);
        const labels = approved.map(r => NafasData.t(r.area).split(' ')[0]);
        const data = approved.map(r => r.aiRating || r.manualRating);

        charts.overviewTrends = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels.length > 0 ? labels : ["الساحة", "الفصول", "المقصف", "الممرات", "الحمامات"],
                datasets: [{
                    label: "مؤشر النظافة",
                    data: data.length > 0 ? data : [4.2, 4.9, 1.8, 3.4, 2.6],
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
                    x: { ticks: { color: "#94a3b8", font: { family: "Cairo, sans-serif" } } },
                    y: { min: 1, max: 5, ticks: { color: "#94a3b8" } }
                }
            }
        });
    }

    function renderMiniTopClassesList() {
        const container = document.getElementById("topClassesMiniList");
        container.innerHTML = "";

        const classes = NafasData.getClassroomLeaderboard();
        classes.slice(0, 3).forEach((cls, i) => {
            const medals = ["🥇", "🥈", "🥉"];
            const row = document.createElement("div");
            row.className = "classes-rank-row";
            row.innerHTML = `
                <span style="font-weight: 700;">${medals[i]} ${cls.name}</span>
                <span style="font-weight: 800; color: var(--primary);">${cls.points} نقطة</span>
            `;
            container.appendChild(row);
        });
    }

    // =======================================================
    // DETAILED DIGITAL TWIN PANEL
    // =======================================================
    function loadTwinPanel() {
        const wrapper = document.getElementById("twinFullViewportWrapper");
        wrapper.innerHTML = "";

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 800 420");
        svg.style.width = "100%";
        svg.style.height = "100%";
        
        NafasDigitalTwin.drawIsometricSchool(svg, "full", handleBuildingClick);
        wrapper.appendChild(svg);

        // Reset details panel
        document.getElementById("twinPlaceholderText").style.display = "block";
        document.getElementById("twinDetailsContent").style.display = "none";
    }

    function handleBuildingClick(area) {
        document.getElementById("twinPlaceholderText").style.display = "none";
        document.getElementById("twinDetailsContent").style.display = "block";

        const reports = NafasData.getReports();
        const areaReports = reports.filter(r => r.area === area && r.status === "approved");

        let total = 0;
        let pollution = 0;
        areaReports.forEach(r => {
            total += (r.aiRating || r.manualRating);
            pollution += r.pollutionPercent;
        });

        const avgRating = areaReports.length > 0 ? (total / areaReports.length).toFixed(1) : "5.0";
        const avgPollution = areaReports.length > 0 ? Math.round(pollution / areaReports.length) : 0;

        document.getElementById("twinSelectedBuildingName").textContent = NafasData.t(area);
        document.getElementById("twinSelectedReportsCount").textContent = areaReports.length;
        document.getElementById("twinSelectedPollutionPercent").textContent = `${avgPollution}%`;
        document.getElementById("twinSelectedBuildingAvg").textContent = `${avgRating}★`;

        // Update rating badge
        const badge = document.getElementById("twinSelectedBuildingStatus");
        badge.className = "score-level-badge";
        const avgRatingNum = parseFloat(avgRating);
        if (avgRatingNum >= 4.0) {
            badge.classList.add("clean");
            badge.textContent = NafasData.t("status_clean");
        } else if (avgRatingNum >= 2.5) {
            badge.classList.add("attention");
            badge.textContent = NafasData.t("status_attention");
        } else {
            badge.classList.add("polluted");
            badge.textContent = NafasData.t("status_polluted");
        }

        // Equipped features list
        const features = {
            area_yard: ["ألواح طاقة شمسية سعة 15kW على المظلة", "مسطحات خضراء (أشجار وشتلات)", "معدات كنس آلية للساحة"],
            area_cafeteria: ["حاويات ذكية لفرز البقايا والعلب", "أجهزة رصد الكثافة بالذكاء الاصطناعي", "أنظمة تقنين استهلاك العبوات"],
            area_restrooms: ["مستشعرات تدفق لترشيد هدر المياه", "بلاغات صيانة إلكترونية فورية", "مراوح تهوية بالطاقة المتجددة"],
            area_classrooms: ["إضاءة LED موفرة مستشعرة للحركة", "سلال فرز الأوراق والكرتون", "أجهزة تحكم تلقائية بالمكيفات"],
            area_hallways: ["شاشات توعوية بيئية رقمية", "ممرات إضاءة نهارية واسعة", "كاميرات فحص النفايات الممرات"]
        };
        const list = document.getElementById("twinSelectedFeaturesList");
        list.innerHTML = "";
        const buildingFeatures = features[area] || ["حاويات الفرز الأساسية"];
        buildingFeatures.forEach(feat => {
            const li = document.createElement("li");
            li.innerHTML = `<i class="fas fa-check-circle text-primary"></i> ${feat}`;
            list.appendChild(li);
        });

        // List last reports
        const reportsList = document.getElementById("twinSelectedReportsList");
        reportsList.innerHTML = "";
        const recent = areaReports.slice(0, 3);
        if (recent.length === 0) {
            reportsList.innerHTML = `<li style="font-size:0.75rem; color:var(--text-muted); text-align:center;">لا توجد سجلات نظافة معتمدة حالياً</li>`;
        } else {
            recent.forEach(r => {
                const li = document.createElement("li");
                li.style = "padding: 0.5rem; border-radius:8px; border: 1px solid var(--border-color); margin: 3px 0; background:var(--bg-input); font-size:0.75rem; display:flex; justify-content:space-between;";
                li.innerHTML = `
                    <span>بواسطة: <strong>${r.submittedBy.split('@')[0]}</strong></span>
                    <span style="color:#f59e0b; font-weight:700;">${(r.aiRating || r.manualRating).toFixed(1)}★</span>
                `;
                reportsList.appendChild(li);
            });
        }
    }

    // =======================================================
    // AI VISION PANEL RENDERING
    // =======================================================
    function loadAiVisionPanel() {
        // Reset states
        selectedPreset = null;
        currentAiResult = null;
        document.getElementById("fileNameLabel").textContent = NafasData.t("upload_btn");
        document.getElementById("manualNotesInput").value = "";
        
        // Hide outputs
        document.getElementById("aiAnalysisOutputPanel").style.display = "none";
        document.getElementById("canvasViewportContainer").style.display = "flex";
        document.getElementById("emptyCanvasPlaceholder").style.display = "block";
        document.getElementById("aiCanvas").style.display = "none";
        document.getElementById("beforeAfterSlider").style.display = "none";
        document.getElementById("aiScanningLoader").style.display = "none";
        document.getElementById("aiVisionHoaxWarning").style.display = "none";
        document.getElementById("aivisionAutoTaskPanel").style.display = "none";
    }

    window.selectPresetMock = (type) => {
        const select = document.getElementById("uploadAreaSelect");
        select.value = `area_${type}`;
        
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

        selectedPreset = {
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

        selectedPreset = file;
        document.getElementById("fileNameLabel").textContent = file.name;

        const canvasPlaceholder = document.getElementById("emptyCanvasPlaceholder");
        canvasPlaceholder.innerHTML = `
            <i class="fas fa-file-image text-primary" style="font-size: 3rem;"></i>
            <p style="font-weight: 700; margin-top: 0.5rem;">File Loaded: ${file.name}</p>
        `;
        showToast("success", "info", `تم تحميل ملف الصورة: ${file.name}`);
    }

    function handleRunAiScan() {
        if (!selectedPreset) {
            showToast("error", "error", "يرجى تحديد ملف صورة أو اختيار نموذج محاكاة أولاً.");
            return;
        }

        // Hide warning and outputs first
        document.getElementById("aiVisionHoaxWarning").style.display = "none";
        document.getElementById("aiAnalysisOutputPanel").style.display = "none";
        document.getElementById("aivisionAutoTaskPanel").style.display = "none";

        // Check simulation of hoax
        const isCheat = document.getElementById("toggleAntiCheatSimulation").checked;
        const relevance = NafasAI.auditImageRelevance(selectedPreset.name, isCheat);

        // 1. Start scanning loader animation
        const loader = document.getElementById("aiScanningLoader");
        const loaderText = document.getElementById("scanningLoaderText");
        
        loader.style.display = "flex";
        loaderText.textContent = NafasData.t("relevance_checking");

        setTimeout(() => {
            if (!relevance.valid) {
                // Warning Hoax detected! Block task & saving
                loader.style.display = "none";
                document.getElementById("aiVisionHoaxWarning").style.display = "block";
                showToast("relevance_failed", "error", "تم كشف محاكاة غش أو رفع صورة غير معتمدة!");
                return;
            }

            // Valid image context
            loaderText.textContent = NafasData.t("analyzing_text");

            setTimeout(() => {
                loader.style.display = "none";
                const selectedArea = document.getElementById("uploadAreaSelect").value;
                const result = NafasAI.analyzeImage(selectedArea, !selectedPreset.preset, selectedPreset.name);
                currentAiResult = result;

                // Handle before/after rendering for dirty cafeteria preset
                const isCafDirty = selectedPreset.preset && selectedPreset.presetType === "cafeteria";
                
                const canvas = document.getElementById("aiCanvas");
                const slider = document.getElementById("beforeAfterSlider");
                const placeholder = document.getElementById("emptyCanvasPlaceholder");

                placeholder.style.display = "none";

                if (isCafDirty) {
                    // Show slider comparison
                    canvas.style.display = "none";
                    slider.style.display = "block";
                    setupBeforeAfterSlider();
                } else {
                    // Show canvas with bounding boxes
                    canvas.style.display = "block";
                    slider.style.display = "none";
                    
                    const ctx = canvas.getContext("2d");
                    const mockImg = new Image();
                    mockImg.onload = () => {
                        canvas.width = 400;
                        canvas.height = 300;
                        NafasAI.drawObjects(canvas, ctx, mockImg, result.objects, NafasI18n.getLang());
                    };
                    mockImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='400' height='300' fill='%231b2622'/><text x='50%25' y='50%25' fill='%2364748b' font-family='sans-serif' font-size='20' text-anchor='middle'>[ " + NafasData.t(selectedArea) + " Scan ]</text></svg>";
                }

                // Render metrics
                document.getElementById("outputPollutionPercent").textContent = `${result.pollutionPercent}%`;
                document.getElementById("outputDensityLevel").textContent = result.densityLevel.toUpperCase();
                document.getElementById("outputCleanlinessRating").textContent = `${result.aiRating.toFixed(1)}★`;
                document.getElementById("outputConfidence").textContent = `${Math.round(result.confidence * 100)}%`;

                const tagsContainer = document.getElementById("outputDetectedObjectsTags");
                tagsContainer.innerHTML = "";
                
                if (result.objects.length === 0) {
                    tagsContainer.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">لم يتم رصد مخلفات. المرفق نظيف جداً!</span>`;
                } else {
                    const colors = { trash_plastic: "#3b82f6", trash_paper: "#eab308", trash_food: "#ef4444", trash_other: "#8b5cf6" };
                    result.objects.forEach(o => {
                        const tag = document.createElement("span");
                        tag.className = "pill-status";
                        tag.style.backgroundColor = colors[o.type] || "#10b981";
                        tag.style.color = "white";
                        tag.textContent = NafasData.t(o.type);
                        tagsContainer.appendChild(tag);
                    });

                    // Real pollution detected: show auto-task prompt button
                    document.getElementById("aivisionAutoTaskPanel").style.display = "flex";
                }

                document.getElementById("aiAnalysisOutputPanel").style.display = "block";
                showToast("success", "success", "اكتمل تحليل الذكاء الاصطناعي بنجاح!");
            }, 1000);
        }, 1200);
    }

    function setupBeforeAfterSlider() {
        const sliderRange = document.getElementById("imageSliderRangeController");
        const beforeImg = document.getElementById("sliderBeforeImgWrapper");

        // Sync slider width on range input
        sliderRange.addEventListener("input", (e) => {
            const val = e.target.value;
            beforeImg.style.width = `${val}%`;
        });
        
        // Reset to 50%
        sliderRange.value = 50;
        beforeImg.style.width = "50%";
    }

    function triggerAutoTaskCreation() {
        if (!currentAiResult) return;

        // Auto task details
        const area = currentAiResult.area;
        const taskTitle = `إزالة نفايات عاجلة برصد الرؤية الحاسوبية (${NafasData.t(area)})`;
        
        const newTask = {
            id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
            title: taskTitle,
            area: area,
            priority: "priority_high",
            assignedTo: "staff@nafas.edu",
            status: "pending",
            date: new Date().toISOString()
        };

        NafasData.addTask(newTask);

        // Add alert to notifications bell for cleaner staff
        const newAnn = {
            id: `A-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString(),
            sender: currentUser.email,
            target: "role_staff",
            text: `تنبيه عاجل: تم إدراج مهمة تنظيف في (${NafasData.t(area)}) بواسطة الرؤية الحاسوبية بدقة ${Math.round(currentAiResult.confidence * 100)}%.`
        };
        NafasData.addAnnouncement(newAnn);

        // Reload notifications in memory if they are staff
        if (currentUser.role === "role_staff") {
            loadNotificationsFromDatabase();
        }

        document.getElementById("aivisionAutoTaskPanel").style.display = "none";
        showToast("aivision_task_created", "success");
    }

    function handleSaveAiReport() {
        if (!currentAiResult) return;

        const note = document.getElementById("manualNotesInput").value;
        const report = {
            id: `R-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString(),
            area: currentAiResult.area,
            submittedBy: currentUser.email,
            manualRating: 3, 
            notes: note || "تحليل تلقائي تم حفظه بواسطة المنصة.",
            aiRating: currentAiResult.aiRating,
            pollutionPercent: currentAiResult.pollutionPercent,
            densityLevel: currentAiResult.densityLevel,
            confidence: currentAiResult.confidence,
            status: currentUser.role === "role_admin" ? "approved" : "pending", // Admins auto-approve, others pending review
            objects: currentAiResult.objects,
            imageName: selectedPreset.name
        };

        NafasData.addReport(report);
        
        if (currentUser.role === "role_admin") {
            showToast("report_saved", "success");
        } else {
            showToast("report_submitted_success", "success");
        }
        
        // Re-route to dailyreports
        window.location.hash = "dailyreports";
    }

    // =======================================================
    // TASKS CHECKLIST PANEL
    // =======================================================
    function loadTasksPanel() {
        const filter = document.getElementById("taskFilterSelect").value;
        const tbody = document.getElementById("tasksTableBody");
        tbody.innerHTML = "";

        // Roles check: Teacher & Admin can add new tasks
        const canCreate = currentUser.role === "role_admin" || currentUser.role === "role_teacher";
        document.getElementById("taskCreationFormBlock").style.display = canCreate ? "block" : "none";

        // Load users to fill assignee dropdown in creation form
        if (canCreate) {
            const staffSelect = document.getElementById("taskInputAssignee");
            staffSelect.innerHTML = "";
            const usersList = NafasData.getUsers().filter(u => u.role === "role_staff" || u.role === "role_student");
            usersList.forEach(u => {
                const opt = document.createElement("optgroup");
                opt.label = NafasData.t(u.role).split(' ')[0];
                const optItem = document.createElement("option");
                optItem.value = u.email;
                optItem.textContent = `${u.name} (${u.email.split('@')[0]})`;
                opt.appendChild(optItem);
                staffSelect.appendChild(opt);
            });
        }

        const tasks = NafasData.getTasks();
        const filtered = tasks.filter(t => {
            if (filter === "completed" && t.status !== "completed") return false;
            if (filter === "pending" && t.status !== "pending") return false;
            return true;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">لا توجد مهام مطابقة حالياً</td></tr>`;
            return;
        }

        filtered.forEach(t => {
            const tr = document.createElement("tr");
            
            // Checkbox for completed status toggle (Only assigned user or admin/teacher can toggle)
            const isAssigned = currentUser.email === t.assignedTo;
            const canToggle = isAssigned || currentUser.role === "role_admin" || currentUser.role === "role_teacher";
            
            const isCompleted = t.status === "completed";
            
            const checkboxMarkup = canToggle 
                ? `<input type="checkbox" style="width:18px; height:18px; cursor:pointer;" ${isCompleted ? 'checked' : ''} onchange="toggleTaskCompletion('${t.id}', this.checked)">`
                : `<input type="checkbox" style="width:18px; height:18px;" ${isCompleted ? 'checked' : ''} disabled>`;

            // Priority badge styling
            const priorityClass = t.priority.replace("priority_", "");
            const statusMarkup = `<span class="pill-status ${isCompleted ? 'approved' : 'pending'}">${isCompleted ? 'مكتملة' : 'قيد الانتظار'}</span>`;

            tr.innerHTML = `
                <td>${checkboxMarkup}</td>
                <td style="font-weight: 700; text-decoration: ${isCompleted ? 'line-through' : 'none'}; color: ${isCompleted ? 'var(--text-muted)' : 'var(--text-main)'};">${t.title}</td>
                <td>${NafasData.t(t.area)}</td>
                <td>${t.assignedTo.split('@')[0]}</td>
                <td><span class="rec-badge ${priorityClass}">${NafasData.t(t.priority)}</span></td>
                <td>${statusMarkup}</td>
                <td>
                    ${canToggle && !isCompleted ? `<button class="btn btn-secondary btn-sm" onclick="completeTaskSim('${t.id}')">إنجاز</button>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.toggleTaskCompletion = (id, checked) => {
        const newStatus = checked ? "completed" : "pending";
        const success = NafasData.updateTaskStatus(id, currentUser.email, newStatus);
        if (success) {
            showToast("settings_saved", "success", "تم تحديث حالة المهمة بنجاح!");
            
            // Give cleaner points if completed (+20 points)
            if (checked) {
                const tasks = NafasData.getTasks();
                const task = tasks.find(t => t.id === id);
                if (task) {
                    const assignee = NafasData.getUsers().find(u => u.email === task.assignedTo);
                    if (assignee) {
                        assignee.points = (assignee.points || 0) + 20;
                        localStorage.setItem("nafas_users", JSON.stringify(NafasData.getUsers()));
                    }
                }
            }

            loadTasksPanel();
            loadOverviewPanel();
        }
    };

    window.completeTaskSim = (id) => {
        window.toggleTaskCompletion(id, true);
    };

    function handleTaskCreation(e) {
        e.preventDefault();
        const title = document.getElementById("taskInputTitle").value;
        const area = document.getElementById("taskInputArea").value;
        const assignee = document.getElementById("taskInputAssignee").value;

        const newTask = {
            id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
            title: title,
            area: area,
            priority: "priority_medium",
            assignedTo: assignee,
            status: "pending",
            date: new Date().toISOString()
        };

        NafasData.addTask(newTask);
        document.getElementById("taskCreationForm").reset();
        loadTasksPanel();
        showToast("settings_saved", "success", "تم إدراج المهمة بنجاح وتعيين المسؤول.");
    }

    // =======================================================
    // DAILY REPORTS & APPROVALS PANEL
    // =======================================================
    function loadDailyReportsPanel() {
        const isAdmin = currentUser.role === "role_admin";
        
        // Update section title and lists headings
        const managerTitle = document.getElementById("dailyReportsManagerTitle");
        managerTitle.textContent = isAdmin 
            ? NafasData.t("manager_approvals_title") 
            : "سجل بلاغاتي اليومية المقدمة";

        renderDailyReportsTable();
    }

    function renderDailyReportsTable() {
        const tbody = document.getElementById("dailyReportsTableBody");
        tbody.innerHTML = "";

        const reports = NafasData.getReports();
        const isAdmin = currentUser.role === "role_admin";

        // If Admin, show pending reports from students. If Student, show only their reports.
        const list = isAdmin 
            ? reports.filter(r => r.status === "pending")
            : reports.filter(r => r.submittedBy === currentUser.email);

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">لا توجد طلبات لمراجعتها حالياً</td></tr>`;
            return;
        }

        list.forEach(r => {
            const tr = document.createElement("tr");
            
            let actionMarkup = "";
            if (isAdmin) {
                actionMarkup = `
                    <div style="display:flex; gap:0.25rem;">
                        <button class="btn btn-primary btn-sm" onclick="approveSubmission('${r.id}')">${NafasData.t("approve_btn")}</button>
                        <button class="btn btn-secondary btn-sm" onclick="rejectSubmission('${r.id}')" style="color:var(--color-critical);">${NafasData.t("reject_btn")}</button>
                    </div>
                `;
            } else {
                actionMarkup = `<button class="btn btn-secondary btn-sm" onclick="viewReportDetailsModal('${r.id}')"><i class="fas fa-eye"></i></button>`;
            }

            const rating = r.aiRating || r.manualRating;
            const statusClass = r.status === "approved" ? "approved" : r.status === "pending" ? "pending" : "rejected";
            const statusLabel = r.status === "approved" ? "مقبول" : r.status === "pending" ? "معلق" : "مرفوض";

            tr.innerHTML = `
                <td style="font-weight:700;">${r.submittedBy.split('@')[0]}</td>
                <td>${NafasData.t(r.area)}</td>
                <td style="color:#f59e0b; font-weight:700;">${rating.toFixed(1)}★</td>
                <td><span class="pill-status ${statusClass}">${statusLabel}</span></td>
                <td>${actionMarkup}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.approveSubmission = (id) => {
        const success = NafasData.approveReport(id, currentUser.email);
        if (success) {
            showToast("settings_saved", "success", "تمت الموافقة على البلاغ وإيداع +50 نقطة للطالب!");
            renderDailyReportsTable();
            loadOverviewPanel();
        }
    };

    window.rejectSubmission = (id) => {
        const success = NafasData.rejectReport(id, currentUser.email);
        if (success) {
            showToast("settings_saved", "info", "تم رفض البلاغ المقدم.");
            renderDailyReportsTable();
            loadOverviewPanel();
        }
    };

    function handleDailyReportSubmit(e) {
        e.preventDefault();
        const area = document.getElementById("dailyReportAreaSelect").value;
        const rating = parseInt(document.getElementById("dailyReportRatingInput").value);
        const notes = document.getElementById("dailyReportNotes").value;

        const newReport = {
            id: `R-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString(),
            area: area,
            submittedBy: currentUser.email,
            manualRating: rating,
            notes: notes,
            aiRating: rating - 0.2 + Math.random() * 0.4, // close to manual
            pollutionPercent: Math.round((5 - rating) * 20),
            densityLevel: rating >= 4 ? "low" : rating >= 2.5 ? "medium" : "high",
            confidence: 0.92,
            status: "pending", // Needs admin approval to award points
            objects: [],
            imageName: "custom_daily_report.jpg"
        };

        NafasData.addReport(newReport);
        document.getElementById("dailyReportSubmissionForm").reset();
        // Reset stars styling
        document.querySelectorAll(".rating-composer-star").forEach(s => {
            s.className = "far fa-star rating-composer-star";
        });
        document.getElementById("dailyReportRatingInput").value = "3";

        showToast("report_submitted_success", "success");
        renderDailyReportsTable();
    }

    // =======================================================
    // ENVIRONMENTAL CALENDAR PANEL
    // =======================================================
    function loadCalendarPanel() {
        const cellsContainer = document.getElementById("ecoCalendarCellsContainer");
        cellsContainer.innerHTML = "";

        const events = NafasData.getCalendarEvents();
        
        // Month of June 2026. June starts on Monday (1). Total days: 30.
        // Weekdays: Sun (0), Mon (1), Tue (2), Wed (3), Thu (4), Fri (5), Sat (6)
        // Monday starts at index 1, so Sunday (index 0) cell is empty.
        const daysInJune = 30;
        
        // Add empty cells for Sunday offset
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-cell";
        emptyCell.style.opacity = "0";
        emptyCell.style.pointerEvents = "none";
        cellsContainer.appendChild(emptyCell);

        for (let day = 1; day <= daysInJune; day++) {
            const dateStr = `2026-06-${day.toString().padStart(2, '0')}`;
            const matchedEvent = events.find(e => e.date === dateStr);

            const cell = document.createElement("div");
            cell.className = "calendar-cell";
            if (matchedEvent) {
                cell.classList.add("has-event");
            }
            if (day === 20) { // today simulated date in metadata
                cell.classList.add("today");
            }

            cell.innerHTML = `
                <span class="calendar-cell-num">${day}</span>
                ${matchedEvent ? `<span class="calendar-event-dot"></span>` : ''}
            `;

            cell.addEventListener("click", () => {
                highlightSelectedCalendarDay(cell, matchedEvent);
            });

            cellsContainer.appendChild(cell);
        }

        // Reset details panel
        document.getElementById("calendarSidebarPlaceholder").style.display = "block";
        document.getElementById("calendarSidebarContent").style.display = "none";
    }

    function highlightSelectedCalendarDay(cell, event) {
        document.querySelectorAll(".calendar-cell").forEach(c => c.style.borderColor = "var(--border-color)");
        cell.style.borderColor = "var(--primary)";

        const placeholder = document.getElementById("calendarSidebarPlaceholder");
        const content = document.getElementById("calendarSidebarContent");

        if (event) {
            placeholder.style.display = "none";
            content.style.display = "block";

            document.getElementById("calendarEventTitle").textContent = event.title;
            document.getElementById("calendarEventDateText").textContent = event.date;
            document.getElementById("calendarEventLocationText").textContent = event.location;
            document.getElementById("calendarEventDesc").textContent = event.desc;
        } else {
            placeholder.style.display = "block";
            content.style.display = "none";
        }
    }

    // =======================================================
    // REWARDS & LEADERBOARD PANEL
    // =======================================================
    function loadLeaderboardPanel() {
        // Sync points wallet in sidebar and dashboard
        document.getElementById("walletPointsValue").textContent = currentUser.points;
        document.getElementById("walletStreakValue").textContent = currentUser.streak || 0;

        // Sync winner blocks names
        const leadingStudent = NafasData.getStudentLeaderboard()[0];
        document.getElementById("winnerTopStudent").textContent = leadingStudent.name.split(' ')[0];
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
    // ANALYTICS & CHARTS PANEL
    // =======================================================
    function loadAnalyticsCharts() {
        // Destroy existing chart instances to re-render clean
        Object.keys(charts).forEach(key => {
            if (charts[key]) charts[key].destroy();
        });

        const reports = NafasData.getReports().filter(r => r.status === "approved");
        const lang = NafasI18n.getLang();
        const theme = document.documentElement.getAttribute("data-theme") || "dark";
        
        const isDark = theme === "dark";
        const gridColor = isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(0,0,0,0.05)";
        const labelColor = isDark ? "#94a3b8" : "#64748b";

        // Chart 1: Cleanliness Trends
        const reversedReports = [...reports].reverse().slice(-7);
        const labels1 = reversedReports.map((r, i) => `${NafasData.t(r.area).split(' ')[0]} #${r.id}`);
        const data1 = reversedReports.map(r => r.aiRating || r.manualRating);

        charts.trends = new Chart(document.getElementById("chartCleanlinessTrends").getContext("2d"), {
            type: "line",
            data: {
                labels: labels1.length > 0 ? labels1 : ["الساحة #R-1", "الفصول #R-2"],
                datasets: [{
                    label: lang === "ar" ? "معدل النظافة" : "Cleanliness Rating",
                    data: data1.length > 0 ? data1 : [4.2, 4.9],
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
                    data: [
                        wasteCounts.trash_plastic || 12,
                        wasteCounts.trash_paper || 8,
                        wasteCounts.trash_food || 15,
                        wasteCounts.trash_other || 4
                    ],
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

        // Chart 4: Pollution by Time of Day
        charts.time = new Chart(document.getElementById("chartPollutionByTime").getContext("2d"), {
            type: "bar",
            data: {
                labels: lang === "ar" ? ["7:00 ص", "9:30 ص", "12:00 م", "2:00 م"] : ["7:00 AM", "9:30 AM", "12:00 PM", "2:00 PM"],
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
        showToast("report_generated", "success", `تم تصدير التقرير الـ ${period === 'daily' ? 'اليومي' : period === 'weekly' ? 'الأسبوعي' : 'الشهري'} بنجاح وحفظه.`);
    };

    // =======================================================
    // AI RECOMMENDATIONS PANEL
    // =======================================================
    function loadRecommendationsPanel() {
        const recs = NafasData.getRecommendations();
        const tbody = document.getElementById("recommendationsTableBody");
        tbody.innerHTML = "";

        recs.forEach((rec, index) => {
            const tr = document.createElement("tr");
            
            const priorityClass = rec.priority.replace("priority_", "");
            const statusClass = rec.status.replace("status_", "");

            // Dropdown selector for admins/teachers
            const statusMarkup = `
                <select class="form-control select-control-styled btn-sm" onchange="changeRecStatus('${rec.id}', this.value)" style="width: 130px; font-weight:600;">
                    <option value="status_pending" ${rec.status === 'status_pending' ? 'selected' : ''}>${NafasData.t("status_pending")}</option>
                    <option value="status_in_progress" ${rec.status === 'status_in_progress' ? 'selected' : ''}>${NafasData.t("status_in_progress")}</option>
                    <option value="status_completed" ${rec.status === 'status_completed' ? 'selected' : ''}>${NafasData.t("status_completed")}</option>
                </select>
            `;

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
        const success = NafasData.updateRecommendationStatus(id, currentUser.email, newStatus);
        if (success) {
            showToast("settings_saved", "success", "تم تحديث حالة التوصية الذكية بنجاح!");
            loadRecommendationsPanel();
        }
    };

    // =======================================================
    // AUDIT HISTORY PANEL
    // =======================================================
    function populateHistoryFilters() {
        const users = NafasData.getUsers();
        const select = document.getElementById("filterUser");
        
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

        const filtered = reports.filter(r => {
            if (areaF !== "all" && r.area !== areaF) return false;
            if (userF !== "all" && r.submittedBy !== userF) return false;
            if (wasteF !== "all" && !r.objects.some(o => o.type === wasteF)) return false;
            return true;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">لا توجد سجلات مطابقة للفلاتر</td></tr>`;
            return;
        }

        filtered.forEach(r => {
            const dateStr = new Date(r.date).toLocaleString(NafasI18n.getLang() === 'ar' ? 'ar-SA' : 'en-US', {dateStyle: 'medium', timeStyle: 'short'});
            const tr = document.createElement("tr");
            
            const rating = r.aiRating || r.manualRating;
            
            tr.innerHTML = `
                <td><strong>${r.id}</strong></td>
                <td style="color:var(--text-muted); font-size:0.75rem;">${dateStr}</td>
                <td style="font-weight:700;">${NafasData.t(r.area)}</td>
                <td style="color:#eab308; font-weight:700;">${rating.toFixed(1)}★</td>
                <td style="font-weight:700;">${r.pollutionPercent}%</td>
                <td>${r.submittedBy.split('@')[0]}</td>
                <td><button class="btn btn-secondary btn-sm" onclick="viewReportDetailsModal('${r.id}')"><i class="fas fa-eye"></i> عرض</button></td>
            `;
            tbody.appendChild(tr);
        });
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
        document.getElementById("modalReportNotes").textContent = report.notes || "لا توجد ملاحظات ميدانية.";

        openModal("reportDetailModal");

        // Draw bounding boxes inside canvas
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
    }

    window.editUserSim = (email) => {
        const users = NafasData.getUsers();
        const user = users.find(u => u.email === email);
        if (!user) return;

        document.getElementById("adminUserFormTitle").textContent = NafasData.t("edit_user");
        document.getElementById("adminUserEditEmail").value = user.email;
        document.getElementById("adminUserEmail").value = user.email;
        document.getElementById("adminUserEmail").disabled = true;
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
            NafasData.updateUser(editEmail, {
                name,
                role,
                assignedArea: area,
                oneTimeAccess: oneTime
            });
            showToast("settings_saved", "success", "تم تعديل بيانات المستخدم بنجاح.");
        } else {
            const newUser = {
                email,
                password: "temp123",
                name,
                role,
                assignedArea: area,
                firstLogin: true,
                oneTimeAccess: false,
                points: 0,
                streak: 0
            };
            NafasData.addUser(newUser);
            showToast("settings_saved", "success", "تم إنشاء الحساب بنجاح وإرسال كلمة المرور المؤقتة.");
        }

        resetAdminUserForm();
        loadAdminPanel();
        populateHistoryFilters();
    }

    window.deleteUserSim = (email) => {
        if (currentUser.email === email) {
            showToast("error", "error", "لا يمكنك حذف حسابك الشخصي!");
            return;
        }

        if (confirm(`هل أنت متأكد من حذف الحساب: ${email}؟`)) {
            NafasData.deleteUser(email);
            showToast("settings_saved", "success", "تم حذف الحساب بنجاح.");
            loadAdminPanel();
            populateHistoryFilters();
        }
    };

    // =======================================================
    // USER PROFILE & ACHIEVEMENTS BADGES PANEL
    // =======================================================
    function loadProfilePanel() {
        document.getElementById("profileUserAvatar").textContent = currentUser.name.charAt(0);
        document.getElementById("profileUserDisplayName").textContent = currentUser.name;
        document.getElementById("profileUserDisplayRole").textContent = NafasI18n.t(currentUser.role);
        document.getElementById("profileUserEmail").textContent = currentUser.email;

        // Badge unlocking criteria logic
        // 🥇 Sustainability Champion: points >= 500
        const isChamp = currentUser.points >= 500;
        toggleBadgeGlow("sustainability", isChamp);

        // ♻️ Recycling Expert: submitted >= 5 plastic/paper scans
        const reports = NafasData.getReports().filter(r => r.submittedBy === currentUser.email);
        const sortingCount = reports.filter(r => r.objects.some(o => o.type === "trash_plastic" || o.type === "trash_paper")).length;
        const isRecycleExp = sortingCount >= 2 || currentUser.points >= 400; // soft seed fallback
        toggleBadgeGlow("recycling", isRecycleExp);

        // 💧 Water Guardian: resolved restrooms or water-saving tasks
        const tasks = NafasData.getTasks().filter(t => t.assignedTo === currentUser.email && t.status === "completed" && t.area === "area_restrooms");
        const isWater = tasks.length > 0 || currentUser.points >= 200; 
        toggleBadgeGlow("water", isWater);

        // ⚡ Energy Saver: energy reports
        const isEnergy = currentUser.points >= 150; 
        toggleBadgeGlow("energy", isEnergy);

        // 🌳 Eco Ambassador: points >= 300
        const isAmbassador = currentUser.points >= 300;
        toggleBadgeGlow("eco", isAmbassador);
    }

    function toggleBadgeGlow(id, active) {
        const card = document.getElementById(`badge-${id}-card`);
        if (card) {
            if (active) {
                card.classList.add("unlocked");
            } else {
                card.classList.remove("unlocked");
            }
        }
    }

    // =======================================================
    // ANNOUNCEMENTS BROADCASTING PANEL (Admin)
    // =======================================================
    function loadAnnouncementsComposerPanel() {
        renderAnnouncementsBroadcastLogs();
    }

    function renderAnnouncementsBroadcastLogs() {
        const tbody = document.getElementById("announcementsBroadcastLogBody");
        tbody.innerHTML = "";

        const anns = NafasData.getAnnouncements();
        anns.forEach(a => {
            const tr = document.createElement("tr");
            const dateStr = new Date(a.date).toLocaleDateString();
            tr.innerHTML = `
                <td style="color:var(--text-muted); font-size:0.75rem;">${dateStr}</td>
                <td><span class="pill-status pending" style="box-shadow:none;">${NafasI18n.t(a.target).split(' ')[0]}</span></td>
                <td style="font-size:0.8rem;">${a.text}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function handleAnnouncementBroadcast(e) {
        e.preventDefault();
        const target = document.getElementById("announcementTargetSelect").value;
        const text = document.getElementById("announcementComposerText").value;

        const newAnn = {
            id: `A-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString(),
            sender: currentUser.email,
            target: target,
            text: text
        };

        NafasData.addAnnouncement(newAnn);
        document.getElementById("announcementComposerText").value = "";
        
        showToast("settings_saved", "success", "تم بث الإعلان بنجاح لكافة المستخدمين المستهدفين.");
        renderAnnouncementsBroadcastLogs();
        loadNotificationsFromDatabase();
    }

    // =======================================================
    // NOTIFICATIONS TIMELINE PANEL
    // =======================================================
    function loadNotificationsTimelinePanel() {
        const container = document.getElementById("notificationsTimelineContainer");
        container.innerHTML = "";

        if (notifications.length === 0) {
            container.innerHTML = `<div class="detail-placeholder" style="padding:2rem;"><p>لا توجد إشعارات حالياً</p></div>`;
            return;
        }

        notifications.forEach(n => {
            const card = document.createElement("div");
            card.style = "padding:1rem; border-radius:12px; border:1px solid var(--border-color); background:var(--bg-card); display:flex; gap:1rem; align-items:center;";
            card.innerHTML = `
                <i class="fas fa-bullhorn text-primary" style="font-size:1.5rem;"></i>
                <div>
                    <h4 style="font-weight:700; font-size:0.9rem;">${n.title}</h4>
                    <p style="font-size:0.8rem; margin:0.25rem 0;">${n.text}</p>
                    <small style="color:var(--text-muted); font-size:0.7rem;">${n.time}</small>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function updateNotificationBell() {
        const badge = document.getElementById("notificationCount");
        const count = notifications.length;
        
        if (count > 0) {
            badge.style.display = "flex";
            badge.textContent = count;
        } else {
            badge.style.display = "none";
        }
        renderNotificationsDropdownList();
    }

    function renderNotificationsDropdownList() {
        const list = document.getElementById("notificationsList");
        list.innerHTML = "";

        if (notifications.length === 0) {
            list.innerHTML = `
                <div class="detail-placeholder" style="min-height: 100px; padding: 1rem;">
                    <p style="font-size: 0.8rem; color: var(--text-muted);">لا توجد إشعارات حالياً</p>
                </div>
            `;
            return;
        }

        notifications.slice(0, 4).forEach(n => {
            const card = document.createElement("div");
            card.className = "notification-item-card";
            card.innerHTML = `
                <i class="fas fa-bullhorn"></i>
                <div>
                    <div class="title">${n.title}</div>
                    <div style="margin: 2px 0;">${n.text.substring(0, 60)}...</div>
                    <div class="time">${n.time}</div>
                </div>
            `;
            list.appendChild(card);
        });
    }

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
        welcomeMsg.style = "background:rgba(16,185,129,0.08); padding:0.75rem; border-radius:10px; font-size:0.8rem; align-self:flex-start; max-width:85%; border:1px solid var(--border-color);";
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
        userMsg.style = "background:var(--primary); color:white; padding:0.75rem; border-radius:10px; font-size:0.8rem; align-self:flex-end; max-width:85%;";
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
            botMsg.style = "background:rgba(16,185,129,0.08); padding:0.75rem; border-radius:10px; font-size:0.8rem; align-self:flex-start; max-width:85%; border:1px solid var(--border-color);";
            botMsg.innerHTML = reply;
            logs.appendChild(botMsg);
            
            logs.scrollTop = logs.scrollHeight;
        }, 1000);
    }

    function logout() {
        NafasAuth.logout();
        window.location.href = "index.html";
    }
    window.logout = logout;

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
        switchPanel: (panelId) => { window.location.hash = panelId; }
    };
})();
window.NafasDashboard = NafasDashboard;
