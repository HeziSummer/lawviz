# LawViz Report Module Standardization Plan

Updated: 2026-06-02

## Core concern

The current Open Design selection is driven by aesthetics: typography, layout quality, color, visual hierarchy, and print/presentation suitability.

This is the right first step for visual direction, but it does not guarantee functional completeness.

Different source templates may have uneven support for:

- timelines;
- evidence boards;
- legal issue matrices;
- relationship maps;
- risk scoring;
- amount/loss calculations;
- action checklists;
- custom Agent visualizations.

Therefore, LawViz must not treat each aesthetic template as a full product template. Aesthetic selection and module completeness are separate decisions.

## Two-stage approach

### Stage 1: aesthetic sample packs

Build several visual sample packs first.

Goal:

- test which visual languages feel right for LawViz;
- identify strong page styles and reusable visual patterns;
- observe which modules naturally work well in each style;
- discover weaknesses in real vertical A4 samples.

Expected packs:

- `lawviz-blueprint`;
- `lawviz-consulting`;
- `lawviz-editorial`.

At this stage, packs do not need to be functionally complete. They are used to compare aesthetics and discover module patterns.

### Stage 2: module/function standard

After reviewing the first sample packs, define a product-level module standard.

This standard becomes independent from any one visual style.

Every mature LawViz visual pack should eventually support the same core module set. If an imported or adapted visual style lacks a module, LawViz creates that missing module in the same aesthetic language.

## Future module standard

The standard should be defined after sample review, but the likely baseline is:

### Required standard pages

- cover;
- table of contents;
- executive summary;
- case fact map;
- party/relationship map;
- timeline;
- evidence board;
- legal issue matrix;
- risk and strategy page;
- action checklist;
- lawyer/contact closing page.

### Required visualization modules

- timeline item;
- evidence card;
- evidence strength marker;
- issue/rule/fact matrix;
- risk badge;
- strategy path;
- amount/loss summary;
- deadline marker;
- callout/insight box;
- source/reference label.

### Required Agent creative modules

- contradiction map;
- responsibility split;
- payment/contract flow;
- evidence heatmap;
- litigation path tree;
- negotiation leverage map;
- damages calculation board;
- "what to prove next" board.

## Completion rule

For each visual pack:

1. Start from source template aesthetics.
2. Build the modules that naturally exist in the source.
3. Compare the pack against the LawViz module standard.
4. Identify missing modules.
5. Design missing modules in the same style language.
6. Only then mark the pack as production-ready.

This prevents a visually attractive pack from becoming a weak product template.

## Example

If `lawviz-editorial` has strong cover, chapter, quote, and explanatory pages but lacks an evidence board:

- do not reject it only because the source template lacks evidence-board pages;
- do not import an evidence board from another style directly;
- design a new editorial-style evidence board using the same typography, colors, borders, and spacing rules.

If `lawviz-blueprint` has strong case maps and evidence chains but weak client-facing summary pages:

- keep its blueprint logic pages;
- design summary and lawyer-closing pages in the same cream/rust/grid language;
- do not let it remain an engineering-looking partial template.

## Product principle

A LawViz visual pack is not complete because the source Open Design template is beautiful.

A LawViz visual pack is complete only when:

- its aesthetics are approved;
- it supports the LawViz module standard;
- missing modules have been designed in the same visual language;
- standard pages and Agent-created pages remain visually consistent;
- the final output is printable, readable, and useful to lawyers and clients.

## Sprint implication

In the current phase, build sample packs quickly and deliberately. Do not over-standardize before seeing real samples.

After sample review, freeze the first LawViz module standard and use it as the acceptance checklist for every future visual pack.

