// prompts.ts - The prompt that turns the career data into a LuaLaTeX CV

import type {CvType} from './config.ts';

const PAGES = 4;

// A4 at 10pt with 1.5cm margins
const LINES_PER_PAGE = 63;
const LINE_BUDGET = PAGES * LINES_PER_PAGE - 20;

const CONTENT = [
  'CV Header, CV summary, key impacts, skills overview table without borders.',
  'Recent roles LBBW, Union Investment, Saloodo, Trusted Shops with three or four bullet points each.',
  'Two or three relevant previous work experiences, mention remaining work experiences; relevant personal projects.',
  'Education, additional skills, career breaks; footer: AI disclaimer.',
];

const CONSTRAINTS = [
  `At most ${PAGES} pages: a page ${PAGES + 1} is the worst outcome, spare room at the end of page ${PAGES} is fine.`,
  String.raw`\documentclass[10pt,a4paper]{article} with 1.5cm margins: ${LINES_PER_PAGE} lines per page, about 100 characters per line.`,
  `Tally the lines while writing, counting every wrapped line, heading and vertical gap: ${LINE_BUDGET} lines in total, no more.`,
  String.raw`No \newpage, \clearpage or \pagebreak: LaTeX breaks the pages.`,
  String.raw`\vfill in front of the footer.`,
  'Valid, compilable LuaLaTeX with standard LuaLaTeX packages only.',
  String.raw`Compiled as tagged PDF/UA-1: \DocumentMetadata is put in front of the document, do not write it.`,
  String.raw`Headings: \section* and \subsection* only, restyled with \@startsection, no titlesec, no \par inside a heading.`,
  String.raw`Heading titles hold text, font and color commands and \hfill only, no \hspace or other spacing commands.`,
  String.raw`Set pdftitle and pdfauthor with \hypersetup.`,
  'Lists: enumitem layout keys only, never the before= or after= keys.',
  String.raw`Colors: \usepackage[svgnames]{xcolor}. Use only svgnames predefined colors, no \definecolor.`,
  'LuaLaTeX bundled fonts only. LaTeX commands for all symbols, not Unicode characters.',
  String.raw`Symbols in text mode (\texttimes, \textrightarrow, \textminus, \textasciitilde), never math mode.`,
  'Prioritize most recent and impactful experiences, teaser the leftover experiences.',
  'Absolutely truthful and factual regarding career data, dont oversell.',
];

const CV_STYLES: Record<CvType, {description: string; instructions: string}> = {
  professional: {
    description: 'Professional CV: Quantified impact, leadership, business value.',
    instructions: 'Emphasize quantified achievements, business value. Use metrics, percentages, concrete numbers.',
  },
  anti: {
    description: 'Anti-CV: Humorous lessons and failures, self-deprecating, still professional.',
    instructions: 'Focus on failures, missed opportunities, growth moments. '
      + 'Professional tone with self-deprecating humor that pokes fun at technology, too.',
  },
};

export const buildPrompt = (cvType: CvType, careerData: string): string => {
  const {description, instructions} = CV_STYLES[cvType];
  return [
    `Create exactly ${PAGES}-page ${description}`,
    `Full career data:\`\`\`markdown\n${careerData}\n\`\`\`.`,
    `Content in this order, about one page each: ${CONTENT.join('\n')}`,
    `Constraints: ${CONSTRAINTS.join('\n')}`,
    instructions,
    'Output: LuaLaTeX code only.',
  ].join('\n');
};
