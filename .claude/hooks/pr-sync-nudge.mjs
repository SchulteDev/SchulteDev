// PostToolUse (Bash): after a push that updated an existing remote branch, remind to re-check its PR.
// Advisory only: prints additionalContext, always exits 0.

// Matched against JSON, where a newline is a literal "\n": stop the capture at branch-name characters.
const RANGE_LINE = /\b[0-9a-f]{7,40}\.{2,3}[0-9a-f]{7,40}\s+\S+\s+->\s+([A-Za-z0-9._/-]+)/;
const NEW_BRANCH = /\[new branch\]/;
const SKIP_FLAGS = /--dry-run|--delete\b|\s-d\b|--tags\b/;
const DEFAULT_BRANCHES = new Set(['main', 'master']);

const isPush = (command) => /\bgit\s+(?:-\S+\s+)*push\b/.test(command);

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

  const command = payload?.tool_input?.command ?? '';
  if (!isPush(command) || SKIP_FLAGS.test(command)) process.exit(0);

  const output = JSON.stringify(payload?.tool_response ?? '');
  const range = RANGE_LINE.exec(output);
  if (NEW_BRANCH.test(output) || !range) process.exit(0);
  if (DEFAULT_BRANCHES.has(range[1].replace(/^refs\/heads\//, ''))) process.exit(0);

  const message =
    'Commits were just pushed to a branch that already existed on the remote. If it has an open PR ' +
    '(gh pr view), its title and description may no longer match the branch. Re-read them against ' +
    'git log origin/main..HEAD: the title stays a valid Conventional Commits subject for the squash ' +
    'merge, and every change and reviewer-relevant decision is in the description, not only in the ' +
    'chat. Update with gh pr edit --title/--body-file.';

  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: message } }),
  );
  process.exit(0);
});
