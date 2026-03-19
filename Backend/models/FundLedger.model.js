import mongoose from "mongoose";

const fundLedgerSchema = new mongoose.Schema(
    {
        ngoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ngo",
            required: [true, "NGO ID is required"],
        },

        type: {
            type: String,
            enum: ["credit", "debit"],
            required: [true, "Entry type (credit/debit) is required"],
        },

        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [1, "Amount must be at least ₹1"],
        },

        category: {
            type: String,
            enum: ["donation", "govt_grant", "salary", "materials", "event", "operations", "village_work", "medical", "education", "other"],
            required: [true, "Category is required"],
        },

        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
        },

        // e.g. Razorpay order ID, invoice number, cheque number
        referenceId: { type: String, trim: true, default: "" },

        // S3 key for receipt / bill image
        receiptKey: { type: String, default: null },

        // The date the transaction actually happened (may differ from createdAt)
        date: { type: Date, required: true, default: Date.now },

        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Whether this entry is visible on the public transparency page
        isPublic: { type: Boolean, default: true },

        // Optional: link to a village this expense was for
        villageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VillageAdoption",
            default: null,
        },
    },
    { timestamps: true }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
fundLedgerSchema.index({ ngoId: 1, date: -1 });
fundLedgerSchema.index({ ngoId: 1, type: 1, category: 1 });
fundLedgerSchema.index({ ngoId: 1, isPublic: 1, date: -1 });
fundLedgerSchema.index({ villageId: 1 });

const FundLedger = mongoose.model("FundLedger", fundLedgerSchema);
export default FundLedger;
