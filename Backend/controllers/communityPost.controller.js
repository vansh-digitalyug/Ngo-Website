import mongoose from "mongoose";
import CommunityPost    from "../models/communityPost.model.js";
import CommunityLike    from "../models/communityLike.model.js";
import CommunityComment from "../models/communityComment.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError    from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────────────────────────────────────
// POSTS
// ─────────────────────────────────────────────────────────────────────────────


export const createPost = asyncHandler(async (req, res) => {
    const { text, imageKeys, tags } = req.body;

    if (!text?.trim()) throw new ApiError(400, "Post text is required");

    const post = await CommunityPost.create({
        author:    req.user._id,
        text:      text.trim(),
        imageKeys: Array.isArray(imageKeys) ? imageKeys : [],
        tags:      Array.isArray(tags) ? tags : [],
    });

    await post.populate("author", "name avatar");

    res.status(201).json(new ApiResponse(201, "Post created", { post }));
});


export const getAllPosts = asyncHandler(async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;
    const tag    = req.query.tag;
    const author = req.query.author;

    const filter = { isDeleted: false };
    if (tag)    filter.tags   = tag;
    if (author) filter.author = author;

    const [posts, total] = await Promise.all([
        CommunityPost.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("author", "name avatar")
            .lean(),
        CommunityPost.countDocuments(filter),
    ]);

    // If user is logged in, mark which posts they liked
    let likedPostIds = new Set();
    if (req.user) {
        const likes = await CommunityLike.find({
            post: { $in: posts.map((p) => p._id) },
            user: req.user._id,
        }).select("post").lean();
        likedPostIds = new Set(likes.map((l) => l.post.toString()));
    }

    const feed = posts.map((p) => ({
        ...p,
        isLiked: likedPostIds.has(p._id.toString()),
    }));

    res.status(200).json(
        new ApiResponse(200, "Posts fetched", {
            posts: feed,
            pagination: { total, page, pages: Math.ceil(total / limit), limit },
        })
    );
});


export const getPostById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid post ID");

    const post = await CommunityPost.findOne({ _id: id, isDeleted: false })
        .populate("author", "name avatar")
        .lean();

    if (!post) throw new ApiError(404, "Post not found");

    // Top-level comments (no parent)
    const comments = await CommunityComment.find({ post: id, parentComment: null, isDeleted: false })
        .sort({ createdAt: 1 })
        .limit(20)
        .populate("author", "name avatar")
        .lean();

    let isLiked = false;
    if (req.user) {
        const like = await CommunityLike.findOne({ post: id, user: req.user._id });
        isLiked = !!like;
    }

    res.status(200).json(new ApiResponse(200, "Post fetched", { post: { ...post, isLiked }, comments }));
});


export const updatePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid post ID");

    const post = await CommunityPost.findOne({ _id: id, isDeleted: false });
    if (!post) throw new ApiError(404, "Post not found");

    if (post.author.toString() !== req.user._id.toString())
        throw new ApiError(403, "You can only edit your own posts");

    const { text, imageKeys, tags } = req.body;
    if (text !== undefined) post.text = text.trim();
    if (Array.isArray(imageKeys)) post.imageKeys = imageKeys;
    if (Array.isArray(tags))      post.tags      = tags;

    await post.save();
    await post.populate("author", "name avatar");

    res.status(200).json(new ApiResponse(200, "Post updated", { post }));
});

export const deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid post ID");

    const post = await CommunityPost.findOne({ _id: id, isDeleted: false });
    if (!post) throw new ApiError(404, "Post not found");

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) throw new ApiError(403, "Not authorized to delete this post");

    post.isDeleted = true;
    await post.save();

    res.status(200).json(new ApiResponse(200, "Post deleted", null));
});

// ─────────────────────────────────────────────────────────────────────────────
// LIKES
// ─────────────────────────────────────────────────────────────────────────────


export const toggleLike = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid post ID");

    const post = await CommunityPost.findOne({ _id: id, isDeleted: false });
    if (!post) throw new ApiError(404, "Post not found");

    const existing = await CommunityLike.findOne({ post: id, user: req.user._id });

    if (existing) {
        // Unlike
        await existing.deleteOne();
        await CommunityPost.findByIdAndUpdate(id, { $inc: { likeCount: -1 } });
        return res.status(200).json(new ApiResponse(200, "Post unliked", { liked: false, likeCount: post.likeCount - 1 }));
    }

    // Like
    await CommunityLike.create({ post: id, user: req.user._id });
    await CommunityPost.findByIdAndUpdate(id, { $inc: { likeCount: 1 } });

    res.status(200).json(new ApiResponse(200, "Post liked", { liked: true, likeCount: post.likeCount + 1 }));
});

// ─────────────────────────────────────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────────────────────────────────────

export const addComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { text, parentComment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid post ID");
    if (!text?.trim()) throw new ApiError(400, "Comment text is required");

    const post = await CommunityPost.findOne({ _id: id, isDeleted: false });
    if (!post) throw new ApiError(404, "Post not found");

    // Validate parentComment if reply
    if (parentComment) {
        if (!mongoose.Types.ObjectId.isValid(parentComment))
            throw new ApiError(400, "Invalid parentComment ID");
        const parent = await CommunityComment.findOne({ _id: parentComment, post: id, isDeleted: false });
        if (!parent) throw new ApiError(404, "Parent comment not found");
    }

    const comment = await CommunityComment.create({
        post:          id,
        author:        req.user._id,
        text:          text.trim(),
        parentComment: parentComment || null,
    });

    await CommunityPost.findByIdAndUpdate(id, { $inc: { commentCount: 1 } });
    await comment.populate("author", "name avatar");

    res.status(201).json(new ApiResponse(201, "Comment added", { comment }));
});


export const getComments = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid post ID");

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [comments, total] = await Promise.all([
        CommunityComment.find({ post: id, parentComment: null, isDeleted: false })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .populate("author", "name avatar")
            .lean(),
        CommunityComment.countDocuments({ post: id, parentComment: null, isDeleted: false }),
    ]);

    // Fetch replies for each top-level comment
    const commentIds = comments.map((c) => c._id);
    const replies = await CommunityComment.find({
        parentComment: { $in: commentIds },
        isDeleted: false,
    })
        .sort({ createdAt: 1 })
        .populate("author", "name avatar")
        .lean();

    // Group replies under their parent
    const replyMap = {};
    replies.forEach((r) => {
        const key = r.parentComment.toString();
        if (!replyMap[key]) replyMap[key] = [];
        replyMap[key].push(r);
    });

    const result = comments.map((c) => ({
        ...c,
        replies: replyMap[c._id.toString()] || [],
    }));

    res.status(200).json(
        new ApiResponse(200, "Comments fetched", {
            comments: result,
            pagination: { total, page, pages: Math.ceil(total / limit), limit },
        })
    );
});

export const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(commentId)) throw new ApiError(400, "Invalid comment ID");

    const comment = await CommunityComment.findOne({ _id: commentId, isDeleted: false });
    if (!comment) throw new ApiError(404, "Comment not found");

    const isOwner = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) throw new ApiError(403, "Not authorized to delete this comment");

    comment.isDeleted = true;
    await comment.save();

    await CommunityPost.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

    res.status(200).json(new ApiResponse(200, "Comment deleted", null));
});

