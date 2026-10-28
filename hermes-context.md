# Portfolio (v1)

## What this is
Nico Rubino's personal portfolio site hosted on GitHub Pages at `rubinonico.github.io/portfolio`. A static HTML/CSS site with a classic Times New Roman / cream-paper aesthetic — dark theme, professional layout. The current index.html is a CRT-terminal-style landing page. Four subpages: Gaming (playable poker demos), Finance (trading systems, LP strategies), Labs (hardware/home lab), and a landing page. The site serves as a public-facing resume supplement for job applications, intentionally omitting chemistry and OPSEC content.

## Structure
- `index.html` — Main landing page (CRT-terminal style, Times New Roman, cream background)
- `finance.html` — Finance section: Concentrated LP, LP Engine, Systematic Trading Research
- `gaming.html` — Gaming section: 3 live poker demos (Five Card Draw, Texas Hold'em v1/v2)
- `labs.html` — Labs section: White Mule, Morgul/Silmaril, eforce_automator.py, homelab, knowledge architecture
- `holdem-scratch.html` / `holdem-scratch-B.html` — Playable Texas Hold'em poker games (vanilla JS)
- `five-column-poker.html` — Five Card Draw poker demo (vanilla JS)
- `eforce_automator.py` — Sanitized Selenium+PyMuPDF PDMP report automation script (public-facing)
- `concepts-portfolio-index.md` — Redesign concept doc: 3 options (Deal Me In card table, Rube Goldberg machine, Rolodex) for replacing the CRT index
- `.github/workflows/deploy.yml` — GitHub Actions: deploys to GitHub Pages on push to master
- `.nojekyll` — Disables Jekyll processing on GitHub Pages

## Key entry points
- `index.html` — Main entry point for visitors
- `concepts-portfolio-index.md` — Design brief for next iteration
- `.github/workflows/deploy.yml` — CI/CD pipeline

## Commands / how to run
Static site — no build step. Deployed automatically via GitHub Actions on push to master. Open any .html file directly in a browser to preview locally.

## Gotchas / notes
- The CRT-terminal index page is a placeholder Nico is "not sold on" — concepts-portfolio-index.md has 3 replacement options
- Chemistry and OPSEC content intentionally removed from public-facing pages
- eforce_automator.py is sanitized (no real credentials/paths)
- No proper project names on anything public-facing (OPSEC rule)
- The site is career-focused: bio mentions "Accounting. Operations & Systems Management." header, WGU B.S. Accounting, healthcare ops background

## Sub-projects
None — this is a single flat static site.