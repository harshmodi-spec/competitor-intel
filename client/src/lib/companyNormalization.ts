export const WEALTH_GROUP = [
  "1 Finance",
  "CRED",
  "Ionic Wealth",
  "Dezerv",
  "IND Money",
  "Waterfield",
  "Asset Plus",
  "ScripBox",
  "FundsIndia",
  "PowerUp Money",
  "Centricity Wealth",
] as const;

export const P2P_GROUP = [
  "1 Finance",
  "LendenClub",
  "Faircent",
  "Lendbox",
] as const;

const CANONICALS = Array.from(new Set([...WEALTH_GROUP, ...P2P_GROUP]));

const ALIAS_TO_CANONICAL: Record<string, string> = {
  "1finance": "1 Finance",
  "onefinance": "1 Finance",
  "cred": "CRED",
  "ionicwealth": "Ionic Wealth",
  "dezerv": "Dezerv",
  "indmoney": "IND Money",
  "scripbox": "ScripBox",
  "assetplus": "Asset Plus",
  "powerup": "PowerUp Money",
  "powerupmoney": "PowerUp Money",
  "waterfield": "Waterfield",
  "fundsindia": "FundsIndia",
  "centricitywealth": "Centricity Wealth",
  "lenclub": "LendenClub",
  "lendenclub": "LendenClub",
  "lenden club": "LendenClub",
  "faircent": "Faircent",
  "lendbox": "Lendbox",
};

export function normalizeCompanyKey(name: string): string {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function toCanonicalName(input: string): string {
  const raw = String(input || "").trim();
  if (!raw) return "Unknown Company";

  const key = normalizeCompanyKey(raw);
  if (ALIAS_TO_CANONICAL[key]) return ALIAS_TO_CANONICAL[key];

  const direct = CANONICALS.find((c) => normalizeCompanyKey(c) === key);
  return direct || raw;
}

export function getPeerGroups(canonicalName: string): Array<"wealth_management" | "p2p_lending"> {
  const groups: Array<"wealth_management" | "p2p_lending"> = [];
  if (WEALTH_GROUP.includes(canonicalName as (typeof WEALTH_GROUP)[number])) groups.push("wealth_management");
  if (P2P_GROUP.includes(canonicalName as (typeof P2P_GROUP)[number])) groups.push("p2p_lending");
  return groups;
}

export function isStrictPeerCompany(canonicalName: string): boolean {
  return getPeerGroups(canonicalName).length > 0;
}

export function registerAlias(alias: string, canonicalName: string): void {
  const aliasKey = normalizeCompanyKey(alias);
  if (!aliasKey) return;
  ALIAS_TO_CANONICAL[aliasKey] = canonicalName;
}
