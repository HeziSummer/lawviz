# LawViz Report Template Research

Updated: 2026-06-02

## Product framing

LawViz generated reports should be treated as vertical presentation decks, not as formal legal documents. The target output is a printable A4 portrait booklet with a "one page, one idea" rhythm: cover, executive summary, case map, timeline, evidence board, legal issues, risk/strategy, and closing action plan.

The Open Design templates below are references for typography, spacing, layout grammar, modules, and color systems. They should not be selected by topic/title similarity alone.

## Local address collection

| Template | Plugin page | Live example | GitHub source | License notes | LawViz use |
| --- | --- | --- | --- | --- | --- |
| Zhangzara Blue Professional | https://open-design.ai/zh/plugins/example-html-ppt-zhangzara-blue-professional/ | https://open-design.ai/plugins/example-html-ppt-zhangzara-blue-professional/example.html | https://github.com/nexu-io/open-design/tree/main/plugins/_official/examples/html-ppt-zhangzara-blue-professional | Open Design plugin metadata points to MIT upstream `zarazhangrui/beautiful-html-templates`. Keep upstream license notice if vendoring. | Strong candidate for cover, executive summary, directory pages, and polished consulting-style pages. |
| Zhangzara Long Table | https://open-design.ai/zh/plugins/example-html-ppt-zhangzara-long-table/ | https://open-design.ai/plugins/example-html-ppt-zhangzara-long-table/example.html | https://github.com/nexu-io/open-design/tree/main/plugins/_official/examples/html-ppt-zhangzara-long-table | Open Design plugin metadata points to MIT upstream `zarazhangrui/beautiful-html-templates`. Keep upstream license notice if vendoring. | Use sparingly for chapter numbering, editorial serif display, rust/red accent, and premium magazine details. Not a primary LawViz system. |
| Course Module | https://open-design.ai/zh/plugins/example-html-ppt-course-module/ | https://open-design.ai/plugins/example-html-ppt-course-module/example.html | https://github.com/nexu-io/open-design/tree/main/plugins/_official/examples/html-ppt-course-module | Uses MIT-licensed `lewislulu/html-ppt-skill`. Keep license if redistributing copied assets. | Good reference for "explain the case to the client" pages: learning objectives rail, warm paper, serif headings, checkpoints. |
| Knowledge Architecture Blueprint | https://open-design.ai/zh/plugins/example-html-ppt-knowledge-arch-blueprint/ | https://open-design.ai/plugins/example-html-ppt-knowledge-arch-blueprint/example.html | https://github.com/nexu-io/open-design/tree/main/plugins/_official/examples/html-ppt-knowledge-arch-blueprint | Uses MIT-licensed `lewislulu/html-ppt-skill`. Keep license if redistributing copied assets. | Best primary structural reference for case logic, evidence chain, timeline, issue map, and strategy pipeline. |
| Pitch Deck | https://open-design.ai/zh/plugins/example-html-ppt-pitch-deck/ | https://open-design.ai/plugins/example-html-ppt-pitch-deck/example.html | https://github.com/nexu-io/open-design/tree/main/plugins/_official/examples/html-ppt-pitch-deck | Uses MIT-licensed `lewislulu/html-ppt-skill`. Keep license if redistributing copied assets. | Useful for large metrics, contrast pages, and "problem/impact/action" rhythm. Avoid the startup gradient identity as the main LawViz style. |
| Data Visualization Report | https://open-design.ai/zh/plugins/example-data-report/ | https://open-design.ai/plugins/example-data-report/example.html | https://github.com/nexu-io/open-design/tree/main/plugins/_official/examples/data-report | Open Design plugin metadata marks it as an example template; inspect source before vendoring. | Good reference for KPI cards, chart containers, data tables, and insight blocks. Useful later for damages, deadlines, evidence counts, and risk scores. |
| Finance Report | https://open-design.ai/zh/plugins/example-finance-report/ | https://open-design.ai/plugins/example-finance-report/example.html | https://github.com/nexu-io/open-design/tree/main/plugins/_official/examples/finance-report | Open Design plugin metadata describes a design-system-backed prototype; inspect source before vendoring. | Good reference for monetary claims, fee exposure, loss calculation, P&L-style summaries, account/table blocks. |
| Open Design Landing Deck | https://open-design.ai/zh/plugins/example-open-design-landing-deck/ | https://open-design.ai/plugins/example-open-design-landing-deck/example.html | https://github.com/nexu-io/open-design/tree/main/plugins/_official/examples/open-design-landing-deck | Open Design plugin references its Atelier Zero deck system. Check linked source and assets before copying. | Useful for premium editorial chapter pages, cover composition, quote pages, and warm-paper brand feel. Not suitable as the whole report engine. |

## What these templates are

Open Design examples are not a drop-in component library for LawViz. Each inspected example is structured as an Open Design plugin folder, usually with:

- `open-design.json`: plugin metadata, preview entry, tags, prompt/use-case metadata, license/homepage information.
- `SKILL.md`: authoring instructions, visual rules, upstream attribution, and usage boundaries.
- `example.html`: a self-contained or mostly self-contained rendered HTML example.

