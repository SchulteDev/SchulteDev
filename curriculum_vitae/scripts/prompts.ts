// prompts.ts - The prompt that turns the career data into a LuaLaTeX CV

import type {CvType} from './config.ts';

const PAGES = 4;

const PAGE_LAYOUT = [
  'Page 1: CV Header, CV summary, key impacts, skills overview table without borders.',
  'Page 2: Recent roles LBBW, Union Investment, Saloodo, Trusted Shops with three or four bullet points each.',
  'Page 3: Two or three relevant previous work experiences, mention remaining work experiences; relevant personal projects.',
  'Page 4: Education, additional skills, career breaks; footer: AI disclaimer.',
];

const CONSTRAINTS = [
  `Exactly ${PAGES} vertical, filled, dense pages.`,
  String.raw`Use \newpage after each page.`,
  `Monitor content density for exactly ${PAGES} pages.`,
  'Fill pages densely - aim for minimal whitespace.',
  String.raw`Use \vfill for remaining white space distribution.`,
  String.raw`Use \vspace{} for vertical spacing fine-tuning.`,
  'Include flexible content sections for page tuning.',
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
  `Page layout:\n${PAGE_LAYOUT.join('\n')}`,
  `Constraints:\n${CONSTRAINTS.join('\n')}`,
  'Output: LuaLaTeX code only.',
].join('\n');
