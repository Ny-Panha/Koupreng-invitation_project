export const featureNames = {
  PREMIUM_TEMPLATES: ['គំរូបុព្វលាភ','Premium templates'], QR_INVITATIONS: ['QR ធៀបអញ្ជើញ','Invitation QR'],
  QR_CHECK_IN: ['ការកត់ត្រាវត្តមានតាម QR','QR check-in'], SEATING: ['ការរៀបចំកន្លែងអង្គុយ','Seating'],
  ADVANCED_ANALYTICS: ['របាយការណ៍កម្រិតខ្ពស់','Advanced analytics'], CUSTOM_BRANDING: ['អត្តសញ្ញាណផ្ទាល់ខ្លួន','Custom branding'],
  TEAM_MEMBERS: ['សមាជិកក្រុម','Team members'], AI_ASSISTANT: ['ជំនួយការ AI','AI assistant'], GUEST_IMPORT: ['ការនាំចូលភ្ញៀវ','Guest import'],
  PRE_WEDDING_VIDEO: ['វីដេអូមុនពិធីមង្គលការ','Pre-wedding video'], COUPLE_MONOGRAM: ['អក្សរកាត់គូស្វាមីភរិយា','Couple monogram'], ILLUSTRATED_VENUE_MAP: ['ផែនទីគំនូរទីតាំង','Illustrated venue map'],
};
export const quotaNames = { invitations: ['កម្មវិធី','Invitations'], guests: ['កំណត់ត្រាភ្ញៀវក្នុងគណនី','Account guest records'], guestsPerInvitation: ['កំណត់ត្រាភ្ញៀវក្នុងកម្មវិធី','Event guest records'], teamMembers: ['សមាជិកក្រុម','Team members'] };
export function accessTitle(reason, en) {
  const names = {
    NOT_AUTHENTICATED: ['សូមចូលប្រើម្ដងទៀត','Sign in again'],
    EVENT_PERMISSION_REQUIRED: ['ត្រូវការសិទ្ធិរបស់កម្មវិធី','Event permission required'], EVENT_OWNER_ONLY: ['សម្រាប់ម្ចាស់កម្មវិធី','Event owner action'],
    PACKAGE_FEATURE_REQUIRED: ['ជ្រើសរើសកញ្ចប់ដែលគាំទ្រមុខងារនេះ','Explore eligible packages'], PACKAGE_LIMIT_REACHED: ['បានដល់កម្រិតកញ្ចប់','Package limit reached'],
    TEMPLATE_PURCHASE_OR_PACKAGE_REQUIRED: ['សិទ្ធិប្រើគំរូ','Template access'], TEMPLATE_INCOMPATIBLE: ['គំរូមិនគាំទ្រជម្រើសនេះ','Incompatible template'],
    SUBSCRIPTION_UNVERIFIED: ['មិនទាន់អាចផ្ទៀងផ្ទាត់កញ្ចប់','Plan not verified'], PLAN_CATALOG_UNAVAILABLE: ['មិនអាចផ្ទុកកញ្ចប់','Packages unavailable'],
    EVENT_UNAVAILABLE: ['មិនអាចបើកកម្មវិធី','Event unavailable'], FEATURE_DISABLED_OR_UNSUPPORTED: ['មុខងារមិនអាចប្រើបាន','Feature unavailable'],
  };
  return (names[reason] || names.FEATURE_DISABLED_OR_UNSUPPORTED)[en ? 1 : 0];
}