For LawViz, the practical value is:

- extract design tokens: colors, fonts, spacing, borders, page rhythm;
- extract page modules: cover, chapter divider, pipeline, KPI grid, table, issue card, insight callout;
- adapt these modules into our Jinja report renderer;
- keep LawViz data and auth/rendering flow inside our FastAPI backend.

## Integration options

### Option A: direct vendoring of complete example HTML

Copy `example.html` into LawViz and replace content manually.

Pros:
- fastest visual prototype;
- preserves the original template behavior.

Cons:
- poor fit for dynamic reports;
- harder to keep consistent with our Jinja data model;
- may include horizontal deck runtime that is unnecessary for printable A4 output.

Verdict: only suitable for local visual samples, not for production rendering.

### Option B: copy selected CSS/classes into LawViz report styles

Extract the useful CSS tokens and structural classes into `backend/app/report_styles/*.css`, then write LawViz-specific Jinja markup in `backend/app/report_templates/*.html`.

Pros:
- fits the current FastAPI/Jinja renderer;
- keeps generated report content data-driven;
- easier to support multiple styles with the same report content;
- avoids carrying unrelated Open Design runtime code.

Cons:
- requires careful redesign for A4 portrait pages;
- some horizontal layouts must be rebuilt, not copied.

Verdict: recommended production path.

### Option C: add an internal "deck theme" layer

Create a small LawViz report theme system:

- `report_templates/lawviz_deck.html`: stable semantic Jinja structure.
- `report_styles/lawviz_blueprint.css`: Knowledge Blueprint-based style.
- `report_styles/lawviz_consulting.css`: Blue Professional-based style.
- `report_styles/lawviz_editorial.css`: Course/Landing/Long Table-inspired style.

Pros:
- preserves one content schema across multiple visual styles;
- supports future style switching in the result page;
- lets HTML, PDF, and screenshot export share the same source.

Cons:
- more initial structure work than a single CSS file.

Verdict: recommended architecture after the first local samples are approved.

## Important implementation notes from template research

- The `html-ppt-*` examples from `lewislulu/html-ppt-skill` mention a shared runtime and assets (`base.css`, `animations.css`, `runtime.js`) in their authoring notes. The Open Design example pages often inline enough CSS for preview, but production copying must not leave broken relative asset URLs.
- `Knowledge Architecture Blueprint` explicitly defines its core visual signature: cream paper `#F0EAE0`, rust red `#B5392A`, blueprint grid, hard 2px black cards, pipeline step boxes, insight callouts, and serif display type.
- `Blue Professional` is described as cream paper with cobalt blue accents and a clean professional deck grammar. It is appropriate for consulting deliverables and advisory updates.
- `Data Visualization Report` calls out a Chart.js pitfall: chart containers need fixed heights when using responsive canvases. If LawViz later adds live charts, we should wrap canvases in explicit-height containers.
- `Finance Report` is a single-page financial-report pattern with KPI strips, charts, P&L table, highlights, and outlook. For LawViz, this maps to damages/claim-value/risk-summary pages.
- `Open Design Landing Deck` uses a horizontal magazine deck runtime. For LawViz's printable vertical report, we should extract typography and chapter/quote composition, not the horizontal navigation model.

## Recommended LawViz visual direction

Use a hybrid system:

1. **Primary structure:** Knowledge Architecture Blueprint.
   - case map;
   - timeline;
   - evidence chain;
   - issue/strategy pipeline;
   - insight callouts.

2. **Professional cover and summary language:** Zhangzara Blue Professional.
   - cover;
   - table of contents;
   - executive summary;
   - closing recommendation page.

3. **Explanation pages:** Course Module.
   - "what happened";
   - "why this matters";
   - "what the client should prepare";
   - educational sidebar/step markers.

4. **Data modules:** Data Visualization Report + Finance Report.
   - KPI cards;
   - loss/amount tables;
   - evidence counts;
   - deadline/risk scoring;
   - claim value summary.

5. **Editorial accents only:** Long Table + Open Design Landing Deck.
   - section dividers;
   - pull quotes;
   - page numbering;
   - serif display details.

## How this fits our current backend

Current LawViz rendering is already Jinja-based:

- `backend/app/services/report_renderer.py`
- `backend/app/api/render.py`
- `backend/app/report_templates/case_report.html`
- `backend/app/report_styles/classic.css`
- `backend/app/report_styles/minimal.css`

The cleanest path is to keep this renderer and add new LawViz-native styles rather than importing Open Design as a runtime dependency.

Proposed next implementation sequence:

1. Create three standalone local A4 portrait HTML samples using shared mock case data:
   - `lawviz-blueprint.html`
   - `lawviz-consulting.html`
   - `lawviz-editorial.html`
2. Use the Open Design examples only as visual/module references, not as direct horizontal deck copies.
3. Review the three samples visually with the user.
4. After style approval, convert the chosen sample into:
   - a Jinja template under `backend/app/report_templates/`;
   - a CSS style under `backend/app/report_styles/`;
   - a new style key in `report_renderer.py`.
5. Fix existing Chinese mojibake in the report renderer/template before wiring the approved style into production rendering.

