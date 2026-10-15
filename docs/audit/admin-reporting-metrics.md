# Admin reporting KPI dictionary

Version: `2026-10-15.1`. Source of truth: `AdminReportCatalog.METRICS`; generated from the verified isolated fixture definitions. Rates are fractions; currency amounts are never summed across USD/KHR.

## paidUsers

គណនីមានប្រាក់ទទួលបានផ្ទៀងផ្ទាត់ / Accounts with positive verified receipts

| Field | Definition |
| --- | --- |
| definition | Payment classification of the selected registration cohort; not an entitlement/free-plan label |
| calculation | COUNT users with at least one lifetime MATCHED order with confirmedReceipt>0; noVerifiedReceiptUsers is the complementary cohort count |
| databaseSource | users LEFT JOIN unified matched payment ledger |
| dateDimension | User registration cohort; lifetime verified purchase history |
| includedStatuses | Nondeleted accounts; positive trusted matched cash |
| excludedStatuses | Zero-value orders, free entitlement alone, pending, duplicate and unverified payment claims |
| denominator | none |
| currencyBehavior | Positive receipt in either explicit currency; no currency amounts added |
| missingDataBehavior | No positive verified receipt does not prove a free plan or absence of unverified claims |
| version | 2026-10-15.1 |

## totalUsers

អ្នកប្រើប្រាស់សរុប / Registered users

| Field | Definition |
| --- | --- |
| definition | Registered users |
| calculation | COUNT nondeleted users |
| databaseSource | users |
| dateDimension | Generation snapshot |
| includedStatuses | Nondeleted accounts |
| excludedStatuses | Deleted |
| denominator | none |
| currencyBehavior | Not monetary |
| missingDataBehavior | Zero means no matching persisted records; unavailable is null |
| version | 2026-10-15.1 |

## activeUsers

គណនីបានបើក / Enabled accounts

| Field | Definition |
| --- | --- |
| definition | Enabled accounts |
| calculation | COUNT status=ACTIVE AND deleted=false; not DAU |
| databaseSource | users |
| dateDimension | Generation snapshot |
| includedStatuses | ACTIVE |
| excludedStatuses | Disabled/deleted |
| denominator | none |
| currencyBehavior | Not monetary |
| missingDataBehavior | Zero means no matching persisted records; unavailable is null |
| version | 2026-10-15.1 |

## inactiveUsers

គណនីបិទ / Disabled accounts

| Field | Definition |
| --- | --- |
| definition | Disabled accounts |
| calculation | Nondeleted total minus enabled accounts |
| databaseSource | users |
| dateDimension | Generation snapshot |
| includedStatuses | Non-ACTIVE |
| excludedStatuses | Deleted |
| denominator | none |
| currencyBehavior | Not monetary |
| missingDataBehavior | Zero means no matching persisted records; unavailable is null |
| version | 2026-10-15.1 |

## totalInvitations

ធៀបការសរុប / Invitations in cohort

| Field | Definition |
| --- | --- |
| definition | Invitations in cohort |
| calculation | COUNT filtered nondeleted invitations |
| databaseSource | invitations |
| dateDimension | Selected invitation dimension; createdAt for executive |
| includedStatuses | All publication states |
| excludedStatuses | Deleted |
| denominator | none |
| currencyBehavior | Not monetary |
| missingDataBehavior | Zero means no matching persisted records; unavailable is null |
| version | 2026-10-15.1 |

## publishedInvitations

ធៀបការបានផ្សាយ / Published invitations

| Field | Definition |
| --- | --- |
| definition | Published invitations |
| calculation | COUNT status=PUBLISHED |
| databaseSource | invitations |
| dateDimension | Selected invitation dimension |
| includedStatuses | PUBLISHED |
| excludedStatuses | Deleted / other publication states |
| denominator | none |
| currencyBehavior | Not monetary |
| missingDataBehavior | Zero means no matching persisted records; unavailable is null |
| version | 2026-10-15.1 |

## draftInvitations

ធៀបការព្រាង / Draft invitations

| Field | Definition |
| --- | --- |
| definition | Draft invitations |
| calculation | COUNT status=DRAFT |
| databaseSource | invitations |
| dateDimension | Selected invitation dimension |
| includedStatuses | DRAFT |
| excludedStatuses | Deleted / other publication states |
| denominator | none |
| currencyBehavior | Not monetary |
| missingDataBehavior | Zero means no matching persisted records; unavailable is null |
| version | 2026-10-15.1 |

## archivedInvitations

