export * from "./httpClient";
export * from "./ApiError";
export * from "./helpers";
export * from "./i18nService";
export { default as httpClient, api } from "./httpClient";
export { default as ApiError } from "./ApiError";
export { default as i18nService } from "./i18nService";

// Centralized Domain Services & APIs (accessible via @/shared/api for any page or feature)
export { authApi, userApi } from "@/features/auth/api";
export { templateService } from "@/features/templates/api/templateService";
export { templateCatalogService } from "@/features/templates/api/templateCatalogApi";
export { subscriptionApi, subscriptionService } from "@/features/subscriptions/api";
export { paymentsApi, paymentService } from "@/features/payments/api/paymentsApi";
export { seatingApi, seatingService } from "@/features/seating/api/seatingApi";
export { notificationsApi, notificationService } from "@/features/notifications/api/notificationsApi";
export { guestApi } from "@/features/guests/api/guestApi";
export { invitationApi } from "@/features/invitations/api/invitationApi";
export { wishesApi } from "@/features/wishes/api/wishesApi";
export { eventsApi } from "@/features/events/api/eventsApi";
export { budgetApi } from "@/features/budget/api/budgetApi";
export { expensesApi } from "@/features/expenses/api/expensesApi";
export { qrApi } from "@/features/qr/api/qrApi";
export { checkInApi } from "@/features/check-in/api/checkInApi";
