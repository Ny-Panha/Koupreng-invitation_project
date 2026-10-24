package com.koupreng.backend.guest.application;

import com.koupreng.backend.entitlement.application.EntitlementService;
import com.koupreng.backend.entitlement.application.EntitlementService.Feature;
import com.koupreng.backend.guest.api.dto.*;
import com.koupreng.backend.guest.infrastructure.persistence.*;
import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.invitation.application.EventAccessPolicy.Permission;
import com.koupreng.backend.shared.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AttendanceAnalyticsService {
    private static final ZoneId ZONE = ZoneId.of("Asia/Phnom_Penh");
    private final InvitationService invitations;
    private final EntitlementService entitlements;
    private final GuestDashboardRepository guests;
    private final AttendanceAnalyticsRepository analytics;
    public AttendanceAnalyticsService(InvitationService invitations, EntitlementService entitlements,
            GuestDashboardRepository guests, AttendanceAnalyticsRepository analytics) {
        this.invitations=invitations; this.entitlements=entitlements; this.guests=guests; this.analytics=analytics;
    }
    @Transactional(readOnly=true)
    public AttendanceAnalyticsResponse report(Authentication auth, Long eventId, LocalDate from, LocalDate to) {
        var event=invitations.requireEventPermission(auth,eventId,Permission.VIEW_REPORTS);
        entitlements.requireFeature(event.getUser(),Feature.ADVANCED_ANALYTICS);
        if(from==null || to==null || to.isBefore(from) || ChronoUnit.DAYS.between(from,to)>365) {
            throw new ApiException(HttpStatus.BAD_REQUEST,"Choose a date range of 1 to 366 calendar days");
        }
        Instant start=from.atStartOfDay(ZONE).toInstant(), end=to.plusDays(1).atStartOfDay(ZONE).toInstant();
        var created=index(analytics.created(eventId,start,end));
        var responses=index(analytics.responses(eventId,start,end));
        var checkIns=index(analytics.checkIns(eventId,start,end));
        List<AttendanceAnalyticsResponse.Day> days=new ArrayList<>();
        for(LocalDate date=from; !date.isAfter(to); date=date.plusDays(1)) {
            var c=created.get(date); var r=responses.get(date); var k=checkIns.get(date);
            days.add(new AttendanceAnalyticsResponse.Day(date,c==null?0:c.total(),r==null?0:r.total(),
                    r==null?0:r.attending(),r==null?0:r.declined(),r==null?0:r.maybe(),k==null?0:k.total()));
        }
        var t=guests.totals(eventId);
        var current=new GuestOverviewResponse(t.guestRecords(),t.reservedSeats(),t.attendingRecords(),t.declinedRecords(),t.maybeRecords(),
                t.unansweredRecords(),t.respondedRecords(),t.toInviteRecords(),t.checkedInRecords(),t.confirmedAttendees(),t.markedSentRecords());
        return new AttendanceAnalyticsResponse(from,to,ZONE.getId(),current,List.copyOf(days));
    }
    private Map<LocalDate,AttendanceAnalyticsRepository.Bucket> index(List<AttendanceAnalyticsRepository.Bucket> buckets) {
        return buckets.stream().collect(Collectors.toMap(AttendanceAnalyticsRepository.Bucket::date,Function.identity()));
    }
}
