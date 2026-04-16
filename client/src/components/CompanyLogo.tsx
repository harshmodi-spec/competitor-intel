import logo1Finance from "@/assets/logos/1finance.png";
import logoAssetPlus from "@/assets/logos/AssetPlus.png";
import logoCentricityWealth from "@/assets/logos/CentricityWealth.png";
import logoFundsIndia from "@/assets/logos/FundsIndia.png";
import logoPowerUp from "@/assets/logos/PowerUp.png";
import logoScripBox from "@/assets/logos/ScripBox.png";
import logoWaterfield from "@/assets/logos/Waterfield.png";
import logoCred from "@/assets/logos/cred.png";
import logoDezerv from "@/assets/logos/dezerv.png";
import logoIndMoney from "@/assets/logos/indmoney.png";
import logoIonicWealth from "@/assets/logos/ionicwealth.png";

const LOGO_MAP: Record<string, string> = {
  "1finance": logo1Finance,
  "assetplus": logoAssetPlus,
  "centricitywealth": logoCentricityWealth,
  "fundsindia": logoFundsIndia,
  "powerup": logoPowerUp,
  "powerupmoney": logoPowerUp,
  "scripbox": logoScripBox,
  "waterfield": logoWaterfield,
  "waterfieldadvisors": logoWaterfield,
  "cred": logoCred,
  "dezerv": logoDezerv,
  "indmoney": logoIndMoney,
  "ionicwealth": logoIonicWealth,
};

function normalize(name: string): string {
  return name.toLowerCase().replace(/[\s\-_\.&']+/g, "");
}

export function getCompanyLogo(displayName: string): string | null {
  const key = normalize(displayName);
  return LOGO_MAP[key] ?? null;
}

interface CompanyLogoProps {
  displayName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-7 h-7 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-lg",
};

export function CompanyLogo({ displayName, size = "md", className = "" }: CompanyLogoProps) {
  const logoSrc = getCompanyLogo(displayName);
  const sizeClass = SIZE_CLASSES[size];
  const initials = displayName
    .split(/[\s\-_]+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  if (logoSrc) {
    return (
      <div className={`${sizeClass} rounded-lg overflow-hidden bg-white flex items-center justify-center border border-border shrink-0 ${className}`}>
        <img
          src={logoSrc}
          alt={`${displayName} logo`}
          className="w-full h-full object-contain p-1"
          onError={(e) => {
            // Fallback to initials on img error
            const el = e.currentTarget;
            el.style.display = "none";
            const parent = el.parentElement;
            if (parent) {
              parent.style.background = "oklch(0.22 0.008 260)";
              parent.innerHTML = `<span style="font-weight:700;color:oklch(0.65 0.18 250)">${initials}</span>`;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-lg bg-primary/10 flex items-center justify-center border border-border shrink-0 ${className}`}>
      <span className="font-bold text-primary">{initials}</span>
    </div>
  );
}