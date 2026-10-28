// Browser UI contracts only. Actual SQL/authorization/export checks run over HTTP/MySQL.
export async function installGuestDashboardFixtures(page, state, eventId = 101) {
  const rows = () => state.guests.map(guest => {
    const rsvp = state.rsvps?.find(response => response.guestId === guest.id);
    const checkIn = state.checkIns?.find(item => item.guestId === guest.id);
    return { guest, rsvpStatus: rsvp?.responseStatus || null, attendeeCount: rsvp?.attendeeCount ?? null,
      respondedAt: rsvp?.respondedAt, checkedIn: Boolean(checkIn), checkedInAt: checkIn?.checkedInAt };
  });
  const needsInvite = row => !row.rsvpStatus && !row.checkedIn && [undefined,null,'','PENDING','មិនទាន់ផ្ញើ'].includes(row.guest.sendStatus);
  await page.route(`**/api/v1/invitations/${eventId}/guests/*`, async route => {
    const url = new URL(route.request().url()), path = url.pathname;
    const reply = data => route.fulfill({ json: { data } });
    if (path.endsWith('/overview')) {
      const data = rows(), count = predicate => data.filter(predicate).length;
      return reply({ guestRecords: data.length, reservedSeats: data.reduce((sum,row) => sum + Math.max(1,Number(row.guest.seatCount)||1),0),
        attendingRecords: count(row => row.rsvpStatus === 'ATTENDING'), declinedRecords: count(row => row.rsvpStatus === 'NOT_ATTENDING'), maybeRecords: count(row => row.rsvpStatus === 'MAYBE'),
        unansweredRecords: count(row => !row.rsvpStatus), respondedRecords: count(row => row.rsvpStatus), toInviteRecords: count(needsInvite), checkedInRecords: count(row => row.checkedIn),
        confirmedAttendees: data.filter(row => row.rsvpStatus === 'ATTENDING').reduce((sum,row) => sum + row.attendeeCount,0),
        markedSentRecords: count(row => ['SENT','OPENED','បានផ្ញើ','បានបើក'].includes(row.guest.sendStatus) || row.guest.lastSentAt || row.guest.invitationViewedAt) });
    }
    if (path.endsWith('/page')) {
      state.pageReads ||= []; state.pageReads.push(Object.fromEntries(url.searchParams));
      const search = (url.searchParams.get('search') || '').toLowerCase(), status = url.searchParams.get('status'), group = url.searchParams.get('group'), category = url.searchParams.get('category');
      let filtered = rows().filter(row => (!search || [row.guest.guestName,row.guest.phone,row.guest.guestGroup,row.guest.sideType,row.guest.tableNumber].some(value => String(value || '').toLowerCase().includes(search)))
        && (!group || row.guest.guestGroup === group) && (!category || row.guest.sideType === category));
      filtered = filtered.filter(row => !status || ({ pending: needsInvite(row), responded: Boolean(row.rsvpStatus), checkedIn: row.checkedIn,
        attending: row.rsvpStatus === 'ATTENDING', declined: row.rsvpStatus === 'NOT_ATTENDING', maybe: row.rsvpStatus === 'MAYBE', unanswered: !row.rsvpStatus })[status]);
      filtered.sort((left,right) => right.guest.id - left.guest.id);
      const page = Number(url.searchParams.get('page') || 0), size = Number(url.searchParams.get('size') || 25);
      return reply({ items: filtered.slice(page*size,(page+1)*size), page, size, totalElements: filtered.length, totalPages: Math.ceil(filtered.length/size) });
    }
    if (path.endsWith('/export-selection')) {
      const { guestIds } = route.request().postDataJSON(); state.selectionExports ||= []; state.selectionExports.push(guestIds);
      const selected = rows().filter(row => guestIds.includes(row.guest.id));
      const cell = value => `"${String(value ?? '').replaceAll('"','""')}"`;
      const csv = 'guestName,reservedSeats,rsvpStatus\n' + selected.map(row => [row.guest.guestName,row.guest.seatCount,row.rsvpStatus].map(cell).join(',')).join('\n');
      return route.fulfill({ contentType: 'text/csv;charset=UTF-8', headers: { 'Content-Disposition': `attachment; filename="selected-guests-${eventId}.csv"` }, body: csv });
    }
    return route.fallback();
  });
}
