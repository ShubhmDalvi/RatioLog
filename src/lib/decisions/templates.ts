/**
 * Pre-filled starter decisions for the empty state. Each one opens the create
 * form with a realistic scaffold the user edits and saves as their own.
 */

export type DecisionTemplateId = "database" | "auth" | "deployment";

export type DecisionTemplate = {
  id: DecisionTemplateId;
  label: string;
  hint: string;
  title: string;
  tags: string[];
  context: string;
  decision: string;
  consequences: string;
};

export const DECISION_TEMPLATES: DecisionTemplate[] = [
  {
    id: "database",
    label: "Choose a database",
    hint: "Turso, SQLite, or managed",
    title: "Choose the production database",
    tags: ["database", "infrastructure"],
    context: `We need a primary database for production.

Forces at play:
- Expected write volume:
- Query patterns (relational vs document):
- Ops budget and hosting preference:
- Team familiarity:`,
    decision: `**Chosen:**

Why it wins:
-

Alternatives considered:
- `,
    consequences: `- Easier:
- Harder:`,
  },
  {
    id: "auth",
    label: "Pick an auth approach",
    hint: "Sessions, JWT, or a provider",
    title: "Pick the authentication approach",
    tags: ["auth", "security"],
    context: `We need sign-in before launch.

Forces at play:
- Where sessions must work (web only, mobile later?):
- Revocation requirements:
- Compliance or SSO on the roadmap:
- Time budget for building vs buying:`,
    decision: `**Chosen:**

Why it wins:
-

Alternatives considered:
- `,
    consequences: `- Easier:
- Harder:`,
  },
  {
    id: "deployment",
    label: "Decide where to deploy",
    hint: "Vercel, containers, or VPS",
    title: "Decide the deployment target",
    tags: ["deployment", "infrastructure"],
    context: `The app needs a home.

Forces at play:
- Traffic expectations at launch:
- Need for long-running jobs or websockets:
- Preview environments for review:
- Cost ceiling per month:`,
    decision: `**Chosen:**

Why it wins:
-

Alternatives considered:
- `,
    consequences: `- Easier:
- Harder:`,
  },
];

export function getDecisionTemplate(
  id: string | undefined,
): DecisionTemplate | undefined {
  return DECISION_TEMPLATES.find((template) => template.id === id);
}
