import mongoose from "mongoose";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3Client.config.js";
import Category from "../models/Services.Category.models.js";
import Program from "../models/Services.Program.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/Apiresponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY
// ─────────────────────────────────────────────────────────────────────────────

export const createCategory = asyncHandler(async (req, res) => {
    const { name, description, imageKey } = req.body;

    if (!name || name.trim() === "") throw new ApiError(400, "Category name is required");
    if (!description || description.trim() === "") throw new ApiError(400, "Category description is required");

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) throw new ApiError(409, "A category with this name already exists");

    const category = await Category.create({
        name: name.trim(),
        description: description.trim(),
        imageUrl: imageKey?.trim() || null,
    });

    return res.status(201).json(new ApiResponse(201, "Category created successfully", category));
});

export const getAllCategories = asyncHandler(async (req, res) => {
    const includeHidden = req.query.includeHidden === "true";
    const query = includeHidden ? {} : { isActive: true };
    const categories = await Category.find(query).sort({ createdAt: 1 });
    return res.status(200).json(new ApiResponse(200, "Categories fetched successfully", categories));
});

export const getCategoryById = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) throw new ApiError(400, "Invalid category ID");

    const category = await Category.findById(categoryId);
    if (!category || !category.isActive) throw new ApiError(404, "Category not found");

    return res.status(200).json(new ApiResponse(200, "Category fetched successfully", category));
});

export const updateCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) throw new ApiError(400, "Invalid category ID");

    const category = await Category.findById(categoryId);
    if (!category || !category.isActive) throw new ApiError(404, "Category not found");

    const { name, description, imageUrl } = req.body;
    if (name && name.trim()) category.name = name.trim();
    if (description && description.trim()) category.description = description.trim();
    if (imageUrl !== undefined) category.imageUrl = imageUrl?.trim() || null;

    await category.save();
    return res.status(200).json(new ApiResponse(200, "Category updated successfully", category));
});

export const deleteCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) throw new ApiError(400, "Invalid category ID");

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category || !category.isActive) throw new ApiError(404, "Category not found");

    return res.status(200).json(new ApiResponse(200, "Category deleted successfully", category));
});

export const unhideCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) throw new ApiError(400, "Invalid category ID");
    const category = await Category.findById(categoryId);
    if (!category) throw new ApiError(404, "Category not found");
    category.isActive = true;
    await category.save();
    return res.status(200).json(new ApiResponse(200, "Category unhidden successfully", null));
});

const deleteCategoryAndPrograms = async (categoryId) => {
    await Category.findByIdAndDelete(categoryId);
    await Program.deleteMany({ categoryId });
}

export const hideCategory = asyncHandler(async(req, res) =>{
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) throw new ApiError(400, "Invalid category ID");
    const category = await Category.findById(categoryId);
    if (!category) throw new ApiError(404, "Category not found");
    category.isActive = false;
    await category.save();
    await Program.updateMany({ categoryId }, { isActive: false });
    return res.status(200).json(new ApiResponse(200, "Category hidden successfully", null));
})









// ─────────────────────────────────────────────────────────────────────────────
// PROGRAM
// ─────────────────────────────────────────────────────────────────────────────

export const createProgram = asyncHandler(async (req, res) => {
    const {
        title, description, fullDescription,
        categoryId, imagekeys, galleryImageKeys,
        donationTitle, cta, href,
    } = req.body;

    if (!title || title.trim() === "") throw new ApiError(400, "Program title is required");
    if (!description || description.trim() === "") throw new ApiError(400, "Program description is required");
    if (!categoryId) throw new ApiError(400, "categoryId is required");
    if (!mongoose.Types.ObjectId.isValid(categoryId)) throw new ApiError(400, "Invalid categoryId");

    const category = await Category.findById(categoryId);
    if (!category || !category.isActive) throw new ApiError(404, "Category not found");

    const existing = await Program.findOne({ title: title.trim(), categoryId });
    if (existing) throw new ApiError(409, "A program with this title already exists in this category");

    const program = await Program.create({
        title: title.trim(),
        description: description.trim(),
        fullDescription: fullDescription?.trim() || "",
        categoryId,
        categoryName: category.name,
        imagekeys: imagekeys?.trim() || null,
        galleryImageKeys: Array.isArray(galleryImageKeys) ? galleryImageKeys : [],
        donationTitle: donationTitle?.trim() || "",
        cta: cta?.trim() || "Help Now",
        href: href?.trim() || null,
    });

    return res.status(201).json(new ApiResponse(201, "Program created successfully", program));
});

export const getAllPrograms = asyncHandler(async (_req, res) => {
    const programs = await Program.find({ isActive: true })
        .populate("categoryId", "name")
        .sort({ categoryName: 1, createdAt: 1 });

    return res.status(200).json(new ApiResponse(200, "Programs fetched successfully", programs));
});

export const getProgramsByCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) throw new ApiError(400, "Invalid category ID");

    const includeHidden = req.query.includeHidden === "true";
    const query = includeHidden ? { categoryId } : { categoryId, isActive: true };
    const programs = await Program.find(query).sort({ createdAt: 1 });
    return res.status(200).json(new ApiResponse(200, "Programs fetched successfully", programs));
});

export const getProgramById = asyncHandler(async (req, res) => {
    const { programId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(programId)) throw new ApiError(400, "Invalid program ID");

    const program = await Program.findById(programId).populate("categoryId", "name");
    if (!program || !program.isActive) throw new ApiError(404, "Program not found");

    return res.status(200).json(new ApiResponse(200, "Program fetched successfully", program));
});