ធៀបការទុកបណ្ណសារ / Archived invitations

| Field | Definition |
| --- | --- |
| definition | Archived invitations |
| calculation | COUNT status=ARCHIVED |
| databaseSource | invitations |
| dateDimension | Selected invitation dimension |
| includedStatuses | ARCHIVED |
| excludedStatuses | Deleted / other publication states |
| denominator | none |
| currencyBehavior | Not monetary |
| missingDataBehavior | Zero means no matching persisted records; unavailable is null |
| version | 2026-10-15.1 |

## totalTemplates

គំរូសរុប / Catalog templates

| Field | Definition |
| --- | --- |
| definition | Catalog templates |
| calculation | COUNT templates |
| databaseSource | templates |
| dateDimension | Generation snapshot |
| includedStatuses | All activation states |
| excludedStatuses | none |
| denominator | none |
| currencyBehavior | Not monetary |
| missingDataBehavior | Zero means no matching persisted records; unavailable is null |
| version | 2026-10-15.1 |

## totalGuests

ភ្ញៀវមានសិទ្ធិ / Eligible invited guests

| Field | Definition |
| --- | --- |
| definition | Eligible invited guests |
| calculation | COUNT persisted guest identities in filtered nondeleted event cohort |
| databaseSource | guests JOIN invitations |
| dateDimension | Selected invitation cohort, current guest snapshot |
| includedStatuses | Persisted guest identities |
| excludedStatuses | Deleted events |
| denominator | none |
| currencyBehavior | Not monetary |
| missingDataBehavior | Zero means no matching persisted records; unavailable is null |
| version | 2026-10-15.1 |

## totalRsvps

ភ្ញៀវបានឆ្លើយ / Guest-linked responses

| Field | Definition |
| --- | --- |
| definition | Guest-linked responses |
| calculation | COUNT latest valid response per eligible guest |
| databaseSource | rsvps JOIN guests ON guest_id AND invitation_id |
| dateDimension | Selected invitation cohort, current response snapshot |
| includedStatuses | ATTENDING, NOT_ATTENDING, MAYBE |
| excludedStatuses | Anonymous, cross-invitation, duplicate older responses |
| denominator | none |
| currencyBehavior | Not monetary |
| missingDataBehavior | Zero means no matching persisted records; unavailable is null |
| version | 2026-10-15.1 |

## totalCheckIns

ភ្ញៀវបានចូល / Checked-in guests

| Field | Definition |
| --- | --- |
| definition | Checked-in guests |
| calculation | COUNT DISTINCT guest_id per event WHERE is_active=true |
| databaseSource | guest_check_ins JOIN guests ON guest_id AND invitation_id |
| dateDimension | Selected invitation cohort, current check-in snapshot |
| includedStatuses | Active matching guest and invitation |
| excludedStatuses | Undone, cross-invitation and duplicate check-ins |
| denominator | none |
| currencyBehavior | Not monetary |
| missingDataBehavior | Zero means no matching persisted records; unavailable is null |
| version | 2026-10-15.1 |

## previousPeriodEvents

ធៀបការរយៈពេលមុន / Previous-period invitations

| Field | Definition |
| --- | --- |
| definition | Previous-period invitations |
| calculation | COUNT nondeleted invitations in preceding equal calendar-day interval |
| databaseSource | invitations |
| dateDimension | createdAt |
| includedStatuses | Nondeleted |
| excludedStatuses | Deleted |
| denominator | none |
| currencyBehavior | Not monetary |
| missingDataBehavior | Zero means no matching persisted records; unavailable is null |
| version | 2026-10-15.1 |

## failedValue

តម្លៃបញ្ជាទិញបរាជ័យ / Failed / rejected order value

| Field | Definition |
| --- | --- |
| definition | Expected value, not cash loss |
| calculation | SUM expected_amount GROUP BY currency |
| databaseSource | Unified payment ledger |
| dateDimension | createdAt for executive; selected dimension for ledger |
| includedStatuses | FAILED, REJECTED, EXPIRED, CANCELLED |
| excludedStatuses | PAID, pending and review |
| denominator | none |
| currencyBehavior | USD/KHR separate |
| missingDataBehavior | Unknown currency excluded from currency totals |
| version | 2026-10-15.1 |

## templateReceipts

ប្រាក់ទទួលពីគំរូ / Verified template receipts

