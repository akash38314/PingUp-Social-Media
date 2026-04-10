export const protect = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        if (!userId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }
        req.userId = userId;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ success: false, message: "Authentication failed" });
    }
};