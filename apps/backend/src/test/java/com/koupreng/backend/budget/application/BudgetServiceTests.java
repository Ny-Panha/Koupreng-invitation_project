package com.koupreng.backend.budget.application;

import com.koupreng.backend.invitation.application.InvitationService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.budget.api.dto.BudgetResponse;
import com.koupreng.backend.budget.api.dto.CreateBudgetItemRequest;
import com.koupreng.backend.budget.api.dto.UpdateBudgetRequest;
import com.koupreng.backend.budget.domain.Budget;
import com.koupreng.backend.budget.domain.BudgetItem;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.budget.infrastructure.persistence.BudgetItemRepository;
import com.koupreng.backend.budget.infrastructure.persistence.BudgetRepository;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;

class BudgetServiceTests {

    @Test
    void getOrCreateBudgetCreatesEmptyBudgetForOwner() {
        Fixture fixture = fixture();
        Authentication authentication = mock(Authentication.class);
        UserInvitation invitation = invitation();

        when(fixture.invitationService.requireOwnedInvitationEntity(authentication, 10L)).thenReturn(invitation);
        when(fixture.budgetRepository.findByInvitationId(10L)).thenReturn(Optional.empty());
        when(fixture.budgetItemRepository.findByBudgetIdOrderByIdDesc(40L)).thenReturn(List.of());

        BudgetResponse response = fixture.service.getOrCreateBudget(authentication, 10L);

        assertEquals(40L, response.getId());
        assertEquals(BigDecimal.ZERO, response.getTotalBudget());
        assertFalse(response.isOverBudget());
        verify(fixture.budgetRepository).save(any(Budget.class));
    }

    @Test
    void addBudgetItemReturnsCalculatedTotals() {
        Fixture fixture = fixture();
        Authentication authentication = mock(Authentication.class);
        UserInvitation invitation = invitation();
        Budget budget = budget(invitation);
        AtomicReference<BudgetItem> savedItem = new AtomicReference<>();

        when(fixture.invitationService.requireOwnedInvitationEntity(authentication, 10L)).thenReturn(invitation);
        when(fixture.budgetRepository.findByInvitationId(10L)).thenReturn(Optional.of(budget));
        when(fixture.budgetItemRepository.save(any(BudgetItem.class))).thenAnswer(invocation -> {
            BudgetItem item = invocation.getArgument(0);
            item.setId(55L);
            savedItem.set(item);
            return item;
        });
        when(fixture.budgetItemRepository.findByBudgetIdOrderByIdDesc(40L))
                .thenAnswer(invocation -> List.of(savedItem.get()));

        CreateBudgetItemRequest request = new CreateBudgetItemRequest();
        request.setCategory("food");
        request.setItemName("Dinner");
        request.setEstimatedCost(new BigDecimal("350.00"));
        request.setActualCost(new BigDecimal("375.50"));

        BudgetResponse response = fixture.service.addBudgetItem(authentication, 10L, request);

        assertEquals(new BigDecimal("350.00"), response.getTotalEstimated());
        assertEquals(new BigDecimal("375.50"), response.getTotalActual());
        assertEquals(new BigDecimal("624.50"), response.getRemainingBudget());
        assertEquals("FOOD", response.getItems().getFirst().getCategory());
    }

