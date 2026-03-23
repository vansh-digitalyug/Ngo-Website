import mongoose from "mongoose";

const communityPostSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: [true, "Post text is required"],
            trim: true,
            maxlength: [2000, "Post cannot exceed 2000 characters"],
        },
        imageKeys: {
            type: [String],
            default: [],
        },
        tags: {
            type: [String],
            default: [],
        },
        // Aggregated counts — updated via $inc for performance
        likeCount:    { type: Number, default: 0, min: 0 },
        commentCount: { type: Number, default: 0, min: 0 },

        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

communityPostSchema.index({ author: 1, createdAt: -1 });
communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ tags: 1 });

const CommunityPost = mongoose.model("CommunityPost", communityPostSchema);
export default CommunityPost;