| Field | Definition |
| --- | --- |
| definition | Template portion of confirmed receipts |
| calculation | SUM confirmedReceipt WHERE productType=TEMPLATE GROUP BY currency |
| databaseSource | Unified payment ledger |
| dateDimension | paidAt for executive; selected dimension for ledger |
| includedStatuses | MATCHED TEMPLATE |
| excludedStatuses | Nonmatched / subscriptions |
| denominator | none |
| currencyBehavior | USD/KHR separate |
| missingDataBehavior | Never use expected or claimant amount |
| version | 2026-10-15.1 |

## subscriptionReceipts

ប្រាក់ទទួលពីសមាជិកភាព / Verified subscription receipts

| Field | Definition |
| --- | --- |
| definition | Subscription portion of confirmed receipts counted once |
| calculation | SUM confirmedReceipt WHERE productType=SUBSCRIPTION GROUP BY currency |
| databaseSource | Unified payment ledger |
| dateDimension | paidAt for executive; selected dimension for ledger |
| includedStatuses | MATCHED SUBSCRIPTION |
| excludedStatuses | Nonmatched / templates |
| denominator | none |
| currencyBehavior | USD/KHR separate |
| missingDataBehavior | Free entitlement does not imply payment |
| version | 2026-10-15.1 |

## confirmedReceipts

ប្រាក់ទទួលបានផ្ទៀងផ្ទាត់ / Verified cash receipts

| Field | Definition |
| --- | --- |
| definition | Matched, deduplicated platform receipts; not accounting revenue |
| calculation | SUM(paid_amount) WHERE reconciliationOutcome=MATCHED GROUP BY currency |
| databaseSource | template_payment_orders UNION subscriptions |
| dateDimension | paidAt for executive; selected payment dimension for ledger |
| includedStatuses | PAID + trusted source + paid/confirmed timestamps + exact amount |
| excludedStatuses | Pending, review, failed, duplicate, mismatch, unsupported currency, missing verification |
| denominator | none |
| currencyBehavior | USD and KHR separate; no FX |
| missingDataBehavior | Missing evidence is an exception; never substitute expected amount |
| version | 2026-10-15.1 |

## pendingOrderValue

តម្លៃបញ្ជាទិញរង់ចាំ / Pending order value

| Field | Definition |
| --- | --- |
| definition | Expected value, not cash |
| calculation | SUM(expected_amount) for pending/review records GROUP BY currency |
| databaseSource | Unified payment ledger |
| dateDimension | Selected payment dimension |
| includedStatuses | PENDING, QR_CREATED, CHECKOUT_CREATED, PAID_PENDING_REVIEW, REVIEW_REQUIRED |
| excludedStatuses | PAID, failed/rejected/expired/cancelled |
| denominator | none |
| currencyBehavior | Separated |
| missingDataBehavior | Unknown currency never becomes USD |
| version | 2026-10-15.1 |

## publishedRate

អត្រាផ្សាយ / Published rate

| Field | Definition |
| --- | --- |
| definition | Current published state of filtered nondeleted invitation cohort |
| calculation | published / total; stored fraction 0..1 |
| databaseSource | invitations |
| dateDimension | createdAt, eventDate or publishedAt |
| includedStatuses | PUBLISHED numerator; all nondeleted cohort denominator |
| excludedStatuses | Deleted invitations |
| denominator | Filtered invitations |
| currencyBehavior | Not monetary |
| missingDataBehavior | Null if denominator zero |
| version | 2026-10-15.1 |

## rsvpRate

អត្រាឆ្លើយតប / RSVP response rate

| Field | Definition |
| --- | --- |
| definition | Distinct eligible guest-linked responses |
| calculation | distinct responded guest_id / guests; fraction 0..1 |
| databaseSource | guests + rsvps joined by invitation_id AND guest_id |
| dateDimension | Invitation cohort; current response snapshot |
| includedStatuses | Latest guest-linked ATTENDING, NOT_ATTENDING, MAYBE |
| excludedStatuses | Anonymous / cross-invitation responses |
| denominator | Persisted guests in invitation |
| currencyBehavior | Not monetary |
| missingDataBehavior | Null if no eligible guests |
| version | 2026-10-15.1 |

## checkInRate

អត្រាចូលរួម / Check-in rate

| Field | Definition |
| --- | --- |
| definition | Distinct currently active checked-in guests |
| calculation | distinct active guest_id / eligible guests; fraction 0..1 |
| databaseSource | guest_check_ins + guests |
| dateDimension | Invitation cohort; current check-in snapshot |
| includedStatuses | is_active=true with matching invitation and guest |
| excludedStatuses | Undone, duplicate and cross-invitation check-ins |
| denominator | Persisted guests in invitation |
| currencyBehavior | Not monetary |
| missingDataBehavior | Null if no eligible guests |
| version | 2026-10-15.1 |

