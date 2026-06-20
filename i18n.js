// Nafas School Sustainability Platform - Internationalization (i18n)
const NafasI18n = (() => {
const translations = {
        en: {
            // App Identity
            appName: "Nafas",
            appSlogan: "AI-Powered School Sustainability Platform",
            
            // Authentication
            login: "Login",
            email: "Email Address",
            password: "Password",
            tempPassword: "Temporary Password",
            newPassword: "New Password",
            confirmPassword: "Confirm New Password",
            changePassword: "Change Password",
            forgotPassword: "Forgot Password?",
            loginBtn: "Sign In",
            logout: "Sign Out",
            welcome: "Welcome back",
            invalidCredentials: "The email address or password you entered is incorrect.",
            firstLoginTitle: "Secure Password Reset",
            firstLoginDesc: "This is your first login. You must set a new personal password to continue. The temporary password will be permanently disabled.",
            oneTimeLoginNotice: "You are logging in with a one-time access permission. You must set a new password immediately.",
            passwordsDontMatch: "Passwords do not match.",
            passwordTooShort: "Password must be at least 6 characters.",
            register: "Create Account",
            register_subtitle: "For Administrators & Teachers only — Students are registered by Admin",
            register_btn: "Create Account & Sign In",
            register_note: "By creating an account, you will be logged in immediately without any additional approval.",
            email_already_exists: "This email address is already registered in the system.",
            register_success: "Account created successfully! Welcome to Nafas.",
            
            // User Roles
            role_admin: "Administrator",
            role_teacher: "Teacher",
            role_student: "Student",
            role_staff: "Cleaning & Maintenance Staff",
            
            // Navigation Tabs
            nav_dashboard: "Overview",
            nav_twin: "Digital Twin",
            nav_aivision: "AI Vision",
            nav_tasks: "Tasks Checklist",
            nav_dailyreports: "Daily Reports",
            nav_calendar: "Eco Calendar",
            nav_leaderboard: "Leaderboard",
            nav_analytics: "Analytics & Reports",
            nav_recommendations: "AI Recommendations",
            nav_history: "Audit History",
            nav_users: "User Management",
            nav_profile: "Profile & Badges",
            nav_announcements: "Announcements",
            nav_notifications: "Notifications",
            nav_settings: "Preferences",
            
            // Dashboard Panel
            dash_sustainability_score: "Nafas Sustainability Score",
            dash_cleanliness_score: "School Cleanliness Score",
            dash_polluted_area: "Most Polluted Area",
            dash_daily_alerts: "Daily Smart Alerts",
            dash_reports_today: "Reports Submitted Today",
            dash_images_uploaded: "Images Scanned Today",
            dash_waste_type: "Most Common Waste",
            dash_weekly_summary: "Daily & Weekly Summary",
            dash_recent_activity: "Recent Activity Log",
            no_alerts_today: "All facilities are clear. Excellent job!",
            alert_polluted: "high waste detected in",
            
            // Sustainability Score Levels
            score_excellent: "Excellent",
            score_good: "Good",
            score_needs_improvement: "Needs Improvement",
            score_critical: "Critical",
            
            // School Areas
            area_yard: "School Yard",
            area_hallways: "Hallways",
            area_cafeteria: "Cafeteria",
            area_classrooms: "Classrooms",
            area_restrooms: "Restrooms",
            
            // Image Upload & AI Module
            upload_title: "Campus AI Scanner",
            upload_desc: "Capture or upload an image from school facilities for AI analysis",
            upload_btn: "Select Image File",
            camera_btn: "Simulate Camera Capture",
            select_area_label: "Select School Facility:",
            cleanliness_rating_label: "Manual Cleanliness Assessment:",
            notes_placeholder: "Add observations, notes or student names...",
            analyze_btn: "Analyze with AI",
            analyzing_text: "Running AI Verification & Detection...",
            detection_results: "AI Analysis Output",
            metric_pollution: "Pollution Percentage",
            metric_density: "Waste Density Level",
            metric_rating: "AI Cleanliness Rating",
            metric_confidence: "Detection Confidence Score",
            metric_objects: "Detected Waste Objects",
            save_report_btn: "Save Report to Database",
            report_saved: "Cleanliness report saved successfully! Points awarded.",
            relevance_failed: "Verification Error: Image rejected! The AI verified this image does not represent any school facility or contains no environment-relevant trash patterns. Please upload a real school scene to maintain system trust.",
            relevance_checking: "Authenticating image context...",
            cheat_prevented: "Points audit rejected: Irrelevant gallery files cannot be used.",
            
            // Trash Categories
            trash_plastic: "Plastic Bottles/Wrappers",
            trash_paper: "Paper & Cardboard",
            trash_food: "Food Waste",
            trash_other: "Other Trash",
            
            // Heatmap
            heatmap_title: "Smart Campus Heatmap",
            heatmap_desc: "Visual occupancy and cleanliness levels layout across facility blocks.",
            view_daily: "Daily View",
            view_weekly: "Weekly View",
            view_monthly: "Monthly View",
            view_history: "Historical Comparison",
            area_stats: "Area Stats Overview",
            latest_reports: "Latest Facility Logs",
            cleanliness_trend: "Cleanliness Trend",
            status_clean: "Clean",
            status_attention: "Needs Attention",
            status_polluted: "Polluted",
            click_to_view: "Select any facility area block to view logs & analytics.",
            
            // Analytics
            analytics_title: "Sustainability Analytics & Charts",
            chart_polluted_areas: "Most Polluted Areas (Avg %)",
            chart_pollution_time: "Pollution Frequency by Time of Day",
            chart_cleanliness_trends: "Cleanliness Trends Over Time",
            chart_waste_dist: "Waste Type Distribution",
            gen_daily: "Generate Daily Report",
            gen_weekly: "Generate Weekly Report",
            gen_monthly: "Generate Monthly Report",
            report_generated: "Analytical report PDF compiled and saved to history log.",
            
            // Recommendations
            rec_title: "AI Sustainability Recommendations",
            rec_desc: "Automated insights triggered by waste frequency and school trends.",
            rec_priority: "Priority",
            rec_status: "Status",
            status_pending: "Pending",
            status_in_progress: "In Progress",
            status_completed: "Completed",
            priority_high: "High",
            priority_medium: "Medium",
            priority_low: "Low",
            
            // Gamification
            rewards_title: "Rewards & Leaderboards",
            rewards_desc: "Cleanliness team students earn points for reporting, cleanup verification, and school improvements.",
            your_points: "Your Points Wallet",
            weekly_ranking: "Leaderboard Standings",
            top_student: "Top Student",
            top_classroom: "Top Classroom",
            most_improved: "Most Improved Area",
            rank_col: "Rank",
            name_col: "Name/Class",
            points_col: "Points",
            participation_streak: "Participation Streak",
            days_streak: "days active",
            
            // Audit History
            history_title: "Audit logs & History Data",
            filter_area: "Filter Area",
            filter_date: "Filter Date",
            filter_user: "Filter Submitter",
            filter_waste: "Filter Waste Type",
            all_areas: "All Areas",
            all_users: "All Users",
            all_wastes: "All Waste Types",
            log_no: "Log #",
            log_date: "Date & Time",
            log_area: "Facility Area",
            log_score: "Rating",
            log_by: "Submitted By",
            log_details: "View Details",
            
            // Settings & System
            settings_title: "System Preferences & Settings",
            lang_label: "Application Language",
            theme_label: "UI Color Theme",
            theme_light: "Light Mode",
            theme_dark: "Dark Mode",
            theme_system: "System Default",
            settings_saved: "Application preferences updated successfully.",
            save_settings: "Save Settings",
            
            // Admin Panel
            admin_title: "Administrator Dashboard",
            user_mgmt: "User Management",
            add_user_btn: "Register New User",
            edit_user: "Edit Account",
            delete_user: "Delete User",
            user_fullname: "Full Name",
            user_email: "Email Address",
            user_assigned_area: "Assigned School Area",
            user_role: "User Role",
            save_user_btn: "Save User Credentials",
            onetime_toggle: "One-Time Access Permission",
            onetime_enabled: "One-Time Access enabled for recovery.",
            area_monitoring_title: "Facility Area Monitoring Summary",
            col_area: "Area Block",
            col_avg_score: "Cleanliness Index",
            col_reports_count: "Total Reports",
            col_last_update: "Last Log Date",
            
            // AI Chatbot
            chat_title: "Nafas AI Environmental Assistant",
            chat_welcome: "Hello! I am your AI Sustainability Assistant. Ask me anything about our school's cleanliness metrics, sorting guidelines, waste reduction, or how to improve our Sustainability Score!",
            chat_placeholder: "Type your query here...",
            chat_send: "Send Message",
            chat_typing: "Nafas AI is typing...",

            // Riyadh Weather Widget
            weather_title: "Riyadh Weather Today",
            weather_aqi: "Air Quality Index (AQI)",
            weather_humidity: "Humidity",
            weather_rec: "Activity Recommendation",
            weather_rec_val: "Ideal air quality for school backyard planting and cleaning!",

            // AI Vision Auto-Task & Hoax Detection
            aivision_hoax_detected: "Fake/Hoax image detected! No report generated.",
            aivision_create_task: "Create cleanup/maintenance task?",
            aivision_create_task_btn: "Create Task",
            aivision_real_image: "Real Pollution Image Context Verified",

            // Profile Badges
            badge_sustainability: "Sustainability Champion",
            badge_sustainability_desc: "Earn 500+ points through green school activities.",
            badge_recycling: "Recycling Expert",
            badge_recycling_desc: "Conduct 5 or more plastic and paper waste sorting scans.",
            badge_water: "Water Guardian",
            badge_water_desc: "Resolve or report a water facility preservation action.",
            badge_energy: "Energy Saver",
            badge_energy_desc: "Audit classrooms to turn off lights and conserve power.",
            badge_eco: "Eco Ambassador",
            badge_eco_desc: "Achieve 300 points and support the school green team.",

            // Announcements
            broadcast_title: "School-Wide Eco Announcements",
            broadcast_btn: "Send Broadcast",
            composer_placeholder: "Type a school announcement to broadcast...",
            target_role: "Target Audience",
            all_users_ann: "All School Members",

            // Daily Reports
            submit_report_title: "Submit Daily Cleanliness Report",
            manager_approvals_title: "Pending Managers Approvals",
            approve_btn: "Approve",
            reject_btn: "Reject",
            report_form_area: "Select facility zone",
            report_form_notes: "Cleanliness observations & actions",
            report_submitted_success: "Daily report submitted for manager review."
        },
        ar: {
            // App Identity
            appName: "نَفَس",
            appSlogan: "منصة بيئية ذكية لمدارس مستدامة مدعومة بالذكاء الاصطناعي",
            
            // Authentication
            login: "تسجيل الدخول",
            email: "البريد الإلكتروني",
            password: "كلمة المرور",
            tempPassword: "كلمة المرور المؤقتة",
            newPassword: "كلمة المرور الجديدة",
            confirmPassword: "تأكيد كلمة المرور الجديدة",
            changePassword: "تغيير كلمة المرور",
            forgotPassword: "نسيت كلمة المرور؟",
            loginBtn: "دخول",
            logout: "تسجيل الخروج",
            welcome: "مرحباً بعودتك",
            invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
            firstLoginTitle: "إعادة تعيين كلمة المرور للأمان",
            firstLoginDesc: "هذا هو تسجيل دخولك الأول. يجب عليك تعيين كلمة مرور شخصية جديدة للمتابعة. سيتم إلغاء كلمة المرور المؤقتة نهائياً.",
            oneTimeLoginNotice: "لقد قمت بتسجيل الدخول باستخدام إذن الوصول لمرة واحدة. يجب عليك تعيين كلمة مرور جديدة فوراً.",
            passwordsDontMatch: "كلمات المرور غير متطابقة.",
            passwordTooShort: "يجب ألا تقل كلمة المرور عن 6 رموز.",
            register: "إنشاء حساب",
            register_subtitle: "للمديرين والمعلمين فقط — تسجيل الطلاب يتم عبر المدير",
            register_btn: "إنشاء الحساب والدخول",
            register_note: "بإنشاء الحساب، ستدخل إلى المنصة فوراً دون الحاجة لموافقة إضافية.",
            email_already_exists: "البريد الإلكتروني مسجل مسبقاً في النظام.",
            register_success: "تم إنشاء حسابك بنجاح! مرحباً بك في نَفَس.",
            
            // User Roles
            role_admin: "مدير النظام",
            role_teacher: "معلم / معلمة",
            role_student: "طالب",
            role_staff: "عضو النظافة والصيانة",
            
            // Navigation Tabs
            nav_dashboard: "الرئيسية",
            nav_twin: "التوأم الرقمي",
            nav_aivision: "الرؤية الحاسوبية",
            nav_tasks: "جدول المهام",
            nav_dailyreports: "التقارير اليومية",
            nav_calendar: "التقويم البيئي",
            nav_leaderboard: "المتصدرين",
            nav_analytics: "التحليلات والتقارير",
            nav_recommendations: "توصيات الذكاء الاصطناعي",
            nav_history: "سجل التدقيق",
            nav_users: "إدارة المستخدمين",
            nav_profile: "الملف الشخصي والأوسمة",
            nav_announcements: "الإعلانات",
            nav_notifications: "الإشعارات",
            nav_settings: "التفضيلات",
            
            // Dashboard Panel
            dash_sustainability_score: "مؤشر نَفَس للاستدامة",
            dash_cleanliness_score: "معدل نظافة المدرسة",
            dash_polluted_area: "المنطقة الأكثر تلوثاً",
            dash_daily_alerts: "التنبيهات الذكية اليومية",
            dash_reports_today: "تقارير قُدمت اليوم",
            dash_images_uploaded: "صور فُحصت اليوم",
            dash_waste_type: "نوع النفايات الأكثر شيوعاً",
            dash_weekly_summary: "الملخص اليومي والأسبوعي",
            dash_recent_activity: "سجل الأنشطة الأخيرة",
            no_alerts_today: "جميع المرافق نظيفة وخالية من المخلفات. عمل رائع!",
            alert_polluted: "معدل تلوث مرتفع في",
            
            // Sustainability Score Levels
            score_excellent: "ممتاز",
            score_good: "جيد",
            score_needs_improvement: "بحاجة لتحسين",
            score_critical: "حرج",
            
            // School Areas
            area_yard: "ساحة المدرسة",
            area_hallways: "الممرات",
            area_cafeteria: "المقصف",
            area_classrooms: "الفصول الدراسية",
            area_restrooms: "دورات المياه",
            
            // Image Upload & AI Module
            upload_title: "ماسح الذكاء الاصطناعي للمرافق",
            upload_desc: "التقط صورة أو قم بتحميلها من مرافق المدرسة ليقوم الذكاء الاصطناعي بتحليلها فورا",
            upload_btn: "اختر ملف الصورة",
            camera_btn: "محاكاة التقاط الكاميرا",
            select_area_label: "اختر مرفق المدرسة:",
            cleanliness_rating_label: "التقييم اليدوي للنظافة:",
            notes_placeholder: "أضف ملاحظاتك أو أسماء الطلاب الملاحظين هنا...",
            analyze_btn: "تحليل بواسطة AI",
            analyzing_text: "جاري فحص وتدقيق الصورة بواسطة الذكاء الاصطناعي...",
            detection_results: "مخرجات تحليل الذكاء الاصطناعي",
            metric_pollution: "نسبة التلوث",
            metric_density: "كثافة النفايات",
            metric_rating: "تقييم النظافة التلقائي",
            metric_confidence: "نسبة ثقة الذكاء الاصطناعي",
            metric_objects: "العناصر المكتشفة",
            save_report_btn: "حفظ التقرير لقاعدة البيانات",
            report_saved: "تم حفظ تقرير النظافة وإضافة النقاط بنجاح!",
            relevance_failed: "خطأ في الفحص والتحقق: تم رفض الصورة! تحقق الذكاء الاصطناعي من أن هذه الصورة لا تنتمي لأي من مرافق المدرسة أو لا تحتوي على مخلفات. يرجى رفع صورة حقيقية للحفاظ على مصداقية نقاطك.",
            relevance_checking: "جاري التحقق من مصداقية وسياق الصورة المرفوعة...",
            cheat_prevented: "تم رفض عملية تدقيق النقاط: لا يمكن استخدام صور عشوائية من المعرض.",
            
            // Trash Categories
            trash_plastic: "علب وأكياس بلاستيكية",
            trash_paper: "أوراق وكرتون",
            trash_food: "بقايا أطعمة",
            trash_other: "مخلفات أخرى",
            
            // Heatmap
            heatmap_title: "خارطة المدرسة التفاعلية",
            heatmap_desc: "مخطط تفاعلي يستعرض مستويات النظافة والتلوث الفورية لمباني ومرافق المدرسة.",
            view_daily: "العرض اليومي",
            view_weekly: "العرض الأسبوعي",
            view_monthly: "العرض الشهري",
            view_history: "مقارنة تاريخية",
            area_stats: "إحصائيات المنطقة",
            latest_reports: "آخر التقارير المرفوعة",
            cleanliness_trend: "منحنى مستوى النظافة",
            status_clean: "نظيف",
            status_attention: "يحتاج انتباه",
            status_polluted: "ملوث",
            click_to_view: "اختر أي منطقة في المخطط لعرض إحصائياتها وتقاريرها المباشرة.",
            
            // Analytics
            analytics_title: "إحصائيات وتقارير الاستدامة",
            chart_polluted_areas: "المناطق الأكثر تلوثاً (المعدل %)",
            chart_pollution_time: "معدل التلوث بالنسبة لأوقات اليوم",
            chart_cleanliness_trends: "تغير مستويات النظافة بمرور الوقت",
            chart_waste_dist: "توزيع أنواع النفايات المكتشفة",
            gen_daily: "تصدير تقرير يومي",
            gen_weekly: "تصدير تقرير أسبوعي",
            gen_monthly: "تصدير تقرير شهري",
            report_generated: "تم تصدير التقرير التحليلي كملف PDF وحفظه في سجل المستندات التاريخية.",
            
            // Recommendations
            rec_title: "توصيات الاستدامة الذكية",
            rec_desc: "توجيهات وإرشادات يولدها نظام الذكاء الاصطناعي تلقائياً بناءً على تقارير المدرسة وسلوك التلوث.",
            rec_priority: "الأولوية",
            rec_status: "الحالة",
            status_pending: "قيد الانتظار",
            status_in_progress: "جاري العمل",
            status_completed: "مكتمل",
            priority_high: "مرتفعة",
            priority_medium: "متوسطة",
            priority_low: "منخفضة",
            
            // Gamification
            rewards_title: "الجوائز والتصنيفات التحفيزية",
            rewards_desc: "يكسب طلاب فريق النظافة نقاطاً إضافية لكل تقرير يتم رفعه، وعمليات التحقق، والمشاركة المستمرة في تحسين البيئة المدرسية.",
            your_points: "محفظة نقاطك الحالية",
            weekly_ranking: "ترتيب المتصدرين الأسبوعي",
            top_student: "الطالب المثالي",
            top_classroom: "الفصل الأكثر استدامة",
            most_improved: "المنطقة الأكثر تحسناً",
            rank_col: "الترتيب",
            name_col: "الاسم / الفصل",
            points_col: "النقاط",
            participation_streak: "معدل النشاط والالتزام المستمر",
            days_streak: "أيام متتالية",
            
            // Audit History
            history_title: "السجلات التاريخية وتدقيق البيانات",
            filter_area: "تصفية حسب المرفق",
            filter_date: "تصفية حسب التاريخ",
            filter_user: "تصفية حسب الموظف/الطالب",
            filter_waste: "تصفية حسب نوع المخلفات",
            all_areas: "جميع المرافق",
            all_users: "جميع المستخدمين",
            all_wastes: "جميع أنواع المخلفات",
            log_no: "رقم اللوج",
            log_date: "التاريخ والوقت",
            log_area: "مرفق المدرسة",
            log_score: "التقييم",
            log_by: "بواسطة",
            log_details: "عرض التفاصيل",
            
            // Settings & System
            settings_title: "الإعدادات العامة وتخصيص المنصة",
            lang_label: "لغة التطبيق الرسمية",
            theme_label: "مظهر وألوان الواجهة",
            theme_light: "الوضع النهاري (فاتح)",
            theme_dark: "الوضع الليلي (داكن)",
            theme_system: "تلقائي (حسب النظام)",
            settings_saved: "تم تحديث إعدادات وتفضيلات المستخدم بنجاح.",
            save_settings: "حفظ الإعدادات",
            
            // Admin Panel
            admin_title: "لوحة التحكم الإدارية",
            user_mgmt: "إدارة شؤون الحسابات والمستخدمين",
            add_user_btn: "إضافة حساب مستخدم جديد",
            edit_user: "تعديل الحساب",
            delete_user: "حذف حساب",
            user_fullname: "الاسم الكامل",
            user_email: "البريد الإلكتروني",
            user_assigned_area: "المنطقة المخصصة له",
            user_role: "دور الصلاحية",
            save_user_btn: "حفظ بيانات الحساب",
            onetime_toggle: "تصريح الدخول لمرة واحدة (حالات الطوارئ)",
            onetime_enabled: "تم تفعيل تصريح الدخول لمرة واحدة لحساب المستخدم لاستعادة كلمة مروره.",
            area_monitoring_title: "ملخص جودة ومراقبة مرافق المدرسة",
            col_area: "مبنى/مرفق المدرسة",
            col_avg_score: "مؤشر النظافة",
            col_reports_count: "إجمالي التقارير",
            col_last_update: "آخر تحديث",
            
            // AI Chatbot
            chat_title: "المساعد البيئي الذكي لنَفَس",
            chat_welcome: "مرحباً بك! أنا مساعد نَفَس البيئي الذكي. يمكنك طرح أي سؤال حول مؤشرات النظافة في مدرستنا، دليل فرز النفايات، كيفية تقليص الاستهلاك، أو زيادة نقاط استدامة فصلك!",
            chat_placeholder: "اكتب استفسارك هنا وسيجيبك الذكاء الاصطناعي...",
            chat_send: "إرسال",
            chat_typing: "يقوم مساعد نَفَس بالكتابة الآن...",

            // Riyadh Weather Widget
            weather_title: "طقس الرياض اليوم",
            weather_aqi: "مؤشر جودة الهواء (AQI)",
            weather_humidity: "معدل الرطوبة",
            weather_rec: "التوصية بالنشاط الميداني",
            weather_rec_val: "جودة الهواء ممتازة لبدء أنشطة التشجير والنظافة في ساحة المدرسة!",

            // AI Vision Auto-Task & Hoax Detection
            aivision_hoax_detected: "تم كشف صورة مفبركة! لن يتم توليد تقرير.",
            aivision_create_task: "إنشاء مهمة تنظيف؟",
            aivision_create_task_btn: "إنشاء مهمة",
            aivision_real_image: "تم التحقق من سياق وجود تلوث حقيقي في الصورة",

            // Profile Badges
            badge_sustainability: "بطل الاستدامة",
            badge_sustainability_desc: "احصل على 500 نقطة أو أكثر في مشاركات الاستدامة المدرسية.",
            badge_recycling: "خبير إعادة التدوير",
            badge_recycling_desc: "قم بإرسال 5 تقارير أو عمليات فحص للورق والبلاستيك.",
            badge_water: "حارس المياه",
            badge_water_desc: "قم بتنظيف أو التبليغ عن هدر المياه بالمرافق.",
            badge_energy: "موفر الطاقة",
            badge_energy_desc: "ساهم في جولات إطفاء أنوار الفصول الدراسية وترشيد الطاقة.",
            badge_eco: "سفير البيئة",
            badge_eco_desc: "اجمع 300 نقطة وحافظ على تفاعل مستمر لدعم أصدقاء البيئة.",

            // Announcements
            broadcast_title: "الإعلانات المدرسية للاستدامة",
            broadcast_btn: "بث الإعلان",
            composer_placeholder: "اكتب الإعلان المدرسي لبثه للمستخدمين المستهدفين...",
            target_role: "الفئة المستهدفة",
            all_users_ann: "جميع منسوبي المدرسة",

            // Daily Reports
            submit_report_title: "تقديم التقرير اليومي للنظافة",
            manager_approvals_title: "طلبات المراجعة المعلقة للإداريين",
            approve_btn: "موافقة",
            reject_btn: "رفض",
            report_form_area: "اختر مرفق المدرسة",
            report_form_notes: "الملاحظات البيئية والإجراءات المتخذة",
            report_submitted_success: "تم إرسال التقرير اليومي بنجاح لموافقة الإدارة."
        }
    };

    let currentLang = localStorage.getItem("nafas_lang") || "ar";

    function t(key) {
        return (translations[currentLang] && translations[currentLang][key]) || translations["en"][key] || key;
    }

    function setLang(lang) {
        if (lang === "en" || lang === "ar") {
            currentLang = lang;
            localStorage.setItem("nafas_lang", lang);
            applyTranslations();
            return true;
        }
        return false;
    }

    function getLang() {
        return currentLang;
    }

    function applyTranslations() {
        document.documentElement.setAttribute("lang", currentLang);
        document.documentElement.setAttribute("dir", currentLang === "ar" ? "rtl" : "ltr");

        // Translate text contents
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            el.innerHTML = t(key);
        });

        // Translate placeholders
        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            const key = el.getAttribute("data-i18n-placeholder");
            el.placeholder = t(key);
        });

        // Toggle visibility of LTR/RTL specific parts if any
        document.body.className = `lang-${currentLang} ` + (document.body.className.replace(/lang-(ar|en)/g, '').trim());
    }

    return {
        t,
        setLang,
        getLang,
        applyTranslations
    };
})();

// Bind translations globally once file loads
window.addEventListener("DOMContentLoaded", () => {
    NafasI18n.applyTranslations();
});
