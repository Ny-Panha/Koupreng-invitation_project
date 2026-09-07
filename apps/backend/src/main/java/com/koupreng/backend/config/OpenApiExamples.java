package com.koupreng.backend.config;

import java.util.List;

import com.koupreng.backend.dev.DevSampleData;

/**
 * Complete, fictional request examples for the generated OpenAPI contract.
 * Values that map to local fixtures use constants from {@link DevSampleData}.
 */
final class OpenApiExamples {

    private OpenApiExamples() {
    }

    static List<NamedExample> forRequestType(Class<?> requestType) {
        return switch (requestType.getSimpleName()) {
            case "LoginRequest" -> List.of(
                    example("demoUser", "Development user", """
                            {"identifier":"%s","password":"%s"}
                            """.formatted(DevSampleData.USER_EMAIL, DevSampleData.USER_PASSWORD)),
                    example("demoAdmin", "Development administrator", """
                            {"identifier":"%s","password":"%s"}
                            """.formatted(DevSampleData.ADMIN_EMAIL, DevSampleData.ADMIN_PASSWORD)));
            case "RegisterRequest" -> one("newUser", "Register a fictional user", """
                    {
                      "fullName": "Koupreng Demo User",
                      "email": "new.user@example.com",
                      "phone": "012345678",
                      "password": "ExamplePass123!"
                    }
                    """);
            case "GoogleLoginRequest" -> one("googleOidc", "Requires a real Google-issued ID token", """
                    {"idToken":"<google-id-token>"}
                    """);
            case "TelegramLoginRequest" -> one("telegramOidc", "Requires a real Telegram-issued ID token", """
                    {
                      "idToken": "<telegram-id-token>",
                      "id": null,
                      "first_name": null,
                      "last_name": null,
                      "username": null,
                      "photo_url": null,
                      "auth_date": null,
                      "hash": null
                    }
                    """);
            case "UpdateProfileRequest" -> one("profile", "Update the current profile", """
                    {
                      "fullName": "Sokha Demo",
                      "phone": "012345678",
                      "profileImage": "https://example.com/images/demo-profile.webp"
                    }
                    """);
            case "ChangePasswordRequest" -> one("changePassword", "Change the demo user's password", """
                    {
                      "currentPassword": "%s",
                      "newPassword": "NewExamplePass123!"
                    }
                    """.formatted(DevSampleData.USER_PASSWORD));
            case "ForgotPasswordRequest" -> one("forgotPassword", "Request a reset email", """
                    {"email":"%s"}
                    """.formatted(DevSampleData.USER_EMAIL));
            case "ResetPasswordRequest" -> one("resetPassword", "Requires a reset token issued by the backend", """
                    {
                      "token": "<password-reset-token>",
                      "newPassword": "NewExamplePass123!"
                    }
                    """);
            case "InvitationRequest" -> invitationExamples();
            case "InvitationCustomizationRequest" -> one("weddingDesign", "Customize a bilingual wedding invitation", """
                    {
                      "templateId": null,
                      "languageMode": "BILINGUAL",
                      "designJson": "{\\\"theme\\\":\\\"moon\\\",\\\"heroStyle\\\":\\\"floral\\\"}",
                      "contentJson": "{\\\"welcome\\\":{\\\"km\\\":\\\"សូមស្វាគមន៍\\\",\\\"en\\\":\\\"Welcome\\\"}}",
                      "customColors": "{\\\"primary\\\":\\\"#7A294A\\\",\\\"accent\\\":\\\"#D6B36A\\\"}",
                      "customFonts": "{\\\"heading\\\":\\\"Noto Serif Khmer\\\",\\\"body\\\":\\\"Noto Sans Khmer\\\"}",
                      "enabledSections": "{\\\"story\\\":true,\\\"gallery\\\":true,\\\"rsvp\\\":true}",
                      "layoutSettings": "{\\\"hero\\\":\\\"full\\\",\\\"spacing\\\":\\\"comfortable\\\"}"
                    }
                    """);
            case "InvitationAccessVerifyRequest" -> one("guestLink", "Use the safe development guest token", """
                    {
                      "password": null,
                      "accessToken": null,
                      "inviteToken": "%s"
                    }
                    """.formatted(DevSampleData.ATTENDING_GUEST_TOKEN));
            case "GuestRequest" -> List.of(
                    example("individualGuest", "Individual guest", """
                            {
                              "guestName": "Dara Sok",
                              "phone": "012345679",
                              "email": "dara.sok@example.com",
                              "guestGroup": "Friends",
                              "sideType": "GROOM",
                              "tableNumber": "A1",
                              "sendStatus": "PENDING",
                              "seatCount": 1,
                              "note": "Vegetarian meal",
                              "contributionStatus": "PENDING",
                              "totalContributed": 0
                            }
                            """),
                    example("familyGuest", "Family invitation", """
                            {
                              "guestName": "Chan Family",
                              "phone": "012345680",
                              "email": "chan.family@example.com",
                              "guestGroup": "Family",
                              "sideType": "BRIDE",
                              "tableNumber": "B1",
                              "sendStatus": "PENDING",
                              "seatCount": 4,
                              "note": "Family seating requested",
                              "contributionStatus": "PENDING",
                              "totalContributed": 0
                            }
                            """));
            case "GuestImportRequest" -> one("guestImport", "Import two fictional guests", """
                    {
                      "guests": [
                        {
                          "guestName": "Vanna Keo",
                          "phone": "012345681",
                          "email": "vanna.keo@example.com",
                          "guestGroup": "Colleagues",
                          "sideType": "GROOM",
                          "seatCount": 1,
                          "sendStatus": "PENDING",
                          "contributionStatus": "PENDING",
                          "totalContributed": 0
                        },
                        {
                          "guestName": "Sophea Lim",
                          "phone": "012345682",
                          "email": "sophea.lim@example.com",
                          "guestGroup": "Friends",
                          "sideType": "BRIDE",
                          "seatCount": 2,
                          "sendStatus": "PENDING",
                          "contributionStatus": "PENDING",
                          "totalContributed": 0
                        }
                      ]
                    }
                    """);
            case "RsvpRequest" -> rsvpExamples();
            case "RsvpUpdateRequest" -> List.of(
                    example("attending", "Mark the RSVP as attending", """
                            {"responseStatus":"ATTENDING","attendeeCount":2,"message":"We look forward to celebrating with you."}
                            """),
                    example("notAttending", "Mark the RSVP as not attending", """
                            {"responseStatus":"NOT_ATTENDING","attendeeCount":0,"message":"Thank you for inviting us."}
                            """));
            case "CheckInScanRequest" -> one("fixtureGuest", "Check in the attending fixture guest", """
                    {"token":"%s","note":"Checked in from the Scalar API reference"}
                    """.formatted(DevSampleData.ATTENDING_GUEST_TOKEN));
            case "ManualCheckInRequest" -> one("manualCheckIn", "Manually check in a guest", """
                    {"note":"Verified by the reception team"}
                    """);
            case "EventRequest" -> one("weddingEvent", "Create a legacy wedding event", """
                    {
                      "eventName": "Sokha & Pisey Wedding",
                      "templateType": "WEDDING",
                      "groom": "Sokha",
                      "bride": "Pisey",
                      "eventDate": "2035-02-17",
                      "eatingTime": "18:00:00",
                      "location": "Phnom Penh",
                      "description": "A fictional bilingual wedding celebration.",
                      "coverImageUrl": "https://example.com/images/demo-wedding-cover.webp"
                    }
                    """);
            case "WeddingGiftRequest" -> one("cashGift", "Record a fictional wedding gift", """
                    {
                      "name": "Vanna Keo",
                      "amount": 50.00,
                      "method": "CASH",
                      "date": "2035-02-17",
                      "note": "With best wishes"
                    }
                    """);
            case "OrganizationRequest" -> one("eventTeam", "Create an event organization", """
                    {"name":"Koupreng Demo Events"}
                    """);
            case "OrganizationMemberRequest" -> one("teamMember", "Add the demo administrator as a manager", """
                    {"email":"%s","role":"MANAGER"}
                    """.formatted(DevSampleData.ADMIN_EMAIL));
            case "OrganizationMemberRoleRequest" -> one("manager", "Update an organization member role", """
                    {"role":"MANAGER"}
                    """);
            case "SubscriptionPurchaseRequest" -> one("developmentPackage", "Purchase the selected package", """
                    {"packageId":1}
                    """);
            case "SubscriptionPackageRequest" -> one("starterPackage", "Create or update a safe package definition", """
                    {
                      "packageName": "Developer Starter",
                      "code": "DEV_STARTER",
                      "description": "A fictional package definition for local API testing.",
                      "price": 0.00,
                      "currency": "USD",
                      "billingInterval": "ONCE",
                      "durationDays": 30,
                      "maxInvitations": 3,
                      "maxGuests": 200,
                      "maxGuestsPerInvitation": 100,
                      "maxTeamMembers": 3,
                      "featuresJson": "{\\\"developerFixture\\\":true}",
                      "premiumTemplatesEnabled": false,
                      "qrInvitationsEnabled": true,
                      "qrCheckInEnabled": true,
                      "seatingEnabled": true,
                      "advancedAnalyticsEnabled": false,
                      "customBrandingEnabled": false,
                      "teamMembersEnabled": true,
                      "aiAssistantEnabled": true,
                      "active": true,
                      "sortOrder": 100
                    }
                    """);
            case "DeliveryRequest" -> one("selectedGuests", "Queue an invitation delivery", """
                    {
                      "guestIds": [1],
                      "allEligible": false,
                      "subject": "You are invited to our wedding",
                      "message": "Please open your personal invitation and let us know if you can attend."
                    }
                    """);
            case "CreateBudgetRequest", "UpdateBudgetRequest" -> one("weddingBudget", "Set the event budget", """
                    {"totalBudget":12000.00,"notes":"Fictional wedding budget in USD"}
                    """);
            case "CreateBudgetItemRequest", "UpdateBudgetItemRequest" -> one("venueBudget", "Add or update a venue budget item", """
                    {
                      "category": "Venue",
                      "itemName": "Reception venue",
                      "estimatedCost": 3500.00,
                      "actualCost": 0.00,
                      "vendorName": "Phnom Penh Demo Venue",
                      "notes": "Fictional estimate for development testing"
                    }
                    """);
            case "BudgetItemRequest" -> one("legacyBudgetItem", "Add or update a legacy budget item", """
                    {
                      "name": "Wedding flowers",
                      "category": "Decoration",
                      "budget": 800.00,
                      "amount": 0.00,
                      "date": "2035-02-01",
                      "status": "PLANNED",
                      "vendorName": "Demo Florist",
                      "notes": "Fictional flower estimate"
                    }
                    """);
            case "EventTableRequest" -> one("familyTable", "Create a reception table", """
                    {
                      "tableName": "Family Table A",
                      "tableLabel": "A1",
                      "capacity": 10,
                      "sortOrder": 1,
                      "notes": "Reserved for close family"
                    }
                    """);
            case "SeatAssignmentRequest" -> one("assignGuest", "Assign a fixture guest to a fixture table", """
                    {
                      "guestId": 1,
                      "tableId": 1,
                      "seatLabel": "A1-01",
                      "seatCount": 1,
                      "notes": "Window-side seat"
                    }
                    """);
            case "CreateNotificationRequest" -> one("systemNotice", "Create an in-app development notification", """
                    {
                      "userId": 1,
                      "invitationId": 1,
                      "guestId": null,
                      "rsvpId": null,
                      "paymentOrderId": null,
                      "type": "ADMIN_NOTICE",
                      "channel": "SYSTEM",
                      "status": "PENDING",
                      "title": "Development API notification",
                      "message": "This fictional notification was created from Scalar.",
                      "recipientName": "Koupreng Demo User",
                      "recipientEmail": "%s",
                      "recipientPhone": null,
                      "recipientTelegramId": null
                    }
                    """.formatted(DevSampleData.USER_EMAIL));
            case "NotificationStatusUpdateRequest" -> one("markDelivered", "Update delivery status", """
                    {"status":"DELIVERED","providerMessageId":"demo-provider-message-001","errorMessage":null}
                    """);
            case "CreateTemplatePaymentRequest" -> one("pendingStaticOrder", "Create a pending static ABA order; this does not confirm payment", """
                    {
                      "templateId": 1,
                      "templateName": "Koupreng Demo Wedding",
                      "packageName": "Single Template",
                      "amount": 0.01,
                      "currency": "USD",
                      "buyerName": "Koupreng Demo User",
                      "buyerEmail": "%s",
                      "buyerPhone": "012345678"
                    }
                    """.formatted(DevSampleData.USER_EMAIL));
            case "ConfirmTemplatePaymentRequest" -> one("adminReview", "Requires a real pending order and administrator authorization", """
                    {"orderCode":"<pending-order-code>","amount":0.01,"confirmedBy":"admin-demo"}
                    """);
            case "TelegramDetectPaymentRequest" -> one("adminReview", "Safe placeholder requiring administrator authorization", """
                    {
                      "rawMessage": "<verified-provider-message>",
                      "detectedBy": "admin-demo",
                      "telegramChatId": "<telegram-chat-id>",
                      "telegramMessageId": "<telegram-message-id>",
                      "telegramSenderUsername": "<telegram-username>",
                      "telegramSenderId": "<telegram-sender-id>",
                      "detectedOrderCode": "<pending-order-code>",
                      "detectedAmount": 0.01,
                      "detectedCurrency": "USD",
                      "paywayTransactionId": null,
                      "paywayApprovalCode": null
                    }
                    """);
            case "AiInvitationDraftRequest" -> one("bilingualWedding", "Generate fictional bilingual wedding copy", """
                    {
                      "language": "BILINGUAL",
                      "tone": "warm and formal",
                      "eventType": "WEDDING",
                      "coupleNames": "Sokha and Pisey",
                      "hostName": "The Sok and Lim families",
                      "venueName": "Phnom Penh Demo Ballroom",
                      "eventDate": "2035-02-17",
                      "notes": "Include a concise Khmer welcome and an English translation."
                    }
                    """);
            case "AdminUpdateUserRoleRequest" -> one("administrator", "Grant the administrator role", """
                    {"role":"ADMIN"}
                    """);
            case "AdminUpdateUserStatusRequest" -> one("activateUser", "Activate a user account", """
                    {"status":"ACTIVE"}
                    """);
            case "AdminTemplateRequest" -> one("demoTemplate", "Create a fictional wedding template", """
                    {
                      "name": "Koupreng Demo Wedding",
                      "code": "%s",
                      "category": "TRADITIONAL",
                      "description": "A fictional bilingual Khmer wedding template.",
                      "thumbnailUrl": "https://example.com/images/demo-template-thumb.webp",
                      "previewUrl": "https://example.com/images/demo-template-preview.webp",
                      "price": 0.00,
                      "currency": "USD",
                      "premium": false,
                      "status": "ACTIVE",
                      "sortOrder": 100
                    }
                    """.formatted(DevSampleData.TEMPLATE_CODE));
            case "AdminTemplatePremiumRequest" -> one("markPremium", "Change the premium classification", """
                    {"premium":true}
                    """);
            case "AdminInvitationModerationRequest" -> one("hideInvitation", "Hide an invitation after review", """
                    {"status":"HIDDEN","reason":"Fictional moderation example"}
                    """);
            default -> List.of();
        };
    }

