import { CollegeCutoff } from '../models/collegeCutoff.model.js';
import { RANK_DATA, RANK_TAKEAWAYS, DEFAULT_YEAR, AVAILABLE_YEARS } from '../data/rankData.js';

const TOTAL_MARKS = 720;
const RANK_BAND = 0.08; // ±8% band around the point estimate

/**
 * Data-driven NEET AIR Rank estimation from expected marks (out of 720).
 *
 * Uses the year-wise anchor dataset in ../data/rankData.js and plain linear
 * interpolation between the two anchor points that bracket `marks`. Each band
 * carries its own per-mark slope straight from the real data, so the "decay"
 * is derived from the data itself (not a guessed constant), and the curve
 * passes exactly through every anchor point. Accuracy improves automatically
 * as more real verified data points are added.
 */
export const predictRankFromMarks = (marks, year = DEFAULT_YEAR) => {
  const m = Number(marks);
  const resolvedYear = RANK_DATA[year] ? Number(year) : DEFAULT_YEAR;

  // Anchors sorted by marks descending (highest marks → lowest rank first).
  const anchors = [...RANK_DATA[resolvedYear]].sort((a, b) => b.marks - a.marks);
  const top = anchors[0];
  const bottom = anchors[anchors.length - 1];

  let estimatedRank;
  if (m >= top.marks) {
    estimatedRank = top.rank;
  } else if (m <= bottom.marks) {
    estimatedRank = bottom.rank;
  } else {
    for (let i = 0; i < anchors.length - 1; i += 1) {
      const high = anchors[i]; // higher marks, lower rank
      const low = anchors[i + 1]; // lower marks, higher rank
      if (m <= high.marks && m >= low.marks) {
        const frac = (high.marks - m) / (high.marks - low.marks);
        estimatedRank = Math.round(high.rank + (low.rank - high.rank) * frac);
        break;
      }
    }
  }

  return {
    marks: m,
    totalMarks: TOTAL_MARKS,
    year: resolvedYear,
    estimatedRank,
    rankRange: {
      min: Math.max(1, Math.round(estimatedRank * (1 - RANK_BAND))),
      max: Math.round(estimatedRank * (1 + RANK_BAND)),
    },
    takeaway: getTakeaway(m, resolvedYear),
  };
};

/** Years the rank predictor has data for (newest first). */
export const getAvailableRankYears = () => AVAILABLE_YEARS;

/**
 * Key takeaway string for the given marks and year, or null if no guidance
 * exists for that year. Picks the band with the highest `minMarks` <= marks.
 */
const getTakeaway = (marks, year) => {
  const bands = RANK_TAKEAWAYS[year];
  if (!bands) return null;
  const m = Number(marks);
  const band = [...bands]
    .sort((a, b) => b.minMarks - a.minMarks)
    .find((b) => m >= b.minMarks);
  return band ? band.text : null;
};

/**
 * Predict probable colleges based on expected marks and category
 */
export const predictCollegesFromMarks = async ({ marks, category = 'GEN', state, year }) => {
  const rankPrediction = predictRankFromMarks(marks, year);
  const estimatedRank = rankPrediction.estimatedRank;

  const query = {
    category,
    closingRank: { $gte: estimatedRank - 2000 },
  };

  if (state) {
    query.state = state;
  }

  const colleges = await CollegeCutoff.find(query)
    .sort({ closingRank: 1 })
    .limit(30);

  return {
    rankPrediction,
    category,
    probableCollegesCount: colleges.length,
    colleges,
  };
};

// Admin Methods
export const bulkImportCutoffs = async (cutoffsArray) => {
  return await CollegeCutoff.insertMany(cutoffsArray);
};
