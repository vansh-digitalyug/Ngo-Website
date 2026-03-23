import mongoose from "mongoose";

// Separate collection — prevents duplicate likes, enables fast aggregation
const communityLikeSchema = new mongoose.Schema(
    {
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CommunityPost",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// One like per user per post
communityLikeSchema.index({ post: 1, user: 1 }, { unique: true });
communityLikeSchema.index({ post: 1 });

const CommunityLike = mongoose.model("CommunityLike", communityLikeSchema);
export default CommunityLike;
