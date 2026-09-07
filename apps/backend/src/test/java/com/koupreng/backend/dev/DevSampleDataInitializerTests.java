package com.koupreng.backend.dev;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.koupreng.backend.entity.user.Role;
import com.koupreng.backend.repository.AppUserRepository;
import com.koupreng.backend.repository.BudgetItemRepository;
import com.koupreng.backend.repository.BudgetRepository;
import com.koupreng.backend.repository.EventTableRepository;
import com.koupreng.backend.repository.GuestCheckInRepository;
import com.koupreng.backend.repository.GuestRepository;
import com.koupreng.backend.repository.GuestSeatAssignmentRepository;
import com.koupreng.backend.repository.InvitationTemplateRepository;
import com.koupreng.backend.repository.NotificationRepository;
import com.koupreng.backend.repository.OrganizationMemberRepository;
import com.koupreng.backend.repository.OrganizationRepository;
import com.koupreng.backend.repository.RsvpRepository;
import com.koupreng.backend.repository.SubscriptionPackageRepository;
import com.koupreng.backend.repository.SubscriptionRepository;
import com.koupreng.backend.repository.TemplatePaymentOrderRepository;
import com.koupreng.backend.repository.UserInvitationRepository;
import com.koupreng.backend.repository.WeddingGiftRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:dev-fixtures;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true",
        "spring.flyway.enabled=false",
        "app.dev-sample-data.enabled=true",
        "app.payment.admin-secret=fixture-test-secret",
        "app.waf.enabled=false",
        "scalar.enabled=false",
        "springdoc.api-docs.enabled=false"
})
@ActiveProfiles({"test", "dev"})
class DevSampleDataInitializerTests {

    @Autowired
    private DevSampleDataInitializer initializer;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private InvitationTemplateRepository templateRepository;

    @Autowired
    private UserInvitationRepository invitationRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationMemberRepository memberRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private RsvpRepository rsvpRepository;

    @Autowired
    private EventTableRepository tableRepository;

    @Autowired
    private GuestSeatAssignmentRepository assignmentRepository;

    @Autowired
    private GuestCheckInRepository checkInRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private BudgetItemRepository budgetItemRepository;

    @Autowired
    private WeddingGiftRepository giftRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SubscriptionPackageRepository packageRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private TemplatePaymentOrderRepository paymentOrderRepository;

    @Test
    void createsEncodedRelatedFixturesWithoutPaymentOrEntitlement() {
        var user = userRepository.findByEmailIgnoreCase(DevSampleData.USER_EMAIL).orElseThrow();
        var admin = userRepository.findByEmailIgnoreCase(DevSampleData.ADMIN_EMAIL).orElseThrow();
        var template = templateRepository.findAllByCodeIgnoreCaseOrderByCreatedAtDesc(
                DevSampleData.TEMPLATE_CODE).getFirst();
        var organization = organizationRepository.findBySlug(DevSampleData.ORGANIZATION_SLUG).orElseThrow();
        var invitation = invitationRepository.findBySlugAndDeletedFalse(DevSampleData.INVITATION_SLUG).orElseThrow();
        var attendingGuest = guestRepository.findByInviteToken(DevSampleData.ATTENDING_GUEST_TOKEN).orElseThrow();

        assertEquals(Role.USER, user.getRole());
        assertEquals(Role.ADMIN, admin.getRole());
        assertFalse(user.getPasswordHash().contains(DevSampleData.USER_PASSWORD));
        assertTrue(passwordEncoder.matches(DevSampleData.USER_PASSWORD, user.getPasswordHash()));
        assertTrue(passwordEncoder.matches(DevSampleData.ADMIN_PASSWORD, admin.getPasswordHash()));
        assertEquals(template.getId(), invitation.getTemplate().getId());
        assertEquals(organization.getId(), invitation.getOrganization().getId());
        assertEquals(user.getId(), invitation.getUser().getId());
        assertEquals(2, memberRepository.findByOrganizationIdOrderByCreatedAtAsc(organization.getId()).size());
        assertEquals(3, guestRepository.countByInvitationId(invitation.getId()));
        assertEquals(2, rsvpRepository.countByInvitationId(invitation.getId()));
        assertEquals(1, rsvpRepository.countPendingGuests(invitation.getId()));
        assertNotNull(rsvpRepository.findByInvitationIdAndGuestId(invitation.getId(), attendingGuest.getId())
                .orElseThrow().getMessage());
        assertEquals(1, tableRepository.findByInvitationIdOrderBySortOrderAscTableNameAsc(
                invitation.getId()).size());
        assertEquals(1, assignmentRepository.findByInvitationIdOrderByAssignedAtDesc(
                invitation.getId()).size());
        assertEquals(1, checkInRepository.countByInvitationId(invitation.getId()));
        var budget = budgetRepository.findByInvitationId(invitation.getId()).orElseThrow();
        assertEquals(2, budgetItemRepository.findByBudgetIdOrderByIdDesc(budget.getId()).size());
        assertEquals(1, giftRepository.findAllByInvitationId(invitation.getId()).size());
        assertEquals(1, notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).size());
        assertTrue(packageRepository.findAll().stream()
                .anyMatch(candidate -> DevSampleData.PACKAGE_CODE.equals(candidate.getCode())));
        assertEquals(0, subscriptionRepository.count());
        assertEquals(0, paymentOrderRepository.count());
    }

    @Test
    void rerunningInitializerIsIdempotent() throws Exception {
        Counts before = counts();

        initializer.run(null);

        assertEquals(before, counts());
    }

    private Counts counts() {
        return new Counts(
                userRepository.count(),
                templateRepository.count(),
                invitationRepository.count(),
                organizationRepository.count(),
                memberRepository.count(),
                guestRepository.count(),
                rsvpRepository.count(),
                tableRepository.count(),
                assignmentRepository.count(),
                checkInRepository.count(),
                budgetRepository.count(),
                budgetItemRepository.count(),
                giftRepository.count(),
                notificationRepository.count(),
                packageRepository.count()
        );
    }

    private record Counts(
            long users,
            long templates,
            long invitations,
            long organizations,
            long members,
            long guests,
            long rsvps,
            long tables,
            long assignments,
            long checkIns,
            long budgets,
            long budgetItems,
            long gifts,
            long notifications,
            long packages
    ) {
    }
}
