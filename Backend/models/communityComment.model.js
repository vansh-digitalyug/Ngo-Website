import mongoose from "mongoose";

const communityCommentSchema = new mongoose.Schema(
    {
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CommunityPost",
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: [true, "Comment text is required"],
            trim: true,
            maxlength: [500, "Comment cannot exceed 500 characters"],
        },
        // Optional — for nested replies
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CommunityComment",
            default: null,
        },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

communityCommentSchema.index({ post: 1, createdAt: 1 });
communityCommentSchema.index({ parentComment: 1 });

const CommunityComment = mongoose.model("CommunityComment", communityCommentSchema);
export default CommunityComment;
