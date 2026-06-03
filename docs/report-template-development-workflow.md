# LawViz Report Template Development Workflow

Updated: 2026-06-02

## Core Separation

LawViz report development has three separate artifacts:

1. Style template
2. Content template
3. Sample

They must not be designed as the same thing.

## 1. Style Template

Purpose:

- Define how reports look.
- Show all available components and their usage boundaries.
- Give Agent and Renderer a complete visual component catalog.
- Stay independent from any case type.

Current active work:

- `docs/report-style-samples/lawviz-blueprint/`

Style template files:

- `style.css`
- `visual-kit.json`
- `component-showroom.html`
- `README.md`

The style template should solve:

- A4 portrait page shell.
- Header, footer, page number, and brand identity.
- Lawyer, team, and firm identity rendering.
- Typography, color, spacing, borders, and grid rules.
- Component catalog.
- Component usage rules.
- Empty-state behavior.
- Overflow and print constraints.
- SVG connector rules for relationship/path diagrams.

The style template should not solve:

- Which pages a contract dispute needs.
- Which pages a labor dispute needs.
- Which questions Agent asks a lawyer.
- Which legal issues apply to a case type.
- Which facts are required for a case-type content template.

## 2. Agent Conversation Design

Purpose:

- Define how Agent interviews the lawyer.
- Define what structured case model Agent can reliably produce.
- Decide which facts require lawyer confirmation.
- Decide which fields are case-type-specific.

This phase should come after the first style template is stable enough.

Agent conversation design should produce:

- Intake flow.
- Required lawyer confirmations.
- Structured case data schema.
- Case-type classification.
- Missing-information prompts.
- Internal-only versus client-facing distinction.

## 3. Content Template

Purpose:

- Define what a case type should present to a client.
- Use Agent output fields as inputs.
- Stay independent from visual style.

Examples:

- Contract dispute content template.
- Labor dispute content template.
- Divorce dispute content template.
- Private lending dispute content template.

A content template should define:

- Page sequence.
- Required data for each page.
- Optional data for each page.
- Page splitting rules.
- Legal/strategic meaning of each module.
- Which modules are standard and which are conditional.

Content templates should be designed only after Agent conversation design has enough structure.

## 4. Sample

Purpose:

- Demonstrate one content template rendered with one style template and example data.

Sample formula:

```text
content template + style template + example data = sample
```

Examples:

- Contract dispute + LawViz Blueprint + CRM tail-payment example.
- Labor dispute + LawViz Blueprint + wrongful termination example.
- Divorce dispute + LawViz Blueprint + custody/property example.

Samples are not the same as style templates.

Samples are not the same as content templates.

## Current Stage Decision

Current stage:

- Build and stabilize `lawviz-blueprint` as a style template.

Current deliverables:

- Component catalog.
- Visual tokens.
- Identity system.
- Renderer constraints.
- Component usage examples.

Deferred stages:

- Agent-lawyer conversation flow.
- Case-type content templates.
- Final content/style combination samples.
- Production renderer integration.

## Guardrails

- Do not design case-type content templates before Agent conversation design.
- Do not call a case-type sample a style template.
- Do not let Agent generate arbitrary HTML/CSS.
- Do not use absolute-positioned div arrows for diagrams.
- Keep A4 portrait pages overflow-safe.
- Keep style packs reusable across multiple case types.
