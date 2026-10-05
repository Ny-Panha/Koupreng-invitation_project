export function getGuestLabel(guest, allGuests = []) {
    const normalizedName = String(guest?.name || "").trim().toLowerCase();
    const isDuplicate = normalizedName && allGuests.filter(
        (candidate) => String(candidate?.name || "").trim().toLowerCase() === normalizedName,
    ).length > 1;
    if (!isDuplicate) return guest?.name || "";

    const details = [guest.phone, guest.side || guest.group].filter(Boolean);
    return details.length ? `${guest.name} (${details.join(" • ")})` : guest.name;
}
