import { toCanonicalName } from "@/lib/companyNormalization";

const COMPANY_DOMAINS: Record<string, string> = {
  "1 Finance": "1finance.co.in",
  CRED: "cred.club",
  "Ionic Wealth": "ionicwealth.com",
  Dezerv: "dezerv.in",
  "IND Money": "indmoney.com",
  Waterfield: "waterfieldadvisors.com",
  "Asset Plus": "assetplus.in",
  ScripBox: "scripbox.com",
  FundsIndia: "fundsindia.com",
  "PowerUp Money": "powerup.money",
  "Centricity Wealth": "centricitywealth.tech",
  LendenClub: "lendenclub.com",
  Faircent: "faircent.com",
  Lendbox: "lendbox.in",
};

export function getLogoUrl(companyName: string): string | null {
  const canonical = toCanonicalName(companyName);
  const domain = COMPANY_DOMAINS[canonical];
  return domain ? `https://logo.clearbit.com/${domain}` : null;
}
