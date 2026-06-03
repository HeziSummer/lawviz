# LawViz Report Generation Architecture

Updated: 2026-06-02

## Core decision

LawViz report generation will use a hybrid architecture:

1. **Standardized visual pages** as the stable report backbone.
2. **Agent-generated visual content** as a core part of every report, not a later upgrade.
3. **One shared visual system** so standardized pages and Agent-created pages look like the same deck.

This means LawViz is not merely filling a fixed legal report template. It is producing a vertical PPT-style case explanation booklet where some pages are deterministic and some pages are creatively assembled by the Agent within strict product boundaries.

## Why this is the right product direction

Pure fixed templates are stable but too rigid. They can cover common case explanation needs, but they cannot fully express case-specific logic, unusual evidence relationships, special damages structures, or narrative strategy.

Pure Agent-authored HTML is flexible but unstable. It risks inconsistent style, broken pagination, print issues, layout overflow, unsafe output, and unreliable PDF conversion.

The hybrid model is the better product:

- standardized pages guarantee baseline quality;
- Agent-generated visual content makes the report feel tailored to the actual case;
- shared components keep everything visually coherent;
- deterministic rendering keeps print/export/security under control.

## Report structure

Each report should be assembled from three layers.

### 1. Case content layer

The Agent analyzes the user's case input and produces structured content:

- case title;
- executive summary;
- case type;
- parties and roles;
- key facts;
- timeline;
- evidence items;
- legal issues;
- risks;
- recommendations;
- amount/loss/deadline data when available;
- client preparation checklist.

This layer must be JSON/schema-driven. The Agent should not write arbitrary final HTML at this layer.

### 2. Standard page layer

These are LawViz-controlled "showroom pages" with fixed layout semantics. They correspond to the most important visualization needs for a specific case type.

Initial standard pages:

- cover page;
- table of contents;
- one-page case summary;
- parties/relationship map;
- timeline page;
- evidence board;
- legal issue matrix;
- risk and strategy page;
- action checklist;
- lawyer/contact closing page.

For each case type, LawViz can define which standard pages are required, optional, or hidden.

### 3. Agent visual idea layer

This is a core feature. The Agent may propose and generate additional case-specific visualization blocks/pages, such as:

- contradiction map;
- responsibility split diagram;
- payment/contract flow;
- evidence strength heatmap;
- litigation path tree;
- negotiation leverage map;
- damages calculation board;
- deadline/risk countdown;
- opposing party behavior pattern;
- "what to prove next" board.

The Agent should receive content-direction guidance and a catalog of allowed visual components. It can choose what to create and how to explain it, but it must stay inside the approved visual system.

Important boundary: the Agent may design the content logic and choose from approved modules, but LawViz should still render the final page through controlled components/CSS. The Agent should not output uncontrolled standalone HTML/CSS/JS for production reports.

## Visual consistency rule

Every page, whether standardized or Agent-generated, must use the same:

- page size and margins;
- typography scale;
- color tokens;
- card/border rules;
- section labels;
- page numbering;
- callout style;
- table/chart style;
- print rules.

The user should not be able to tell which page came from a fixed template and which came from Agent composition.

## How this maps to implementation

### Template system

LawViz should define a semantic page/component library rather than one giant static template.

Recommended backend concepts:

- `ReportPage`: one page in the final vertical deck.
- `PageKind`: cover, summary, timeline, evidence_board, issue_matrix, risk_strategy, custom_visual, etc.
- `VisualBlock`: reusable block inside a page, such as callout, metric, timeline_item, evidence_card, matrix_cell, flow_node.
- `Theme`: CSS/token package used by all pages.

### Agent output contract

The Agent should output something like:

```json
{
  "report_title": "...",
  "standard_pages": [
    {"kind": "cover", "content": {}},
    {"kind": "timeline", "content": {}},
    {"kind": "evidence_board", "content": {}}
  ],
  "agent_visual_pages": [
    {
      "kind": "custom_visual",
      "visual_intent": "show contradiction between payment record and verbal agreement",
      "recommended_module": "contradiction_map",
      "content": {}
    }
  ]
}
```

The final HTML renderer then maps these pages into approved Jinja components and CSS classes.

### Renderer responsibility

The renderer must:

- enforce page dimensions;
- escape text safely;
- apply shared style tokens;
- prevent arbitrary script injection;
- handle overflow with known rules;
- support print/PDF export;
- support style switching across the same content.

## Open Design role

Open Design templates are used as visual references and source material for the LawViz visual system.

Recommended extraction:

- Knowledge Architecture Blueprint: case map, evidence chain, pipeline, issue logic.
- Blue Professional: cover, executive summary, professional consulting tone.
- Course Module: explanatory pages and client-education rhythm.
- Data/Finance Report: KPI, amount, table, and calculation modules.
- Long Table / Landing Deck: editorial chapter dividers and premium typography accents.

Do not import Open Design as a runtime dependency for report rendering. Extract and adapt styles/components into LawViz.

See `docs/opendesign-adapter-spec.md` for the adapter pipeline that turns Open Design `SKILL.md`, `open-design.json`, and `example.html` into LawViz visual kits, showroom pages, and Agent consistency tests.

## Sprint implication

This hybrid generation model is part of the core report product and should be included in the next report-rendering sprint.

Next build sequence:

1. Define the first LawViz report page schema.
2. Build local vertical HTML samples that include both standard pages and Agent-style custom visual pages.
3. Use mock case data to test whether standard and custom pages look visually unified.
4. After approval, implement the renderer as controlled Jinja/CSS components.
5. Update the LLM prompt so the Agent outputs page plans and visual intentions, not arbitrary final HTML.
