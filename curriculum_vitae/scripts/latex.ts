// latex.ts - Cut the LaTeX document out of a model response and mark it for tagged PDF output

const DOCUMENT_START = String.raw`\documentclass`;
const DOCUMENT_END = String.raw`\end{document}`;
const MIN_LENGTH = 500;
const DOCUMENT_METADATA = String.raw`\DocumentMetadata{lang=en,pdfstandard=ua-2,tagging=on}`;

/** Drops code fences and any prose around the document; throws if there is no complete document */
export const extractLatex = (response: string): string => {
  const firstStart = response.indexOf(DOCUMENT_START);
  const end = firstStart === -1 ? -1 : response.indexOf(DOCUMENT_END, firstStart);
  if (end === -1) {
    throw new Error(`Response contains no complete LaTeX document (${DOCUMENT_START} ... ${DOCUMENT_END})`);
  }
  const start = response.lastIndexOf(DOCUMENT_START, end);

  const latex = response.slice(start, end + DOCUMENT_END.length).replace(/\n{3,}/g, '\n\n');
  if (!latex.includes(String.raw`\begin{document}`)) {
    throw new Error(String.raw`LaTeX document has no \begin{document}`);
  }
  if (latex.length < MIN_LENGTH) {
    throw new Error(`LaTeX document is too short (${latex.length} < ${MIN_LENGTH} chars)`);
  }
  return latex;
};

/** Makes LuaLaTeX write a tagged PDF/UA-2 */
export const tagged = (latex: string): string => `${DOCUMENT_METADATA}\n${latex}`;
