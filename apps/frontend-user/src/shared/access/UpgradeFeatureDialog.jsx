import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Check, Crown, LockKeyhole, MapPinned, ShieldCheck } from 'lucide-react';
import Modal from '../ui/Modal';
import { CardGridSkeleton } from '../ui/LoadingState';
import { useLanguageStore } from '@/stores/useLanguageStore';
import subscriptionService from '@/features/subscriptions/subscriptionService';
import { eligiblePlans, FEATURES, safeReturnTo } from './accessDecision';
import { accessTitle, featureNames, quotaNames } from './accessCopy';
import './access.css';

function VenueMapPreview() {
  return <svg className="access-map-preview" viewBox="0 0 210 130" aria-hidden="true" focusable="false">
    <rect x="1" y="1" width="208" height="128" rx="13" fill="#102c4c"/>
    <rect x="8" y="8" width="194" height="114" rx="8" fill="none" stroke="#9b8050"/>
    <path d="M22 94h132V42" fill="none" stroke="#d5b575" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 94h132V42" fill="none" stroke="#102c4c" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 94h132V42" fill="none" stroke="#e9d3a3" strokeWidth="1" strokeDasharray="4 5"/>
    <path d="m86 90 8 4-8 4" fill="none" stroke="#f4e3bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <g fill="none" stroke="#e9d3a3" strokeWidth="1.8" strokeLinejoin="round"><path d="m137 32 17-12 17 12v18h-34V32Zm11 18V38h12v12M35 60h29l-15-10-14 10Zm4 0v16h21V60M32 76h34"/><rect x="89" y="47" width="18" height="21" rx="3"/><path d="M95 63V52h4a3 3 0 0 1 0 6h-4"/></g>
  </svg>;
}

