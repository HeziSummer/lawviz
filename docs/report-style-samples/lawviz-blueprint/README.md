# LawViz Blueprint Style Pack

This is the first LawViz visual style pack.

It is a style template, not a case-type content template.

Chosen base style:

- Primary: Open Design `Knowledge Architecture Blueprint`
- Supporting references: `Zhangzara Blue Professional`, `Data Visualization Report`, `Finance Report`

Purpose:

- define a reusable A4 portrait report visual system;
- show all supported components and their intended usage;
- provide the renderer and Agent with component boundaries;
- keep standardized pages and future content-template samples visually consistent.

Files:

- `visual-kit.json`: normalized LawViz visual configuration, component catalog, renderer constraints, and identity system.
- `style.css`: shared A4 portrait deck styling.
- `component-showroom.html`: style-template component catalog and composition stress test.
- `chart-showroom.html`: chart component catalog with visible text data for validation.

Current scope:

- page shell, header, footer, print size, and overflow discipline;
- typography, colors, cards, tags, metrics, and callouts;
- identity system for individual lawyer, law firm team, and corporate-style firm;
- tables, matrices, comparison layouts, ledgers, amount boards, action boards, timelines, heatmaps, and SVG connector diagrams;
- chart components: bar, stacked bar, donut, waterfall, risk quadrant, score gauge, and calendar strip;
- empty-state behavior for optional identity and component fields.

Out of scope for this style pack:

- case-type page sequence;
- contract, labor, divorce, lending, equity, or other content templates;
- Agent interview flow;
- legal issue taxonomy;
- final production renderer integration.

Future workflow:

- Content templates are designed after Agent-lawyer interaction design.
- Samples are combinations of one content template, one style template, and example data.
- This style pack can be used by many content templates.

Open `component-showroom.html` and `chart-showroom.html` directly in a browser. These are static local samples and do not affect the backend renderer yet.


