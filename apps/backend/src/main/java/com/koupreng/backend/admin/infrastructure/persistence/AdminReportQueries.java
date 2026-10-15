package com.koupreng.backend.admin.infrastructure.persistence;

import com.koupreng.backend.admin.application.AdminReportFilter;

/** Read-only projections. No raw evidence, credentials, guest names or contact fields. */
final class AdminReportQueries {
    private AdminReportQueries() { }
    static final String PAYMENTS = """
        SELECT evaluated.*,
          CASE WHEN paymentStatus='PAID' THEN COALESCE(paidAt,createdAt) ELSE createdAt END activityAt,
          CASE WHEN paidAmount IS NOT NULL THEN 'PERSISTED_CONFIRMATION' ELSE 'NOT_VERIFIED' END verificationResult,
          NULL resolutionNote,
          CASE WHEN reconciliationOutcome='MATCHED' THEN NULL ELSE reconciliationOutcome END exceptionCode,
          CASE WHEN reconciliationOutcome='MATCHED' THEN paidAmount ELSE NULL END confirmedReceipt
        FROM (
          SELECT verified.*,
            CASE WHEN orderDuplicates>1 OR referenceDuplicates>1 THEN 'DUPLICATE'
              WHEN currency NOT IN ('USD','KHR') OR currency IS NULL THEN 'UNMATCHED'
              WHEN paymentStatus='PAID' AND paidAmount IS NOT NULL AND paidAmount<>expectedAmount THEN 'AMOUNT_MISMATCH'
              WHEN paymentStatus='PAID' AND paidAmount IS NOT NULL AND expectedAmount>=0 THEN 'MATCHED'
              WHEN paymentStatus='PAID' THEN 'UNMATCHED'
              WHEN paymentStatus IN ('REJECTED','FAILED','CANCELLED') THEN 'REJECTED'
              WHEN paymentStatus='EXPIRED' THEN 'EXPIRED'
              WHEN paymentStatus IN ('PAID_PENDING_REVIEW','REVIEW_REQUIRED') THEN 'PENDING_REVIEW'
              ELSE 'UNMATCHED' END reconciliationOutcome
          FROM (
            SELECT facts.*,
              CASE WHEN paymentStatus='PAID' AND paidAt IS NOT NULL AND confirmedAt IS NOT NULL
                AND ((productType='TEMPLATE' AND confirmSource IN ('ABA_PAYWAY_CALLBACK','MANUAL_ADMIN','TELEGRAM_ABA_ALERT')) OR (productType='SUBSCRIPTION' AND confirmSource IN ('MANUAL_ADMIN','TRUSTED_TELEGRAM_MERCHANT_ALERT')))
                THEN recordedPaidAmount ELSE NULL END paidAmount,
              NULL paymentMethod,
              COUNT(*) OVER (PARTITION BY COALESCE(NULLIF(orderCode,''),id)) orderDuplicates,
              COUNT(*) OVER (PARTITION BY COALESCE(NULLIF(providerReference,''),id)) referenceDuplicates
            FROM (
              SELECT CONCAT('TEMPLATE-',CAST(id AS CHAR(30))) id, id recordId, order_code orderCode,
                payway_transaction_id providerReference, user_id userId, 'TEMPLATE' productType,
                template_name productName, package_name legacyPackageName, template_id templateId, NULL packageId, provider,
                status paymentStatus, amount expectedAmount, paid_amount recordedPaidAmount, currency,
                created_at createdAt, paid_at paidAt, confirm_source confirmSource,
                confirmed_at confirmedAt, confirmed_by reviewedBy
              FROM template_payment_orders
              UNION ALL
              SELECT CONCAT('SUBSCRIPTION-',CAST(s.subscription_id AS CHAR(30))), s.subscription_id, s.order_code,
                s.payway_transaction_id, s.user_id, 'SUBSCRIPTION', p.package_name, p.package_name, NULL, s.package_id, s.provider,
                COALESCE(s.payment_status,CASE WHEN s.status='REVIEW_REQUIRED' THEN 'REVIEW_REQUIRED' ELSE 'UNKNOWN' END),
                s.amount, s.paid_amount, s.currency, s.created_at, s.paid_at, s.confirm_source, s.confirmed_at, s.confirmed_by
              FROM subscriptions s LEFT JOIN packages p ON p.package_id=s.package_id
            ) facts
          ) verified
        ) evaluated
        """;