export default function UpgradeFeatureDialog({ request, onClose }) {
  const en = useLanguageStore(state => state.lang) === 'en';
  const L = (km, english) => en ? english : km;
  const location = useLocation();
  const decision = request.decision;
  const feature = decision.feature || request.feature;
  const quota = decision.quota || request.quota;
  const collaborator = request.event?.access?.owner === false;
  const offer = !collaborator && ['PACKAGE_FEATURE_REQUIRED','PACKAGE_LIMIT_REACHED','TEMPLATE_PURCHASE_OR_PACKAGE_REQUIRED'].includes(decision.reason);
  const mapOffer = offer && feature === 'ILLUSTRATED_VENUE_MAP';
  const [state, setState] = useState({ loading: offer, plans: [], current: null, failed: false });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!offer) return;
    let active = true;
    setState({ loading: true, plans: [], current: null, failed: false });
    Promise.all([subscriptionService.publicPackages(), subscriptionService.entitlements({ suppressAuthRedirect: true })]).then(([plans, current]) => {
      if (active) setState({ loading: false, plans: Array.isArray(plans) ? plans : [], current, failed: !current?.packagePlan || !Array.isArray(current?.features) });
    }).catch(() => { if (active) setState({ loading: false, plans: [], current: null, failed: true }); });
    return () => { active = false; };
  }, [offer, revision]);
  const returnTo = safeReturnTo(request.returnTo || location.pathname + location.search + location.hash);
  const context = new URLSearchParams({ returnTo });
  if (FEATURES.includes(feature)) context.set('feature', feature);
  if (quotaNames[quota?.resource]) context.set('resource', quota.resource);
  const compare = `/app/packages?${context}`;
  const alreadyEnabled = !quota && state.current?.features?.includes(feature);
  const plans = alreadyEnabled ? [] : eligiblePlans(state.plans, { feature, quota, currentPlan: state.current?.packagePlan, usage: { ...state.current?.quotas, ...request.event?.access?.quotas } });
  const permission = ['EVENT_OWNER_ONLY','EVENT_PERMISSION_REQUIRED'].includes(decision.reason);
  const name = (featureNames[feature] || [feature, feature])[en ? 1 : 0];
  const purchase = offer && request.template?.checkoutEligible === true && request.template?.checkoutAmount > 0 && /^[A-Z]{3}$/.test(request.template.checkoutCurrency || '');
  const billing = { MONTHLY:L('ប្រចាំខែ','Monthly'),YEARLY:L('ប្រចាំឆ្នាំ','Yearly'),CUSTOM:L('រយៈពេលផ្ទាល់ខ្លួន','Custom term'),ONE_TIME:L('បង់ម្តង','One-time') };
  return <Modal isOpen onClose={onClose} title={mapOffer ? L('រចនាផែនទីពិសេស','Premium Map Designer') : accessTitle(decision.reason, en)} size="lg" className={`access-dialog ${offer ? 'access-upgrade-dialog' : ''}`}
    footer={<div className="access-actions"><button type="button" onClick={onClose}>{L('មិនមែនឥឡូវនេះ','Not now')}</button>{offer && !state.failed && !state.loading && plans.length > 0 && <Link to={compare} onClick={onClose}>{L('ប្រៀបធៀបកញ្ចប់','Compare packages')}</Link>}</div>}>
    {mapOffer ? <div className="access-map-intro"><div><h3>{L('ជួយភ្ញៀវរកទីតាំងបានងាយ','Make your venue easy to find')}</h3><p>{L('ផ្លូវ សញ្ញាសម្គាល់ និងអក្សរខ្មែរ ឬអង់គ្លេស។ សម្រាប់ Pro ឬ Premium។','Roads, landmarks and Khmer or English labels. Available with Pro or Premium.')}</p></div><VenueMapPreview/></div> : <div className="access-heading"><span aria-hidden="true">{permission ? <ShieldCheck /> : <LockKeyhole />}</span><div>{name && <h3>{name}</h3>}
      <p>{permission ? L('សិទ្ធិក្រុមរបស់អ្នកមិនអនុញ្ញាតសកម្មភាពនេះទេ។ សូមទាក់ទងម្ចាស់កម្មវិធី ដើម្បីពិនិត្យសិទ្ធិ។ ការជាវកញ្ចប់មិនផ្ដល់សិទ្ធិចូលកម្មវិធីទេ។','Your event role does not allow this action. Ask the event owner to review your access. Buying a package does not grant event permission.')
        : collaborator ? L('មុខងារនេះអាស្រ័យលើកញ្ចប់របស់ម្ចាស់កម្មវិធី។ សូមទាក់ទងម្ចាស់កម្មវិធី។ កញ្ចប់ផ្ទាល់ខ្លួនរបស់អ្នកមិនអាចផ្លាស់ប្ដូរសិទ្ធិនេះបានទេ។','This feature follows the event owner’s package. Contact the owner; upgrading your own account cannot unlock this shared event.')
        : offer ? null
        : decision.reason === 'NOT_AUTHENTICATED' ? L('ការកែប្រែរបស់អ្នកនៅតែនៅទីនេះ។ រក្សាច្បាប់ចម្លងសិន ហើយចូលប្រើម្ដងទៀត។','Your edits remain here. Keep a recovery copy, then sign in again.')
        : L('មិនទាន់អាចផ្ទៀងផ្ទាត់សិទ្ធិនេះបានទេ។ ការកែប្រែរបស់អ្នកត្រូវបានរក្សាដដែល។','This access cannot currently be verified. Your edits have been preserved.')}</p></div></div>}
    {quota?.used != null && quota?.limit != null && <p className="access-quota">{(quotaNames[quota.resource] || [quota.resource,quota.resource])[en ? 1 : 0]}: <strong>{quota.used} / {quota.limit}</strong> · {quota.scope === 'EVENT' ? L('ក្នុងកម្មវិធីនេះ','This event') : L('ក្នុងគណនី','Account-wide')}</p>}
    {offer && state.loading && <CardGridSkeleton variant="pricing" count={2} label={L('កំពុងពិនិត្យជម្រើសកញ្ចប់…','Checking eligible packages…')}/>}
    {offer && state.failed && <div role="status"><p>{L('មិនអាចផ្ទៀងផ្ទាត់កញ្ចប់ និងស្ថានភាពគណនីបានទេ។ មិនទាន់មានជម្រើសជាវដែលអាចបញ្ជាក់បាន។','Could not verify package options and your current plan. No purchase recommendation is available yet.')}</p><button type="button" onClick={() => setRevision(value => value + 1)}>{L('សាកម្តងទៀត','Try again')}</button></div>}
    {offer && !state.loading && !state.failed && <>
      <div className="access-current"><span>{L('កញ្ចប់បច្ចុប្បន្ន','Current plan')}</span><strong>{state.current?.packagePlan?.packageName}</strong>{state.current?.expiresAt && Number.isFinite(new Date(state.current.expiresAt).getTime()) && <time dateTime={state.current.expiresAt}>{new Date(state.current.expiresAt).toLocaleDateString(en ? 'en-GB' : 'km-KH')}</time>}</div>
      {alreadyEnabled ? <p role="status">{L('កញ្ចប់បច្ចុប្បន្នមានមុខងារនេះរួចហើយ។ សូមបិទប្រអប់ ហើយពិនិត្យសិទ្ធិម្ដងទៀត ឬទាក់ទងជំនួយ។', 'Your current verified plan already includes this feature. Close this dialog and recheck access, or contact support.')}</p> : plans.length ? <div className="access-plan-grid">{plans.map((plan,index) => {
        const query = new URLSearchParams(context); query.set('package', plan.code);
        const benefits = [...new Set([feature,...(plan.eligibleFeatures || [])])].filter(key=>FEATURES.includes(key)&&plan.eligibleFeatures?.includes(key)).slice(0,4);
        const term = [plan.durationDays != null ? `${plan.durationDays} ${L('ថ្ងៃ','days')}` : null,billing[plan.billingInterval] || plan.billingInterval].filter(Boolean).join(' · ');
        return <article className="access-plan" data-recommended={index===0 || undefined} key={plan.id}>
          <div className="access-plan-heading">{mapOffer&&index===0?<MapPinned size={21} aria-hidden="true"/>:<Crown size={21} aria-hidden="true"/>}{index===0 && <span className="access-plan-match">{L('កញ្ចប់ណែនាំ','Suggested plan')}</span>}</div>
          <h3>{plan.packageName}</h3><p className="access-price">{new Intl.NumberFormat(en ? 'en-US' : 'km-KH', { style: 'currency', currency: plan.currency }).format(plan.price)}</p>
          <p className="access-term">{term || L('រយៈពេលមិនបានបញ្ជាក់','Term not specified')}</p>
          <ul className="access-benefits">{benefits.map(key=><li key={key}><Check size={16} aria-hidden="true"/><span>{featureNames[key]?.[en?1:0] || key}</span></li>)}</ul>
          {quota && <p>{(quotaNames[quota.resource] || [quota.resource,quota.resource])[en ? 1 : 0]}: {plan[{ invitations:'maxInvitations', guests:'maxGuests', guestsPerInvitation:'maxGuestsPerInvitation', teamMembers:'maxTeamMembers' }[quota.resource]] ?? L('មិនកំណត់','Unlimited')}</p>}
          <Link to={`/app/packages?${query}`} onClick={onClose}>{L('ជ្រើសរើសកញ្ចប់','Choose package')}<ArrowUpRight size={17} aria-hidden="true"/></Link></article>;
      })}</div> : <p role="status">{L('មិនមានកញ្ចប់សាធារណៈដែលអាចជាវដើម្បីបើកមុខងារនេះទេ។ សូមពិនិត្យម្ដងទៀត ឬទាក់ទងជំនួយ។','No eligible purchasable public package is available. Check again or contact support.')}</p>}
      {purchase && <Link to={`/templates/${encodeURIComponent(request.template.code)}/checkout`} onClick={onClose}>{L('ទិញគំរូនេះ','Purchase this template')} · {new Intl.NumberFormat(en ? 'en-US' : 'km-KH', { style: 'currency', currency: request.template.checkoutCurrency }).format(request.template.checkoutAmount)}</Link>}
      {!plans.length && <button type="button" onClick={() => setRevision(value => value + 1)}>{L('ពិនិត្យម្ដងទៀត','Check again')}</button>}
      <p className="access-note"><ShieldCheck size={16} aria-hidden="true"/>{L('ការទូទាត់ដែលកំពុងរង់ចាំមិនបើកសិទ្ធិទេ។ ត្រូវរង់ចាំការផ្ទៀងផ្ទាត់ និងការបើកសិទ្ធិពីម៉ាស៊ីនមេ។','Pending payments do not unlock features. Access changes only after verified activation on the server.')}</p>
    </>}
    {decision.reason === 'NOT_AUTHENTICATED' && <Link to={`/login?next=${encodeURIComponent(returnTo)}`} onClick={onClose}>{L('ចូលប្រើម្ដងទៀត','Sign in again')}</Link>}
    {!permission && !state.loading && <Link className="access-support" to="/contact" onClick={onClose}>{L('ទាក់ទងជំនួយ','Contact support')}</Link>}
  </Modal>;
}
