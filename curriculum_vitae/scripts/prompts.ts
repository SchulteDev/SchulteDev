// prompts.ts - The prompt that turns the career data into the body of a LuaLaTeX CV

import type {CvType} from './config.ts';
import {PREAMBLE} from './latex.ts';

const PAGES = 4;

const PAGE_LAYOUT = [
  String.raw`Page 1: \cvheader, CV summary, key impacts (a cvkpis row of five \kpi figures, then bullets), skills overview (cvskills).`,
  'Page 2: Recent roles LBBW, Union Investment, Saloodo, Trusted Shops with three or four bullet points each.',
  'Page 3: Two or three relevant previous work experiences, mention remaining work experiences; relevant personal projects.',
  String.raw`Page 4: Education, additional skills, career breaks; \cvdisclaimer: AI disclaimer.`,
];

const CONSTRAINTS = [
  String.raw`Exactly ${PAGES} pages: \pagebreak after each of the first ${PAGES - 1} pages.`,
  'Every page full, none overflowing: a page holds about 65 lines of 135 characters; the preamble stretches the spacing to the page bottom.',
  'Include flexible content sections for page tuning.',
  String.raw`Structure with the preamble's commands: \cvsection for sections, \cvrole for roles and degrees, \subsection* for other subheadings, itemize for lists.`,
  String.raw`No vertical spacing commands (\vspace, \vfill, \newpage): the preamble spaces the content.`,
  String.raw`No packages, colors or definitions: the preamble is fixed.`,
  String.raw`Start the body with \hypersetup{pdftitle={...},pdfauthor={...}}.`,
  'LaTeX commands for all symbols, not Unicode characters.',
  String.raw`Symbols in text mode (\texttimes, \textrightarrow, \textminus, \textasciitilde), never math mode.`,
  'Facts come from the career data only: nothing invented, nothing oversold.',
];

const CV_STYLES: Record<CvType, string> = {
  professional: 'Professional CV: quantified impact, leadership and business value, backed by metrics, percentages and concrete numbers.',
  anti: 'Anti-CV: failures, missed opportunities and growth moments, '
    + 'in a professional tone with self-deprecating humor that pokes fun at technology, too.',
};

export const buildPrompt = (cvType: CvType, careerData: string): string => [
  `Career data:\n\`\`\`markdown\n${careerData}\n\`\`\``,
  `From this career data, write the body of a LuaLaTeX ${CV_STYLES[cvType]}`,
  `Fixed preamble:\n\`\`\`latex\n${PREAMBLE}\n\`\`\``,
  `Page layout:\n${PAGE_LAYOUT.join('\n')}`,
  `Constraints:\n${CONSTRAINTS.join('\n')}`,
  String.raw`Output: the document body only, from \begin{document} to \end{document}.`,
].join('\n');
