// latex.ts - Cut the CV body out of a model response and put it into the fixed CV preamble

import fs from 'node:fs';

const BODY_START = String.raw`\begin{document}`;
const BODY_END = String.raw`\end{document}`;
const MIN_LENGTH = 500;

export const PREAMBLE = fs.readFileSync(new URL('cv-preamble.tex', import.meta.url), 'utf8').trimEnd();

/** Drops code fences, prose and any preamble around the body; throws if there is no complete body */
export const extractBody = (response: string): string => {
  const firstStart = response.indexOf(BODY_START);
  const end = firstStart === -1 ? -1 : response.indexOf(BODY_END, firstStart);
  if (end === -1) {
    throw new Error(`Response contains no complete document body (${BODY_START} ... ${BODY_END})`);
  }
  const start = response.lastIndexOf(BODY_START, end) + BODY_START.length;

  const body = response.slice(start, end).trim().replace(/\n{3,}/g, '\n\n');
  if (body.length < MIN_LENGTH) {
    throw new Error(`Document body is too short (${body.length} < ${MIN_LENGTH} chars)`);
  }
  return body;
};

export const toDocument = (body: string): string => `${PREAMBLE}\n\n${BODY_START}\n${body}\n${BODY_END}\n`;
