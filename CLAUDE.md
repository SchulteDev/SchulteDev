# CLAUDE.md

Layout, commands and checks: [README_repository.md](README_repository.md) and the READMEs it links.
Run the checks of every area you touch before finishing.

## Conventions

- Conventional Commits (`feat(cv):`, `fix:`, `chore(deps):`, `ci:`, ...). PRs are squash-merged, so
  the PR title is the commit subject.
- Career facts come only from `_data/`: never invent or embellish them in a CV or on the website.
- Repo facts belong in the repo's docs, agent guidance here; neither goes in agent memory.

## Engineering Philosophy

- **Pathfinder**: leave it better than you found it.
- **YAGNI & KISS**: build what is needed now. No speculative options, flags, abstractions or
  fallbacks, no backward compatibility; delete dead code.
- **No story-telling in source** (code, workflows, Makefiles, LaTeX): describe what *is*, never how
  it got there. History, earlier versions, review findings and why something changed go in the commit
  message and PR. Wrong, wherever they appear:
  - "one at a time again"
  - "would be mangled by the old template engine"
  - "written before validation: the one worth reading"
  - a note on what the code *doesn't* do: it only reads against the old version
- **Comments**: default to none. One line, only where its absence invites a wrong edit. Before
  committing, reread every comment in the diff and delete each one you can't justify that way.
- **Source stands alone**: don't reference `*.md` paths from code; they move and rot.
- **READMEs stay short and stable**: what it is, how to build, run and test it. No file tables, file
  trees, option lists, counts or anything else that changes with the code. Describe `main`, not an
  unmerged PR.