    private static List<NamedExample> invitationExamples() {
        return List.of(
                example("khmerWedding", "Khmer bilingual wedding", """
                        {
                          "templateId": null,
                          "organizationId": null,
                          "title": "Sokha & Pisey Wedding",
                          "eventType": "WEDDING",
                          "eventDate": "2035-02-17",
                          "eventTime": "18:00:00",
                          "venueName": "Phnom Penh Demo Ballroom",
                          "venueAddress": "Russian Federation Boulevard, Phnom Penh",
                          "googleMapUrl": "https://maps.google.com/?q=Phnom+Penh",
                          "hostName": "The Sok and Lim families",
                          "partnerName": "Pisey Lim",
                          "groomName": "Sokha Sok",
                          "brideName": "Pisey Lim",
                          "storyText": "A fictional celebration of two families joining together.",
                          "languageMode": "BILINGUAL",
                          "designJson": "{\\\"theme\\\":\\\"traditional-khmer\\\",\\\"heroStyle\\\":\\\"floral\\\"}",
                          "contentJson": "{\\\"welcome\\\":{\\\"km\\\":\\\"សូមគោរពអញ្ជើញ\\\",\\\"en\\\":\\\"You are warmly invited\\\"}}",
                          "customColors": "{\\\"primary\\\":\\\"#7A294A\\\",\\\"accent\\\":\\\"#D6B36A\\\"}",
                          "customFonts": "{\\\"heading\\\":\\\"Noto Serif Khmer\\\",\\\"body\\\":\\\"Noto Sans Khmer\\\"}",
                          "enabledSections": "{\\\"story\\\":true,\\\"gallery\\\":true,\\\"rsvp\\\":true,\\\"gifts\\\":true}",
                          "layoutSettings": "{\\\"hero\\\":\\\"full\\\",\\\"spacing\\\":\\\"comfortable\\\"}",
                          "visibility": "PUBLIC",
                          "accessPassword": null,
                          "rsvpDeadline": "2035-02-10"
                        }
                        """),
                example("birthday", "Birthday celebration", """
                        {
                          "templateId": null,
                          "organizationId": null,
                          "title": "Malis's Birthday Celebration",
                          "eventType": "BIRTHDAY",
                          "eventDate": "2035-06-14",
                          "eventTime": "17:30:00",
                          "venueName": "Riverside Demo Garden",
                          "venueAddress": "Sisowath Quay, Phnom Penh",
                          "googleMapUrl": "https://maps.google.com/?q=Sisowath+Quay+Phnom+Penh",
                          "hostName": "The Chea family",
                          "partnerName": null,
                          "groomName": null,
                          "brideName": null,
                          "storyText": "Join us for a fictional sunset birthday celebration.",
                          "languageMode": "BILINGUAL",
                          "designJson": "{\\\"theme\\\":\\\"bright-modern\\\"}",
                          "contentJson": "{\\\"welcome\\\":{\\\"km\\\":\\\"សូមស្វាគមន៍\\\",\\\"en\\\":\\\"Come celebrate with us\\\"}}",
                          "customColors": "{\\\"primary\\\":\\\"#6C5CE7\\\",\\\"accent\\\":\\\"#FDCB6E\\\"}",
                          "customFonts": "{\\\"heading\\\":\\\"Noto Sans Khmer\\\",\\\"body\\\":\\\"Inter\\\"}",
                          "enabledSections": "{\\\"story\\\":true,\\\"gallery\\\":true,\\\"rsvp\\\":true}",
                          "layoutSettings": "{\\\"hero\\\":\\\"centered\\\"}",
                          "visibility": "PUBLIC",
                          "accessPassword": null,
                          "rsvpDeadline": "2035-06-07"
                        }
                        """),
                example("corporateEvent", "Corporate reception", """
                        {
                          "templateId": null,
                          "organizationId": null,
                          "title": "Koupreng Demo Product Reception",
                          "eventType": "CORPORATE",
                          "eventDate": "2035-09-12",
                          "eventTime": "09:00:00",
                          "venueName": "Phnom Penh Demo Convention Hall",
                          "venueAddress": "Tonle Bassac, Phnom Penh",
                          "googleMapUrl": "https://maps.google.com/?q=Tonle+Bassac+Phnom+Penh",
                          "hostName": "Koupreng Demo Events",
                          "partnerName": null,
                          "groomName": null,
                          "brideName": null,
                          "storyText": "A fictional event for API development and testing.",
                          "languageMode": "EN",
                          "designJson": "{\\\"theme\\\":\\\"corporate-minimal\\\"}",
                          "contentJson": "{\\\"welcome\\\":\\\"Join our product reception\\\"}",
                          "customColors": "{\\\"primary\\\":\\\"#17324D\\\",\\\"accent\\\":\\\"#37B5A5\\\"}",
                          "customFonts": "{\\\"heading\\\":\\\"Inter\\\",\\\"body\\\":\\\"Inter\\\"}",
                          "enabledSections": "{\\\"agenda\\\":true,\\\"speakers\\\":true,\\\"rsvp\\\":true}",
                          "layoutSettings": "{\\\"hero\\\":\\\"split\\\"}",
                          "visibility": "PUBLIC",
                          "accessPassword": null,
                          "rsvpDeadline": "2035-09-05"
                        }
                        """));
    }

    private static List<NamedExample> rsvpExamples() {
        return List.of(
                example("attending", "Attending with a guest", """
                        {
                          "guestName": "Dara Sok",
                          "phone": "012345679",
                          "email": "dara.sok@example.com",
                          "responseStatus": "ATTENDING",
                          "attendeeCount": 2,
                          "message": "We are delighted to celebrate with you."
                        }
                        """),
                example("notAttending", "Unable to attend", """
                        {
                          "guestName": "Sophea Lim",
                          "phone": "012345682",
                          "email": "sophea.lim@example.com",
                          "responseStatus": "NOT_ATTENDING",
                          "attendeeCount": 0,
                          "message": "Thank you for the invitation; we send our best wishes."
                        }
                        """));
    }

    private static List<NamedExample> one(String name, String summary, String json) {
        return List.of(example(name, summary, json));
    }

    private static NamedExample example(String name, String summary, String json) {
        return new NamedExample(name, summary, json.strip());
    }

    record NamedExample(String name, String summary, String json) {
    }
}
