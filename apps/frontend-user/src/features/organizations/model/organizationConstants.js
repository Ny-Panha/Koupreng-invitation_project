export const ORGANIZATION_ROLES = [
  { value: "MANAGER", label: "Manager", labelKm: "អ្នកគ្រប់គ្រង", description: "Full workspace & team access", descriptionKm: "សិទ្ធិគ្រប់គ្រងកន្លែងធ្វើការ និងក្រុមទាំងមូល" },
  { value: "DESIGNER", label: "Designer", labelKm: "អ្នករចនា", description: "Template & invitation builder access", descriptionKm: "សិទ្ធិប្រើគំរូ និងឧបករណ៍បង្កើតធៀបអញ្ជើញ" },
  { value: "CHECK_IN_STAFF", label: "Check-in Staff", labelKm: "បុគ្គលិកកត់ត្រាវត្តមាន", description: "Guest check-in & QR scanner access", descriptionKm: "សិទ្ធិកត់ត្រាវត្តមានភ្ញៀវ និងប្រើឧបករណ៍ស្កេនកូដ" },
  { value: "VIEWER", label: "Viewer", labelKm: "អ្នកមើល", description: "Read-only access", descriptionKm: "អាចមើលទិន្នន័យតែប៉ុណ្ណោះ" },
  { value: "MEMBER", label: "Member", labelKm: "សមាជិក", description: "Standard team member", descriptionKm: "សមាជិកក្រុមធម្មតា" },
];

export const ROLE_VARIANTS = {
  OWNER: "primary",
  MANAGER: "info",
  ADMIN: "info",
  DESIGNER: "warning",
  CHECK_IN_STAFF: "success",
  VIEWER: "neutral",
  MEMBER: "neutral",
};
