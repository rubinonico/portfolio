# AGENTS.md — portfolio

Static site published at **https://rubinonico.github.io/portfolio/** via GitHub Pages (`main` branch root,
`.nojekyll` present). Source of truth for the public résumé surface. No build step — the HTML is the artifact.

## Layout

| Path | What it is |
|---|---|
| `index.html` | The page. Cream/cream-rule/Times New Roman, crimson headers. Every claim is a factual claim about a real person — treat edits as evidence changes, not copy changes. |
| `gaming.html` | Index of the browser card games |
| `five-column-poker.html` | Five-Column Chinese Poker, 1-swap variant |
| `holdem-scratch.html` | Texas Hold'em v1 |
| `holdem-scratch-B.html` | Texas Hold'em v2 |
| `finance.html`, `labs.html` | Project sub-pages |
| `assets/*.pdf` | Résumé PDFs — **generated**, not hand-edited. Rebuild from `../resume-system/` |
| `eforce_automator.py` | Sanitised copy of the PDMP automation script, published deliberately |

## Rules

1. **No unverifiable numbers.** Every figure on the page must trace to an artifact in the vault or the
   repo. "47+ documents", "65+ indexes", "50+ pages" and "published negative results" were all removed
   for failing this rule — do not reintroduce them.
2. **Print the employer as `NEXGEN Hyperbarics` and nothing else.** The legal entity is `Mark P. Rubino MD,
   LLC`, whose owner is also the candidate's father; naming it reads as nepotism and undercuts the
   application. The DBA is the market-facing name and is what goes on every artifact. The LLC will surface
   in a background check — that is normal and expected, not a discrepancy.
3. **Degree status:** B.S. Accounting, WGU, **27 competency units remaining** after the term ending
   2027-01-31. "Expected Spring 2027" is wrong — do not restore it.
4. **Positioning leads accounting/assurance, not healthcare operations.** Healthcare exit is a standing
   owner instruction.
5. `assets/*.pdf` are stale whenever `master_resume.yaml` changes. Regenerate, do not patch.

## Deploy

`git push origin main` → Pages rebuilds in ~1 min. Verify at the URL, not in the local file.
