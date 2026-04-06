import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Ngo from "../models/ngo.model.js";
import Volunteer from "../models/volunteer.model.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";

// ─── GET /api/public/stats ────────────────────────────────────────────────
// Returns platform-wide live stats + recent donations for the home page.
// No auth required.
export const getPublicStats = asyncHandler(async (req, res) => {
  const [
    totalNgos,
    statesAgg,
    totalVolunteers,
    totalDonors,
    totalRaisedAgg,
    recentPayments,
    causesAgg
  ] = await Promise.all([
    // Total registered NGOs (all are verified on this platform)
    Ngo.countDocuments({}),

    // Distinct states across all NGOs
    Ngo.distinct("state", {}),

    // Approved volunteers
    Volunteer.countDocuments({ status: "Approved" }),

    // Total paid donations count
    Payment.countDocuments({ status: "paid" }),

    // Sum of all paid payments
    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),

    // Last 9 paid donations for the feed
    Payment.find({ status: "paid" })
      .sort({ updatedAt: -1 })
      .limit(9)
      .select("donorName isAnonymous serviceTitle amount updatedAt createdAt")
      .lean(),

    // Top causes: total raised per serviceTitle (top 4)
    Payment.aggregate([
      { $match: { status: "paid", serviceTitle: { $nin: [null, ""] } } },
      { $group: { _id: "$serviceTitle", raised: { $sum: "$amount" }, donors: { $sum: 1 } } },
      { $sort: { raised: -1 } },
      { $limit: 4 }
    ])
  ]);

  // Use whichever is higher: the real distinct-state count from DB, or the
  // platform's known geographic reach (25 states). This ensures the number
  // never goes below the real operational coverage even if not all NGOs have
  // state data populated yet.
  const distinctStates = statesAgg.filter(Boolean).length;
  const PLATFORM_STATES_COVERED = 25;
  const statesCovered = Math.max(distinctStates, PLATFORM_STATES_COVERED);

  const totalRaised = totalRaisedAgg[0]?.total || 0;



  // Format recent donations for the frontend (mask anonymous donors)
  const AVATAR_COLORS = [
    "#1a2d5a", "#b45309", "#065f46", "#5b21b6",
    "#9f1239", "#1e3a5f", "#78350f", "#14532d", "#312e81"
  ];

  const recentDonations = recentPayments.map((p, i) => {
    const rawName = p.isAnonymous ? "Anonymous" : (p.donorName || "Donor");
    const parts = rawName.split(" ");
    const initials = parts.map(w => w[0]?.toUpperCase() || "").join("").slice(0, 2) || "D";
    const displayName = p.isAnonymous
      ? "Anonymous"
      : parts.length > 1
        ? `${parts[0]} ${parts[parts.length - 1][0]}.`
        : parts[0];

    const now = Date.now();
    const ts = new Date(p.updatedAt || p.createdAt).getTime();
    const diffMs = isNaN(ts) ? 0 : now - ts;
    const diffMin = Math.floor(diffMs / 60000);
    let timeAgo;
    if (diffMin < 1)         timeAgo = "just now";
    else if (diffMin < 60)   timeAgo = `${diffMin} min ago`;
    else if (diffMin < 1440) timeAgo = `${Math.floor(diffMin / 60)} hr ago`;
    else                     timeAgo = `${Math.floor(diffMin / 1440)} days ago`;

    return {
      initials,
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      name: displayName,
      cause: p.serviceTitle || "General Donation",
      amount: `₹${Number(p.amount).toLocaleString("en-IN")}`,
      time: timeAgo
    };
  });

  // Map cause titles to display category labels
  const CATEGORY_MAP = [
    { keywords: ["orphan", "child", "education", "school"],    cat: "Child Welfare"    },
    { keywords: ["elder", "senior", "medical", "health"],      cat: "Medical Aid"      },
    { keywords: ["meal", "food", "nutrition", "lunch"],        cat: "Nutrition"        },
    { keywords: ["kanya", "wedding", "marriage", "girl"],      cat: "Kanya Daan"       },
    { keywords: ["widow", "women", "woman", "empowerment"],    cat: "Women Welfare"    },
    { keywords: ["road", "infrastructure", "construction"],    cat: "Infrastructure"   },
    { keywords: ["cancer", "kidney", "camp", "treatment"],     cat: "Medical Aid"      },
    { keywords: ["helmet", "safety", "community"],             cat: "Community Safety" },
  ];

  const getCategory = (title) => {
    const lower = (title || "").toLowerCase();
    for (const c of CATEGORY_MAP) {
      if (c.keywords.some(k => lower.includes(k))) return c.cat;
    }
    return "General";
  };

  const topCauses = causesAgg.map(c => ({
    title: c._id,
    cat: getCategory(c._id),
    raised: c.raised,
    donors: c.donors,
  }));

  return res.status(200).json(
    new ApiResponse(200, "Public stats fetched successfully", {
      stats: {
        totalNgos,
        statesCovered,
        totalVolunteers,
        totalDonations: totalDonors,
        totalRaised
      },
      recentDonations,
      topCauses
    })
  );
});
