# LawViz Visual Pack Format

Updated: 2026-06-02

## Purpose

LawViz will not use Open Design templates as raw imported pages. Instead, each useful Open Design template should be converted into a LawViz Visual Pack.

A Visual Pack is LawViz's internal format for:

- visual style tokens;
- standardized page samples;
- reusable visualization modules;
- Agent guidance;
- renderer constraints;
- source attribution and license notes.

This gives the Agent creative space while keeping every generated page consistent with the approved LawViz report style.

## Source material

Each Open Design template usually provides:

- `SKILL.md`: authoring rules, design intent, best/worst use cases, asset/runtime notes.
- `open-design.json`: plugin metadata, preview entry, tags, license/homepage, use-case prompt.
- `example.html`: rendered HTML/CSS sample that reveals the actual layout and component grammar.

LawViz conversion should treat these as source material, not as final production code.

## Conversion pipeline

```text
Open Design plugin
  ├─ SKILL.md
  ├─ open-design.json
  └─ example.html
        │
        ▼
LawViz Visual Pack
  ├─ source metadata
  ├─ visual tokens
  ├─ page blueprints
  ├─ visual modules
  ├─ Agent guidance
  ├─ renderer constraints
  └─ license/attribution notes
        │
        ▼
LawViz renderer
  ├─ Jinja templates
  ├─ CSS styles
  └─ controlled HTML output
```

## Pack schema

Recommended shape:

```json
{
  "id": "lawviz-hybrid-blueprint",
  "name": "LawViz Hybrid Blueprint",
  "version": "0.1.0",
  "purpose": "Vertical legal case explanation deck for lawyer-to-client communication.",
  "sources": [
    {
      "name": "Knowledge Architecture Blueprint",
      "plugin_url": "https://open-design.ai/zh/plugins/example-html-ppt-knowledge-arch-blueprint/",
      "example_url": "https://open-design.ai/plugins/example-html-ppt-knowledge-arch-blueprint/example.html",
      "github_url": "https://github.com/nexu-io/open-design/tree/main/plugins/_official/examples/html-ppt-knowledge-arch-blueprint",
      "role": "Primary structural reference"
    }
  ],
  "visual_tokens": {
    "page": {
      "format": "A4 portrait",
      "screen_preview_px": {"width": 794, "height": 1123},
      "print_size": "210mm x 297mm",
      "safe_margin_mm": 14
    },
    "colors": {
      "paper": "#F0EAE0",
      "ink": "#1A1A1A",
      "muted": "#666666",
      "accent": "#B5392A",
      "accent_secondary": "#244CFF",
      "card": "#FFFFFF"
    },
    "typography": {
      "display": "Noto Serif SC / Playfair Display fallback",
      "body": "Inter / Noto Sans SC fallback",
      "mono": "JetBrains Mono / IBM Plex Mono fallback"
    },
    "shapes": {
      "card_border": "2px solid #1A1A1A",
      "card_radius": "10-12px",
      "callout_radius": "10px",
      "grid_size_px": 48
    }
  },
  "standard_pages": [
    {
      "kind": "cover",
      "required": true,
      "visual_reference": "Blue Professional + Knowledge Blueprint",
      "content_slots": ["title", "subtitle", "case_type", "lawyer", "date", "key_insight"]
    }
  ],
  "visual_modules": [
    {
      "id": "evidence_strength_board",
      "description": "Evidence cards grouped by proof value and risk.",
      "allowed_blocks": ["evidence_card", "risk_badge", "source_label", "note_callout"]
    }
  ],
  "agent_guidance": {
    "allowed_to_choose": [
      "which optional visualization pages are useful",
      "which approved module best fits the case-specific logic",
      "page title and explanatory copy",
      "semantic grouping of facts/evidence/issues"
    ],
    "not_allowed_to_generate": [
      "uncontrolled final HTML",
      "unapproved CSS",
      "external JavaScript",
      "new visual style tokens outside the pack"
    ]
  },
  "renderer_constraints": {
    "escape_text": true,
    "allow_inline_svg_from_renderer_only": true,
    "allow_external_scripts": false,
    "print_ready": true,
    "overflow_policy": "split_page_or_condense_block"
  }
}
```

## Required fields

### `sources`

Track where the pack came from. This is important for future maintenance and license attribution.

Each source should record:

- plugin URL;
- live example URL;
- GitHub source URL;
- source role in LawViz;
- license notes if known.

### `visual_tokens`

These are the controlled design knobs the Agent cannot freely alter:

