/**
 * Year-wise NEET Marks → All India Rank (AIR) anchor datasets.
 *
 * Each year holds an array of { marks, rank } anchor points.
 * The predictor service log-interpolates between adjacent anchors, so this
 * table does NOT need to be dense — just accurate at the anchor points.
 *
 * To add a new year, add a `YYYY: [ ... ]` entry sorted by marks descending.
 */
export const RANK_DATA = {
  2026: [
    { marks: 715, rank: 1 },
    { marks: 700, rank: 19 },
    { marks: 681, rank: 250 },
    { marks: 660, rank: 900 },
    { marks: 640, rank: 2200 },
    { marks: 620, rank: 4700 },
    { marks: 600, rank: 10500 },
    { marks: 575, rank: 20000 },
    { marks: 560, rank: 29500 },
    { marks: 535, rank: 50000 },
    { marks: 500, rank: 90000 },
    { marks: 450, rank: 165000 },
    { marks: 400, rank: 270000 },
    { marks: 350, rank: 400000 },
    { marks: 300, rank: 600000 },
    { marks: 250, rank: 800000 },
    { marks: 200, rank: 1050000 },
    { marks: 150, rank: 1350000 },
    { marks: 100, rank: 1750000 },
  ],
  // NEET 2025 — derived from the official range-based marks-vs-rank table.
  // Each "marks range → rank range" row becomes two anchor points:
  // higher marks → lower rank end, lower marks → higher rank end.
  2025: [
    { marks: 686, rank: 1 },
    { marks: 682, rank: 2 },
    { marks: 681, rank: 3 },
    { marks: 678, rank: 8 },
    { marks: 650, rank: 77 },
    { marks: 635, rank: 170 },
    { marks: 630, rank: 250 },
    { marks: 622, rank: 412 },
    { marks: 609, rank: 845 },
    { marks: 607, rank: 981 },
    { marks: 601, rank: 1302 },
    { marks: 589, rank: 2341 },
    { marks: 577, rank: 4000 },
    { marks: 571, rank: 5123 },
    { marks: 569, rank: 5603 },
    { marks: 563, rank: 7296 },
    { marks: 549, rank: 12860 },
    { marks: 540, rank: 17370 },
    { marks: 528, rank: 25541 },
    { marks: 525, rank: 27698 },
    { marks: 515, rank: 36843 },
    { marks: 481, rank: 76510 },
    { marks: 478, rank: 80336 },
    { marks: 459, rank: 107944 },
    { marks: 435, rank: 146846 },
    { marks: 402, rank: 206050 },
    { marks: 398, rank: 213371 },
    { marks: 302, rank: 436777 },
    { marks: 257, rank: 577330 },
    { marks: 228, rank: 684232 },
    { marks: 172, rank: 937041 },
    { marks: 135, rank: 1152192 },
    { marks: 104, rank: 1391647 },
    { marks: 69, rank: 1717603 },
    { marks: 35, rank: 2035851 },
  ],
  // NEET 2024 — from the official range-based marks-vs-rank table.
  2024: [
    { marks: 720, rank: 1 },
    { marks: 715, rank: 17 },
    { marks: 700, rank: 2250 },
    { marks: 690, rank: 4406 },
    { marks: 665, rank: 17800 },
    { marks: 656, rank: 25500 },
    { marks: 638, rank: 40116 },
    { marks: 630, rank: 47810 },
    { marks: 615, rank: 65000 },
    { marks: 606, rank: 70000 },
    { marks: 592, rank: 90400 },
    { marks: 550, rank: 144000 },
    { marks: 500, rank: 209000 },
    { marks: 451, rank: 285550 },
    { marks: 414, rank: 351425 },
    { marks: 380, rank: 420000 },
    { marks: 287, rank: 657138 },
    { marks: 251, rank: 774559 },
    { marks: 142, rank: 1200000 },
  ],
  // NEET 2023 — from the official range-based marks-vs-rank table.
  2023: [
    { marks: 715, rank: 1 },
    { marks: 701, rank: 48 },
    { marks: 700, rank: 97 },
    { marks: 670, rank: 2700 }, // real verified data point
    { marks: 651, rank: 4245 },
    { marks: 650, rank: 4677 },
    { marks: 601, rank: 20568 },
    { marks: 600, rank: 21162 },
    { marks: 551, rank: 48400 },
    { marks: 550, rank: 49121 },
    { marks: 451, rank: 125742 },
    { marks: 450, rank: 126733 },
    { marks: 401, rank: 177959 },
    { marks: 400, rank: 179226 },
    { marks: 351, rank: 241657 },
    { marks: 350, rank: 243139 },
    { marks: 301, rank: 320666 },
    { marks: 300, rank: 322702 },
    { marks: 251, rank: 417675 },
    { marks: 250, rank: 420134 },
    { marks: 201, rank: 540747 },
    { marks: 200, rank: 544093 },
    { marks: 151, rank: 710276 },
    { marks: 150, rank: 715384 },
    { marks: 101, rank: 990231 },
    { marks: 100, rank: 1001694 },
    { marks: 51, rank: 1460741 },
    { marks: 50, rank: 1476066 },
    { marks: 0, rank: 1750199 },
  ],
};

/**
 * Year-wise "Key Takeaway" bands (from the official marks-range guidance).
 * `minMarks` is the floor of the band: a student's takeaway is the entry with
 * the highest `minMarks` that is <= their marks. Only years we have guidance
 * for are populated; others simply return no takeaway.
 */
export const RANK_TAKEAWAYS = {
  2026: [
    { minMarks: 715, text: 'Highest reported score in NEET 2026' },
    { minMarks: 700, text: 'Excellent chance of top government medical colleges' },
    { minMarks: 681, text: 'Likely top 300 rank' },
    { minMarks: 660, text: 'Expected within top 1,000' },
    { minMarks: 640, text: 'Around top 2,500 rank' },
    { minMarks: 620, text: 'Around top 5,000 rank' },
    { minMarks: 600, text: 'Around top 10,000 rank' },
    { minMarks: 575, text: 'Competitive score for many government colleges' },
    { minMarks: 560, text: 'Around top 30,000 rank' },
    { minMarks: 535, text: 'Mid-range government/private college opportunities depending on category' },
    { minMarks: 500, text: 'Likely private MBBS and government BDS opportunities' },
    { minMarks: 450, text: 'Limited government options; private colleges more likely' },
    { minMarks: 400, text: 'Mostly private medical and allied health courses' },
    { minMarks: 350, text: 'BDS, AYUSH, and private colleges may be available' },
    { minMarks: 300, text: 'Admission mainly through private or allied medical courses' },
    { minMarks: 250, text: 'Limited MBBS chances; AYUSH/private options possible' },
    { minMarks: 200, text: 'Qualifying score for many reserved-category candidates' },
    { minMarks: 150, text: 'Primarily qualifying-level score' },
    { minMarks: 0, text: 'Low admission chances for MBBS; consider alternative courses' },
  ],
};

/** Default year used when the client does not send one. */
export const DEFAULT_YEAR = 2026;

/** Years we actually have data for (newest first). */
export const AVAILABLE_YEARS = Object.keys(RANK_DATA)
  .map(Number)
  .sort((a, b) => b - a);
