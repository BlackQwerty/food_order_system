# AGENTS.md — Agent Navigation & Token Efficiency Guide

This file tells AI agents how to read this project efficiently. Follow these rules strictly to avoid wasting tokens reading files you don't need.

---

## File Registry

| File             | What it is                        | When to read it                                                |
|------------------|-----------------------------------|----------------------------------------------------------------|
| `AGENTS.md`      | This file — navigation rules      | Always read first, every session                               |
| `CONTEXT.md`     | Project brief, pages, flows, DB   | Read once at session start for full project understanding      |
| `DESIGN.md`      | Colors, typography, spacing, components | Read before writing any HTML/CSS                         |
| `GRAPH_REPORT.md`| Plain-English project summary     | **Primary file for token savings** — read this instead of scanning all source files |
| `graph.json`     | Machine-readable dependency graph | Query only when you need a specific answer (see commands below)|
| `graph.html`     | Interactive browser visualization | **Never read** — for human use only, skip entirely             |

---

## Session Start Protocol

Every new session, agents MUST do this in order:

```
1. Read AGENTS.md        ← you are here
2. Read GRAPH_REPORT.md  ← understand the current project state in minimal tokens
3. Read CONTEXT.md       ← only if you need full page/flow/DB details
4. Read DESIGN.md        ← only if the task involves UI/HTML/CSS
```

**Never scan the full source folder** unless explicitly instructed. Use `GRAPH_REPORT.md` first — it tells you what exists without reading every file.

---

## graph.json Query Commands

Use these commands to extract specific answers from `graph.json` without reading the whole file. Each command targets only what you need.

### List all pages in the project
```
Query graph.json → extract all nodes where type = "page"
```

### Find what a specific page links to
```
Query graph.json → find node where name = "<filename>" → read its "links" array
```

### Find all forms and their validation rules
```
Query graph.json → extract all nodes where type = "form" → read "fields" and "validation"
```

### Find all JS functions on a page
```
Query graph.json → find node where name = "<filename>" → read "scripts" array
```

### Find which pages share a component (e.g. navbar)
```
Query graph.json → find all nodes where "components" includes "<component-name>"
```

### Find all database tables and columns
```
Query graph.json → extract all nodes where type = "table"
```

### Check if a page exists before creating it
```
Query graph.json → search nodes for name = "<filename>" → if not found, safe to create
```

### Find all broken or missing links
```
Query graph.json → find all edges where target node does not exist
```

---

## Token Budget Rules

Follow these rules to keep token usage low:

1. **Read `GRAPH_REPORT.md` before any source file** — it gives you the full picture in ~10% of the tokens.
2. **Never read `graph.html`** — it is a browser visualization with embedded JS, zero value for agents.
3. **Query `graph.json` surgically** — use the commands above. Do not parse the whole file unless asked.
4. **Do not re-read `CONTEXT.md` or `DESIGN.md`** mid-session if you have already read them — they don't change unless the user says so.
5. **Do not scan folders recursively** to discover files — use `GRAPH_REPORT.md` instead.
6. **Cache what you've read** — if you already read a page's HTML this session, do not read it again for a follow-up task on the same page.

---

## When to Read Source Files Directly

Only read a raw source file (`.html`, `.css`, `.js`, `.php`) when:

- You are editing that specific file
- `GRAPH_REPORT.md` says it exists but doesn't have enough detail for your task
- The user explicitly asks you to read or audit it

In all other cases, `GRAPH_REPORT.md` + `graph.json` queries are sufficient.

---

## File Creation Rules

When creating a new file, agents must:

1. Check `graph.json` first — confirm the file doesn't already exist
2. Follow naming conventions from `CONTEXT.md` File Map exactly
3. Apply all styles from `DESIGN.md` — no inline styles, external CSS only
4. Update `GRAPH_REPORT.md` after creation to reflect the new file

---

## Quick Reference — What Each File Answers

| Question                                   | Go to                  |
|--------------------------------------------|------------------------|
| What pages exist?                          | `GRAPH_REPORT.md`      |
| What does this page do?                    | `CONTEXT.md`           |
| What color is the button?                  | `DESIGN.md`            |
| What does page X link to?                  | `graph.json` query     |
| What forms need validation?                | `CONTEXT.md` or `graph.json` |
| What DB tables exist?                      | `CONTEXT.md`           |
| Is file X already created?                 | `graph.json` query     |
| What is the overall project status?        | `GRAPH_REPORT.md`      |
| Which files are missing or incomplete?     | `GRAPH_REPORT.md`      |