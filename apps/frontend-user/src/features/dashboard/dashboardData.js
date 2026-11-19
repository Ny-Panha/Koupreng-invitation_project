import { reportsApi } from "@/features/reports/api/reportsApi";
import { budgetService } from "@/features/budget/api/budgetApi";
import { planningService } from "@/features/planning/api/planningApi";
import { guestService } from "@/features/guests/api/guestApi";
import notificationService from "@/features/notifications/notificationService";

export async function loadServerDashboard(invitationId) {
  const [dashboard, budgetItems, gifts, notifications, checkInSummary] = await Promise.all([
    reportsApi.invitationDashboard(invitationId), budgetService.listItems(invitationId),
    planningService.listGifts(invitationId), notificationService.listByInvitation(invitationId),
    guestService.checkInSummary(invitationId),
  ]);
  return { dashboard, budgetItems, gifts, notifications, checkInSummary, guests: [], rsvps: [], rsvpSummary: null };
}

export function groupAmounts(items, field) {
  return items.reduce((totals, item) => {
    const currency = item.currency;
    if (!['USD', 'KHR'].includes(currency)) return totals;
    const raw = item[field];
    const amount = typeof raw === 'number' || (typeof raw === 'string' && raw.trim()) ? Number(raw) : NaN;
    if (!Number.isFinite(amount) || totals[currency] === null) totals[currency] = null;
    else totals[currency] = (totals[currency] || 0) + amount;
    return totals;
  }, {});
}