## periodGrowth

កំណើនតាមរយៈពេល / Comparable-period growth

| Field | Definition |
| --- | --- |
| definition | Event creation in selected interval versus immediately preceding interval of equal calendar days |
| calculation | (current-previous)/previous; fraction scale, may exceed 1 |
| databaseSource | invitations |
| dateDimension | createdAt in Phnom Penh calendar windows |
| includedStatuses | Nondeleted invitations |
| excludedStatuses | Deleted invitations |
| denominator | Previous interval count |
| currencyBehavior | Not monetary |
| missingDataBehavior | Null; NEW_ACTIVITY when prior=0 and current>0, NO_ACTIVITY when both=0 |
| version | 2026-10-15.1 |

## activeAccounts

គណនីសកម្ម / Enabled accounts

| Field | Definition |
| --- | --- |
| definition | Current ACTIVE, nondeleted accounts; not DAU |
| calculation | COUNT users WHERE status=ACTIVE AND deleted=false |
| databaseSource | users |
| dateDimension | Generation snapshot |
| includedStatuses | ACTIVE |
| excludedStatuses | DISABLED and deleted |
| denominator | none |
| currencyBehavior | Not monetary |
| missingDataBehavior | Activity timestamp/DAU unavailable |
| version | 2026-10-15.1 |

## newRegistrations

ចុះឈ្មោះថ្មី / New registrations

| Field | Definition |
| --- | --- |
| definition | Nondeleted users registered in period |
| calculation | COUNT users in [from,to) |
| databaseSource | users |
| dateDimension | createdAt |
| includedStatuses | Nondeleted |
| excludedStatuses | Deleted |
| denominator | none |
| currencyBehavior | Not monetary |
| missingDataBehavior | Zero means no matching registrations |
| version | 2026-10-15.1 |

## activeSubscriptions

សមាជិកភាពសកម្ម / Effective active subscriptions

| Field | Definition |
| --- | --- |
| definition | Persisted active state with current validity window |
| calculation | is_active AND status=ACTIVE AND start<=asOf AND (end IS NULL OR end>asOf) |
| databaseSource | subscriptions |
| dateDimension | Generation instant; activePeriod selects overlap |
| includedStatuses | ACTIVE within validity |
| excludedStatuses | Expired, future, replaced and pending |
| denominator | none |
| currencyBehavior | Purchase receipts counted only in unified ledger |
| missingDataBehavior | Unknown transitions/renewals/upgrades/downgrades unavailable |
| version | 2026-10-15.1 |

## templateUsage

ការប្រើគំរូ / Template usage

| Field | Definition |
| --- | --- |
| definition | Nondeleted invitations created in period using template |
| calculation | COUNT invitation_id GROUP BY template_id |
| databaseSource | invitations |
| dateDimension | createdAt |
| includedStatuses | Nondeleted |
| excludedStatuses | Deleted |
| denominator | none |
| currencyBehavior | Purchase receipts separated by currency |
| missingDataBehavior | Conversion unavailable without persisted view denominator |
| version | 2026-10-15.1 |

## delivery

ការផ្ញើ និងការបើក / Recorded sends and opens

| Field | Definition |
| --- | --- |
| definition | Distinct guests with persisted last_sent_at / invitation_viewed_at |
| calculation | COUNT guest identities with marker |
| databaseSource | guests |
| dateDimension | Selected invitation cohort; current markers |
| includedStatuses | Non-null persisted marker |
| excludedStatuses | Client-only attempts |
| denominator | Eligible guests |
| currencyBehavior | Not monetary |
| missingDataBehavior | Confirmed delivered unavailable; send markers are not delivery receipts |
| version | 2026-10-15.1 |

## systemHealth

ព្រឹត្តិការណ៍ប្រព័ន្ធ / Persisted operational events

| Field | Definition |
| --- | --- |
| definition | Audit actions plus notification/payment exceptions; sanitized |
| calculation | Count persisted projected events |
| databaseSource | system_audit_logs, notifications, unified payment exceptions |
| dateDimension | createdAt / exception record date |
| includedStatuses | Persisted records |
| excludedStatuses | Unpersisted failures and raw evidence |
| denominator | none |
| currencyBehavior | No financial aggregation |
| missingDataBehavior | Uptime and unpersisted API failures unavailable |
| version | 2026-10-15.1 |
