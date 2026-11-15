// prompts.ts - The prompt that turns the career data into the body of a LuaLaTeX CV

import type {CvType} from './config.ts';
import {PAGES, PREAMBLE} from './latex.ts';

const KEY_IMPACTS = String.raw`key impacts (a cvkpis row of five \kpi figures, then bullets)`;

const PAGE_LAYOUTS: Record<CvType, string[]> = {
  professional: [
    String.raw`Page 1: \cvheader, CV summary, ${KEY_IMPACTS}, skills overview (cvskills).`,
    'Page 2: Recent roles at Union Investment, LBBW, Saloodo, Trusted Shops with three or four bullet points each.',
    'Page 3: Two or three relevant previous work experiences, mention remaining work experiences; relevant personal projects.',
    String.raw`Page 4: Education, additional skills, career breaks; \cvdisclaimer: AI disclaimer.`,
  ],
  anti: [
    String.raw`Page 1: \cvheader, CV summary, ${KEY_IMPACTS}, recent roles at Union Investment, LBBW, Saloodo, Trusted Shops with two bullet points each.`,
    String.raw`Page 2: Earlier roles as one list with a bullet per role, three personal projects, skills overview (cvskills), education, career breaks; \cvdisclaimer: AI disclaimer.`,
  ],
};

// The model writes past the budget of a short CV and short of a long one's
const PAGE_CHARS: Record<CvType, number> = {professional: 6500, anti: 5000};

const constraints = (pages: number, pageChars: number): string[] => [
  String.raw`Exactly ${pages} pages: \pagebreak at the end of every page but the last.`,
  `Fill every page, but an overflowing page fails the build: a page takes about ${pageChars.toLocaleString('en-US')} `
  + `characters of LaTeX source, the body about ${(pages * pageChars).toLocaleString('en-US')}; `
  + 'the preamble stretches the spacing to the page bottom.',
  'Each fact once: fill pages with more depth from the career data, never with repetition.',
  'Include flexible content sections for page tuning.',
  'Roles newest first in every section.',
  String.raw`Structure with the preamble's commands: \cvsection for sections, \cvrole for roles and degrees, \subsection* for other subheadings, itemize for lists.`,
  String.raw`No vertical spacing commands (\vspace, \vfill, \newpage): the preamble spaces the content.`,
  String.raw`Heading titles: text, font commands and \hfill only. Lists: itemize without options.`,
  String.raw`No packages, colors or definitions: the preamble is fixed.`,
  String.raw`Start the body with \hypersetup{pdftitle={...},pdfauthor={...}}.`,
  String.raw`Symbols: the font has only \textrightarrow, \textleftarrow, \texttimes, \textminus, \textpm, \textasciitilde, `
  + String.raw`\textbullet, \textbar, \textendash, \textemdash, \textdegree, \texteuro, \textellipsis and the escapes \% \& \# \$ \_; `
  + 'no other symbol commands, no Unicode symbols, no math mode.',
  'Facts come from the career data only: nothing invented, nothing oversold.',
];

const CV_STYLES: Record<CvType, string> = {
  professional: 'Professional CV: quantified impact, leadership and business value, backed by metrics, percentages and concrete numbers; '
    + 'key figures are business outcomes, not engineering metrics.',
  anti: 'Anti-CV: humorous lessons and failures, self-deprecating, still professional, poking fun at technology, too: '
    + 'a punchline in most bullets, ironic section titles; the facts stay true, the humor is in the framing.',
};

export const buildPrompt = (cvType: CvType, careerData: string): string => [
  `Career data:\n\`\`\`markdown\n${careerData}\n\`\`\``,
  `From this career data, write the body of a LuaLaTeX ${CV_STYLES[cvType]}`,
  `Fixed preamble:\n\`\`\`latex\n${PREAMBLE}\n\`\`\``,
  `Page layout:\n${PAGE_LAYOUTS[cvType].join('\n')}`,
  `Constraints:\n${constraints(PAGES[cvType], PAGE_CHARS[cvType]).join('\n')}`,
  String.raw`Output: the document body only, from \begin{document} to \end{document}.`,
].join('\n');
