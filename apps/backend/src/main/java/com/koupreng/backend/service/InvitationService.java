package com.koupreng.backend.service;

import com.koupreng.backend.common.ApiException;
import com.koupreng.backend.dto.invitation.InvitationRequest;
import com.koupreng.backend.dto.invitation.InvitationResponse;
import com.koupreng.backend.dto.invitation.InvitationSummaryResponse;
import com.koupreng.backend.dto.invitation.InvitationAccessVerifyRequest;
import com.koupreng.backend.dto.invitation.InvitationAccessVerifyResponse;
import com.koupreng.backend.dto.invitation.InvitationCustomizationRequest;
import com.koupreng.backend.dto.invitation.InvitationCustomizationResponse;
import com.koupreng.backend.dto.invitation.PublicInvitationResponse;
import com.koupreng.backend.dto.invitation.GuestInvitationViewResponse;
import com.koupreng.backend.dto.rsvp.WishResponse;
import com.koupreng.backend.dto.media.MediaListResponse;
import com.koupreng.backend.entity.invitation.EventType;
import com.koupreng.backend.entity.invitation.Guest;
import com.koupreng.backend.entity.invitation.GuestSeatAssignment;
import com.koupreng.backend.entity.invitation.InvitationTemplate;
import com.koupreng.backend.entity.invitation.UserInvitation;
import com.koupreng.backend.entity.invitation.Rsvp;
import com.koupreng.backend.entity.organization.Organization;
import com.koupreng.backend.entity.user.AppUser;
import com.koupreng.backend.entity.user.Role;
import com.koupreng.backend.enums.InvitationModerationStatus;
import com.koupreng.backend.enums.InvitationStatus;
import com.koupreng.backend.enums.InvitationVisibility;
import com.koupreng.backend.repository.EventTableRepository;
import com.koupreng.backend.repository.InvitationTemplateRepository;
import com.koupreng.backend.repository.GuestRepository;
import com.koupreng.backend.repository.GuestCheckInRepository;
import com.koupreng.backend.repository.OrganizationMemberRepository;
import com.koupreng.backend.repository.OrganizationRepository;
import com.koupreng.backend.repository.UserInvitationRepository;
import com.koupreng.backend.repository.UserTemplateAccessRepository;
import com.koupreng.backend.repository.GuestSeatAssignmentRepository;
import com.koupreng.backend.repository.InvitationDeliveryEventRepository;
import com.koupreng.backend.repository.MediaFileRepository;
import com.koupreng.backend.repository.NotificationRepository;
import com.koupreng.backend.repository.RsvpRepository;
import com.koupreng.backend.config.AppProperties;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class InvitationService {

    private final UserInvitationRepository invitationRepository;
    private final InvitationTemplateRepository templateRepository;
    private final GuestRepository guestRepository;
    private final UserTemplateAccessRepository templateAccessRepository;
    private final GuestSeatAssignmentRepository seatAssignmentRepository;
    private final CurrentUserService currentUserService;
    private final PasswordEncoder passwordEncoder;
    private final RsvpRepository rsvpRepository;
    private final MediaFileRepository mediaFileRepository;
    private final AuditLogService auditLogService;
    private final AppProperties appProperties;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;

    @Autowired(required = false)
    private com.koupreng.backend.repository.BudgetRepository budgetRepository;

    @Autowired(required = false)
    private com.koupreng.backend.repository.BudgetItemRepository budgetItemRepository;

    @Autowired(required = false)
    private com.koupreng.backend.repository.WeddingGiftRepository weddingGiftRepository;

    @Autowired(required = false)
    private InvitationDeliveryEventRepository deliveryEventRepository;

    @Autowired(required = false)
    private NotificationRepository notificationRepository;

    @Autowired(required = false)
    private GuestCheckInRepository guestCheckInRepository;

    @Autowired(required = false)
    private EventTableRepository eventTableRepository;

    @Autowired
    public InvitationService(
            UserInvitationRepository invitationRepository,
            InvitationTemplateRepository templateRepository,
            UserTemplateAccessRepository templateAccessRepository,
            GuestRepository guestRepository,
            GuestSeatAssignmentRepository seatAssignmentRepository,
            CurrentUserService currentUserService,
            PasswordEncoder passwordEncoder,
            RsvpRepository rsvpRepository,
            MediaFileRepository mediaFileRepository,
            AuditLogService auditLogService,
            AppProperties appProperties,
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository organizationMemberRepository
    ) {
        this.invitationRepository = invitationRepository;
        this.templateRepository = templateRepository;
        this.templateAccessRepository = templateAccessRepository;
        this.guestRepository = guestRepository;
        this.seatAssignmentRepository = seatAssignmentRepository;
        this.currentUserService = currentUserService;
        this.passwordEncoder = passwordEncoder;
        this.rsvpRepository = rsvpRepository;
        this.mediaFileRepository = mediaFileRepository;
        this.auditLogService = auditLogService;
        this.appProperties = appProperties;
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
    }

    public InvitationService(
            UserInvitationRepository invitationRepository,
            InvitationTemplateRepository templateRepository,
            UserTemplateAccessRepository templateAccessRepository,
            GuestRepository guestRepository,
            GuestSeatAssignmentRepository seatAssignmentRepository,
            CurrentUserService currentUserService,
            PasswordEncoder passwordEncoder,
            RsvpRepository rsvpRepository,
            MediaFileRepository mediaFileRepository,
            AuditLogService auditLogService,
            AppProperties appProperties
    ) {
        this(invitationRepository, templateRepository, templateAccessRepository, guestRepository,
                seatAssignmentRepository, currentUserService, passwordEncoder, rsvpRepository,
                mediaFileRepository, auditLogService, appProperties, null, null);
    }

    public InvitationService(
            UserInvitationRepository invitationRepository,
            InvitationTemplateRepository templateRepository,
            UserTemplateAccessRepository templateAccessRepository,
            GuestRepository guestRepository,
            GuestSeatAssignmentRepository seatAssignmentRepository,
            CurrentUserService currentUserService,
            PasswordEncoder passwordEncoder
    ) {
        this(invitationRepository, templateRepository, templateAccessRepository, guestRepository, seatAssignmentRepository, currentUserService, passwordEncoder, null, null, null, null);
    }

    public InvitationService(
            UserInvitationRepository invitationRepository,
            InvitationTemplateRepository templateRepository,
            GuestRepository guestRepository,
            UserTemplateAccessRepository templateAccessRepository,
            CurrentUserService currentUserService,
            PasswordEncoder passwordEncoder
    ) {
        this(invitationRepository, templateRepository, templateAccessRepository, guestRepository, null,
                currentUserService, passwordEncoder, null, null, null, null);
    }

    @Transactional
    public InvitationResponse create(Authentication authentication, InvitationRequest request) {
        AppUser user = currentUserService.currentUser(authentication);
        UserInvitation invitation = new UserInvitation();
        invitation.setUser(user);
        invitation.setStatus(InvitationStatus.DRAFT);
        applyRequest(invitation, request, user);
        ensureSlug(invitation);
        ensureAccessToken(invitation);
        return toResponse(save(invitation));
    }

    @Transactional(readOnly = true)
    public List<InvitationSummaryResponse> listMine(Authentication authentication, InvitationStatus status) {
        AppUser user = currentUserService.currentUser(authentication);
        List<UserInvitation> invitations = status == null
                ? invitationRepository.findAllByUserIdAndDeletedFalseOrderByCreatedAtDesc(user.getId())
                : invitationRepository.findAllByUserIdAndStatusAndDeletedFalseOrderByCreatedAtDesc(user.getId(), status);
        return invitations.stream()
                .map(InvitationSummaryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InvitationResponse> listAllForAdmin() {
        return invitationRepository.findAllByDeletedFalseOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public InvitationResponse get(Authentication authentication, Long id) {
        return toResponse(requireOwnedInvitation(authentication, id));
    }

    @Transactional
    public InvitationResponse update(Authentication authentication, Long id, InvitationRequest request) {
        UserInvitation invitation = requireOwnedInvitation(authentication, id);
        applyRequest(invitation, request, invitation.getUser());
        ensureSlug(invitation);
        ensureAccessToken(invitation);
        if (invitation.getStatus() == InvitationStatus.PUBLISHED) {
            validatePublishReady(invitation);
        }
        return toResponse(save(invitation));
    }

    @Transactional
    public void delete(Authentication authentication, Long id) {
        UserInvitation invitation = requireOwnedInvitationOrAdmin(authentication, id);

        if (deliveryEventRepository != null) {
            deliveryEventRepository.deleteByInvitationId(id);
        }
        if (notificationRepository != null) {
            notificationRepository.deleteByInvitationId(id);
        }
        if (rsvpRepository != null) {
            rsvpRepository.deleteByInvitationId(id);
        }
        if (guestCheckInRepository != null) {
            guestCheckInRepository.deleteByInvitationId(id);
        }
        if (seatAssignmentRepository != null) {
            seatAssignmentRepository.deleteByInvitationId(id);
        }
        if (guestRepository != null) {
            guestRepository.deleteByInvitationId(id);
        }
        if (budgetItemRepository != null) {
            budgetItemRepository.deleteByBudget_Invitation_Id(id);
        }
        if (budgetRepository != null) {
            budgetRepository.deleteByInvitationId(id);
        }
        if (weddingGiftRepository != null) {
            weddingGiftRepository.deleteByInvitationId(id);
        }
        if (mediaFileRepository != null) {
            mediaFileRepository.deleteByInvitationId(id);
        }
        if (eventTableRepository != null) {
            eventTableRepository.deleteByInvitationId(id);
        }
        invitationRepository.delete(invitation);
    }

    @Transactional
    public InvitationResponse saveAsDraft(Authentication authentication, Long id) {
        UserInvitation invitation = requireOwnedInvitation(authentication, id);
        invitation.setStatus(InvitationStatus.DRAFT);
        invitation.setPublishedAt(null);
        ensureSlug(invitation);
        return toResponse(save(invitation));
    }

    @Transactional
    public InvitationResponse publish(Authentication authentication, Long id) {
        UserInvitation invitation = requireOwnedInvitation(authentication, id);
        ensureSlug(invitation);
        ensureAccessToken(invitation);
        validatePublishReady(invitation);
        invitation.setStatus(InvitationStatus.PUBLISHED);
        invitation.setPublishedAt(Instant.now());
        UserInvitation saved = save(invitation);
        if (auditLogService != null) {
            auditLogService.logSystemEvent("INVITATION_PUBLISHED", "INVITATION", saved.getId(), "Invitation published by owner", java.util.Map.of("userId", saved.getUser().getId()));
        }
        return toResponse(saved);
    }

    @Transactional
    public InvitationResponse unpublish(Authentication authentication, Long id) {
        UserInvitation invitation = requireOwnedInvitation(authentication, id);
        if (invitation.getStatus() != InvitationStatus.PUBLISHED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invitation is not published");
        }
        invitation.setStatus(InvitationStatus.UNPUBLISHED);
        UserInvitation saved = save(invitation);
        if (auditLogService != null) {
            auditLogService.logSystemEvent("INVITATION_UNPUBLISHED", "INVITATION", saved.getId(), "Invitation unpublished by owner", java.util.Map.of("userId", saved.getUser().getId()));
        }
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public InvitationResponse preview(Authentication authentication, Long id) {
        return toResponse(requireOwnedInvitation(authentication, id));
    }

    @Transactional(readOnly = true)
    public InvitationCustomizationResponse getCustomization(Authentication authentication, Long id) {
        return InvitationCustomizationResponse.from(requireOwnedInvitation(authentication, id));
    }

    @Transactional
    public InvitationCustomizationResponse updateCustomization(
            Authentication authentication,
            Long id,
            InvitationCustomizationRequest request
    ) {
        UserInvitation invitation = requireOwnedInvitation(authentication, id);
        invitation.setTemplate(resolveTemplate(request.getTemplateId(), invitation.getUser()));
        invitation.setLanguageMode(trimToNull(request.getLanguageMode()));
        invitation.setDesignJson(trimToNull(request.getDesignJson()));
        invitation.setContentJson(trimToNull(request.getContentJson()));
        invitation.setCustomColors(trimToNull(request.getCustomColors()));
        invitation.setCustomFonts(trimToNull(request.getCustomFonts()));
        invitation.setEnabledSections(trimToNull(request.getEnabledSections()));
        invitation.setLayoutSettings(trimToNull(request.getLayoutSettings()));
        return InvitationCustomizationResponse.from(save(invitation));
    }

    @Transactional
    public PublicInvitationResponse publicBySlug(String slug) {
        return publicBySlug(slug, null, null);
    }

    @Transactional
    public PublicInvitationResponse publicBySlug(String slug, String inviteToken) {
        return publicBySlug(slug, null, inviteToken);
    }

    private UserInvitation findPublicInvitationEntity(String slug) {
        Optional<UserInvitation> invitationOpt = invitationRepository
                .findBySlugAndStatusAndDeletedFalse(slug, InvitationStatus.PUBLISHED);

        if (invitationOpt.isEmpty()) {
            try {
                Long id = Long.parseLong(slug);
                invitationOpt = invitationRepository.findByIdAndDeletedFalse(id)
                        .filter(inv -> inv.getStatus() == InvitationStatus.PUBLISHED || inv.getStatus() == InvitationStatus.DRAFT);
            } catch (NumberFormatException ignored) {
            }
        }

        if (invitationOpt.isEmpty()) {
            invitationOpt = invitationRepository.findBySlugAndDeletedFalse(slug);
        }

        return invitationOpt.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invitation not found"));
    }

    @Transactional
    public PublicInvitationResponse publicBySlug(String slug, String accessToken, String inviteToken) {
        UserInvitation invitation = findPublicInvitationEntity(slug);

        requirePubliclyVisibleByModeration(invitation);
        requirePublicInvitationAccess(invitation, accessToken, inviteToken);
        Guest guest = guestByToken(invitation, inviteToken);
        GuestSeatAssignment assignment = guest == null || seatAssignmentRepository == null
                ? null
                : seatAssignmentRepository.findByInvitationIdAndGuestId(invitation.getId(), guest.getId()).orElse(null);
        if (guest != null && guest.getInvitationViewedAt() == null) {
            guest.setInvitationViewedAt(Instant.now());
        }
        return PublicInvitationResponse.from(invitation, guest, assignment);
    }

    @Transactional(readOnly = true)
    public UserInvitation requirePublicInvitationForView(String slug, String inviteToken) {
        UserInvitation invitation = findPublicInvitationEntity(slug);

        requirePubliclyVisibleByModeration(invitation);
        requirePublicInvitationAccess(invitation, null, inviteToken);
        return invitation;
    }

    @Transactional
    public InvitationAccessVerifyResponse verifyPublicAccess(String slug, InvitationAccessVerifyRequest request) {
        UserInvitation invitation = findPublicInvitationEntity(slug);

        requirePubliclyVisibleByModeration(invitation);
        ensureAccessToken(invitation);

        String accessToken = request == null ? null : trimToNull(request.getAccessToken());
        String inviteToken = request == null ? null : trimToNull(request.getInviteToken());
        String password = request == null ? null : trimToNull(request.getPassword());

        if (invitation.getVisibility() == InvitationVisibility.PUBLIC
                || hasInvitationAccess(invitation, accessToken, inviteToken)
                || validPassword(invitation, password)) {
            return InvitationAccessVerifyResponse.builder()
                    .slug(invitation.getSlug())
                    .accessGranted(true)
                    .accessToken(invitation.getAccessToken())
                    .build();
        }

        throw new ApiException(HttpStatus.FORBIDDEN, protectedMessage(invitation));
    }

    @Transactional(readOnly = true)
    public UserInvitation requireOwnedInvitationEntity(Authentication authentication, Long id) {
        return requireOwnedInvitation(authentication, id);
    }

    @Transactional
    public String ensureAccessTokenValue(UserInvitation invitation) {
        ensureAccessToken(invitation);
        invitationRepository.save(invitation);
        return invitation.getAccessToken();
    }

    @Transactional(readOnly = true)
    public UserInvitation requirePublishedInvitationForRsvp(String slug, boolean tokenAccess) {
        return requirePublishedInvitationForRsvp(slug, tokenAccess, null, null);
    }

    @Transactional(readOnly = true)
    public UserInvitation requirePublishedInvitationForRsvp(
            String slug,
            boolean tokenAccess,
            String accessToken,
            String inviteToken
    ) {
        UserInvitation invitation = findPublicInvitationEntity(slug);

        requirePubliclyVisibleByModeration(invitation);
        if (!tokenAccess) {
            requirePublicInvitationAccess(invitation, accessToken, inviteToken);
        }
        return invitation;
    }

    private void requirePublicInvitationAccess(UserInvitation invitation, String accessToken, String inviteToken) {
        if (invitation.getVisibility() == null || invitation.getVisibility() == InvitationVisibility.PUBLIC) {
            return;
        }
        if (hasInvitationAccess(invitation, accessToken, inviteToken)) {
            return;
        }
        if (invitation.getVisibility() == InvitationVisibility.PRIVATE) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Invitation not found");
        }
        throw new ApiException(HttpStatus.FORBIDDEN, protectedMessage(invitation));
    }

    private boolean hasInvitationAccess(UserInvitation invitation, String accessToken, String inviteToken) {
        String normalizedAccessToken = trimToNull(accessToken);
        if (normalizedAccessToken != null
                && invitation.getAccessToken() != null
                && normalizedAccessToken.equals(invitation.getAccessToken())) {
            return true;
        }

        String normalizedInviteToken = trimToNull(inviteToken);
        return normalizedInviteToken != null
                && guestRepository != null
                && guestRepository.findByInvitationIdAndInviteToken(invitation.getId(), normalizedInviteToken).isPresent();
    }

    private Guest guestByToken(UserInvitation invitation, String inviteToken) {
        String normalizedInviteToken = trimToNull(inviteToken);
        if (normalizedInviteToken == null || guestRepository == null) {
            return null;
        }
        return guestRepository.findByInvitationIdAndInviteToken(invitation.getId(), normalizedInviteToken)
                .orElse(null);
    }

    private boolean validPassword(UserInvitation invitation, String password) {
        return invitation.getVisibility() == InvitationVisibility.PASSWORD_PROTECTED
                && password != null
                && invitation.getAccessPassword() != null
                && passwordEncoder.matches(password, invitation.getAccessPassword());
    }

    private String protectedMessage(UserInvitation invitation) {
        if (invitation.getVisibility() == InvitationVisibility.PASSWORD_PROTECTED) {
            return "Invitation password required";
        }
        return "Invitation access token required";
    }

    private void requirePubliclyVisibleByModeration(UserInvitation invitation) {
        if (invitation.getModerationStatus() != null
                && invitation.getModerationStatus() != InvitationModerationStatus.ACTIVE) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Invitation not found");
        }
    }

    private UserInvitation requireOwnedInvitation(Authentication authentication, Long id) {
        AppUser user = currentUserService.currentUser(authentication);
        UserInvitation invitation = invitationRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invitation not found"));
        if (invitation.getUser() == null || !invitation.getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this invitation");
        }
        return invitation;
    }

    private UserInvitation requireOwnedInvitationOrAdmin(Authentication authentication, Long id) {
        AppUser user = currentUserService.currentUser(authentication);
        UserInvitation invitation = invitationRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invitation not found"));
        boolean isOwner = invitation.getUser() != null && invitation.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this invitation");
        }
        return invitation;
    }

    private void applyRequest(UserInvitation invitation, InvitationRequest request, AppUser user) {
        invitation.setTitle(trimToNull(request.getTitle()));
        invitation.setTemplate(resolveTemplate(request.getTemplateId(), user));
        invitation.setOrganization(resolveOrganization(request.getOrganizationId(), user));
        invitation.setEventType(request.getEventType());
        invitation.setEventDate(request.getEventDate());
        invitation.setEventTime(request.getEventTime());
        invitation.setVenueName(trimToNull(request.getVenueName()));
        invitation.setVenueAddress(trimToNull(request.getVenueAddress()));
        invitation.setGoogleMapUrl(trimToNull(request.getGoogleMapUrl()));
        invitation.setHostName(trimToNull(request.getHostName()));
        invitation.setPartnerName(trimToNull(request.getPartnerName()));
        invitation.setGroomName(trimToNull(request.getGroomName()));
        invitation.setBrideName(trimToNull(request.getBrideName()));
        invitation.setStoryText(trimToNull(request.getStoryText()));
        invitation.setLanguageMode(trimToNull(request.getLanguageMode()));
        invitation.setDesignJson(trimToNull(request.getDesignJson()));
        invitation.setContentJson(trimToNull(request.getContentJson()));
        invitation.setCustomColors(trimToNull(request.getCustomColors()));
        invitation.setCustomFonts(trimToNull(request.getCustomFonts()));
        invitation.setEnabledSections(trimToNull(request.getEnabledSections()));
        invitation.setLayoutSettings(trimToNull(request.getLayoutSettings()));
        invitation.setRsvpDeadline(request.getRsvpDeadline());

        InvitationVisibility visibility = parseVisibility(request.getVisibility());
        invitation.setVisibility(visibility);
        if (visibility == InvitationVisibility.PASSWORD_PROTECTED) {
            String password = trimToNull(request.getAccessPassword());
            if (password != null) {
                invitation.setAccessPassword(passwordEncoder.encode(password));
            }
        } else {
            invitation.setAccessPassword(null);
        }
    }

    private InvitationTemplate resolveTemplate(Long templateId, AppUser user) {
        if (templateId == null) {
            return null;
        }
        InvitationTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Template not found"));
        if (template.isPremium()
                && (user == null
                || !templateAccessRepository.existsByUserIdAndTemplateIdAndActiveTrue(user.getId(), templateId))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Premium template access is required");
        }
        return template;
    }

    private Organization resolveOrganization(Long organizationId, AppUser user) {
        if (organizationId == null) {
            return null;
        }
        if (organizationRepository == null || organizationMemberRepository == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Organization support is not available");
        }
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Organization not found"));
        boolean owner = organization.getOwner() != null && organization.getOwner().getId().equals(user.getId());
        boolean member = organizationMemberRepository.existsByOrganizationIdAndUserIdAndStatus(
                organizationId,
                user.getId(),
                com.koupreng.backend.entity.organization.OrganizationMember.STATUS_ACTIVE
        );
        if (!owner && !member) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Organization access is required");
        }
        return organization;
    }

    private InvitationVisibility parseVisibility(String value) {
        String normalized = trimToNull(value);
        if (normalized == null) {
            return InvitationVisibility.PUBLIC;
        }
        try {
            return InvitationVisibility.valueOf(normalized.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invitation visibility is invalid");
        }
    }

    private void validatePublishReady(UserInvitation invitation) {
        List<String> missing = new ArrayList<>();
        requirePresent(invitation.getTitle(), "title", missing);
        if (invitation.getEventType() == null) {
            missing.add("eventType");
        }
        if (invitation.getEventDate() == null) {
            missing.add("eventDate");
        }
        if (invitation.getEventTime() == null) {
            missing.add("eventTime");
        }
        requirePresent(invitation.getVenueName(), "venueName", missing);
        requirePresent(invitation.getVenueAddress(), "venueAddress", missing);
        requirePresent(invitation.getSlug(), "slug", missing);

        if (invitation.getEventType() == EventType.WEDDING || invitation.getEventType() == EventType.ENGAGEMENT) {
            requirePresent(invitation.getGroomName(), "groomName", missing);
            requirePresent(invitation.getBrideName(), "brideName", missing);
        } else {
            requirePresent(invitation.getHostName(), "hostName", missing);
        }

        if (invitation.getRsvpDeadline() != null
                && invitation.getEventDate() != null
                && invitation.getRsvpDeadline().isAfter(invitation.getEventDate())) {
            missing.add("rsvpDeadline must not be after eventDate");
        }

        if (invitation.getVisibility() == InvitationVisibility.PASSWORD_PROTECTED
                && trimToNull(invitation.getAccessPassword()) == null) {
            missing.add("accessPassword");
        }

        if (!missing.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Publish requirements missing: " + String.join(", ", missing));
        }
    }

    private void requirePresent(String value, String field, List<String> missing) {
        if (trimToNull(value) == null) {
            missing.add(field);
        }
    }

    private void ensureSlug(UserInvitation invitation) {
        if (trimToNull(invitation.getSlug()) != null && isAsciiSlug(invitation.getSlug())) {
            return;
        }

        String base = firstPresent(
                joinNames(invitation.getGroomName(), invitation.getBrideName()),
                joinNames(invitation.getHostName(), invitation.getPartnerName()),
                invitation.getTitle(),
                "wedding"
        );
        String cleanBase = slugify(base);
        if (("wedding".equals(cleanBase) || "invitation".equals(cleanBase))
                && invitation.getId() != null) {
            invitation.setSlug(String.valueOf(invitation.getId()));
            return;
        }
        invitation.setSlug(uniqueSlug(cleanBase, invitation.getId()));
    }

    private boolean isAsciiSlug(String slug) {
        return slug != null && slug.matches("^[a-zA-Z0-9_-]+$");
    }

    private String uniqueSlug(String base, Long invitationId) {
        String safeBase = base == null || base.isBlank() ? "wedding" : base;
        for (int attempt = 0; attempt < 25; attempt++) {
            String candidate = attempt == 0 ? safeBase : safeBase + "-" + attempt;
            if (!slugExistsForOtherInvitation(candidate, invitationId)) {
                return candidate;
            }
        }
        String candidate;
        do {
            candidate = safeBase + "-" + UUID.randomUUID().toString().substring(0, 8);
        } while (slugExistsForOtherInvitation(candidate, invitationId));
        return candidate;
    }

    private boolean slugExistsForOtherInvitation(String slug, Long invitationId) {
        return invitationId == null
                ? invitationRepository.existsBySlug(slug)
                : invitationRepository.existsBySlugAndIdNot(slug, invitationId);
    }

    private String slugify(String value) {
        if (value == null || value.isBlank()) {
            return "wedding";
        }
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (normalized.length() > 80) {
            normalized = normalized.substring(0, 80).replaceAll("-$", "");
        }
        return normalized.isBlank() ? "wedding" : normalized;
    }

    private void ensureAccessToken(UserInvitation invitation) {
        if (trimToNull(invitation.getAccessToken()) != null) {
            return;
        }
        invitation.setAccessToken(uniqueAccessToken());
    }

    private String uniqueAccessToken() {
        String token;
        do {
            token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        } while (invitationRepository.existsByAccessToken(token));
        return token;
    }

    private String joinNames(String first, String second) {
        String left = trimToNull(first);
        String right = trimToNull(second);
        if (left == null && right == null) {
            return null;
        }
        if (left == null) {
            return right;
        }
        if (right == null) {
            return left;
        }
        return left + " " + right;
    }

    private String firstPresent(String... values) {
        for (String value : values) {
            String trimmed = trimToNull(value);
            if (trimmed != null) {
                return trimmed;
            }
        }
        return "invitation";
    }

    private UserInvitation save(UserInvitation invitation) {
        try {
            return invitationRepository.save(invitation);
        } catch (DataIntegrityViolationException ex) {
            throw new ApiException(HttpStatus.CONFLICT, "Invitation slug already exists");
        }
    }

    private InvitationResponse toResponse(UserInvitation invitation) {
        return InvitationResponse.from(invitation);
    }

    @Transactional
    public GuestInvitationViewResponse guestView(String slug, String inviteToken) {
        UserInvitation invitation = findPublicInvitationEntity(slug);

        requirePubliclyVisibleByModeration(invitation);

        String normalizedInviteToken = trimToNull(inviteToken);
        if (normalizedInviteToken == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Invitation token is required");
        }

        if (guestRepository == null) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Guest repository not initialized");
        }

        Guest guest = guestRepository.findByInvitationIdAndInviteToken(invitation.getId(), normalizedInviteToken)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Invalid invitation token"));

        GuestSeatAssignment assignment = seatAssignmentRepository == null
                ? null
                : seatAssignmentRepository.findByInvitationIdAndGuestId(invitation.getId(), guest.getId()).orElse(null);

        if (guest.getInvitationViewedAt() == null) {
            guest.setInvitationViewedAt(Instant.now());
            guestRepository.save(guest);
        }

        Rsvp rsvp = rsvpRepository == null ? null : rsvpRepository.findByInvitationIdAndGuestId(invitation.getId(), guest.getId()).orElse(null);
        String rsvpStatus = rsvp != null && rsvp.getResponseStatus() != null ? rsvp.getResponseStatus().name() : "PENDING";

        List<WishResponse> wishes = rsvpRepository == null
                ? new ArrayList<>()
                : rsvpRepository.findByInvitationIdAndMessageIsNotNullOrderByRespondedAtDesc(invitation.getId()).stream()
                .map(WishResponse::from)
                .toList();

        MediaListResponse media = mediaFileRepository == null
                ? null
                : MediaListResponse.from(mediaFileRepository.findByInvitationIdOrderBySortOrderAscCreatedAtAsc(invitation.getId()));

        String guestCategory = guest.getGuestGroup();
        Integer seatCount = assignment != null ? assignment.getSeatCount() : guest.getSeatCount();
        String tableName = assignment != null && assignment.getTable() != null ? assignment.getTable().getTableName() : guest.getTableNumber();
        String seatNumber = assignment != null ? assignment.getSeatLabel() : null;

        String baseUrl = appProperties != null && appProperties.getInvitation() != null ? appProperties.getInvitation().getPublicBaseUrl() : "http://localhost:5173";
        baseUrl = baseUrl.replaceAll("/+$", "");
        String invitationUrl = baseUrl + "/i/" + encodeValue(slug) + "?token=" + encodeValue(normalizedInviteToken);

        boolean canRsvp = invitation.getRsvpDeadline() == null || !invitation.getRsvpDeadline().isBefore(LocalDate.now());

        return GuestInvitationViewResponse.builder()
                .invitation(PublicInvitationResponse.from(invitation, guest, assignment))
                .guestName(guest.getGuestName())
                .guestCategory(guestCategory)
                .seatCount(seatCount)
                .tableName(tableName)
                .seatNumber(seatNumber)
                .rsvpStatus(rsvpStatus)
                .invitationUrl(invitationUrl)
                .qrPayload(invitationUrl)
                .canRsvp(canRsvp)
                .media(media)
                .wishes(wishes)
                .build();
    }

    private String encodeValue(String value) {
        try {
            return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8.name()).replace("+", "%20");
        } catch (java.io.UnsupportedEncodingException ex) {
            return value;
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
