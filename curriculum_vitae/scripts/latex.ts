// latex.ts - Cut the CV body out of a model response and put it into the fixed CV preamble

import fs from 'node:fs';

const BODY_START = String.raw`\begin{document}`;
const BODY_END = String.raw`\end{document}`;
const MIN_LENGTH = 500;

export const PAGES = 4;

export const PREAMBLE = fs.readFileSync(new URL('cv-preamble.tex', import.meta.url), 'utf8').trimEnd();

const FORBIDDEN: Record<string, RegExp> = {
  'vertical spacing': /\\(?:vspace|vfill|newpage|clearpage)\b/,
  'packages, colors or definitions': /\\(?:usepackage|definecolor|colorlet|newcommand|renewcommand|newenvironment|def)\b/,
  'list options': /\\begin\{itemize\}\s*\[/,
};

/** The longest span from a \begin{document} to the next \end{document}, so prose quoting either is skipped */
export const extractBody = (response: string): string => {
  const candidates = response.split(BODY_START).slice(1)
    .filter(part => part.includes(BODY_END))
    .map(part => part.slice(0, part.indexOf(BODY_END)));
  if (candidates.length === 0) {
    throw new Error(`Response contains no complete document body (${BODY_START} ... ${BODY_END})`);
  }
  const longest = candidates.reduce((a, b) => (b.length > a.length ? b : a));

  const body = longest.trim().replace(/\n{3,}/g, '\n\n');
  if (body.length < MIN_LENGTH) {
    throw new Error(`Document body is too short (${body.length} < ${MIN_LENGTH} chars)`);
  }
  return body;
};

/** The body in the fixed preamble, if it keeps the preamble's rules */
export const toDocument = (body: string): string => {
  const violations = Object.entries(FORBIDDEN).filter(([, pattern]) => pattern.test(body)).map(([rule]) => rule);
  const pageBreaks = body.match(/\\pagebreak\b/g)?.length ?? 0;
  if (pageBreaks !== PAGES - 1) violations.push(`${pageBreaks} instead of ${PAGES - 1} \\pagebreak`);
  if (violations.length > 0) throw new Error(`Document body breaks the preamble's rules: ${violations.join(', ')}`);
  return `${PREAMBLE}\n\n${BODY_START}\n${body}\n${BODY_END}\n`;
};
