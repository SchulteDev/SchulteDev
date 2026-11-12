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
  'Valid, compilable LuaLaTeX with standard LuaLaTeX packages only.',
  String.raw`Compiled as tagged PDF/UA-2: \DocumentMetadata is put in front of the document, do not write it.`,
  String.raw`Headings: \section* and \subsection* only, restyled with \@startsection, no titlesec, no \par inside a heading.`,
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
    `Page layout: ${PAGE_LAYOUT.join('\n')}`,
    `Constraints: ${CONSTRAINTS.join('\n')}`,
    instructions,
    'Output: LuaLaTeX code only.',
  ].join('\n');
};
