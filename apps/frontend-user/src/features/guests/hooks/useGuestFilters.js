import { useMemo, useState } from "react";
import { matchesGuestStatus } from "../model/guestStatus";

export function useGuestFilters(guests = []) {
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const term = search.trim().toLowerCase();
      const name = (guest.name || "").toLowerCase();
      const phone = (guest.phone || "").toLowerCase();
      const group = (guest.group || "").toLowerCase();

      const matchesSearch =
        !term || [name, phone, group, guest.companionName, guest.category, guest.seat]
          .some((value) => String(value || "").toLowerCase().includes(term));
      const matchesGroup = !groupFilter || guest.group === groupFilter;
      const matchesCategory = !categoryFilter || guest.category === categoryFilter;

      return matchesSearch && matchesGroup && matchesCategory && matchesGuestStatus(guest, statusFilter);
    });
  }, [categoryFilter, groupFilter, guests, search, statusFilter]);

  const clearFilters = () => {
    setSearch("");
    setGroupFilter("");
    setCategoryFilter("");
    setStatusFilter("");
  };

  return {
    search,
    setSearch,
    groupFilter,
    setGroupFilter,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    clearFilters,
    filteredGuests,
  };
}