export const getProgramByTitle = asyncHandler(async (req, res) => {
    const { title } = req.params;
    if (!title || title.trim() === "") throw new ApiError(400, "Program title is required");

    const escaped = title.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const program = await Program.findOne({
        title: { $regex: new RegExp(`^${escaped}$`, "i") },
        isActive: true,
    }).populate("categoryId", "name");

    if (!program) throw new ApiError(404, "Program not found");
    return res.status(200).json(new ApiResponse(200, "Program fetched successfully", program));
});

export const getProgramByHref = asyncHandler(async (req, res) => {
    const href = req.query.href;
    if (!href) throw new ApiError(400, "href query param is required");

    const program = await Program.findOne({ href, isActive: true }).populate("categoryId", "name");
    if (!program) throw new ApiError(404, "Program not found for this URL");

    // Reuse the same resolveImageUrl helper used by getServicesWithPrograms
    const coverUrl = await resolveImageUrl(program.imagekeys).catch(() => null);

    const galleryUrls = await Promise.all(
        (program.galleryImageKeys || []).map(key => resolveImageUrl(key).catch(() => null))
    ).then(urls => urls.filter(Boolean));

    return res.status(200).json(new ApiResponse(200, "Program fetched successfully", {
        ...program.toObject(),
        coverUrl,
        galleryUrls,
    }));
});


export const updateProgram = asyncHandler(async (req, res) => {
    const { programId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(programId)) throw new ApiError(400, "Invalid program ID");

    const program = await Program.findById(programId);
    if (!program || !program.isActive) throw new ApiError(404, "Program not found");

    const {
        title, description, fullDescription,
        categoryId, imagekeys, galleryImageKeys,
        donationTitle, cta, href,
    } = req.body;

    if (title?.trim()) program.title = title.trim();
    if (description?.trim()) program.description = description.trim();
    if (fullDescription?.trim()) program.fullDescription = fullDescription.trim();
    if (donationTitle?.trim()) program.donationTitle = donationTitle.trim();
    if (cta?.trim()) program.cta = cta.trim();
    if (href !== undefined) program.href = href?.trim() || null;
    if (imagekeys !== undefined) program.imagekeys = imagekeys?.trim() || null;
    if (Array.isArray(galleryImageKeys)) program.galleryImageKeys = galleryImageKeys;

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
        const category = await Category.findById(categoryId);
        if (!category || !category.isActive) throw new ApiError(404, "Category not found");
        program.categoryId = categoryId;
        program.categoryName = category.name;
    }

    await program.save();
    return res.status(200).json(new ApiResponse(200, "Program updated successfully", program));
});

export const deleteProgram = asyncHandler(async (req, res) => {
    const { programId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(programId)) throw new ApiError(400, "Invalid program ID");

    const program = await Program.findById(programId);
    if (!program) throw new ApiError(404, "Program not found");

    program.isActive = false;
    await program.save();
    return res.status(200).json(new ApiResponse(200, "Program deleted successfully", null));
});

export const unhideProgram = asyncHandler(async (req, res) => {
    const { programId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(programId)) throw new ApiError(400, "Invalid program ID");
    const program = await Program.findById(programId);
    if (!program) throw new ApiError(404, "Program not found");
    program.isActive = true;
    await program.save();
    return res.status(200).json(new ApiResponse(200, "Program unhidden successfully", null));
});

export const hardDeleteProgram = asyncHandler(async (req, res) => {
    const { programId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(programId)) throw new ApiError(400, "Invalid program ID");
    const program = await Program.findByIdAndDelete(programId);
    if (!program) throw new ApiError(404, "Program not found");
    return res.status(200).json(new ApiResponse(200, "Program permanently deleted successfully", null));
});

export const hideProgram = asyncHandler(async(req, res) =>{
    const { programId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(programId)) throw new ApiError(400, "Invalid program ID");
    const program = await Program.findById(programId);
    if (!program) throw new ApiError(404, "Program not found");
    program.isActive = false;
    await program.save();
    return res.status(200).json(new ApiResponse(200, "Program hidden successfully", null));
})


// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — all categories with their programs in one response (used by frontend)
// ─────────────────────────────────────────────────────────────────────────────

// Resolve a raw key to a URL:
//   - already an http(s) URL (Pexels etc.) → return as-is
//   - S3 key → generate a presigned GET URL valid for 7 days
async function resolveImageUrl(key) {
    if (!key) return null;
    if (typeof key === "string" && key.startsWith("http")) return key;
    const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
    });
    return getSignedUrl(s3, command, { expiresIn: 604800 }); // 7 days
}

export const getServicesWithPrograms = asyncHandler(async (_req, res) => {
    // Use let/$expr form so this works on MongoDB 3.6+ (not just 5.0+)
    const result = await Category.aggregate([
        { $match: { isActive: true } },
        { $sort: { createdAt: 1 } },
        {
            $lookup: {
                from: "programs",
                let: { catId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$categoryId", "$$catId"] },
                            isActive: true,
                        },
                    },
                    { $sort: { createdAt: 1 } },
                ],
                as: "programs",
            },
        },
    ]);

    // Resolve all S3 keys to signed URLs in parallel (local crypto ops, no network calls)
    const transformed = await Promise.all(
        result.map(async (cat) => ({
            ...cat,
            programs: await Promise.all(
                cat.programs.map(async (p) => ({
                    ...p,
                    imagekeys: await resolveImageUrl(p.imagekeys),
                    galleryImageKeys: (
                        await Promise.all((p.galleryImageKeys || []).map(resolveImageUrl))
                    ).filter(Boolean),
                }))
            ),
        }))
    );

    return res.status(200).json(new ApiResponse(200, "Services fetched successfully", transformed));
});
