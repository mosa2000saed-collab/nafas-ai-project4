// Nafas School Sustainability Platform - AI Engine & Chatbot
const NafasAI = (() => {
    // Preset Template School Environment Images for instant scan simulation
    const presetImages = {
        yard: {
            title: "School Yard Area",
            pollutionPercent: 15,
            densityLevel: "low",
            cleanlinessRating: 4.1,
            confidence: 0.94,
            objects: [
                { type: "trash_paper", label: "Paper Cup", x: 120, y: 150, w: 40, h: 50 },
                { type: "trash_plastic", label: "Plastic Bag", x: 280, y: 220, w: 90, h: 40 }
            ],
            color: "#10b981"
        },
        cafeteria: {
            title: "School Cafeteria Area",
            pollutionPercent: 74,
            densityLevel: "high",
            cleanlinessRating: 1.8,
            confidence: 0.92,
            objects: [
                { type: "trash_plastic", label: "Plastic Bottle", x: 90, y: 180, w: 45, h: 90 },
                { type: "trash_plastic", label: "Plastic Cup", x: 160, y: 220, w: 50, h: 60 },
                { type: "trash_food", label: "Food Scraps", x: 250, y: 200, w: 80, h: 45 },
                { type: "trash_other", label: "Crushed Can", x: 320, y: 280, w: 60, h: 35 }
            ],
            color: "#ef4444"
        },
        classrooms: {
            title: "School Classroom Block",
            pollutionPercent: 8,
            densityLevel: "low",
            cleanlinessRating: 4.7,
            confidence: 0.96,
            objects: [
                { type: "trash_paper", label: "Notebook Paper", x: 180, y: 250, w: 70, h: 40 }
            ],
            color: "#10b981"
        },
        restrooms: {
            title: "School Restroom Block",
            pollutionPercent: 52,
            densityLevel: "medium",
            cleanlinessRating: 2.6,
            confidence: 0.89,
            objects: [
                { type: "trash_paper", label: "Soggy Paper Towels", x: 110, y: 190, w: 100, h: 70 },
                { type: "trash_plastic", label: "Shampoo Bottle", x: 260, y: 240, w: 40, h: 70 }
            ],
            color: "#eab308"
        },
        hallways: {
            title: "School Corridors Block",
            pollutionPercent: 28,
            densityLevel: "medium",
            cleanlinessRating: 3.4,
            confidence: 0.91,
            objects: [
                { type: "trash_paper", label: "Paper Wrapper", x: 150, y: 200, w: 60, h: 30 },
                { type: "trash_plastic", label: "Straw wrapper", x: 240, y: 230, w: 45, h: 20 }
            ],
            color: "#eab308"
        }
    };

    // Simulated Image Authenticity Verification (Anti-Cheat)
    function auditImageRelevance(fileName, isSimulatedCheat) {
        if (isSimulatedCheat) {
            return {
                valid: false,
                reasonKey: "cheat_prevented",
                detectedType: "Random Gallery File (Car / Graphic)"
            };
        }

        const name = fileName.toLowerCase();
        
        // Let's reject files that explicitly contain irrelevant terms
        const irrelevantKeywords = [
            "car", "cat", "dog", "selfie", "document", "screenshot", 
            "wallpaper", "nature", "bitcoin", "meme", "random", "invoice", "cv"
        ];
        
        for (const kw of irrelevantKeywords) {
            if (name.includes(kw)) {
                return {
                    valid: false,
                    reasonKey: "relevance_failed",
                    detectedType: kw.charAt(0).toUpperCase() + kw.slice(1)
                };
            }
        }

        return {
            valid: true,
            detectedType: "School Facility Environment"
        };
    }

    // Generate simulated AI Analysis
    function analyzeImage(area, isCustomUploaded = false, customFileName = "") {
        const areaKey = area.replace("area_", "");
        const template = presetImages[areaKey] || presetImages.yard;

        // Add minor randomness for custom uploads to make it feel dynamic
        if (isCustomUploaded) {
            const seed = Math.random();
            const pollutionPercent = Math.max(0, Math.min(100, Math.round(template.pollutionPercent + (seed * 20 - 10))));
            let cleanlinessRating = parseFloat((5 - (pollutionPercent / 20)).toFixed(1));
            cleanlinessRating = Math.max(1.0, Math.min(5.0, cleanlinessRating));
            
            let densityLevel = "low";
            if (pollutionPercent > 50) densityLevel = "high";
            else if (pollutionPercent > 20) densityLevel = "medium";

            return {
                area: area,
                pollutionPercent,
                densityLevel,
                aiRating: cleanlinessRating,
                confidence: parseFloat((0.85 + (seed * 0.14)).toFixed(2)),
                objects: template.objects.map(obj => ({
                    ...obj,
                    // slightly shift boxes to show it's active
                    x: Math.round(obj.x + (seed * 30 - 15)),
                    y: Math.round(obj.y + (seed * 30 - 15))
                }))
            };
        }

        return {
            area: area,
            pollutionPercent: template.pollutionPercent,
            densityLevel: template.densityLevel,
            aiRating: template.cleanlinessRating,
            confidence: template.confidence,
            objects: template.objects
        };
    }

    // Canvas drawing bounding boxes overlays
    function drawObjects(canvas, ctx, img, objects, lang = "ar") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const colors = {
            trash_plastic: "#3b82f6", // Blue
            trash_paper: "#eab308",  // Yellow
            trash_food: "#ef4444",   // Red
            trash_other: "#8b5cf6"   // Purple
        };

        const labels = {
            en: {
                trash_plastic: "Plastic",
                trash_paper: "Paper",
                trash_food: "Food Waste",
                trash_other: "Other Trash"
            },
            ar: {
                trash_plastic: "بلاستيك",
                trash_paper: "أوراق",
                trash_food: "بقايا طعام",
                trash_other: "مخلفات أخرى"
            }
        };

        ctx.lineWidth = 3;
        ctx.font = "bold 13px Cairo, Inter, sans-serif";

        objects.forEach(obj => {
            const color = colors[obj.type] || "#10b981";
            const typeLabel = (labels[lang] && labels[lang][obj.type]) || obj.label;

            // Draw bounding box
            ctx.strokeStyle = color;
            ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);

            // Draw label background tag
            ctx.fillStyle = color;
            const textWidth = ctx.measureText(typeLabel).width;
            ctx.fillRect(obj.x, obj.y - 24, textWidth + 14, 24);

            // Draw label text
            ctx.fillStyle = "#ffffff";
            ctx.fillText(typeLabel, obj.x + 7, obj.y - 7);
        });
    }

    // AI Conversational Sustainability Chatbot Responses Database
    const chatbotResponses = {
        en: [
            {
                keys: ["score", "sustainability", "school rating", "points", "grade"],
                response: () => {
                    const score = NafasData.getScore();
                    const level = NafasData.t(NafasData.getScoreLevel());
                    return `Our current school Nafas Sustainability Score is **${score}/100** (Ranked: **${level}**). You can increase this rating by reporting waste, resolving pending recommendations, and improving cleanliness in the most polluted block: **${NafasData.t(NafasData.getMostPolluted())}**!`;
                }
            },
            {
                keys: ["point", "wallet", "earn", "leaderboard", "rank", "streak"],
                response: () => {
                    const user = NafasAuth.getCurrentUser();
                    if (!user) return "Please log in to check your reward points wallet status.";
                    return `Hello ${user.name}! You currently have **${user.points} points** with a daily streak of **${user.streak} days**. Reporting cleanup tasks awards **20 points** + **5 points** for each waste object detected!`;
                }
            },
            {
                keys: ["cheat", "fake", "authenticity", "reject", "car", "dog"],
                response: () => {
                    return "Our school platform uses an AI contextual authenticity filter. If a student attempts to upload non-school related files (such as graphics, selfies, or pets) from their gallery, the system halts validation to prevent rewards manipulation and ensure data trust.";
                }
            },
            {
                keys: ["plastic", "sorting", "bottle", "recycle"],
                response: () => {
                    return "Plastic bottles, wrap, and containers must go into the **Blue Bins**. AI alerts will trigger if plastics mix with organic food wastes. Try packing lunches in reusable containers to reduce school single-use plastic.";
                }
            },
            {
                keys: ["paper", "cardboard", "notebook"],
                response: () => {
                    return "Discarded exam sheets, cardboard, and classroom paper must go into the **Yellow Bins**. Classrooms with the lowest paper waste earn high points on our Leaderboard!";
                }
            },
            {
                keys: ["food", "cafeteria", "sandwich", "waste"],
                response: () => {
                    return "Leftover meals, apple cores, and organic garbage go into the **Red Bins**. Our AI analytics shows food waste reaches peak levels in the Cafeteria immediately after first recess. Try sorting organic wastes to create school compost!";
                }
            },
            {
                keys: ["recommendation", "todo", "improve", "campaign"],
                response: () => {
                    const recs = NafasData.getRecommendations().filter(r => r.status === "status_pending");
                    if (recs.length === 0) return "All AI recommendations are currently resolved! Excellent campus administration.";
                    return `We have **${recs.length} pending recommendations**. The top priority is: **"${recs[0].title}"**. Implementing these issues directly upgrades our School Sustainability Score!`;
                }
            },
            {
                keys: ["hello", "hi", "hey", "who are you", "help"],
                response: () => {
                    return "Hello! I am your Nafas AI School Sustainability Assistant. Ask me about our school cleanliness score, points rules, how to sort plastic/paper waste, or current recommendation tasks!";
                }
            }
        ],
        ar: [
            {
                keys: ["درجة", "مجموع", "نسبة", "معدل النظافة", "استدامة", "تقييم"],
                response: () => {
                    const score = NafasData.getScore();
                    const level = NafasData.t(NafasData.getScoreLevel());
                    return `مؤشر نَفَس للاستدامة لمدرستنا حالياً هو **${score}/100** (بتقييم: **${level}**). يمكننا رفع هذا المؤشر عن طريق تصوير المخلفات أولاً بأول، وتصفية التوصيات الذكية، وتحسين النظافة في المنطقة الأكثر تلوثاً حالياً وهي: **${NafasData.t(NafasData.getMostPolluted())}**.`;
                }
            },
            {
                keys: ["نقاط", "نقاطي", "المتصدرين", "الترتيب", "رصيد", "التصنيف", "جائزة"],
                response: () => {
                    const user = NafasAuth.getCurrentUser();
                    if (!user) return "يرجى تسجيل الدخول أولاً لتتمكن من استعراض محفظة نقاطك الشخصية.";
                    return `مرحباً ${user.name}! رصيدك الحالي هو **${user.points} نقطة** مع التزام يومي مستمر لـ **${user.streak} أيام متتالية**. تحصل على **20 نقطة** لكل بلاغ، بالإضافة لـ **5 نقاط** عن كل عنصر نفايات يقوم الذكاء الاصطناعي بفرزه المباشر.`;
                }
            },
            {
                keys: ["غش", "مزورة", "رفض", "سيارة", "صورة عشوائية", "معرض"],
                response: () => {
                    return "تعتمد منصة نَفَس على فلتر تدقيق سياق الصور بالذكاء الاصطناعي. إذا تم رفع صور لا علاقة لها بمرفق المدرسة أو البيئة (مثل صور السيارات أو الحيوانات أو لقطات الشاشة)، فسيتم رفضها تلقائياً لحفظ مصداقية نقاط الطلاب وحماية البيانات.";
                }
            },
            {
                keys: ["بلاستيك", "قارورة", "علبة", "فرز"],
                response: () => {
                    return "العلب والأكياس البلاستيكية يجب فرزها ورميها في **الحاويات الزرقاء**. يكتشف الذكاء الاصطناعي خلط البلاستيك مع بقايا الطعام ويرسل تنبيهات للمعلمين. ننصح باستخدام مطارات المياه القابلة لإعادة الاستخدام داخل المدرسة.";
                }
            },
            {
                keys: ["ورق", "كتب", "دفاتر", "كرتون"],
                response: () => {
                    return "الأوراق التالفة والكتب والكرتون يجب فرزها ووضعها في **الحاويات الصفراء**. الفصول الدراسية الأكثر فرزاً وتوفيراً للأوراق تحصل على مرتبة 'الفصل الأكثر استدامة' في لوحة الشرف.";
                }
            },
            {
                keys: ["أكل", "طعام", "المقصف", "وجبة", "فواكه"],
                response: () => {
                    return "بقايا الوجبات والأطعمة الفائضة تفرز في **الحاويات الحمراء**. تشير إحصائيات نَفَس إلى ذروة التلوث في المقصف المدرسي فور انتهاء الفسحة الأولى. فرز بقايا الأطعمة يساعد مدرستنا على تحويلها لسماد طبيعي للحديقة.";
                }
            },
            {
                keys: ["توصية", "توصيات", "تحسين", "نصائح", "المطلوب"],
                response: () => {
                    const recs = NafasData.getRecommendations().filter(r => r.status === "status_pending");
                    if (recs.length === 0) return "جميع توصيات الاستدامة تم إنجازها بنجاح! إدارة المدرسة تقوم بعمل ممتاز.";
                    return `لدينا **${recs.length} توصيات معلقة** قيد الانتظار. أهمها أولوية هي: **"${recs[0].title}"**. إنجاز هذه المهام وتغيير حالتها يرفع نقاط الاستدامة العامة للمدرسة فورا.`;
                }
            },
            {
                keys: ["أهلاً", "مرحبا", "سلام", "من أنت", "مساعدة", "كيف"],
                response: () => {
                    return "أهلاً بك! أنا مساعد نَفَس البيئي الذكي. يمكنك سؤالي عن نقاط الاستدامة لمدرستنا، رصيد نقاطك وشروط كسبها، طريقة فرز النفايات (بلاستيك/ورق)، أو التوصيات الحالية المطلوب تنفيذها.";
                }
            }
        ]
    };

    // Chatbot response fetcher
    function getChatResponse(question, lang = "ar") {
        const query = question.toLowerCase().trim();
        const pool = chatbotResponses[lang] || chatbotResponses.ar;

        // Try to match keyword keys
        for (const item of pool) {
            for (const key of item.keys) {
                if (query.includes(key)) {
                    return item.response();
                }
            }
        }

        // Fallback responses
        if (lang === "ar") {
            return "عذراً، لم أفهم سؤالك بدقة. يمكنك الاستفسار عن: 'كم نقاطي؟'، 'ما هي التوصيات الحالية؟'، 'كيف نرفع مؤشر استدامة المدرسة؟'، أو 'كيف نفرز الورق والبلاستيك؟'.";
        } else {
            return "I couldn't quite understand that. Try asking: 'What is my points wallet?', 'What are the pending recommendations?', 'How can we improve our school score?', or 'How should we recycle plastic and paper?'";
        }
    }

    return {
        getPresetImages: () => presetImages,
        auditImageRelevance,
        analyzeImage,
        drawObjects,
        getChatResponse
    };
})();
window.NafasAI = NafasAI;