- page size;
- margins;
- colors;
- typography;
- spacing;
- borders;
- card radius;
- callout style;
- table/chart style;
- print rules.

### `standard_pages`

These define the fixed "showroom" pages for each case type. They are not only templates; they are product decisions about what visual explanations matter most.

Examples:

- cover;
- executive summary;
- case map;
- timeline;
- evidence board;
- issue matrix;
- strategy path;
- action checklist.

### `visual_modules`

These are approved building blocks the Agent can choose from when creating case-specific visual content.

Examples:

- contradiction map;
- payment flow;
- responsibility split;
- evidence strength board;
- risk matrix;
- damages calculation board;
- litigation path tree;
- negotiation leverage map.

### `agent_guidance`

This is the creative boundary.

The Agent may:

- decide which visualization is useful;
- decide content grouping;
- write explanatory text;
- choose approved modules;
- propose custom page sequence.

The Agent may not:

- invent unrelated styles;
- output unsafe arbitrary HTML/JS;
- bypass the visual token system;
- create pages that cannot print or export reliably.

### `renderer_constraints`

This section tells the backend what must be enforced no matter what the Agent proposes:

- text escaping;
- no external scripts;
- fixed page size;
- page overflow handling;
- print/PDF readiness;
- style token consistency.

## First pack recommendation

The first LawViz pack should be a hybrid:

`lawviz-hybrid-blueprint`

Source roles:

- Knowledge Architecture Blueprint: main case-logic structure.
- Zhangzara Blue Professional: professional consulting feel.
- Course Module: explanatory/educational page rhythm.
- Data Visualization Report: KPI/chart/table guidance.
- Finance Report: monetary and calculation modules.
- Long Table + Open Design Landing Deck: editorial accents only.

This pack should be used to build the first three local vertical samples and then converted into production Jinja/CSS once approved.

## Evaluation loop

After the first pack is drafted, evaluate Agent consistency by asking the Agent to generate several reports from the same pack:

1. a simple contract dispute;
2. a labor dispute;
3. a divorce/property dispute;
4. a private lending dispute;
5. a traffic accident compensation case.

For each output, check:

- whether standard and Agent-generated pages look like one system;
- whether the Agent selected useful custom visual pages;
- whether page overflow is controlled;
- whether print preview works;
- whether the same content can switch styles later.

## Module maturity model

The current template selection process is primarily aesthetic. That is intentional for the visual exploration phase, but it means different packs may start with uneven functional coverage.

LawViz should therefore separate two questions:

1. **Aesthetic fit:** Does this visual language feel right for a legal client-facing vertical deck?
2. **Functional completeness:** Does this pack cover the modules a LawViz report must reliably provide?

Early packs may pass the aesthetic test while missing important report modules. That is acceptable during exploration. After several sample packs are built, LawViz should define a required module baseline. Future packs must either include those modules directly or recreate them in the pack's own visual style.

## Phased pack strategy

### Phase 1: aesthetic sample packs

Build a few visually distinct sample packs first.

Goal:

- test visual quality;
- test print/PDF feel;
- test whether standard and Agent-created pages remain visually unified;
- discover which visual modules are actually useful in legal case reports.

At this stage, packs do not need identical module coverage.

### Phase 2: module baseline

After reviewing the first sample packs, define the LawViz required module standard.

Candidate baseline modules:

- cover;
- executive summary;
- table of contents;
- case fact map;
- party relationship map;
- timeline;
- evidence board;
- evidence strength/risk labels;
- issue matrix;
- claim/legal basis map;
- responsibility split;
- risk strategy page;
- amount/damages calculation board;
- deadline/action checklist;
- lawyer closing card;
- Agent custom visual page.

This baseline should be product-led, not template-led. It should reflect what users need to understand a case, not what any one Open Design template happened to contain.

### Phase 3: style-complete packs

Once the baseline exists, every approved visual pack must become functionally complete.

If a source template has a beautiful aesthetic but lacks a required module, LawViz should design the missing module in that same style.

Examples:

- If an editorial pack lacks a timeline, create an editorial timeline using its serif typography, page numbering, and chapter rhythm.
- If a blueprint pack lacks damages calculation, create a hard-card calculation board using its grid, rust accent, and black border system.
- If a consulting pack lacks an evidence board, create one using its restrained blue accent and professional card/table grammar.

The rule: **style may vary, module capability must converge.**

## Pack approval rule

A pack should not become production-available until it passes both checks:

- visual approval: the pack looks good and fits LawViz's audience;
- module approval: the pack covers the required LawViz module baseline, either from source templates or from LawViz-created additions.
