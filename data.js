// Nafas School Sustainability Platform - Data Store & Mock Database
const NafasData = (() => {
    // Initial Seed Users Database
    const defaultUsers = [
        {
            email: "admin@nafas.edu",
            password: "admin123",
            name: "سعد القحطاني",
            role: "role_admin",
            assignedArea: "all",
            firstLogin: false,
            oneTimeAccess: false,
            points: 0,
            streak: 0
        },
        {
            email: "teacher@nafas.edu",
            password: "teacher123",
            name: "أ. نورة الشهري",
            role: "role_teacher",
            assignedArea: "area_classrooms",
            firstLogin: false,
            oneTimeAccess: false,
            points: 150,
            streak: 3
        },
        {
            email: "student@nafas.edu",
            password: "student123",
            name: "سعيد الحربي",
            role: "role_student",
            assignedArea: "area_yard",
            firstLogin: false,
            oneTimeAccess: false,
            points: 480,
            streak: 7
        },
        {
            email: "staff@nafas.edu",
            password: "staff123",
            name: "أبو فهد (الصيانة)",
            role: "role_staff",
            assignedArea: "all",
            firstLogin: false,
            oneTimeAccess: false,
            points: 210,
            streak: 5
        },
        {
            email: "newstudent@nafas.edu",
            password: "temp123", // Temporary password for first-login reset
            name: "فيصل الخريّف",
            role: "role_student",
            assignedArea: "area_cafeteria",
            firstLogin: true,
            oneTimeAccess: false,
            points: 0,
            streak: 0
        },
        {
            email: "forgotten@nafas.edu",
            password: "change123",
            name: "عبدالعزيز العتيبي",
            role: "role_student",
            assignedArea: "area_restrooms",
            firstLogin: false,
            oneTimeAccess: true, // Requires password change on next login
            points: 120,
            streak: 1
        }
    ];

    // Initial Seed Reports Database
    const defaultReports = [
        {
            id: "R-1001",
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            area: "area_yard",
            submittedBy: "student@nafas.edu",
            manualRating: 4,
            notes: "أوراق شجر متساقطة في الساحة الغربية وتم كنسها من قبل الطلاب المناوبين.",
            aiRating: 4.2,
            pollutionPercent: 12,
            densityLevel: "low",
            confidence: 0.94,
            status: "approved",
            objects: [
                { type: "trash_paper", label: "Paper Wrapper", box: [120, 150, 45, 30] },
                { type: "trash_other", label: "Dry Leaf Pile", box: [300, 200, 110, 80] }
            ],
            imageName: "yard_clean"
        },
        {
            id: "R-1002",
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            area: "area_cafeteria",
            submittedBy: "teacher@nafas.edu",
            manualRating: 2,
            notes: "تراكم علب بلاستيكية ومخلفات وجبات الإفطار بعد الفسحة المدرسية الأولى.",
            aiRating: 1.8,
            pollutionPercent: 68,
            densityLevel: "high",
            confidence: 0.91,
            status: "approved",
            objects: [
                { type: "trash_plastic", label: "Plastic Bottle", box: [80, 220, 50, 90] },
                { type: "trash_plastic", label: "Plastic Box", box: [150, 250, 70, 50] },
                { type: "trash_food", label: "Leftover Sandwich", box: [260, 180, 90, 60] },
                { type: "trash_plastic", label: "Juice Pouch", box: [340, 300, 40, 60] }
            ],
            imageName: "cafeteria_dirty"
        },
        {
            id: "R-1003",
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            area: "area_restrooms",
            submittedBy: "forgotten@nafas.edu",
            manualRating: 3,
            notes: "أوراق تنشيف ملقاة على الأرض والوضع متوسط النظافة.",
            aiRating: 3.0,
            pollutionPercent: 35,
            densityLevel: "medium",
            confidence: 0.88,
            status: "approved",
            objects: [
                { type: "trash_paper", label: "Paper Towel", box: [100, 200, 80, 60] },
                { type: "trash_paper", label: "Paper Tissue", box: [220, 260, 50, 40] }
            ],
            imageName: "restroom_medium"
        },
        {
            id: "R-1004",
            date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
            area: "area_classrooms",
            submittedBy: "teacher@nafas.edu",
            manualRating: 5,
            notes: "الفصل ١/أ نموذج ومثالي وخالي تماماً من الأوساخ بعد حصة النشاط.",
            aiRating: 4.9,
            pollutionPercent: 2,
            densityLevel: "low",
            confidence: 0.97,
            status: "approved",
            objects: [],
            imageName: "classroom_clean"
        }
    ];

    // Initial AI Recommendations
    const defaultRecommendations = [
        {
            id: "REC-2001",
            titleKey: "rec_bins_yard",
            title: "زيادة حاويات الفرز في ساحة المدرسة",
            reasonKey: "reason_bins_yard",
            reason: "رصد تكرار وجود علب بلاستيكية في الفناء الخارجي بنسبة تتجاوز 40٪ من إجمالي المخلفات الأسبوعية.",
            priority: "priority_high",
            status: "status_pending"
        },
        {
            id: "REC-2002",
            titleKey: "rec_schedule_cafeteria",
            title: "جدولة عمليات التنظيف فور انتهاء الفسحة",
            reasonKey: "reason_schedule_cafeteria",
            reason: "تحليل ذروة انخفاض تقييم النظافة في المقصف المدرسي يومياً بين الساعة 10:15 صباحاً و11:00 صباحاً.",
            priority: "priority_high",
            status: "status_in_progress"
        },
        {
            id: "REC-2003",
            titleKey: "rec_campaign_classroom",
            title: "إطلاق حملة توعية لإعادة تدوير الورق بالفصول",
            reasonKey: "reason_campaign_classroom",
            reason: "تراكم مخلفات الدفاتر والكرتون يمثل 75٪ من سلة المهملات داخل الصفوف الدراسية.",
            priority: "priority_medium",
            status: "status_completed"
        },
        {
            id: "REC-2004",
            titleKey: "rec_reassign_restrooms",
            title: "إعادة توزيع فرق النظافة الطلابية لدورات المياه",
            reasonKey: "reason_reassign_restrooms",
            reason: "معدل نظافة دورات المياه انخفض إلى 60٪ خلال الأيام الثلاثة الماضية بناءً على الفحص البصري.",
            priority: "priority_medium",
            status: "status_pending"
        }
    ];

    // Seeding default Tasks
    const defaultTasks = [
        {
            id: "T-3001",
            title: "إفراغ سلال إعادة التدوير في الممرات",
            area: "area_hallways",
            priority: "priority_medium",
            assignedTo: "staff@nafas.edu",
            status: "pending",
            date: new Date().toISOString()
        },
        {
            id: "T-3002",
            title: "تنظيف انسكابات العصير في المقصف المدرسي",
            area: "area_cafeteria",
            priority: "priority_high",
            assignedTo: "staff@nafas.edu",
            status: "pending",
            date: new Date().toISOString()
        },
        {
            id: "T-3003",
            title: "فحص تسرب مياه الصنبور الثالث وتصليحه",
            area: "area_restrooms",
            priority: "priority_high",
            assignedTo: "staff@nafas.edu",
            status: "completed",
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: "T-3004",
            title: "تنظيف الساحة بعد الفسحة المدرسية الأولى",
            area: "area_yard",
            priority: "priority_high",
            assignedTo: "staff@nafas.edu",
            status: "pending",
            date: new Date().toISOString()
        }
    ];

    // Seeding default Calendar Activities
    const defaultCalendarEvents = [
        {
            date: "2026-06-05",
            title: "اليوم العالمي للبيئة - World Environment Day",
            location: "مسرح المدرسة الرئيسي",
            desc: "فعاليات توعوية ومعرض الفرز الذكي وإطلاق مسابقة الاستدامة الكبرى.",
            points: 50
        },
        {
            date: "2026-06-15",
            title: "حملة تشجير ساحة المدرسة الغربية",
            location: "ساحة المدرسة الغربية",
            desc: "حملة تشجير لغرس 50 شتلة لزيادة الرقعة الخضراء وتقليص انبعاثات الكربون.",
            points: 50
        },
        {
            date: "2026-06-22",
            title: "ورشة عمل فرز البلاستيك وإعادة التدوير",
            location: "المقصف المدرسي",
            desc: "ورشة عمل تفاعلية لتعليم فرز البلاستيك وتحويل المخلفات لأسمدة.",
            points: 30
        },
        {
            date: "2026-06-28",
            title: "جولة مراجعة وترشيد استهلاك طاقة الفصول",
            location: "مبنى الفصول الدراسية",
            desc: "جولة تقييمية للتأكد من إطفاء الأنوار والمكيفات لترشيد هدر الكهرباء.",
            points: 40
        }
    ];

    // Seeding Announcements
    const defaultAnnouncements = [
        {
            id: "A-5001",
            date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            sender: "admin@nafas.edu",
            target: "all",
            text: "تنبيه: ستبدأ حملة تشجير ساحة المدرسة الغربية غداً الاثنين في تمام الساعة 9:00 صباحاً. نرحب بمشاركتكم الفعالة وكسب 50 نقطة استدامة!"
        },
        {
            id: "A-5002",
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            sender: "admin@nafas.edu",
            target: "role_staff",
            text: "يرجى من جميع منسوبي الصيانة تكثيف جولات النظافة في المقصف المدرسي فور انتهاء الفسحة للحد من تراكم البلاستيك."
        }
    ];

    // Gamification Standings
    const defaultStudentLeaderboard = [
        { name: "سعيد الحربي (الصف 2-أ)", points: 480 },
        { name: "سارة العتيبي (الصف 3-ب)", points: 410 },
        { name: "فيصل الحربي (الصف 1-أ)", points: 380 },
        { name: "لمى القحطاني (الصف 2-ب)", points: 310 },
        { name: "يوسف المطيري (الصف 3-أ)", points: 290 }
    ];

    const defaultClassroomLeaderboard = [
        { name: "الصف الثاني (أ)", points: 1420 },
        { name: "الصف الثالث (ب)", points: 1280 },
        { name: "الصف الأول (أ)", points: 1100 },
        { name: "الصف الثاني (ب)", points: 950 }
    ];

    // Initial Audit & System Activity Logs
    const defaultAuditLogs = [
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), user: "system", action: "Nafas Database initialized with default rules." },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), user: "student@nafas.edu", action: "User signed in and submitted a cleanliness report for School Yard (Approved)." },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), user: "teacher@nafas.edu", action: "Teacher uploaded picture for Cafeteria. AI classified 4 waste items (Critical Alert triggered)." },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), user: "admin@nafas.edu", action: "Administrator enabled 'One-Time Access Permission' for user forgotten@nafas.edu." }
    ];

    // LocalStorage helper utilities
    function load(key, defaultVal) {
        const stored = localStorage.getItem(`nafas_${key}`);
        if (!stored) {
            localStorage.setItem(`nafas_${key}`, JSON.stringify(defaultVal));
            return defaultVal;
        }
        try {
            return JSON.parse(stored);
        } catch (e) {
            return defaultVal;
        }
    }

    function save(key, val) {
        localStorage.setItem(`nafas_${key}`, JSON.stringify(val));
    }

    // Load active variables
    let users = load("users", defaultUsers);
    let reports = load("reports", defaultReports);
    let recommendations = load("recommendations", defaultRecommendations);
    let studentLeaderboard = load("student_rankings", defaultStudentLeaderboard);
    let classroomLeaderboard = load("classroom_rankings", defaultClassroomLeaderboard);
    let auditLogs = load("audit_logs", defaultAuditLogs);
    
    let tasks = load("tasks", defaultTasks);
    let calendarEvents = load("calendar_events", defaultCalendarEvents);
    let announcements = load("announcements", defaultAnnouncements);

    // Save functions
    function saveUsers() { save("users", users); }
    function saveReports() { save("reports", reports); }
    function saveRecommendations() { save("recommendations", recommendations); }
    function saveLeaderboards() {
        save("student_rankings", studentLeaderboard);
        save("classroom_rankings", classroomLeaderboard);
    }
    function saveAuditLogs() { save("audit_logs", auditLogs); }
    function saveTasks() { save("tasks", tasks); }
    function saveCalendarEvents() { save("calendar_events", calendarEvents); }
    function saveAnnouncements() { save("announcements", announcements); }

    // Log actions helper
    function logAction(userEmail, actionText) {
        const log = {
            date: new Date().toISOString(),
            user: userEmail,
            action: actionText
        };
        auditLogs.unshift(log);
        if (auditLogs.length > 200) auditLogs.pop();
        saveAuditLogs();
    }

    // Sustainability Calculations
    function calculateSustainabilityScore() {
        if (reports.length === 0) return 75; // Neutral baseline if no data

        let totalRating = 0;
        let countApproved = 0;
        reports.forEach(r => {
            if (r.status === "approved") {
                totalRating += (r.aiRating || r.manualRating);
                countApproved++;
            }
        });
        const avgRating = countApproved > 0 ? (totalRating / countApproved) : 4.0; 
        const cleanlinessScore = (avgRating / 5) * 100; // 0 to 100

        let totalPollution = 0;
        reports.forEach(r => totalPollution += r.pollutionPercent);
        const avgPollution = totalPollution / reports.length;
        const pollutionScore = 100 - avgPollution; // inverse

        const totalRecs = recommendations.length;
        const completedRecs = recommendations.filter(r => r.status === "status_completed").length;
        const inProgressRecs = recommendations.filter(r => r.status === "status_in_progress").length;
        const responseScore = totalRecs > 0 ? ((completedRecs + (inProgressRecs * 0.5)) / totalRecs) * 100 : 80;

        const recentReports = reports.slice(0, 5);
        const cleanRecent = recentReports.filter(r => (r.aiRating || r.manualRating) >= 4).length;
        const trendScore = recentReports.length > 0 ? (cleanRecent / recentReports.length) * 100 : 70;

        const finalScore = Math.round(
            (cleanlinessScore * 0.40) +
            (pollutionScore * 0.30) +
            (responseScore * 0.15) +
            (trendScore * 0.15)
        );

        return Math.max(0, Math.min(100, finalScore));
    }

    function getScoreLevel(score) {
        if (score >= 90) return "score_excellent";
        if (score >= 70) return "score_good";
        if (score >= 50) return "score_needs_improvement";
        return "score_critical";
    }

    function getSchoolCleanlinessAverage() {
        let total = 0;
        let count = 0;
        reports.forEach(r => {
            if (r.status === "approved") {
                total += (r.aiRating || r.manualRating);
                count++;
            }
        });
        if (count === 0) return 4.0;
        return parseFloat((total / count).toFixed(1));
    }

    function getMostPollutedArea() {
        const areaStats = {};
        reports.forEach(r => {
            if (!areaStats[r.area]) areaStats[r.area] = { totalPollution: 0, count: 0 };
            areaStats[r.area].totalPollution += r.pollutionPercent;
            areaStats[r.area].count++;
        });

        let worstArea = "area_yard";
        let maxAvgPollution = -1;
        
        Object.keys(areaStats).forEach(area => {
            const avg = areaStats[area].totalPollution / areaStats[area].count;
            if (avg > maxAvgPollution) {
                maxAvgPollution = avg;
                worstArea = area;
            }
        });

        return worstArea;
    }

    function getMostCommonWasteType() {
        const wasteCounts = { trash_plastic: 0, trash_paper: 0, trash_food: 0, trash_other: 0 };
        reports.forEach(r => {
            r.objects.forEach(o => {
                if (wasteCounts[o.type] !== undefined) {
                    wasteCounts[o.type]++;
                }
            });
        });

        let maxCount = -1;
        let dominantWaste = "trash_plastic";
        Object.keys(wasteCounts).forEach(type => {
            if (wasteCounts[type] > maxCount) {
                maxCount = wasteCounts[type];
                dominantWaste = type;
            }
        });
        return dominantWaste;
    }

    return {
        getUsers: () => users,
        addUser: (user) => {
            users.push(user);
            saveUsers();
            logAction("admin@nafas.edu", `Added new user account: ${user.email} (${user.role})`);
        },
        updateUser: (email, updatedFields) => {
            const index = users.findIndex(u => u.email === email);
            if (index !== -1) {
                users[index] = { ...users[index], ...updatedFields };
                saveUsers();
                return true;
            }
            return false;
        },
        deleteUser: (email) => {
            const index = users.findIndex(u => u.email === email);
            if (index !== -1) {
                users.splice(index, 1);
                saveUsers();
                logAction("admin@nafas.edu", `Deleted user account: ${email}`);
                return true;
            }
            return false;
        },
        getReports: () => reports,
        addReport: (report) => {
            reports.unshift(report);
            saveReports();
            logAction(report.submittedBy, `Submitted report for ${report.area}. AI detected ${report.objects.length} waste objects.`);
            
            // Student gets points immediately only if approved, but new reports are pending manager approval
            if (report.status === "approved" && report.submittedBy) {
                const user = users.find(u => u.email === report.submittedBy);
                if (user && user.role === "role_student") {
                    const addedPoints = 20 + (report.objects.length * 5);
                    user.points += addedPoints;
                    user.streak = (user.streak || 0) + 1;
                    saveUsers();

                    // Update leaderboard
                    const leadIndex = studentLeaderboard.findIndex(l => l.name.startsWith(user.name));
                    if (leadIndex !== -1) {
                        studentLeaderboard[leadIndex].points = user.points;
                    } else {
                        studentLeaderboard.push({ name: `${user.name} (الصف 1-أ)`, points: user.points });
                    }
                    studentLeaderboard.sort((a,b) => b.points - a.points);
                    saveLeaderboards();
                }
            }
        },
        approveReport: (id, adminEmail) => {
            const report = reports.find(r => r.id === id);
            if (report && report.status === "pending") {
                report.status = "approved";
                saveReports();
                logAction(adminEmail, `Approved cleanliness report ${id} submitted by ${report.submittedBy}.`);
                
                // Award points on approval
                const user = users.find(u => u.email === report.submittedBy);
                if (user && user.role === "role_student") {
                    const addedPoints = 50; // +50 points total as per request
                    user.points += addedPoints;
                    user.streak = (user.streak || 0) + 1;
                    saveUsers();

                    // Update leaderboard list
                    const leadIndex = studentLeaderboard.findIndex(l => l.name.startsWith(user.name));
                    if (leadIndex !== -1) {
                        studentLeaderboard[leadIndex].points = user.points;
                    } else {
                        studentLeaderboard.push({ name: `${user.name} (الصف 1-أ)`, points: user.points });
                    }
                    studentLeaderboard.sort((a,b) => b.points - a.points);
                    saveLeaderboards();
                }
                return true;
            }
            return false;
        },
        rejectReport: (id, adminEmail) => {
            const report = reports.find(r => r.id === id);
            if (report && report.status === "pending") {
                report.status = "rejected";
                saveReports();
                logAction(adminEmail, `Rejected cleanliness report ${id} submitted by ${report.submittedBy}.`);
                return true;
            }
            return false;
        },
        getRecommendations: () => recommendations,
        updateRecommendationStatus: (id, userEmail, newStatus) => {
            const rec = recommendations.find(r => r.id === id);
            if (rec) {
                rec.status = newStatus;
                saveRecommendations();
                logAction(userEmail, `Updated recommendation ${id} status to: ${newStatus}`);
                return true;
            }
            return false;
        },
        getTasks: () => tasks,
        addTask: (task) => {
            tasks.unshift(task);
            saveTasks();
            logAction("system", `New task generated: "${task.title}" assigned to ${task.assignedTo}`);
        },
        updateTaskStatus: (id, userEmail, status) => {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.status = status;
                saveTasks();
                logAction(userEmail, `Marked task ${id} as ${status}.`);
                return true;
            }
            return false;
        },
        getCalendarEvents: () => calendarEvents,
        getAnnouncements: () => announcements,
        addAnnouncement: (ann) => {
            announcements.unshift(ann);
            saveAnnouncements();
            logAction(ann.sender, `Broadcasted announcement targeted to ${ann.target}.`);
        },
        getStudentLeaderboard: () => studentLeaderboard,
        getClassroomLeaderboard: () => classroomLeaderboard,
        getAuditLogs: () => auditLogs,
        logAction,
        
        // Stats calculations
        getScore: calculateSustainabilityScore,
        getScoreLevel: () => getScoreLevel(calculateSustainabilityScore()),
        getCleanlinessAverage: getSchoolCleanlinessAverage,
        getMostPolluted: getMostPollutedArea,
        getDominantWaste: getMostCommonWasteType,

        t: (key) => (typeof NafasI18n !== "undefined" ? NafasI18n.t(key) : key),
        getLang: () => (typeof NafasI18n !== "undefined" ? NafasI18n.getLang() : "ar")
    };
})();
window.NafasData = NafasData;
