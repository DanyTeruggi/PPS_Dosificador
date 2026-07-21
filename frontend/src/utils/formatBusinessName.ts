const LEGAL_SUFFIXES: Record<string, string> = {
  sa: "S.A.",
  "s.a.": "S.A.",
  sas: "S.A.S.",
  "s.a.s.": "S.A.S.",
  srl: "S.R.L.",
  "s.r.l.": "S.R.L.",
};

/** Normaliza una razón social solo para su presentación en pantalla. */
export function formatBusinessName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => {
      const normalizedWord = word.toLocaleLowerCase("es-AR");
      const legalSuffix = LEGAL_SUFFIXES[normalizedWord];

      if (legalSuffix) return legalSuffix;
      return normalizedWord.charAt(0).toLocaleUpperCase("es-AR") + normalizedWord.slice(1);
    })
    .join(" ");
}
