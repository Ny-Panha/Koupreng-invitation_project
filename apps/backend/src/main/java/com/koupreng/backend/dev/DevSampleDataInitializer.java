package com.koupreng.backend.dev;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.koupreng.backend.entity.budget.Budget;
import com.koupreng.backend.entity.budget.BudgetItem;
import com.koupreng.backend.entity.gift.WeddingGift;
import com.koupreng.backend.entity.invitation.EventTable;
import com.koupreng.backend.entity.invitation.EventType;
import com.koupreng.backend.entity.invitation.Guest;
import com.koupreng.backend.entity.invitation.GuestCheckIn;
import com.koupreng.backend.entity.invitation.GuestSeatAssignment;
import com.koupreng.backend.entity.invitation.InvitationTemplate;
import com.koupreng.backend.entity.invitation.Rsvp;
import com.koupreng.backend.entity.invitation.TemplateCategory;
import com.koupreng.backend.entity.invitation.UserInvitation;
import com.koupreng.backend.entity.notification.Notification;
import com.koupreng.backend.entity.organization.Organization;
import com.koupreng.backend.entity.organization.OrganizationMember;
import com.koupreng.backend.entity.subscription.SubscriptionPackage;
import com.koupreng.backend.entity.user.AppUser;
import com.koupreng.backend.entity.user.Role;
import com.koupreng.backend.enums.InvitationModerationStatus;
import com.koupreng.backend.enums.InvitationStatus;
import com.koupreng.backend.enums.InvitationVisibility;
import com.koupreng.backend.enums.NotificationChannel;
import com.koupreng.backend.enums.NotificationStatus;
import com.koupreng.backend.enums.NotificationType;
import com.koupreng.backend.enums.RsvpStatus;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates a small, repeatable data set for interactive local API testing.
 * The component cannot load outside the dev profile and also requires an
 * explicit property, providing two independent production safeguards.
 */
