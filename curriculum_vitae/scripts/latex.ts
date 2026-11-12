// latex.ts - Cut the LaTeX document out of a model response

const DOCUMENT_START = '\\documentclass';
const DOCUMENT_END = '\\end{document}';
// A complete CV is tens of KB; anything this short is a placeholder, not a CV
const MIN_LENGTH = 500;

/** Drops code fences and any prose around the document; throws if there is no complete document */
export const extractLatex = (response: string): string => {
  const start = response.indexOf(DOCUMENT_START);
  const end = response.lastIndexOf(DOCUMENT_END);
  if (start === -1 || end < start) {
    throw new Error(`Response contains no complete LaTeX document (${DOCUMENT_START} ... ${DOCUMENT_END})`);
  }

  const latex = response.slice(start, end + DOCUMENT_END.length).replace(/\n{3,}/g, '\n\n');
  if (!latex.includes('\\begin{document}')) {
    throw new Error('LaTeX document has no \\begin{document}');
  }
  if (latex.length < MIN_LENGTH) {
    throw new Error(`LaTeX document is too short (${latex.length} < ${MIN_LENGTH} chars)`);
  }
  return latex;
};
