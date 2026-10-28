import { describe, expect, it } from 'vitest';
import { accessDecision, accessFailure, eligiblePlans, safeReturnTo } from './accessDecision';
import { ApiError } from '../api/ApiError';

const owner = { access: { owner: true, permissions: ['MANAGE_INVITATION'], ownerFeatures: [] } };
const account = { verified: true, value: { features: [] } };
describe('permissions, benefits, compatibility and capacity have independent reasons', () => {
  it('checks authentication and event permission before commercial restrictions', () => {
    expect(accessDecision({ authenticated: false, event: owner, feature: 'PREMIUM_TEMPLATES' }).reason).toBe('NOT_AUTHENTICATED');
    expect(accessDecision({ event: { access: null }, feature: 'PREMIUM_TEMPLATES' }).reason).toBe('EVENT_UNAVAILABLE');
    expect(accessDecision({ event: { access: { owner: false, permissions: [], ownerFeatures: [] } }, permission: 'MANAGE_INVITATION', feature: 'PREMIUM_TEMPLATES' }).reason).toBe('EVENT_PERMISSION_REQUIRED');
    expect(accessDecision({ event: { access: { owner: false } }, ownerOnly: true }).reason).toBe('EVENT_OWNER_ONLY');
  });
  it('uses owner benefits for an accepted collaborator, ignoring the actor’s paid package', () => {
    const event = { access: { owner: false, permissions: ['MANAGE_INVITATION'], ownerFeatures: [] } };
    const paidActor = { verified: true, value: { features: ['PRE_WEDDING_VIDEO'] } };
    expect(accessDecision({ event, account: paidActor, permission: 'MANAGE_INVITATION', feature: 'PRE_WEDDING_VIDEO' }).reason).toBe('PACKAGE_FEATURE_REQUIRED');
    event.access.ownerFeatures = ['PRE_WEDDING_VIDEO'];
    expect(accessDecision({ event, account, permission: 'MANAGE_INVITATION', feature: 'PRE_WEDDING_VIDEO' }).reason).toBe('ALLOWED');
  });
  it('does not turn unknown plan state, incompatible templates or unsupported features into an upsell', () => {
    expect(accessDecision({ feature: 'SEATING' }).reason).toBe('SUBSCRIPTION_UNVERIFIED');
    expect(accessDecision({ event: { access: { owner: true } }, feature: 'SEATING' }).reason).toBe('SUBSCRIPTION_UNVERIFIED');
    expect(accessDecision({ feature: 'SEATING', supported: false }).reason).toBe('FEATURE_DISABLED_OR_UNSUPPORTED');
    expect(accessDecision({ feature: 'SEATING', templateCompatible: false }).reason).toBe('TEMPLATE_INCOMPATIBLE');
    expect(accessDecision({ feature: 'MADE_UP_FEATURE', account }).reason).toBe('FEATURE_DISABLED_OR_UNSUPPORTED');
  });
  it('separates invitation QR from check-in and keeps unlimited distinct from zero', () => {
    const free = { verified: true, value: { features: ['QR_INVITATIONS'] } };
    expect(accessDecision({ account: free, feature: 'QR_INVITATIONS' }).reason).toBe('ALLOWED');
    expect(accessDecision({ account: free, feature: 'QR_CHECK_IN' }).reason).toBe('PACKAGE_FEATURE_REQUIRED');
    expect(accessDecision({ quota: { limit: null, used: 100 } }).reason).toBe('ALLOWED');
    expect(accessDecision({ quota: { limit: 0, used: 0 } }).reason).toBe('PACKAGE_LIMIT_REACHED');
  });
  it.each([[401,'NOT_AUTHENTICATED'],[403,'EVENT_PERMISSION_REQUIRED'],[404,'EVENT_UNAVAILABLE'],[409,'CONFLICT'],[422,'VALIDATION_REQUIRED'],[429,'RATE_LIMITED'],[500,'NETWORK_ERROR'],[0,'NETWORK_ERROR']])('classifies HTTP %s without losing its original status', (status, reason) => {
    const error = new ApiError('Safe server message', status, { code: 'AUTH_FORBIDDEN' });
    expect(accessFailure(error).reason).toBe(reason); expect(error.status).toBe(status);
  });
  it('recognizes only explicit server commercial codes and preserves exact quota metadata', () => {
    const quota = { resource: 'guestsPerInvitation', scope: 'EVENT', limit: 20, used: 20, requested: 2 };
    expect(accessFailure(new ApiError('Limit',403,{ code:'PACKAGE_LIMIT_REACHED', details:quota }))).toEqual({ reason:'PACKAGE_LIMIT_REACHED', feature:undefined, quota });
    expect(accessFailure(new ApiError('Premium',403,{ code:'PACKAGE_FEATURE_REQUIRED', details:{ feature:'PREMIUM_TEMPLATES',templateId:14 } })).reason).toBe('TEMPLATE_PURCHASE_OR_PACKAGE_REQUIRED');
    expect(accessFailure(new ApiError('Premium access required',403,{})).reason).toBe('EVENT_PERMISSION_REQUIRED');
  });
});

