import { useMemo, useState } from "react";
import { toCanonicalName } from "@/lib/companyNormalization";
import { getLogoUrl } from "@/lib/companyLogos";

interface CompanyLogoProps {
  displayName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export function CompanyLogo({ displayName, size = "md", className = "" }: CompanyLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const canonical = toCanonicalName(displayName);
  const logoSrc = useMemo(() => getLogoUrl(canonical), [canonical]);
  const initials = canonical
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className={`${SIZE_CLASSES[size]} rounded-lg border border-border bg-white p-1 shrink-0 flex items-center justify-center ${className}`}>
      {logoSrc && !imgFailed ? (
        <img
          src={logoSrc}
          alt={`${canonical} logo`}
          className="w-full h-full object-contain"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="font-semibold text-primary">{initials || "?"}</span>
      )}
    </div>
  );
}
