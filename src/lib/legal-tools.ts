import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const legalTools = [
  tool(
    ({ fields }) => {
      const labels: Record<keyof typeof fields, string> = {
        accusedName: "Accused person's name",
        offenceDescription: "Offence description",
        statutoryProvision: "Cited statutory provision",
        particulars: "Offence particulars",
        dateAndPlace: "Date and place alleged",
        complainantOrWitness: "Complainant or witness details",
      };
      const missing = Object.entries(fields)
        .filter(([, value]) => !value)
        .map(([key]) => labels[key as keyof typeof labels]);
      return JSON.stringify({
        checked: Object.keys(fields).length,
        missing,
        note: "Administrative completeness check only. Confirm all charge-sheet requirements against current Ugandan law and applicable court rules.",
      });
    },
    {
      name: "check_charge_sheet_completeness",
      description:
        "Check whether common identifying and descriptive fields appear in a charge sheet. This is not a legal sufficiency or validity opinion.",
      schema: z.object({
        fields: z.object({
          accusedName: z.boolean(),
          offenceDescription: z.boolean(),
          statutoryProvision: z.boolean(),
          particulars: z.boolean(),
          dateAndPlace: z.boolean(),
          complainantOrWitness: z.boolean(),
        }),
      }),
    },
  ),
  tool(
    ({ court, caseType, location, questions }) =>
      JSON.stringify({
        supplied: { court, caseType, location },
        verify: [
          "The court's subject-matter and territorial jurisdiction under the current applicable law",
          "Any statutory limits, allocation rules, and procedural requirements that apply to this case type",
          "Whether the relevant location or cause-of-action facts affect venue",
          ...questions,
        ],
        note: "This is a verification checklist, not a jurisdiction determination. Confirm against current primary legal sources.",
      }),
    {
      name: "jurisdiction_verification_checklist",
      description:
        "Create a fact-specific checklist of jurisdiction questions to verify in primary Ugandan legal sources; do not determine jurisdiction.",
      schema: z.object({
        court: z.string().min(1).max(160),
        caseType: z.string().min(1).max(160),
        location: z.string().min(1).max(160),
        questions: z.array(z.string().max(240)).max(5).default([]),
      }),
    },
  ),
  tool(
    ({ startDate, numberOfCalendarDays }) => {
      const start = new Date(`${startDate}T00:00:00.000Z`);
      if (
        Number.isNaN(start.getTime()) ||
        start.toISOString().slice(0, 10) !== startDate
      ) {
        return JSON.stringify({ error: "Enter a valid date in YYYY-MM-DD format." });
      }
      start.setUTCDate(start.getUTCDate() + numberOfCalendarDays);
      return JSON.stringify({
        calculatedDate: start.toISOString().slice(0, 10),
        calculation: `${startDate} + ${numberOfCalendarDays} calendar days`,
        note: "Arithmetic only. This does not determine legal time limits or whether the start or end day is included; verify the applicable statute and court rules.",
      });
    },
    {
      name: "calendar_date_calculator",
      description:
        "Add a stated number of calendar days to a supplied date. Never infer a legal deadline or counting convention.",
      schema: z.object({
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        numberOfCalendarDays: z.number().int().min(0).max(3650),
      }),
    },
  ),
];
