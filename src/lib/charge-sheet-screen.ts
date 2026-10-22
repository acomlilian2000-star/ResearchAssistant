export type ChargeSheetField = {
  id: string;
  label: string;
  description: string;
  pattern: RegExp;
};

export const chargeSheetFields: ChargeSheetField[] = [
  {
    id: "accused",
    label: "Accused person",
    description: "A labelled accused-person or name field",
    pattern: /\b(?:name\s+of\s+accused|accused(?:\s+person)?)\s*[:\-]/i,
  },
  {
    id: "offence",
    label: "Offence description",
    description: "A labelled offence or charge field",
    pattern: /\b(?:offence|offense|charge)\s*[:\-]/i,
  },
  {
    id: "provision",
    label: "Statutory provision",
    description: "A section or statutory-provision reference",
    pattern: /\b(?:section|sec\.?|s\.)\s+\d+[A-Za-z]?(?:\s*\(\d+\))?/i,
  },
  {
    id: "particulars",
    label: "Particulars",
    description: "A labelled particulars field",
    pattern: /\bparticulars?\s*[:\-]/i,
  },
  {
    id: "date-place",
    label: "Date and place",
    description: "A labelled date/time or place/location field",
    pattern: /\b(?:date\s*(?:and|&)\s*place|date\s*\/\s*place|place\s*of\s*offence|date\s*of\s*offence)\s*[:\-]/i,
  },
  {
    id: "complainant",
    label: "Complainant or witness",
    description: "A labelled complainant or witness field",
    pattern: /\b(?:complainant|witness(?:es)?)\s*[:\-]/i,
  },
];

export function screenChargeSheet(text: string) {
  return chargeSheetFields.map((field) => ({
    id: field.id,
    label: field.label,
    description: field.description,
    found: field.pattern.test(text),
  }));
}
