// latex.ts - Cut the CV body out of a model response and put it into the fixed CV preamble

import fs from 'node:fs';

const BODY_START = String.raw`\begin{document}`;
const BODY_END = String.raw`\end{document}`;
const MIN_LENGTH = 500;

export const PREAMBLE = fs.readFileSync(new URL('cv-preamble.tex', import.meta.url), 'utf8').trimEnd();

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

export const toDocument = (body: string): string => `${PREAMBLE}\n\n${BODY_START}\n${body}\n${BODY_END}\n`;
