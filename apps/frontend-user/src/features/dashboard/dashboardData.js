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
    const currency = item.currency || "USD";
    totals[currency] = (totals[currency] || 0) + Number(item[field] ?? 0);
    return totals;
  }, {});
}
