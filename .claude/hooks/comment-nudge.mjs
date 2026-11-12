// PostToolUse (Edit|Write|MultiEdit): lists comment lines an edit added, with a one-line reminder.
// Advisory only: prints additionalContext, always exits 0.

const SLASH = /^\s*(\/\/|\/\*|\*(?!\/))|\s\/\/\s/;
const HASH = /^\s*#(?!!)|\s#\s/;
const COMMENT = [
  [/\.(ts|tsx|mts|cts|js|mjs|cjs|scss|css)$/, SLASH],
  [/\.(ya?ml|rb|sh|toml|properties)$|(^|\/)(Makefile|Rakefile|Gemfile|Dockerfile|\.gitignore)$/, HASH],
  [/\.tex$/, /(^|[^\\])%\s*\w/],
  [/\.html$/, /<!--|\{%-?\s*comment/],
];
const MAX_LISTED = 5;

const addedText = (input) => {
  if (typeof input.content === 'string') return [input.content, ''];
  const edits = Array.isArray(input.edits) ? input.edits : [input];
  return [edits.map((e) => e.new_string ?? '').join('\n'), edits.map((e) => e.old_string ?? '').join('\n')];
};

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  raw += chunk;
});
process.stdin.on('error', () => process.exit(0));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const input = payload?.tool_input ?? {};
  const file = input.file_path ?? '';
  const pattern = COMMENT.find(([files]) => files.test(file))?.[1];
  if (!pattern) process.exit(0);

  const [added, removed] = addedText(input);
  const before = new Set(removed.split('\n').map((l) => l.trim()));
  const comments = added
    .split('\n')
    .filter((l) => pattern.test(l) && !before.has(l.trim()))
    .map((l) => l.trim());
  if (comments.length === 0) process.exit(0);

  const listed = comments.slice(0, MAX_LISTED).map((l) => `  ${l}`).join('\n');
  const more = comments.length > MAX_LISTED ? `\n  ... and ${comments.length - MAX_LISTED} more` : '';
  const message =
    `Comments added to ${file}:\n${listed}${more}\n` +
    'Keep only those that prevent a wrong edit; story-telling (history, why it changed) goes in the commit/PR.';

  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: message } }),
  );
  process.exit(0);
});
