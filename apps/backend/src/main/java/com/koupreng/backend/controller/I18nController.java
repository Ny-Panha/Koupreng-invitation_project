package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.service.MessageService;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "Internationalization", description = "Public localized message bundles used by the clients.")
public class I18nController {

    private final MessageService msg;

    public I18nController(MessageService msg) {
        this.msg = msg;
    }

    /**
     * Returns the i18n message keys for the given namespace.
     * Uses a switch statement to map namespace names to their key lists.
     */
    private List<String> getNamespaceKeys(String namespace) {
        switch (namespace) {
            case "hostNav":
                return List.of(
                        "hostNav.events",
                        "hostNav.dashboard",
                        "hostNav.guests",
                        "hostNav.expenses",
                        "hostNav.gifts",
                        "hostNav.templates",
                        "hostNav.logout",
                        "hostNav.editProfile",
                        "hostNav.createProfile",
                        "hostNav.backToDashboard",
                        "hostNav.accountFallback"
                );
            case "dashboard":
                return List.of(
                        "dashboard.brand",
                        "dashboard.emptyTitle",
                        "dashboard.emptyText",
                        "dashboard.createInvitation",
                        "dashboard.eventSwitcherAria",
                        "dashboard.eventSwitcherTitle",
                        "dashboard.keepTwo",
                        "dashboard.keepTwoConfirm",
                        "dashboard.active",
                        "dashboard.overview",
                        "dashboard.title",
                        "dashboard.description",
                        "dashboard.guests",
                        "dashboard.editInvitation",
                        "dashboard.invitedGuests",
                        "dashboard.responses",
                        "dashboard.rsvpReady",
                        "dashboard.attending",
                        "dashboard.budgetUsed",
                        "dashboard.spent",
                        "dashboard.giftTotal",
                        "dashboard.records",
                        "dashboard.planHealth",
                        "dashboard.rsvpCompletion",
                        "dashboard.weddingDate",
                        "dashboard.giftRecords",
                        "dashboard.published",
                        "dashboard.draft",
                        "dashboard.eventDate",
                        "dashboard.venue",
                        "dashboard.notCompleted",
                        "dashboard.rsvp",
                        "dashboard.open",
                        "dashboard.closed",
                        "dashboard.preview",
                        "dashboard.totalGuests",
                        "dashboard.invitedResponded",
                        "dashboard.rsvpProgress",
                        "dashboard.rsvpProgressNote",
                        "dashboard.budgetProgress",
                        "dashboard.budgetProgressNote",
                        "dashboard.giftSummary",
                        "dashboard.giftSummaryNote",
                        "dashboard.graph",
                        "dashboard.rsvpGuests",
                        "dashboard.accepted",
                        "dashboard.pending",
                        "dashboard.maybe",
                        "dashboard.declined",
                        "dashboard.recentGuests",
                        "dashboard.newGuests",
                        "dashboard.viewAll",
                        "dashboard.noGroup",
                        "dashboard.noGuests",
                        "dashboard.event",
                        "dashboard.summary",
                        "dashboard.edit",
                        "dashboard.template",
                        "dashboard.newEvent",
                        "dashboard.noDate",
                        "dashboard.wedding",
                        "dashboard.weddingTemplate"
                );
            case "guests":
                return List.of(
                        "guests.title",
                        "guests.totalSeats",
                        "guests.sent",
                        "guests.searchPlaceholder",
                        "guests.filterGroup",
                        "guests.filterStatus",
                        "guests.addGuest",
                        "guests.delete",
                        "guests.colName",
                        "guests.colPhone",
                        "guests.colGroup",
                        "guests.colStatus",
                        "guests.colSendStatus",
                        "guests.colNote",
                        "guests.colActions",
                        "guests.empty",
                        "guests.emptyNote",
                        "guests.totalRecords",
                        "guests.perPage",
                        "guests.page",
                        "guests.editGuest",
                        "guests.addGuestModal",
                        "guests.guestFormDesc",
                        "guests.fieldName",
                        "guests.fieldCompanion",
                        "guests.fieldPhone",
                        "guests.fieldCount",
                        "guests.fieldSeat",
                        "guests.fieldSendStatus",
                        "guests.fieldNote",
                        "guests.fieldGroup",
                        "guests.fieldCategory",
                        "guests.placeholderCompanion",
                        "guests.placeholderPhone",
                        "guests.placeholderSeat",
                        "guests.placeholderNote",
                        "guests.selectGroup",
                        "guests.selectCategory",
                        "guests.cancel",
                        "guests.submit",
                        "guests.manageGroups",
                        "guests.manageCategories",
                        "guests.manage",
                        "guests.managerListTitle",
                        "guests.managerFieldName",
                        "guests.managerFieldNote",
                        "guests.managerAddBtn",
                        "guests.managerSave",
                        "guests.managerNoDesc",
                        "guests.toastAdded",
                        "guests.toastUpdated",
                        "guests.toastDeleted",
                        "guests.toastDeleteSelected",
                        "guests.toastLinkReady",
                        "guests.toastCopied",
                        "guests.toastCopiedSelected",
                        "guests.toastQrDownloaded",
                        "guests.qrTitle",
                        "guests.qrCopyLink",
                        "guests.qrDownload",
                        "guests.linkTitle",
                        "guests.editMenuItem",
                        "guests.deleteMenuItem",
                        "guests.menuManage"
                );
            case "expenses":
                return List.of(
                        "expenses.heroTag",
                        "expenses.title",
                        "expenses.subtitle",
                        "expenses.addBtn",
                        "expenses.closeBtn",
                        "expenses.selectPlaceholder",
                        "expenses.noInvitationsTitle",
                        "expenses.noInvitationsText",
                        "expenses.createInvitation",
                        "expenses.sumTotal",
                        "expenses.sumSpent",
                        "expenses.sumRemaining",
                        "expenses.sumPercent",
                        "expenses.progressLabel",
                        "expenses.formTitleAdd",
                        "expenses.formTitleEdit",
                        "expenses.fieldName",
                        "expenses.fieldNamePlaceholder",
                        "expenses.fieldCategory",
                        "expenses.fieldBudget",
                        "expenses.fieldAmount",
                        "expenses.fieldDate",
                        "expenses.fieldStatus",
                        "expenses.statusPending",
                        "expenses.statusPaid",
                        "expenses.cancelBtn",
                        "expenses.saveBtn",
                        "expenses.addItemBtn",
                        "expenses.searchPlaceholder",
                        "expenses.colExpense",
                        "expenses.colCategory",
                        "expenses.colDate",
                        "expenses.colBudget",
                        "expenses.colAmount",
                        "expenses.colStatus",
                        "expenses.colActions",
                        "expenses.editBtn",
                        "expenses.deleteBtn",
                        "expenses.emptyTitle",
                        "expenses.emptyText",
                        "expenses.loadingText",
                        "expenses.savingText",
                        "expenses.catAll",
                        "expenses.catFood",
                        "expenses.catDecor",
                        "expenses.catClothing",
                        "expenses.catTransport",
                        "expenses.catOther",
                        "expenses.deleteConfirm",
                        "expenses.fieldNotes",
                        "expenses.placeholderNotes",
                        "expenses.payments",
                        "expenses.addPaymentBtn",
                        "expenses.paymentsEmpty",
                        "expenses.paymentFor",
                        "expenses.paymentAmount",
                        "expenses.paymentDate",
                        "expenses.placeholderAmount"
                );
            case "gifts":
                return List.of(
                        "gifts.heroTag",
                        "gifts.title",
                        "gifts.subtitle",
                        "gifts.addBtn",
                        "gifts.closeBtn",
                        "gifts.selectPlaceholder",
                        "gifts.noInvitationsTitle",
                        "gifts.noInvitationsText",
                        "gifts.createInvitation",
                        "gifts.sumTotal",
                        "gifts.sumCount",
                        "gifts.sumAverage",
                        "gifts.sumMax",
                        "gifts.formTitleAdd",
                        "gifts.formTitleEdit",
                        "gifts.fieldName",
                        "gifts.fieldAmount",
                        "gifts.fieldMethod",
                        "gifts.fieldDate",
                        "gifts.fieldNote",
                        "gifts.placeholderName",
                        "gifts.placeholderNote",
                        "gifts.fieldDatePlaceholder",
                        "gifts.cancelBtn",
                        "gifts.saveBtn",
                        "gifts.addItemBtn",
                        "gifts.searchPlaceholder",
                        "gifts.colName",
                        "gifts.colAmount",
                        "gifts.colMethod",
                        "gifts.colDate",
                        "gifts.colNote",
                        "gifts.colActions",
                        "gifts.editBtn",
                        "gifts.deleteBtn",
                        "gifts.emptyTitle",
                        "gifts.emptyText",
                        "gifts.loadingText",
                        "gifts.savingText",
                        "gifts.methodAll",
                        "gifts.deleteConfirm",
                        "gifts.countPersons"
                );
            case "templates":
                return List.of(
                        "templates.title",
                        "templates.subtitle",
                        "templates.freeSection",
                        "templates.paidSection",
                        "templates.noPriceTag",
                        "templates.priceTag",
                        "templates.selectBtn",
                        "templates.viewBtn",
                        "templates.addedBtn",
                        "templates.noImage",
                        "templates.empty",
                        "templates.loading",
                        "templates.error"
                );
            case "nav":
                return List.of(
                        "nav.home", "nav.templates", "nav.pricing", "nav.venues",
                        "nav.dashboard", "nav.login", "nav.register", "nav.logout",
                        "nav.backToHome", "nav.english", "nav.khmer", "nav.langEn", "nav.language"
                );
            case "home":
                return List.of(
                        "home.subtitleDigitalWedding", "home.titlePlan", "home.titlePerfect", "home.description",
                        "home.btnStart", "home.btnPricing", "home.howItWorks", "home.step1Choose",
                        "home.step1Templates", "home.step1Desc", "home.step2Setup", "home.step2Pricing",
                        "home.step2Desc", "home.step3Find", "home.step3Venues", "home.step3Desc",
                        "home.pricingTitle", "home.popular", "home.perEvent", "home.selectPlan",
                        "home.footerLogo", "home.footerDesc", "home.footerServices", "home.footerTemplates",
                        "home.footerPricing", "home.footerVenues", "home.footerCompany", "home.footerAbout",
                        "home.footerContact", "home.footerHelp", "home.footerCopyright",
                        "home.planBasicName", "home.planBasicDesc", "home.planBasicFeat1", "home.planBasicFeat2", "home.planBasicFeat3",
                        "home.planProName", "home.planProDesc", "home.planProFeat1", "home.planProFeat2", "home.planProFeat3", "home.planProFeat4",
                        "home.planEntName", "home.planEntPrice", "home.planEntDesc", "home.planEntFeat1", "home.planEntFeat2", "home.planEntFeat3"
                );
            case "templateGrid":
                return List.of(
                        "templateGrid.premiumLabel", "templateGrid.titleTemplates", "templateGrid.titleTemplatesSpan",
                        "templateGrid.popular", "templateGrid.catAncient", "templateGrid.catModern", "templateGrid.catContemporary",
                        "templateGrid.viewDetail", "templateGrid.templateBenefit", "templateGrid.useTemplate",
                        "templateGrid.startCreate", "templateGrid.createCustom", "templateGrid.customDesc",
                        "templateGrid.customBenefit", "templateGrid.useCustom"
                );
            case "pricing":
                return List.of(
                        "pricing.subtitle", "pricing.titlePlan", "pricing.titlePerfect", "pricing.recommended",
                        "pricing.btnStartNow", "pricing.btnSelectGold", "pricing.btnContactSales",
                        "pricing.planBasicName", "pricing.planBasicPrice", "pricing.planBasicDesc",
                        "pricing.planBasicFeat1", "pricing.planBasicFeat2", "pricing.planBasicFeat3", "pricing.planBasicFeat4",
                        "pricing.planProName", "pricing.planProDesc",
                        "pricing.planProFeat1", "pricing.planProFeat2", "pricing.planProFeat3", "pricing.planProFeat4", "pricing.planProFeat5",
                        "pricing.planEntName", "pricing.planEntPrice", "pricing.planEntDesc",
                        "pricing.planEntFeat1", "pricing.planEntFeat2", "pricing.planEntFeat3", "pricing.planEntFeat4", "pricing.planEntFeat5"
                );
            case "venues":
                return List.of(
                        "venues.subtitle", "venues.titleFind", "venues.titleVenues",
                        "venues.searchPlaceholder", "venues.searchBtn",
                        "venues.capacity", "venues.priceRangeText", "venues.viewDetail",
                        "venues.phnomPenh", "venues.siemReap", "venues.battambang",
                        "venues.tagPopular", "venues.tagBigHall", "venues.tagModern", "venues.tagGoodService",
                        "venues.tagLuxuryEng", "venues.tagLuxury", "venues.tagAffordable",
                        "venues.venue1Name", "venues.venue1Capacity",
                        "venues.venue2Name", "venues.venue2Capacity",
                        "venues.venue3Name", "venues.venue3Capacity",
                        "venues.venue4Name", "venues.venue4Capacity"
                );
            case "authUI":
                return List.of(
                        "authUI.loginTitle", "authUI.loginSubtitle",
                        "authUI.registerTitle", "authUI.registerSubtitle",
                        "authUI.phoneOrEmail", "authUI.phoneOrEmailPlaceholder",
                        "authUI.password", "authUI.passwordPlaceholder",
                        "authUI.newPassword", "authUI.confirmPassword",
                        "authUI.fullName", "authUI.fullNamePlaceholder",
                        "authUI.phone", "authUI.phonePlaceholder",
                        "authUI.signingIn", "authUI.signIn",
                        "authUI.registering", "authUI.registerBtn",
                        "authUI.orContinueWith", "authUI.forgotPassword",
                        "authUI.noAccount", "authUI.haveAccount",
                        "authUI.requiredFields", "authUI.loginFailed",
                        "authUI.registerRequired", "authUI.registerFailed",
                        "authUI.passwordMismatch"
                );
            case "profile":
                return List.of(
                        "profile.editTitle", "profile.createTitle",
                        "profile.editSubtitle", "profile.createSubtitle",
                        "profile.changePhoto", "profile.selectImage", "profile.newUser",
                        "profile.fullNameLabel", "profile.fullNamePlaceholder",
                        "profile.emailLabel", "profile.emailReadonly",
                        "profile.phoneLabel", "profile.phonePlaceholder",
                        "profile.saving", "profile.saveEdit", "profile.createBtn",
                        "profile.savedSuccess", "profile.saveFailed",
                        "profile.changePassword", "profile.changePasswordHint",
                        "profile.currentPassword", "profile.newPasswordLabel",
                        "profile.confirmNewPassword",
                        "profile.changingPassword", "profile.changePasswordBtn",
                        "profile.passwordChanged", "profile.passwordMismatch",
                        "profile.passwordTooShort", "profile.passwordChangeFailed",
                        "profile.loading"
                );
            case "common":
                return List.of(
                        "common.save", "common.cancel", "common.confirm",
                        "common.delete", "common.edit", "common.loading",
                        "common.error", "common.success"
                );
            case "events":
                return List.of(
                        "events.title", "events.subtitle", "events.createBtn",
                        "events.emptyTitle", "events.emptySubtitle", "events.deleteModalTitle",
                        "events.deleteModalDesc", "events.cancelBtn", "events.confirmBtn",
                        "events.badgeDraft", "events.badgePublished", "events.noDate",
                        "events.editBtn", "events.deleteBtn", "events.newInvitation",
                        "events.groom", "events.bride", "events.brandKicker",
                        "events.goToCreate", "events.deletedSuccess"
                );
            case "invitations":
                return List.of(
                        "invitations.brand", "invitations.title", "invitations.subtitle",
                        "invitations.createBtn", "invitations.emptyIcon", "invitations.emptyTitle",
                        "invitations.emptyText", "invitations.emptyActionBtn", "invitations.loading"
                );
            default:
                return null;
        }
    }

    @Operation(summary = "Get localized UI messages",
            description = "Return the supported messages for one known client namespace in the active locale.")
    @GetMapping("/api/v1/i18n/messages")
    public ResponseEntity<ApiResponse<Map<String, Object>>> messages(
            @RequestParam(defaultValue = "dashboard") String namespace,
            @RequestParam(required = false) String lang
    ) {
        List<String> keys = getNamespaceKeys(namespace);
        if (keys == null) {
            keys = List.of();
        }

        Map<String, String> messages = new LinkedHashMap<>();
        String prefix = namespace + ".";
        for (String key : keys) {
            messages.put(key.substring(prefix.length()), msg.get(key));
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("locale", LocaleContextHolder.getLocale().toLanguageTag());
        data.put("namespace", namespace);
        data.put("messages", messages);
        return ResponseEntity.ok(ApiResponse.success("Messages fetched successfully", data));
    }
}
