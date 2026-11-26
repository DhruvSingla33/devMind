// ============================================================================
//  BLOG INDEX  (public — no login required)
//
//  To add a new blog post, do TWO things:
//   1. Put the blog's full HTML file in:  aarambh_frontend/public/blogs/<slug>.html
//      (Expo serves everything in /public at the web root, so that file is
//       reachable at the URL  /blogs/<slug>.html )
//   2. Add one entry to the array below. Keep `slug` identical to the file
//      name (without ".html"). Newest posts can go at the top.
//
//  The blog list and post screens read everything from here.
// ============================================================================

const blogs = [
  {
    slug: 'diagnose-the-patient', // -> loads /blogs/diagnose-the-patient.html
    title: 'Diagnose the Patient',
    excerpt:
      'An interactive clinical game: meet a patient, ask history questions, examine and order tests — each move costs points — then make the diagnosis and earn up to three stars across 80+ cases in Medicine, Surgery, OBGY and Pediatrics.',
    date: '2026-11-26', // YYYY-MM-DD
    author: 'Mukul',
    authorUrl: 'https://www.instagram.com/chale_mukul',
    tags: ['Medical', 'Interactive'],
  },

  {
    slug: 'ecg-lab', // -> loads /blogs/ecg-lab.html
    title: 'ECG Lab',
    excerpt:
      'An interactive ECG lab: pick a cardiac condition and watch the monitor, the conduction system and the 12-lead ECG respond together, all driven by the same simulated heart.',
    date: '2026-11-25', // YYYY-MM-DD
    author: 'Mukul',
    authorUrl: 'https://www.instagram.com/chale_mukul',
    tags: ['Medical', 'Interactive'],
  },

  {
    slug: 'heart-murmur-lab', // -> loads /blogs/heart-murmur-lab.html
    title: 'Heart Murmur Lab',
    excerpt:
      'An interactive lab to learn heart murmurs: pick a condition and press Listen. The valves, the abnormal blood flow and the sound trace all move in time with what you hear.',
    date: '2026-11-23', // YYYY-MM-DD
    author: 'Mukul',
    authorUrl: 'https://www.instagram.com/chale_mukul',
    tags: ['Medical', 'Interactive'],
  },

  // Add more posts here, e.g.:
  // {
  //   slug: 'my-next-blog',
  //   title: 'My Next Blog',
  //   excerpt: 'Short summary shown on the blog list card.',
  //   date: '2026-12-01',
  //   author: 'Aarambh Study',
  //   tags: ['Topic'],
  // },
];

export const getAllBlogs = () =>
  [...blogs].sort((a, b) => new Date(b.date) - new Date(a.date));

export const getBlogBySlug = (slug) => blogs.find((b) => b.slug === slug) || null;

export default blogs;
