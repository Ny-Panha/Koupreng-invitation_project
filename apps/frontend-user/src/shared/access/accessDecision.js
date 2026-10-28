/** @typedef {'ALLOWED'|'NOT_AUTHENTICATED'|'EVENT_PERMISSION_REQUIRED'|'EVENT_OWNER_ONLY'|'PACKAGE_FEATURE_REQUIRED'|'PACKAGE_LIMIT_REACHED'|'TEMPLATE_PURCHASE_OR_PACKAGE_REQUIRED'|'TEMPLATE_INCOMPATIBLE'|'SUBSCRIPTION_UNVERIFIED'|'PLAN_CATALOG_UNAVAILABLE'|'EVENT_UNAVAILABLE'|'FEATURE_DISABLED_OR_UNSUPPORTED'|'VALIDATION_REQUIRED'|'CONFLICT'|'RATE_LIMITED'|'NETWORK_ERROR'} AccessReason */
export const FEATURES = Object.freeze(['PREMIUM_TEMPLATES','QR_INVITATIONS','QR_CHECK_IN','SEATING','ADVANCED_ANALYTICS','CUSTOM_BRANDING','TEAM_MEMBERS','AI_ASSISTANT','GUEST_IMPORT','PRE_WEDDING_VIDEO','COUPLE_MONOGRAM','ILLUSTRATED_VENUE_MAP']);
const limitFields = { invitations: 'maxInvitations', guests: 'maxGuests', guestsPerInvitation: 'maxGuestsPerInvitation', teamMembers: 'maxTeamMembers' };

/** @returns {{reason: AccessReason, feature?: string, quota?: object}} */
export function accessDecision({ authenticated = true, event, permission, ownerOnly = false, supported = true, templateCompatible = true, feature, account, quota, additional = 1 } = {}) {
  if (!authenticated) return { reason: 'NOT_AUTHENTICATED' };
  if (event && !event.access) return { reason: 'EVENT_UNAVAILABLE' };
  if (event && ownerOnly && !event.access.owner) return { reason: 'EVENT_OWNER_ONLY' };
  if (event && permission && !event.access.owner && !event.access.permissions?.includes(permission)) return { reason: 'EVENT_PERMISSION_REQUIRED' };
  if (!supported) return { reason: 'FEATURE_DISABLED_OR_UNSUPPORTED' };
  if (!templateCompatible) return { reason: 'TEMPLATE_INCOMPATIBLE' };
  if (feature && !FEATURES.includes(feature)) return { reason: 'FEATURE_DISABLED_OR_UNSUPPORTED' };
  if (feature && !event && !account?.verified) return { reason: 'SUBSCRIPTION_UNVERIFIED' };
  if (feature && event && !Array.isArray(event.access.ownerFeatures)) return { reason: 'SUBSCRIPTION_UNVERIFIED' };
  const features = event ? event.access.ownerFeatures : account?.value?.features;
  if (feature && !features?.includes(feature)) return { reason: 'PACKAGE_FEATURE_REQUIRED', feature };
  if (quota?.limit != null && Number(quota.used) + additional > Number(quota.limit)) return { reason: 'PACKAGE_LIMIT_REACHED', feature, quota };
  return { reason: 'ALLOWED' };
}

export function accessFailure(error, context = {}) {
  const status = Number(error?.status || error?.response?.status || 0);
  const data = error?.data || error?.response?.data || {};
  const code = error?.code || data.code || data.error?.code;
  const details = error?.details || data.details || data.error?.details || {};
  if (status === 401) return { reason: 'NOT_AUTHENTICATED' };
  if (status === 404) return { reason: 'EVENT_UNAVAILABLE' };
  if (status === 409) return { reason: 'CONFLICT' };
  if (status === 429) return { reason: 'RATE_LIMITED' };
  if ([400,422].includes(status)) return { reason: 'VALIDATION_REQUIRED' };
  if (status === 403) {
    const permission = accessDecision({ ...context, feature: undefined });
    if (['EVENT_OWNER_ONLY','EVENT_PERMISSION_REQUIRED','EVENT_UNAVAILABLE','FEATURE_DISABLED_OR_UNSUPPORTED'].includes(permission.reason)) return permission;
    if (code === 'PACKAGE_FEATURE_REQUIRED') return { reason: details.templateId ? 'TEMPLATE_PURCHASE_OR_PACKAGE_REQUIRED' : 'PACKAGE_FEATURE_REQUIRED', feature: details.feature || context.feature };
    if (code === 'PACKAGE_LIMIT_REACHED') return { reason: 'PACKAGE_LIMIT_REACHED', feature: context.feature, quota: details };
    // A generic 403 is never evidence that buying a package will fix access.
    return { reason: 'EVENT_PERMISSION_REQUIRED' };
  }
  return { reason: 'NETWORK_ERROR' };
}

export function eligiblePlans(plans, { feature, quota, currentPlan, usage } = {}) {
  const field = limitFields[quota?.resource];
  return (Array.isArray(plans) ? plans : []).filter(plan => {
    if (plan.purchasable !== true || !Number.isSafeInteger(Number(plan.id)) || Number(plan.id) <= 0
      || plan.price == null || !Number.isFinite(Number(plan.price)) || Number(plan.price) < 0
      || !/^[A-Z]{3}$/.test(plan.currency || '') || Number(plan.id) === Number(currentPlan?.id)) return false;
    if (feature && (!FEATURES.includes(feature) || !plan.eligibleFeatures?.includes(feature))) return false;
    for (const [resource, used] of Object.entries(usage || {})) {
      const capacity = limitFields[resource];
      if (capacity && used?.used != null && plan[capacity] !== null && (plan[capacity] == null || Number(plan[capacity]) < Number(used.used))) return false;
    }
    if (quota) {
      if (!field || quota.used == null || quota.limit == null) return false;
      const next = plan[field];
      return next === null || (next != null && Number(next) > Number(quota.limit) && Number(next) >= Number(quota.used) + Number(quota.requested ?? 1));
    }
    return Boolean(feature);
  });
}

export function safeReturnTo(value) {
  if (typeof value !== 'string' || !/^\/(?!\/)/.test(value)) return '/app/events';
  try {
    const url = new URL(value, 'https://koupreng.invalid');
    if (url.origin !== 'https://koupreng.invalid' || !/^\/(app(?:\/|$)|templates(?:\/|$))/.test(url.pathname)) return '/app/events';
    return url.pathname + url.search + url.hash;
  } catch { return '/app/events'; }
}
