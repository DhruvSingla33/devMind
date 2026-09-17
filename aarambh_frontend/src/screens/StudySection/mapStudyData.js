// Maps the /textbooks/:code/chapters/:n API response onto the shape the
// StudySection reader components consume. The backend nests each content item's
// payload under a per-type key (text.body, image.url, table.rows) and uses
// `contents`/`_id`, whereas the presentational components read a flattened
// `content`/`id` shape — this is the single place that bridges the two.

function byOrder(a, b) {
  const ao = a?.order ?? a?.pageNumber ?? 0;
  const bo = b?.order ?? b?.pageNumber ?? 0;
  return ao - bo;
}

// A backend table is { caption, rows }. If a dedicated header (`columns`) isn't
// provided, treat the first row as the header so DataTable has something to
// render; otherwise the table is skipped (DataTable renders nothing with no
// columns).
function mapTable(table) {
  const rows = Array.isArray(table?.rows) ? table.rows : [];
  if (Array.isArray(table?.columns) && table.columns.length) {
    return { type: 'table', columns: table.columns, rows };
  }
  if (rows.length && Array.isArray(rows[0])) {
    return { type: 'table', columns: rows[0], rows: rows.slice(1) };
  }
  return { type: 'table', columns: [], rows: [] };
}

function mapContent(item) {
  switch (item?.type) {
    case 'text':
      return { type: 'text', value: item.text?.body || '' };
    case 'image':
      return {
        type: 'image',
        src: item.image?.url || '',
        caption: item.image?.caption || '',
        alt: item.image?.alt || '',
      };
    case 'table':
      return mapTable(item.table);
    case 'list':
      return { type: 'list', items: item.list?.items || item.items || [] };
    default:
      return null;
  }
}

function mapSection(section) {
  return {
    id: section._id || section.id,
    heading: section.heading || '',
    content: (section.contents || section.content || [])
      .map(mapContent)
      .filter(Boolean),
  };
}

// Per-page MCQs arrive under `page.quiz`, with objects shaped like
// { questionText, options: [{ text, _id }], difficulty: "easy" }.
function mapMcq(mcq, index) {
  const rawOptions = mcq.options || [];
  const options = rawOptions.map((opt) =>
    typeof opt === 'string' ? opt : opt?.text ?? ''
  );

  // The correct-answer index may come as a number under a few names, or be
  // flagged on an option. The sample payload omits it entirely (dummy data), so
  // it falls back to 0 — tell me the field name if "Show Answer" is wrong.
  let correctAnswer = -1;
  if (typeof mcq.correctAnswer === 'number') correctAnswer = mcq.correctAnswer;
  else if (typeof mcq.correctOption === 'number') correctAnswer = mcq.correctOption;
  else if (typeof mcq.correctIndex === 'number') correctAnswer = mcq.correctIndex;
  else {
    const flagged = rawOptions.findIndex((o) => o && typeof o === 'object' && o.isCorrect);
    if (flagged >= 0) correctAnswer = flagged;
  }
  if (correctAnswer < 0) correctAnswer = 0;

  // MCQCard keys its difficulty colors on Easy/Medium/Hard; the API sends
  // lowercase.
  const difficulty = mcq.difficulty
    ? mcq.difficulty.charAt(0).toUpperCase() + mcq.difficulty.slice(1).toLowerCase()
    : 'Medium';

  return {
    id: mcq._id || mcq.id || `mcq-${index}`,
    question: mcq.question || mcq.questionText || mcq.text || '',
    options,
    correctAnswer,
    difficulty,
    marks: mcq.marks ?? 1,
  };
}

function mapPage(page) {
  return {
    ...page,
    pageNumber: page.pageNumber,
    sections: (page.sections || []).slice().sort(byOrder).map(mapSection),
    mcqs: (page.quiz || page.mcqs || []).map(mapMcq),
  };
}

export default function mapStudyData(data) {
  if (!data) return { chapter: null, pages: [] };
  const { textbook, chapter, pages } = data;
  return {
    chapter: {
      ...chapter,
      // ModuleHeader shows the subject; it lives on the textbook, not the chapter.
      subject: chapter?.subject || textbook?.subject || '',
    },
    pages: (pages || []).slice().sort(byOrder).map(mapPage),
  };
}