    @Test
    void updateBudgetPreservesTotalBudgetWhenOnlyNotesChange() {
        Fixture fixture = fixture();
        Authentication authentication = mock(Authentication.class);
        UserInvitation invitation = invitation();
        Budget budget = budget(invitation);

        when(fixture.invitationService.requireOwnedInvitationEntity(authentication, 10L)).thenReturn(invitation);
        when(fixture.budgetRepository.findByInvitationId(10L)).thenReturn(Optional.of(budget));
        when(fixture.budgetRepository.save(any(Budget.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fixture.budgetItemRepository.findByBudgetIdOrderByIdDesc(40L)).thenReturn(List.of());

        UpdateBudgetRequest request = new UpdateBudgetRequest();
        request.setNotes("Bride family covers venue");

        BudgetResponse response = fixture.service.updateBudget(authentication, 10L, request);

        assertEquals(new BigDecimal("1000.00"), response.getTotalBudget());
        assertEquals("Bride family covers venue", response.getNotes());
    }

    @Test
    void summaryMarksOverBudgetWhenActualExceedsTotal() {
        Fixture fixture = fixture();
        Authentication authentication = mock(Authentication.class);
        UserInvitation invitation = invitation();
        Budget budget = budget(invitation);
        BudgetItem item = new BudgetItem();
        item.setId(55L);
        item.setBudget(budget);
        item.setCategory("VENUE");
        item.setItemName("Hall");
        item.setEstimatedCost(new BigDecimal("900.00"));
        item.setActualCost(new BigDecimal("1200.00"));

        when(fixture.invitationService.requireOwnedInvitationEntity(authentication, 10L)).thenReturn(invitation);
        when(fixture.budgetRepository.findByInvitationId(10L)).thenReturn(Optional.of(budget));
        when(fixture.budgetItemRepository.findByBudgetIdOrderByIdDesc(40L)).thenReturn(List.of(item));

        var summary = fixture.service.getBudgetSummary(authentication, 10L);

        assertEquals(new BigDecimal("1000.00"), summary.getTotalBudget());
        assertEquals(new BigDecimal("900.00"), summary.getTotalEstimated());
        assertEquals(new BigDecimal("1200.00"), summary.getTotalActual());
        assertEquals(new BigDecimal("-200.00"), summary.getRemainingBudget());
        assertTrue(summary.isOverBudget());
    }

    @Test
    void userCannotAccessAnotherUsersBudget() {
        Fixture fixture = fixture();
        Authentication authentication = mock(Authentication.class);
        when(fixture.invitationService.requireOwnedInvitationEntity(authentication, 10L))
                .thenThrow(new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this invitation"));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.getOrCreateBudget(authentication, 10L)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }

    @Test
    void addBudgetItemRejectsNegativeCosts() {
        Fixture fixture = fixture();
        Authentication authentication = mock(Authentication.class);
        UserInvitation invitation = invitation();
        Budget budget = budget(invitation);

        when(fixture.invitationService.requireOwnedInvitationEntity(authentication, 10L)).thenReturn(invitation);
        when(fixture.budgetRepository.findByInvitationId(10L)).thenReturn(Optional.of(budget));

        CreateBudgetItemRequest request = new CreateBudgetItemRequest();
        request.setItemName("Photographer");
        request.setEstimatedCost(new BigDecimal("-1.00"));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.addBudgetItem(authentication, 10L, request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Estimated cost must be zero or greater", exception.getMessage());
        verify(fixture.budgetItemRepository, never()).save(any(BudgetItem.class));
    }

    @Test
    void exportBudgetCsvReturnsHeaderAndEscapedRows() {
        Fixture fixture = fixture();
        Authentication authentication = mock(Authentication.class);
        UserInvitation invitation = invitation();
        Budget budget = budget(invitation);
        BudgetItem item = new BudgetItem();
        item.setId(55L);
        item.setBudget(budget);
        item.setCategory("FOOD");
        item.setItemName("Dinner, VIP");
        item.setEstimatedCost(new BigDecimal("350.00"));
        item.setActualCost(new BigDecimal("-10.00"));
        item.setVendorName("=cmd|' /C calc'!A0");

        when(fixture.invitationService.requireOwnedInvitationEntity(authentication, 10L)).thenReturn(invitation);
        when(fixture.budgetRepository.findByInvitationId(10L)).thenReturn(Optional.of(budget));
        when(fixture.budgetItemRepository.findByBudgetIdOrderByIdDesc(40L)).thenReturn(List.of(item));

        String csv = fixture.service.exportBudgetCsv(authentication, 10L);

        assertTrue(csv.startsWith("itemId,category,itemName,estimatedCost,actualCost,date,status,vendorName,notes"));
        assertTrue(csv.contains("\"Dinner, VIP\""));
        assertTrue(csv.contains("\"'=cmd|' /C calc'!A0\""));
    }

    private Fixture fixture() {
        BudgetRepository budgetRepository = mock(BudgetRepository.class);
        BudgetItemRepository budgetItemRepository = mock(BudgetItemRepository.class);
        UserInvitationRepository invitationRepository = mock(UserInvitationRepository.class);
        InvitationService invitationService = mock(InvitationService.class);
        BudgetService service = new BudgetService(
                budgetRepository,
                budgetItemRepository,
                invitationRepository,
                invitationService
        );

        when(budgetRepository.save(any(Budget.class))).thenAnswer(invocation -> {
            Budget budget = invocation.getArgument(0);
            if (budget.getId() == null) {
                budget.setId(40L);
            }
            return budget;
        });

        return new Fixture(service, budgetRepository, budgetItemRepository, invitationRepository, invitationService);
    }

    private UserInvitation invitation() {
        UserInvitation invitation = new UserInvitation();
        invitation.setId(10L);
        invitation.setTitle("Wedding");
        return invitation;
    }

    private Budget budget(UserInvitation invitation) {
        Budget budget = new Budget();
        budget.setId(40L);
        budget.setInvitation(invitation);
        budget.setTotalBudget(new BigDecimal("1000.00"));
        return budget;
    }

    private record Fixture(
            BudgetService service,
            BudgetRepository budgetRepository,
            BudgetItemRepository budgetItemRepository,
            UserInvitationRepository invitationRepository,
            InvitationService invitationService
    ) {
    }
}
