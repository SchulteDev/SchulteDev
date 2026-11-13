// prompts.ts - The prompt that turns the career data into a LuaLaTeX CV

import type {CvType} from './config.ts';

const PAGES = 4;

const LINES_PER_PAGE = 63;
const LINE_BUDGET = PAGES * LINES_PER_PAGE - 20;

const CONTENT = [
  'CV Header, CV summary, key impacts, skills overview table without borders.',
  'Recent roles LBBW, Union Investment, Saloodo, Trusted Shops with three or four bullet points each.',
  'Two or three relevant previous work experiences, mention remaining work experiences; relevant personal projects.',
  'Education, additional skills, career breaks; footer: AI disclaimer.',
];

const CONSTRAINTS = [
  `The CV ends on page ${PAGES}: running onto page ${PAGES + 1} is the failure to avoid, unused room at the end of page ${PAGES} is fine.`,
  String.raw`\documentclass[10pt,a4paper]{article} with 1.5cm margins at the default line spacing: a page holds ${LINES_PER_PAGE} lines of about 100 characters, and headings, table rows and vertical space use up lines, too.`,
  `Size the content to about ${LINE_BUDGET} of the ${PAGES * LINES_PER_PAGE} lines: the count is an estimate, and the slack keeps a miscount from running onto page ${PAGES + 1}.`,
  String.raw`Let LaTeX place the page breaks: no \newpage, \clearpage or \pagebreak and no minipage or \parbox around a section, because a forced break or an unbreakable block leaves the rest of a page empty.`,
  'Standard LuaLaTeX packages only.',
  String.raw`Compiled as tagged PDF/UA-1: \DocumentMetadata is put in front of the document, do not write it.`,
  String.raw`Headings: \section* and \subsection* only, restyled with \@startsection, no titlesec, no \par inside a heading.`,
  String.raw`Heading titles hold text, font and color commands and \hfill only, no \hspace or other spacing commands.`,
  String.raw`Set pdftitle and pdfauthor with \hypersetup.`,
  'Lists: enumitem layout keys only, never the before= or after= keys.',
  String.raw`Colors: \usepackage[svgnames]{xcolor}. Use only svgnames predefined colors, no \definecolor.`,
  'LuaLaTeX bundled fonts only. LaTeX commands for all symbols, not Unicode characters.',
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
  `From this career data, create a LuaLaTeX ${CV_STYLES[cvType]}`,
  `Content in this order, each part about a quarter of the length:\n${CONTENT.join('\n')}`,
  `Constraints:\n${CONSTRAINTS.join('\n')}`,
  'Output: LuaLaTeX code only.',
].join('\n');
