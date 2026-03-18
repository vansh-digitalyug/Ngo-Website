import User from "../models/user.model.js";
import Community from "../models/community.model.js";

/**
 * requireCommunityLeader
 * ─────────────────────────────────────────────────────────────────────────────
 * Protects community-leader dashboard routes.
 *
 * Checks:
 *  1. User is authenticated (req.userId set by `authenticate` middleware)
 *  2. User has been assigned a communityId and communityRole on their profile
 *  3. The community is active and verified
 *
 * Sets on request:
 *  - req.community   → full Community document
 *  - req.communityId → community ObjectId
 *  - req.communityRole → "leader" | "co-leader" | "coordinator"
 */
export const requireCommunityLeader = async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first.",
            });
        }

        // Fetch community assignment from user profile (fast single-field query)
        const user = await User.findById(req.userId)
            .select("communityId communityRole name email")
            .lean();

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found." });
        }

        if (!user.communityId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. No community leadership has been assigned to your account.",
            });
        }

        const validRoles = ["leader", "co-leader", "coordinator"];
        if (!validRoles.includes(user.communityRole)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Community leader role required.",
            });
        }

        // Verify the community still exists and is active
        const community = await Community.findById(user.communityId);

        if (!community) {
            return res.status(404).json({
                success: false,
                message: "Assigned community not found.",
            });
        }

        if (community.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Your community is currently inactive. Please contact the admin.",
            });
        }

        // Attach to request for downstream controllers
        req.community   = community;
        req.communityId = user.communityId;
        req.communityRole = user.communityRole;

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Community authorization error.",
            error: error.message,
        });
    }
};

/**
 * requireCommunityLeaderOnly
 * ─────────────────────────────────────────────────────────────────────────────
 * Stricter version — only allows "leader" role (not co-leader or coordinator).
 * Use for destructive or high-privilege leader actions.
 */
export const requireCommunityLeaderOnly = async (req, res, next) => {
    await requireCommunityLeader(req, res, async () => {
        if (req.communityRole !== "leader") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only the primary community leader can perform this action.",
            });
        }
        next();
    });
};