describe('server-projected eligible upgrades', () => {
  const basic = { id: 1, code: 'BASIC', price: .01, currency: 'USD', purchasable: true, eligibleFeatures: ['QR_INVITATIONS','GUEST_IMPORT'], maxGuests: 3, maxGuestsPerInvitation: 3, maxInvitations: 1 };
  const pro = { id: 2, code: 'PRO', price: 199, currency: 'USD', purchasable: true, eligibleFeatures: ['PREMIUM_TEMPLATES','QR_CHECK_IN','GUEST_IMPORT'], maxGuests: 2000, maxGuestsPerInvitation: 500, maxInvitations: 20 };
  const premium = { ...pro, id: 3, code: 'PREMIUM', price: 499, eligibleFeatures: [...pro.eligibleFeatures,'PRE_WEDDING_VIDEO'], maxGuestsPerInvitation: 5000, maxInvitations: 999 };
  it('never infers features from a marketing name, price or flag', () => {
    expect(eligiblePlans([{ ...premium, eligibleFeatures: undefined, premiumTemplatesEnabled: true }],{ feature:'PRE_WEDDING_VIDEO' })).toEqual([]);
    expect(eligiblePlans([basic,pro,premium],{ feature:'PRE_WEDDING_VIDEO' })).toEqual([premium]);
    expect(eligiblePlans([basic,pro,premium],{ feature:'QR_CHECK_IN' })).toEqual([pro,premium]);
  });
  it('excludes unavailable checkout, invalid currency, current plans and insufficient quotas', () => {
    const quota = { resource:'guestsPerInvitation', limit:20, used:20, requested:10 };
    expect(eligiblePlans([basic,pro,premium],{ quota })).toEqual([pro,premium]);
    expect(eligiblePlans([{ ...pro, purchasable:false },{ ...premium,currency:null }],{ quota })).toEqual([]);
    expect(eligiblePlans([pro,premium],{ feature:'QR_CHECK_IN',currentPlan:pro })).toEqual([premium]);
  });
  it('never recommends a capacity downgrade below existing actual record usage', () => {
    expect(eligiblePlans([basic,pro,premium],{ feature:'GUEST_IMPORT', usage:{ guests:{used:15,limit:20},invitations:{used:1,limit:1} } })).toEqual([pro,premium]);
    expect(eligiblePlans([{ ...pro,maxGuests:null }],{ feature:'GUEST_IMPORT',usage:{ guests:{used:10000,limit:20000} } })).toHaveLength(1);
    expect(eligiblePlans([pro],{ quota:{ resource:'guests',limit:null,used:200 } })).toEqual([]);
  });
  it.each(['https://evil.example/app/events','//evil.example/app/events','/\\evil.example','/login','/app/../../evil'])('rejects unsafe return context %s', value => { expect(safeReturnTo(value)).toBe('/app/events'); });
  it('preserves a validated internal event return route', () => { expect(safeReturnTo('/app/events/101/invitation?section=venue')).toBe('/app/events/101/invitation?section=venue'); });
});