    static String invitationBase() {
        return """
          SELECT i.invitation_id id, i.title, i.slug, i.user_id userId, u.full_name ownerName,
            i.template_id templateId, t.name templateName, i.event_type eventType, i.status,
            i.moderation_status moderationStatus, i.event_date eventDate, i.event_time eventTime,
            i.venue_name venueName, i.created_at createdAt, i.published_at publishedAt,
            COALESCE(g.guestCount,0) guestCount, COALESCE(g.sentCount,0) sentCount,
            NULL deliveredCount, COALESCE(g.openedCount,0) openedCount,
            COALESCE(r.rsvpCount,0) rsvpCount, COALESCE(r.attendingCount,0) attendingCount,
            COALESCE(r.declinedCount,0) declinedCount, COALESCE(r.maybeCount,0) maybeCount,
            COALESCE(c.checkedInCount,0) checkedInCount,
            CASE WHEN COALESCE(g.guestCount,0)=0 THEN NULL ELSE ROUND(1.0*COALESCE(r.rsvpCount,0)/g.guestCount,8) END rsvpRate,
            CASE WHEN COALESCE(g.guestCount,0)=0 THEN NULL ELSE ROUND(1.0*COALESCE(c.checkedInCount,0)/g.guestCount,8) END checkInRate
          FROM invitations i
          LEFT JOIN users u ON u.user_id=i.user_id
          LEFT JOIN templates t ON t.template_id=i.template_id
          LEFT JOIN (SELECT invitation_id, COUNT(*) guestCount,
              SUM(CASE WHEN last_sent_at IS NOT NULL THEN 1 ELSE 0 END) sentCount,
              SUM(CASE WHEN invitation_viewed_at IS NOT NULL THEN 1 ELSE 0 END) openedCount
              FROM guests GROUP BY invitation_id) g ON g.invitation_id=i.invitation_id
          LEFT JOIN (
            SELECT latest.invitation_id, COUNT(*) rsvpCount,
              SUM(CASE WHEN response_status='ATTENDING' THEN 1 ELSE 0 END) attendingCount,
              SUM(CASE WHEN response_status='NOT_ATTENDING' THEN 1 ELSE 0 END) declinedCount,
              SUM(CASE WHEN response_status='MAYBE' THEN 1 ELSE 0 END) maybeCount
            FROM (SELECT r.*, ROW_NUMBER() OVER(PARTITION BY r.invitation_id,r.guest_id ORDER BY r.responded_at DESC,r.rsvp_id DESC) rowPosition
              FROM rsvps r JOIN guests g ON g.guest_id=r.guest_id AND g.invitation_id=r.invitation_id
              WHERE r.response_status IN ('ATTENDING','NOT_ATTENDING','MAYBE')) latest
            WHERE latest.rowPosition=1 GROUP BY latest.invitation_id
          ) r ON r.invitation_id=i.invitation_id
          LEFT JOIN (SELECT c.invitation_id,COUNT(DISTINCT c.guest_id) checkedInCount
            FROM guest_check_ins c JOIN guests g ON g.guest_id=c.guest_id AND g.invitation_id=c.invitation_id
            WHERE c.is_active=true GROUP BY c.invitation_id) c ON c.invitation_id=i.invitation_id
          WHERE i.deleted=false
          """;
    }
    static String subscriptions() {
        return """
          SELECT s.subscription_id id, s.order_code orderCode, s.user_id userId,
            s.package_id packageId, p.package_name packageName, s.payment_status paymentStatus,
            s.status, s.provider, s.start_date startDate, s.end_date endDate,
            CASE WHEN s.is_active=true AND s.status='ACTIVE' AND s.start_date<=:asOf
              AND (s.end_date IS NULL OR s.end_date>:asOf) THEN 'ACTIVE'
              WHEN s.end_date<=:asOf THEN 'EXPIRED' ELSE 'INACTIVE' END activeState,
            s.amount, CASE WHEN s.payment_status='PAID' AND s.confirmed_at IS NOT NULL
              AND s.confirm_source IN ('MANUAL_ADMIN','TRUSTED_TELEGRAM_MERCHANT_ALERT') THEN s.paid_amount ELSE NULL END paidAmount,
            s.currency, s.paid_at paidAt, s.created_at createdAt
          FROM subscriptions s LEFT JOIN packages p ON p.package_id=s.package_id
          """;
    }
    static String base(String code, AdminReportFilter filter) {
        return switch (code) {
            case "payments", "reconciliation" -> PAYMENTS;
            case "invitations", "engagement" -> invitationBase();
            case "subscriptions" -> subscriptions();
            case "users" -> """
                SELECT u.user_id id,u.full_name displayName,u.role,u.status,u.created_at createdAt,
                  COALESCE(i.invitationCount,0) invitationCount,COALESCE(p.confirmedPurchases,0) confirmedPurchases,
                  COALESCE(p.allPaidPurchases,0) allPaidPurchases,
                  s.packageName currentPackage,s.activeState subscriptionStatus,NULL lastActivityAt
                FROM users u
                LEFT JOIN (SELECT user_id,COUNT(*) invitationCount FROM invitations WHERE deleted=false GROUP BY user_id) i ON i.user_id=u.user_id
                LEFT JOIN (SELECT userId,SUM(CASE WHEN productType='TEMPLATE' THEN 1 ELSE 0 END) confirmedPurchases,SUM(CASE WHEN confirmedReceipt>0 THEN 1 ELSE 0 END) allPaidPurchases FROM (
                """ + PAYMENTS + """
                ) verified WHERE reconciliationOutcome='MATCHED' GROUP BY userId) p ON p.userId=u.user_id
                LEFT JOIN (
                """ + subscriptions() + """
                ) s ON s.userId=u.user_id AND s.activeState='ACTIVE'
                WHERE u.deleted=false
                """;
            case "templates" -> """
                SELECT t.template_id id,t.name,t.category,CASE WHEN t.is_premium=true THEN 'PREMIUM' ELSE 'FREE' END classification,
                  t.status,t.created_at createdAt,COALESCE(i.usageCount,0) usageCount,
                  COALESCE(p.verifiedPurchases,0) verifiedPurchases,COALESCE(p.receiptsUsd,0) receiptsUsd,
                  COALESCE(p.receiptsKhr,0) receiptsKhr,NULL conversionRate
                FROM templates t
                LEFT JOIN (SELECT template_id,COUNT(*) usageCount FROM invitations WHERE deleted=false AND
                """ + filter.period("created_at") + " " + """
                GROUP BY template_id) i ON i.template_id=t.template_id
                LEFT JOIN (SELECT templateId,COUNT(*) verifiedPurchases,
                  SUM(CASE WHEN currency='USD' THEN confirmedReceipt ELSE 0 END) receiptsUsd,
                  SUM(CASE WHEN currency='KHR' THEN confirmedReceipt ELSE 0 END) receiptsKhr
                  FROM (
                """ + PAYMENTS + ") paid WHERE reconciliationOutcome='MATCHED' AND productType='TEMPLATE' AND "
                + filter.period("paidAt") + " GROUP BY templateId) p ON p.templateId=t.template_id";
            case "system" -> """
                SELECT CONCAT('AUDIT-',CAST(log_id AS CHAR(30))) id,created_at createdAt,'backend' source,
                  CASE WHEN action LIKE '%FAIL%' OR action LIKE '%REJECT%' THEN 'ERROR' ELSE 'INFO' END severity,
                  resource_type category,action,NULL status,actor_user_id actorId,CAST(resource_id AS CHAR(30)) targetId,
                  'Details withheld; refer to authorized source record' message FROM system_audit_logs
                UNION ALL
                SELECT CONCAT('NOTIFICATION-',CAST(notification_id AS CHAR(30))),created_at,'backend','ERROR',
                  'NOTIFICATION','NOTIFICATION_FAILED',status,NULL,CAST(notification_id AS CHAR(30)),
                  'Notification failed; recipient and message withheld' FROM notifications WHERE status='FAILED'
                UNION ALL
                SELECT CONCAT('REVIEW-',id),createdAt,'backend','WARNING','PAYMENT','PAYMENT_EXCEPTION',
                  reconciliationOutcome,userId,id,'Payment exception; raw evidence withheld' FROM (
                """ + PAYMENTS + ") payment WHERE paymentStatus IN ('PAID','PAID_PENDING_REVIEW','REVIEW_REQUIRED') AND reconciliationOutcome<>'MATCHED'";
            default -> throw new IllegalArgumentException("No ledger query for report");
        };
    }
}
