/** Public sample files offered in the course editor. */
export const SAMPLE_QUIZ_PATH = "/samples/sample-quiz.json";

// Public-domain (CC0) clip from MDN, usable without uploading anything to S3
export const SAMPLE_VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

/**
 * Checks a parsed quiz file against the format the student quiz expects:
 * { "questions": [ { "id", "question", "options": [...], "correctAnswer": <index> } ] }
 * Returns up to 5 problems, or [] when valid. Mirrors the server's validateQuiz.
 */
export const validateQuiz = (data: any): string[] => {
  if (!data || typeof data !== "object" || !Array.isArray(data.questions)) {
    return ['The file must be an object with a "questions" array'];
  }
  if (data.questions.length === 0) return ["Add at least one question"];

  const problems: string[] = [];
  data.questions.forEach((q: any, i: number) => {
    const n = `Question ${i + 1}`;
    if (q?.id === undefined || q?.id === null || q?.id === "") problems.push(`${n}: missing "id"`);
    if (typeof q?.question !== "string" || !q.question.trim()) problems.push(`${n}: missing "question" text`);
    if (!Array.isArray(q?.options) || q.options.length < 2) {
      problems.push(`${n}: "options" needs at least 2 answers`);
    } else if (
      !Number.isInteger(q.correctAnswer) ||
      q.correctAnswer < 0 ||
      q.correctAnswer >= q.options.length
    ) {
      problems.push(`${n}: "correctAnswer" must be an option index from 0 to ${q.options.length - 1}`);
    }
  });
  return problems.slice(0, 5);
};
