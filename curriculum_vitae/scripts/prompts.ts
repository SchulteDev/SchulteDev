// prompts.ts - The prompt that turns the career data into a LuaLaTeX CV

import type {CvType} from './config.ts';

const PAGES = 4;

// Measured in compiled CVs: headings and spacing leave fewer text lines than the nominal 63
const LINES_PER_PAGE = 57;
const LINE_BUDGET = Math.round(PAGES * LINES_PER_PAGE * 0.9);

const CONTENT = [
  'CV Header, CV summary, key impacts, skills overview that looks like a two-column table without borders but is set as a list, so that it can break across pages.',
  'Recent roles LBBW, Union Investment, Saloodo, Trusted Shops with three or four bullet points each.',
  'Two or three relevant previous work experiences, mention remaining work experiences; relevant personal projects.',
  'Education, additional skills, career breaks; footer: AI disclaimer.',
];

const CONSTRAINTS = [
  `The CV ends on page ${PAGES}: running onto page ${PAGES + 1} is the failure to avoid, unused room at the end of page ${PAGES} is fine.`,
  String.raw`\documentclass[10pt,a4paper]{article} with 1.5cm margins at the default line spacing: next to its headings and spacing, a page holds about ${LINES_PER_PAGE} lines of text, a full line about 115 characters.`,
  `Size the content to about ${LINE_BUDGET} of the ${PAGES * LINES_PER_PAGE} lines of text, each heading, table row and wrapped line counting as one: the count is an estimate, and the slack keeps a miscount from running onto page ${PAGES + 1}.`,
  String.raw`Let LaTeX place the page breaks: no \newpage, \clearpage or \pagebreak, and no tabular, minipage or \parbox taller than five lines, because a forced break or a block LaTeX cannot break leaves the rest of a page empty.`,
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
