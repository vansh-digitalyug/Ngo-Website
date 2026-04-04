import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
    heading: { type: String, default: "" },
    body:    { type: String, default: "" },
}, { _id: false });

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    S3Imagekey: {
        type: String,
        required: true,
    },
    excerpt: {
        type: String,
        default: "",
        trim: true,
    },
    content: {
        type: String,
        default: "",
    },
    sections: {
        type: [sectionSchema],
        default: [],
    },
    category: {
        type: String,
        default: "General",
        trim: true,
    },
    author: {
        type: String,
        default: "Admin Team",
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// ✅ Added indexes
blogSchema.index({ createdAt: -1 });                  // public blog list: most recent first
blogSchema.index({ category: 1, createdAt: -1 });     // filter by category, sorted by newest
blogSchema.index({ title: "text", excerpt: "text" }); // full-text search on title & excerpt

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;