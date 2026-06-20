// Nafas School Sustainability Platform - Authentication & Role Manager
const NafasAuth = (() => {
    let currentUser = null;
    let forcePasswordResetState = false;

    // School pre-approved registry whitelist for auto-linking new accounts
    const preApprovedRegistry = [
        { email: "guest.student@nafas.edu", name: "خالد بن الوليد", role: "role_student", schoolId: "SCH-9021" },
        { email: "guest.teacher@nafas.edu", name: "أ. منصور العتيبي", role: "role_teacher", schoolId: "SCH-9022" },
        { email: "guest.staff@nafas.edu", name: "سليم اليماني", role: "role_staff", schoolId: "SCH-9023" }
    ];

    function init() {
        const session = localStorage.getItem("nafas_session");
        if (session) {
            try {
                currentUser = JSON.parse(session);
                // Synchronize with database state
                const users = NafasData.getUsers();
                const dbUser = users.find(u => u.email === currentUser.email);
                if (dbUser) {
                    currentUser = dbUser;
                    // Check if password reset is forced in DB
                    forcePasswordResetState = dbUser.firstLogin || dbUser.oneTimeAccess;
                }
            } catch (e) {
                currentUser = null;
                localStorage.removeItem("nafas_session");
            }
        }
    }

    // Login Action
    function login(email, password) {
        const users = NafasData.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

        if (!user) {
            return { success: false, error: "invalidCredentials" };
        }

        // Validate password
        if (user.password !== password) {
            return { success: false, error: "invalidCredentials" };
        }

        // Successful authentication
        currentUser = user;
        localStorage.setItem("nafas_session", JSON.stringify(user));
        NafasData.logAction(user.email, `User logged in successfully (${user.role}).`);

        // Check if password change is forced
        if (user.firstLogin || user.oneTimeAccess) {
            forcePasswordResetState = true;
            return { success: true, user, forcePasswordReset: true };
        }

        forcePasswordResetState = false;
        return { success: true, user, forcePasswordReset: false };
    }

    // Force Password Change Action
    function changePassword(newPassword) {
        if (!currentUser) return { success: false, error: "no_active_session" };

        const email = currentUser.email;
        const wasOneTime = currentUser.oneTimeAccess;
        const wasFirst = currentUser.firstLogin;

        const updateFields = {
            password: newPassword,
            firstLogin: false,
            oneTimeAccess: false
        };

        const success = NafasData.updateUser(email, updateFields);
        if (success) {
            // Update local user reference
            currentUser.password = newPassword;
            currentUser.firstLogin = false;
            currentUser.oneTimeAccess = false;
            localStorage.setItem("nafas_session", JSON.stringify(currentUser));

            // Log security actions
            let logMsg = "Password updated successfully.";
            if (wasFirst) logMsg = "Temporary password disabled. Personal password created on first login.";
            if (wasOneTime) logMsg = "One-Time access permission consumed. New password configured.";

            NafasData.logAction(email, logMsg);
            forcePasswordResetState = false;
            return { success: true };
        }

        return { success: false, error: "update_failed" };
    }

    // Logout Action
    function logout() {
        if (currentUser) {
            NafasData.logAction(currentUser.email, "User signed out.");
        }
        currentUser = null;
        forcePasswordResetState = false;
        localStorage.removeItem("nafas_session");
    }

    // Admin Toggle One-Time Permission Access
    function toggleOneTimeAccess(email, status) {
        const success = NafasData.updateUser(email, { oneTimeAccess: status });
        if (success) {
            NafasData.logAction("admin@nafas.edu", `Modified One-Time Access Permission for ${email} to ${status}.`);
            return true;
        }
        return false;
    }

    // Register a new account (supporting school pre-approved linking)
    function register(name, email, password, role) {
        const users = NafasData.getUsers();
        const cleanEmail = email.trim().toLowerCase();

        // Check email uniqueness
        const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
        if (existing) {
            return { success: false, error: "email_already_exists" };
        }

        // Match against pre-approved registry whitelist
        const match = preApprovedRegistry.find(r => r.email.toLowerCase() === cleanEmail);
        
        let finalName = name.trim();
        let finalRole = role;
        let schoolId = "";

        if (match) {
            // Auto-link pre-approved details
            finalName = match.name;
            finalRole = match.role;
            schoolId = match.schoolId;
        } else {
            // Block self-registration if it doesn't belong to school domain or requested role is student (admin registers students)
            if (!cleanEmail.endsWith("@nafas.edu")) {
                return { success: false, error: "email_not_in_registry" };
            }
            if (role !== "role_admin" && role !== "role_teacher") {
                return { success: false, error: "invalidCredentials" };
            }
        }

        // Build new user object
        const newUser = {
            email: cleanEmail,
            password: password,
            name: finalName,
            role: finalRole,
            assignedArea: "all",
            firstLogin: false,
            oneTimeAccess: false,
            points: 0,
            streak: 0,
            schoolId: schoolId
        };

        // Persist to data store
        NafasData.addUser(newUser);
        NafasData.logAction(newUser.email, `New ${finalRole} account registered. Pre-approved match: ${match ? "Yes" : "No"}`);

        // Auto-login after registration
        currentUser = newUser;
        localStorage.setItem("nafas_session", JSON.stringify(newUser));
        forcePasswordResetState = false;

        return { success: true, user: newUser };
    }

    // Check Roles and Permissions
    function hasRole(allowedRoles) {
        if (!currentUser) return false;
        return allowedRoles.includes(currentUser.role);
    }

    init();

    return {
        login,
        changePassword,
        logout,
        register,
        toggleOneTimeAccess,
        getCurrentUser: () => currentUser,
        isPasswordResetForced: () => forcePasswordResetState,
        hasRole
    };
})();
window.NafasAuth = NafasAuth;
