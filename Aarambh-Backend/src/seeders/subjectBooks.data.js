// NCERT books backing the Home subject cards: two parts per subject.
const S3 = 'https://aarambh-media-assets.s3.ap-south-1.amazonaws.com/pdfs';

const SUBJECTS = [
  { subject: 'Physics', slug: 'physics', icon: '⚡', color: '#4aa3ff', examTags: ['NEET', 'JEE'] },
  { subject: 'Chemistry', slug: 'chemistry', icon: '⚗️', color: '#f0a500', examTags: ['NEET', 'JEE'] },
  { subject: 'Botany', slug: 'botany', icon: '🌿', color: '#22a04b', examTags: ['NEET'] },
  { subject: 'Zoology', slug: 'zoology', icon: '🦋', color: '#0ea5b7', examTags: ['NEET'] },
];

export const SUBJECT_BOOKS = SUBJECTS.flatMap(({ subject, slug, icon, color, examTags }) =>
  [1, 2].map((part) => ({
    title: `${subject} NCERT Part ${part}`,
    code: `${slug}-11-part-${part}`,
    subject,
    classLevel: 'XI',
    publisher: 'NCERT',
    icon,
    color,
    examTags,
    pdfUrl: `${S3}/ncert-${slug}-11-part-${part}.pdf`,
  }))
);
