package com.koupreng.backend.guest.application;

import com.koupreng.backend.guest.api.dto.*;
import com.koupreng.backend.guest.infrastructure.persistence.GuestDashboardRepository;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.invitation.application.EventAccessPolicy.Permission;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
import com.koupreng.backend.checkin.infrastructure.persistence.GuestCheckInRepository;
import com.koupreng.backend.audit.application.AuditLogService;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.shared.export.CsvExportUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GuestDashboardService {
    private final InvitationService invitations;
    private final GuestDashboardRepository dashboard;
    private final GuestRepository guests;
    private final RsvpRepository rsvps;
    private final GuestCheckInRepository checkIns;
    private final AuditLogService audit;
    public GuestDashboardService(InvitationService invitations, GuestDashboardRepository dashboard, GuestRepository guests,
            RsvpRepository rsvps, GuestCheckInRepository checkIns, AuditLogService audit) {
        this.invitations=invitations; this.dashboard=dashboard; this.guests=guests; this.rsvps=rsvps; this.checkIns=checkIns; this.audit=audit;
    }
    @Transactional(readOnly=true)
    public GuestOverviewResponse overview(Authentication auth, Long eventId) {
        invitations.requireEventPermission(auth,eventId,Permission.MANAGE_GUESTS);
        var t=dashboard.totals(eventId);
        return new GuestOverviewResponse(t.guestRecords(),t.reservedSeats(),t.attendingRecords(),t.declinedRecords(),t.maybeRecords(),t.unansweredRecords(),t.respondedRecords(),t.toInviteRecords(),t.checkedInRecords(),t.confirmedAttendees(),t.markedSentRecords());
    }
    @Transactional(readOnly=true)
    public GuestPageResponse page(Authentication auth, Long eventId, int page, int size, String search, String group, String category, String status) {
        var event=invitations.requireEventPermission(auth,eventId,Permission.MANAGE_GUESTS);
        if(page<0 || page>10000 || size<1 || size>100 || search.length()>100 || group.length()>255 || category.length()>255
                || !Set.of("","pending","responded","checkedIn","attending","declined","maybe","unanswered").contains(status)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,"Invalid guest page or filter");
        }
        var result=dashboard.page(eventId,page,size,search.trim(),group,category,status);
        var items=rows(eventId,result.ids(),invitations.isEventOwner(auth,event));
        return new GuestPageResponse(items,page,size,result.total(),(int)((result.total()+size-1)/size));
    }
    @Transactional
    public String exportSelection(Authentication auth, Long eventId, GuestSelectionExportRequest request) {
        var event=invitations.requireEventPermission(auth,eventId,Permission.MANAGE_GUESTS);
        var ids=request.guestIds();
        if(ids==null || ids.isEmpty() || ids.size()>100 || ids.stream().anyMatch(Objects::isNull) || new HashSet<>(ids).size()!=ids.size()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,"Select between 1 and 100 distinct guest records");
        }
        var items=rows(eventId,ids,invitations.isEventOwner(auth,event));
        if(items.size()!=ids.size()) throw new ApiException(HttpStatus.NOT_FOUND,"One or more selected guests are unavailable for this event");
        StringBuilder csv=new StringBuilder("\uFEFFguestName,group,category,reservedSeats,table,rsvpStatus,confirmedAttendees,checkedIn\n");
        for(var item:items) {
            var g=item.guest();
            csv.append(CsvExportUtils.row(g.getGuestName(),g.getGuestGroup(),g.getSideType(),g.getSeatCount(),g.getTableNumber(),
                    item.rsvpStatus(),"ATTENDING".equals(item.rsvpStatus())?item.attendeeCount():0,item.checkedIn())).append('\n');
        }
        audit.logSystemEvent("GUEST_SELECTION_EXPORTED","INVITATION",eventId,"Selected guest records exported",
                Map.of("recordCount",items.size(),"containsContacts",false,"containsGuestTokens",false));
        return csv.toString();
    }
    private List<GuestPageResponse.Row> rows(Long eventId, List<Long> ids, boolean owner) {
        if(ids.isEmpty()) return List.of();
        var guestById=guests.findByInvitationIdAndIdIn(eventId,ids).stream().collect(Collectors.toMap(g->g.getId(),g->g));
        var responseByGuest=rsvps.findByInvitationIdAndGuestIdIn(eventId,ids).stream().collect(Collectors.toMap(r->r.getGuest().getId(),r->r));
        var checkInByGuest=checkIns.findByInvitationIdAndGuestIdInAndActiveTrue(eventId,ids).stream().collect(Collectors.toMap(c->c.getGuest().getId(),c->c));
        return ids.stream().filter(guestById::containsKey).map(id->{
            var response=responseByGuest.get(id); var checkIn=checkInByGuest.get(id);
            return new GuestPageResponse.Row(GuestResponse.from(guestById.get(id),owner),response==null || response.getResponseStatus()==null?null:response.getResponseStatus().name(),
                    response==null?null:response.getAttendeeCount(),response==null?null:response.getRespondedAt(),checkIn!=null,checkIn==null?null:checkIn.getCheckedInAt());
        }).toList();
    }
}
