# Open Design to LawViz Adapter Spec

Updated: 2026-06-02

## Goal

LawViz will not use Open Design templates as raw copied pages. Instead, we will convert selected Open Design plugin materials into a LawViz-specific visual system format.

Input sources:

- `SKILL.md`: visual rules, authoring boundaries, upstream notes, usage warnings.
- `open-design.json`: metadata, preview entry, tags, license/homepage, prompt/use-case data.
- `example.html`: concrete HTML/CSS implementation and page modules.

LawViz outputs:

- visual sample pages;
- visual configuration files;
- reusable report components;
- Agent constraints for case-specific visual generation.

The purpose is to test whether an Agent can create additional case-specific visualization pages while staying visually consistent with LawViz's approved report styles.

## Adapter pipeline

### 1. Source capture

For every selected Open Design plugin, record:

- plugin URL;
- live example URL;
- GitHub source URL;
- license/upstream;
- visual signature;
- useful modules;
- unsuitable parts;
- LawViz adaptation notes.

This is already started in `docs/report-template-research.md`.

### 2. Visual extraction

Extract reusable design information from `SKILL.md`, `open-design.json`, and `example.html`:

- palette;
- typography;
- spacing scale;
- page proportion;
- page/chrome elements;
- card and border style;
- table style;
- chart style;
- callout style;
- page numbering;
- section/chapter label style;
- printable behavior;
- component classes worth adapting.

Do not blindly copy everything. Keep only what supports LawViz's vertical PPT booklet.

### 3. LawViz visual kit

Normalize extracted material into a LawViz-owned format:

```json
{
  "id": "lawviz-blueprint",
  "source_plugins": [
    "example-html-ppt-knowledge-arch-blueprint",
    "example-html-ppt-zhangzara-blue-professional",
    "example-data-report"
  ],
  "intent": "Structured legal case explanation with evidence-chain and strategy-map pages.",
  "page": {
    "format": "A4 portrait",
    "ratio": "210:297",
    "preview_width_px": 794,
    "preview_height_px": 1123
  },
  "tokens": {
    "colors": {},
    "fonts": {},
    "spacing": {},
    "borders": {},
    "shadows": {}
  },
  "components": [
    "cover",
    "toc",
    "case_summary",
    "timeline",
    "evidence_board",
    "issue_matrix",
    "risk_strategy",
    "custom_visual"
  ],
  "agent_rules": {
    "may_create": [
      "contradiction_map",
      "responsibility_split",
      "payment_flow",
      "evidence_heatmap",
      "litigation_path_tree"
    ],
    "must_not_create": [
      "arbitrary_script",
      "unbounded_html",
      "style_tokens_outside_theme",
      "overlong_text_blocks"
    ]
  }
}
```

This file is not the final report. It is the design contract that both the renderer and the Agent follow.

### 4. Showroom pages

For each visual kit, create local sample pages that show the standard report pages:

- cover;
- table of contents;
- case summary;
- party relationship map;
- timeline;
- evidence board;
- issue matrix;
- risk/strategy page;
- action checklist;
- closing page.

These are the "showroom" pages. They define the visual quality bar and the reusable component vocabulary.

### 5. Agent creative pages

For each visual kit, create several sample Agent-style pages using the same mock case data:

- contradiction map;
- payment/contract flow;
- evidence strength heatmap;
- litigation path tree;
- damages calculation board.

The Agent should be constrained by the visual kit. It may decide the visualization idea and page content, but it must use approved tokens and components.

### 6. Consistency evaluation

Judge whether standard pages and Agent-created pages feel like the same report.

Evaluation criteria:

- same page rhythm;
- same visual density;
- same typography scale;
- same card/border language;
- same accent color behavior;
- no uncontrolled one-off layout;
- no text overflow;
- printable as A4 portrait;
- no scripts or external runtime required for the static report.

## Recommended LawViz format

Use three internal artifact types.

### `visual-kit.json`

Holds design tokens, source references, allowed modules, Agent boundaries, and print rules.

### `showroom.html`

Static local sample that demonstrates standard LawViz pages using the visual kit.

### `agent-sandbox.html`

Static local sample that demonstrates extra Agent-style visualization pages under the same visual kit.

After approval, these are converted into backend renderer assets:

- `backend/app/report_templates/*.html`
- `backend/app/report_styles/*.css`
- `backend/app/services/report_renderer.py`
- LLM prompt/schema changes in `backend/app/services/llm.py`

## First three visual kits to build

### 1. `lawviz-blueprint`

Primary sources:

- Knowledge Architecture Blueprint;
- Blue Professional;
- Data Visualization Report.

Use for structured legal logic, evidence chain, issue map, and strategy planning.

### 2. `lawviz-consulting`

Primary sources:

- Blue Professional;
- Finance Report;
- Pitch Deck.

Use for professional lawyer-to-client advisory reports, executive summaries, amount/risk summaries, and decision pages.

### 3. `lawviz-editorial`

Primary sources:

- Course Module;
- Open Design Landing Deck;
- Long Table.

Use for explanatory reports, client education, narrative case walkthroughs, and premium chapter-page typography.

## Product boundary

This is core functionality.

The Agent-created visual pages are not an optional future add-on. They are part of the main LawViz report value: every report should combine stable standard pages with case-specific visual insight pages.

The production renderer must still control final HTML/CSS. The Agent's creativity enters through structured page plans, visual intents, and component choices, not uncontrolled freeform HTML.

