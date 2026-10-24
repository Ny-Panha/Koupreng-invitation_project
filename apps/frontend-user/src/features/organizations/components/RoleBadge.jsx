import { StatusBadge } from "@/shared/ui";
import { ORGANIZATION_ROLES, ROLE_VARIANTS } from "../model/organizationConstants";
import { useUiCopy } from "@/shared/i18n/useUiCopy";

export default function RoleBadge({ role, className = "" }) {
  const copy = useUiCopy();
  const normalized = (role || "VIEWER").toUpperCase();
  const variant = ROLE_VARIANTS[normalized] || "neutral";
  const khmer = ORGANIZATION_ROLES.find(item => item.value === normalized)?.labelKm || ({ OWNER: "ម្ចាស់", ADMIN: "អ្នកគ្រប់គ្រង" })[normalized] || "សមាជិក";
  const displayLabel = copy(khmer, normalized.replace(/_/g, " "));

  return <StatusBadge status={normalized} label={displayLabel} variant={variant} className={className} />;
}