@Component
@Profile("dev")
@ConditionalOnProperty(name = "app.dev-sample-data.enabled", havingValue = "true")
public class DevSampleDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevSampleDataInitializer.class);
    private static final String DEMO_NOTIFICATION_TITLE = "Welcome to the Koupreng development API";
    private static final String FAMILY_TABLE_NAME = "Family Table A";

    private final EntityManager entityManager;
    private final PasswordEncoder passwordEncoder;

    public DevSampleDataInitializer(EntityManager entityManager, PasswordEncoder passwordEncoder) {
        this.entityManager = entityManager;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        AppUser user = ensureUser(
                DevSampleData.USER_EMAIL,
                DevSampleData.USER_PASSWORD,
                "Koupreng Demo User",
                Role.USER
        );
        AppUser admin = ensureUser(
                DevSampleData.ADMIN_EMAIL,
                DevSampleData.ADMIN_PASSWORD,
                "Koupreng Demo Administrator",
                Role.ADMIN
        );
        InvitationTemplate template = ensureTemplate();
        Organization organization = ensureOrganization(user);
        ensureMember(organization, user, OrganizationMember.ROLE_OWNER);
        ensureMember(organization, admin, OrganizationMember.ROLE_ADMIN);
        UserInvitation invitation = ensureInvitation(user, template, organization);

        Guest attendingGuest = ensureGuest(
                invitation,
                DevSampleData.ATTENDING_GUEST_TOKEN,
                "Dara Sok",
                "dara.sok@example.com",
                "012345679",
                "Friends",
                "GROOM",
                2
        );
        Guest declinedGuest = ensureGuest(
                invitation,
                DevSampleData.DECLINED_GUEST_TOKEN,
                "Sophea Lim",
                "sophea.lim@example.com",
                "012345682",
                "Friends",
                "BRIDE",
                1
        );
        ensureGuest(
                invitation,
                DevSampleData.PENDING_GUEST_TOKEN,
                "Chan Family",
                "chan.family@example.com",
                "012345680",
                "Family",
                "BRIDE",
                4
        );
        ensureRsvp(invitation, attendingGuest, RsvpStatus.ATTENDING, 2,
                "We are delighted to celebrate with you.");
        ensureRsvp(invitation, declinedGuest, RsvpStatus.NOT_ATTENDING, 0,
                "Thank you for the invitation; we send our best wishes.");

        EventTable table = ensureTable(invitation);
        ensureSeatAssignment(invitation, table, attendingGuest);
        ensureCheckIn(invitation, attendingGuest, admin);
        ensureBudget(invitation);
        ensureWeddingGift(invitation);
        ensureNotification(user, invitation);
        ensurePackage();
        entityManager.flush();

        log.info(
                "Development fixtures ready: userId={}, adminId={}, templateId={}, organizationId={}, "
                        + "invitationId={}, invitationSlug={}, attendingGuestId={}, tableId={}",
                user.getId(), admin.getId(), template.getId(), organization.getId(), invitation.getId(),
                invitation.getSlug(), attendingGuest.getId(), table.getId()
        );
    }

    private AppUser ensureUser(String email, String password, String fullName, Role role) {
        AppUser user = first(
                AppUser.class,
                "select u from AppUser u where lower(u.email) = lower(:email)",
                "email",
                email
        );
        boolean created = user == null;
        if (created) {
            user = new AppUser();
            user.setEmail(email);
        }
        user.setFullName(fullName);
        user.setRole(role);
        user.setStatus(AppUser.STATUS_ACTIVE);
        if (user.getPasswordHash() == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            user.setPasswordHash(passwordEncoder.encode(password));
        }
        if (created) {
            entityManager.persist(user);
        }
        return user;
    }

    private InvitationTemplate ensureTemplate() {
        InvitationTemplate template = first(
                InvitationTemplate.class,
                "select t from InvitationTemplate t where lower(t.code) = lower(:code)",
                "code",
                DevSampleData.TEMPLATE_CODE
        );
        boolean created = template == null;
        if (created) {
            template = new InvitationTemplate();
            template.setCode(DevSampleData.TEMPLATE_CODE);
        }
        template.setName("Koupreng Demo Wedding");
        template.setCategory(TemplateCategory.TRADITIONAL);
        template.setDescription("Fictional bilingual Khmer wedding template for local API testing.");
        template.setPrice(BigDecimal.ZERO);
        template.setCurrency("USD");
        template.setPremium(false);
        template.setStatus("ACTIVE");
        template.setSortOrder(100);
        if (created) {
            entityManager.persist(template);
        }
        return template;
    }

    private Organization ensureOrganization(AppUser owner) {
        Organization organization = first(
                Organization.class,
                "select o from Organization o where o.slug = :slug",
                "slug",
                DevSampleData.ORGANIZATION_SLUG
        );
        boolean created = organization == null;
        if (created) {
            organization = new Organization();
            organization.setSlug(DevSampleData.ORGANIZATION_SLUG);
        }
        organization.setName("Koupreng Demo Events");
        organization.setOwner(owner);
        organization.setStatus(Organization.STATUS_ACTIVE);
        if (created) {
            entityManager.persist(organization);
        }
        return organization;
    }

    private void ensureMember(Organization organization, AppUser user, String role) {
        OrganizationMember member = first(
                OrganizationMember.class,
                "select m from OrganizationMember m where m.organization = :organization "
                        + "and lower(m.email) = lower(:email)",
                List.of("organization", "email"),
                List.of(organization, user.getEmail())
        );
        boolean created = member == null;
        if (created) {
            member = new OrganizationMember();
            member.setOrganization(organization);
            member.setEmail(user.getEmail());
        }
        member.setUser(user);
        member.setRole(role);
        member.setStatus(OrganizationMember.STATUS_ACTIVE);
        if (member.getJoinedAt() == null) {
            member.setJoinedAt(Instant.now());
        }
        if (created) {
            entityManager.persist(member);
        }
    }

    private UserInvitation ensureInvitation(
            AppUser user,
            InvitationTemplate template,
            Organization organization
    ) {
        UserInvitation invitation = first(
                UserInvitation.class,
                "select i from UserInvitation i where i.slug = :slug",
                "slug",
                DevSampleData.INVITATION_SLUG
        );
        boolean created = invitation == null;
        if (created) {
            invitation = new UserInvitation();
            invitation.setSlug(DevSampleData.INVITATION_SLUG);
        }
        invitation.setUser(user);
        invitation.setTemplate(template);
        invitation.setOrganization(organization);
        invitation.setTitle("Sokha & Pisey Wedding");
        invitation.setEventType(EventType.WEDDING);
        invitation.setEventDate(LocalDate.of(2035, 2, 17));
        invitation.setEventTime(LocalTime.of(18, 0));
        invitation.setVenueName("Phnom Penh Demo Ballroom");
        invitation.setVenueAddress("Russian Federation Boulevard, Phnom Penh");
        invitation.setGoogleMapUrl("https://maps.google.com/?q=Phnom+Penh");
        invitation.setHostName("The Sok and Lim families");
        invitation.setPartnerName("Pisey Lim");
        invitation.setGroomName("Sokha Sok");
        invitation.setBrideName("Pisey Lim");
        invitation.setStoryText("A fictional celebration of two families joining together.");
        invitation.setLanguageMode("BILINGUAL");
        invitation.setDesignJson("{\"theme\":\"traditional-khmer\",\"heroStyle\":\"floral\"}");
        invitation.setContentJson(
                "{\"welcome\":{\"km\":\"សូមគោរពអញ្ជើញ\",\"en\":\"You are warmly invited\"}}"
        );
        invitation.setCustomColors("{\"primary\":\"#7A294A\",\"accent\":\"#D6B36A\"}");
        invitation.setCustomFonts("{\"heading\":\"Noto Serif Khmer\",\"body\":\"Noto Sans Khmer\"}");
        invitation.setEnabledSections("{\"story\":true,\"gallery\":true,\"rsvp\":true,\"gifts\":true}");
        invitation.setLayoutSettings("{\"hero\":\"full\",\"spacing\":\"comfortable\"}");
        invitation.setVisibility(InvitationVisibility.PUBLIC);
        invitation.setAccessPassword(null);
        invitation.setAccessToken(DevSampleData.INVITATION_ACCESS_TOKEN);
        invitation.setRsvpDeadline(LocalDate.of(2035, 2, 10));
        invitation.setStatus(InvitationStatus.PUBLISHED);
        invitation.setModerationStatus(InvitationModerationStatus.ACTIVE);
        invitation.setDeleted(false);
        if (invitation.getPublishedAt() == null) {
            invitation.setPublishedAt(Instant.now());
        }
        if (created) {
            entityManager.persist(invitation);
        }
        return invitation;
    }

    private Guest ensureGuest(
            UserInvitation invitation,
            String inviteToken,
            String name,
            String email,
            String phone,
            String group,
            String side,
            int seats
    ) {
        Guest guest = first(
                Guest.class,
                "select g from Guest g where g.inviteToken = :inviteToken",
                "inviteToken",
                inviteToken
        );
        boolean created = guest == null;
        if (created) {
            guest = new Guest();
            guest.setInviteToken(inviteToken);
        }
        guest.setInvitation(invitation);
        guest.setGuestName(name);
        guest.setEmail(email);
        guest.setPhone(phone);
        guest.setGuestGroup(group);
        guest.setSideType(side);
        guest.setTableNumber("A1");
        guest.setSendStatus("SENT");
        guest.setSeatCount(seats);
        guest.setNote("Fictional development guest");
        guest.setContributionStatus("PENDING");
        guest.setTotalContributed(BigDecimal.ZERO);
        if (created) {
            entityManager.persist(guest);
        }
        return guest;
    }

    private void ensureRsvp(
            UserInvitation invitation,
            Guest guest,
            RsvpStatus status,
            int attendeeCount,
            String message
    ) {
        Rsvp rsvp = first(
                Rsvp.class,
                "select r from Rsvp r where r.invitation = :invitation and r.guest = :guest",
                List.of("invitation", "guest"),
                List.of(invitation, guest)
        );
        boolean created = rsvp == null;
        if (created) {
            rsvp = new Rsvp();
            rsvp.setInvitation(invitation);
            rsvp.setGuest(guest);
        }
        rsvp.setResponseStatus(status);
        rsvp.setAttendeeCount(attendeeCount);
        rsvp.setMessage(message);
        if (created) {
            entityManager.persist(rsvp);
        }
    }

    private EventTable ensureTable(UserInvitation invitation) {
        EventTable table = first(
                EventTable.class,
                "select t from EventTable t where t.invitation = :invitation and lower(t.tableName) = lower(:name)",
                List.of("invitation", "name"),
                List.of(invitation, FAMILY_TABLE_NAME)
        );
        boolean created = table == null;
        if (created) {
            table = new EventTable();
            table.setInvitation(invitation);
            table.setTableName(FAMILY_TABLE_NAME);
        }
        table.setTableLabel("A1");
        table.setCapacity(10);
        table.setSortOrder(1);
        table.setNotes("Reserved for close family");
        if (created) {
            entityManager.persist(table);
        }
        return table;
    }

    private void ensureSeatAssignment(UserInvitation invitation, EventTable table, Guest guest) {
        GuestSeatAssignment assignment = first(
                GuestSeatAssignment.class,
                "select a from GuestSeatAssignment a where a.invitation = :invitation and a.guest = :guest",
                List.of("invitation", "guest"),
                List.of(invitation, guest)
        );
        boolean created = assignment == null;
        if (created) {
            assignment = new GuestSeatAssignment();
            assignment.setInvitation(invitation);
            assignment.setGuest(guest);
        }
        assignment.setTable(table);
        assignment.setSeatLabel("A1-01");
        assignment.setSeatCount(guest.getSeatCount());
        assignment.setNotes("Fictional fixture seating assignment");
        if (created) {
            entityManager.persist(assignment);
        }
    }

    private void ensureCheckIn(UserInvitation invitation, Guest guest, AppUser admin) {
        GuestCheckIn checkIn = first(
                GuestCheckIn.class,
                "select c from GuestCheckIn c where c.invitation = :invitation and c.guest = :guest",
                List.of("invitation", "guest"),
                List.of(invitation, guest)
        );
        boolean created = checkIn == null;
        if (created) {
            checkIn = new GuestCheckIn();
            checkIn.setInvitation(invitation);
            checkIn.setGuest(guest);
        }
        checkIn.setCheckedInBy(admin);
        checkIn.setSource("MANUAL");
        checkIn.setNote("Development fixture check-in");
        if (created) {
            entityManager.persist(checkIn);
        }
    }

    private void ensureBudget(UserInvitation invitation) {
        Budget budget = first(
                Budget.class,
                "select b from Budget b where b.invitation = :invitation",
                "invitation",
                invitation
        );
        boolean created = budget == null;
        if (created) {
            budget = new Budget();
            budget.setInvitation(invitation);
        }
        budget.setTotalBudget(new BigDecimal("12000.00"));
        budget.setNotes("Fictional wedding budget in USD");
        if (created) {
            entityManager.persist(budget);
        }
        ensureBudgetItem(budget, "Reception venue", "Venue", "3500.00", "Phnom Penh Demo Venue");
        ensureBudgetItem(budget, "Wedding flowers", "Decoration", "800.00", "Demo Florist");
    }

    private void ensureBudgetItem(
            Budget budget,
            String itemName,
            String category,
            String estimatedCost,
            String vendorName
    ) {
        BudgetItem item = first(
                BudgetItem.class,
                "select i from BudgetItem i where i.budget = :budget and lower(i.itemName) = lower(:itemName)",
                List.of("budget", "itemName"),
                List.of(budget, itemName)
        );
        boolean created = item == null;
        if (created) {
            item = new BudgetItem();
            item.setBudget(budget);
            item.setItemName(itemName);
        }
        item.setCategory(category);
        item.setEstimatedCost(new BigDecimal(estimatedCost));
        item.setActualCost(BigDecimal.ZERO);
        item.setExpenseDate(LocalDate.of(2035, 2, 1));
        item.setStatus("PLANNED");
        item.setVendorName(vendorName);
        item.setNotes("Fictional development estimate");
        if (created) {
            entityManager.persist(item);
        }
    }

    private void ensureWeddingGift(UserInvitation invitation) {
        WeddingGift gift = first(
                WeddingGift.class,
                "select g from WeddingGift g where g.invitation = :invitation and g.giverName = :name",
                List.of("invitation", "name"),
                List.of(invitation, "Vanna Keo")
        );
        boolean created = gift == null;
        if (created) {
            gift = new WeddingGift();
            gift.setInvitation(invitation);
            gift.setGiverName("Vanna Keo");
        }
        gift.setAmount(new BigDecimal("50.00"));
        gift.setMethod("CASH");
        gift.setReceivedDate(LocalDate.of(2035, 2, 17));
        gift.setNote("With best wishes");
        if (created) {
            entityManager.persist(gift);
        }
    }

    private void ensureNotification(AppUser user, UserInvitation invitation) {
        Notification notification = first(
                Notification.class,
                "select n from Notification n where n.user = :user and n.title = :title",
                List.of("user", "title"),
                List.of(user, DEMO_NOTIFICATION_TITLE)
        );
        boolean created = notification == null;
        if (created) {
            notification = new Notification();
            notification.setUser(user);
            notification.setTitle(DEMO_NOTIFICATION_TITLE);
        }
        notification.setInvitation(invitation);
        notification.setType(NotificationType.ADMIN_NOTICE);
        notification.setChannel(NotificationChannel.SYSTEM);
        notification.setStatus(NotificationStatus.PENDING);
        notification.setMessage("Use Scalar at /docs to explore the fictional development dataset.");
        notification.setRecipientName(user.getFullName());
        notification.setRecipientEmail(user.getEmail());
        if (created) {
            entityManager.persist(notification);
        }
    }

    private void ensurePackage() {
        SubscriptionPackage subscriptionPackage = first(
                SubscriptionPackage.class,
                "select p from SubscriptionPackage p where p.code = :code",
                "code",
                DevSampleData.PACKAGE_CODE
        );
        boolean created = subscriptionPackage == null;
        if (created) {
            subscriptionPackage = new SubscriptionPackage();
            subscriptionPackage.setCode(DevSampleData.PACKAGE_CODE);
        }
        subscriptionPackage.setPackageName("Developer Starter");
        subscriptionPackage.setDescription("Free fictional package for local API exploration; no subscription is granted by seeding.");
        subscriptionPackage.setPrice(BigDecimal.ZERO);
        subscriptionPackage.setCurrency("USD");
        subscriptionPackage.setBillingInterval("ONCE");
        subscriptionPackage.setDurationDays(30);
        subscriptionPackage.setMaxInvitations(3);
        subscriptionPackage.setMaxGuests(200);
        subscriptionPackage.setMaxGuestsPerInvitation(100);
        subscriptionPackage.setMaxTeamMembers(3);
        subscriptionPackage.setFeaturesJson("{\"developerFixture\":true}");
        subscriptionPackage.setStatus("ACTIVE");
        subscriptionPackage.setPremiumTemplatesEnabled(false);
        subscriptionPackage.setQrInvitationsEnabled(true);
        subscriptionPackage.setQrCheckInEnabled(true);
        subscriptionPackage.setSeatingEnabled(true);
        subscriptionPackage.setAdvancedAnalyticsEnabled(false);
        subscriptionPackage.setCustomBrandingEnabled(false);
        subscriptionPackage.setTeamMembersEnabled(true);
        subscriptionPackage.setAiAssistantEnabled(true);
        subscriptionPackage.setActive(true);
        subscriptionPackage.setSortOrder(100);
        if (created) {
            entityManager.persist(subscriptionPackage);
        }
    }

    private <T> T first(Class<T> type, String queryText, String parameterName, Object parameterValue) {
        return first(type, queryText, List.of(parameterName), List.of(parameterValue));
    }

    private <T> T first(
            Class<T> type,
            String queryText,
            List<String> parameterNames,
            List<Object> parameterValues
    ) {
        TypedQuery<T> query = entityManager.createQuery(queryText, type).setMaxResults(1);
        for (int index = 0; index < parameterNames.size(); index++) {
            query.setParameter(parameterNames.get(index), parameterValues.get(index));
        }
        return query.getResultStream().findFirst().orElse(null);
    }
}
