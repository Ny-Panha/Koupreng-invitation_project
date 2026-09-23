import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loading, ErrorState, Empty, Toast } from "../../shared/ui";
import { useResource, useToast } from "../../shared/hooks";
import { formatDate } from "../../shared/utils";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import adminManagementService from "../../shared/api/adminService";

const EMPTY_CREATE_FORM = {
  fullName: "",
  email: "",
  password: "",
  role: "ADMIN",
};

const MASTER_ADMIN_EMAIL = "admin.demo@koupreng.local";

export default function AdminUsersPage() {
  const { lang, t } = useAdminLanguage();
  const { data, setData, loading, error, reload } = useResource(adminManagementService.users);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [busyCreate, setBusyCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const { toast, show, clear } = useToast();

  const isMasterAdmin = (user) => {
    if (!user) return false;
    return user.email?.toLowerCase() === MASTER_ADMIN_EMAIL;
  };

  const isProtectedAdminUser = (user) => {
    if (!user) return false;
    return isMasterAdmin(user) || Number(user.id) === 2;
  };

  const isAdminRole = (user) => user.role === "ADMIN" || user.role === "STAFF";

  const getRoleLabel = (user) => {
    if (isMasterAdmin(user)) return t("users.masterAdmin", "Master Admin");
    if (isAdminRole(user)) return t("users.admin", "Admin");
    return t("users.regularUser", "Regular User");
  };

  const getRoleBadgeClass = (user) => {
    if (isMasterAdmin(user)) return "badge-gold";
    if (isAdminRole(user)) return "badge-amber";
    return "badge-gray";
  };

  const users = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || []).filter((user) => {
      const matchesRole =
        roleFilter === "ALL" ||
        (roleFilter === "ADMIN" && isAdminRole(user)) ||
        (roleFilter === "USER" && !isAdminRole(user));
      if (!matchesRole) return false;
      if (!q) return true;
      return [user.fullName, user.email, user.phone, user.role, user.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [data, query, roleFilter]);

  const updateUser = async (user, action, value) => {
    const label = user.fullName || user.email || `#${user.id}`;
    const confirmMsg =
      action === "deactivate"
        ? (lang === "en" ? `Deactivate user "${label}"?` : `តើអ្នកពិតជាចង់បិទដំណើរការ "${label}" មែនទេ?`)
        : (lang === "en" ? `Activate user "${label}"?` : `តើអ្នកពិតជាចង់បើកដំណើរការ "${label}" មែនទេ?`);

    if (action !== "role" && !window.confirm(confirmMsg)) return;
    setBusyId(user.id);
    try {
      let updated;
      if (action === "activate") updated = await adminManagementService.activateUser(user.id);
      if (action === "deactivate") updated = await adminManagementService.deactivateUser(user.id);
      if (action === "role") updated = await adminManagementService.updateUserRole(user.id, value);
      setData((current) => (current || []).map((item) => (item.id === user.id ? updated : item)));
      show(t("users.toastSuccess", "User updated successfully"));
    } catch (err) {
      show(err?.message || t("users.toastFail", "User update failed"), "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setBusyCreate(true);
    try {
      const payload = {
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: "ADMIN",
      };
      await adminManagementService.createUser(payload);
      await reload();
      setCreateForm({ ...EMPTY_CREATE_FORM });
      show(t("users.createToastSuccess", "Admin account created successfully"));
    } catch (err) {
      show(err?.message || t("users.createToastFail", "Could not create admin account"), "error");
    } finally {
      setBusyCreate(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 className="page-title">{t("users.title", "Users")}</h2>
          <p className="page-subtitle">{t("users.subtitle", "Search, inspect, activate, and deactivate users.")}</p>
        </div>
      </div>

      <section className="card" style={{ marginBottom: 18 }}>
        <h3 className="page-title" style={{ fontSize: 16, marginBottom: 12 }}>
          {t("users.createAdminTitle", "Create New Admin Account")}
        </h3>
        <form onSubmit={handleCreateUser}>
          <div className="admin-form-grid">
            <label>
              {t("users.colName", "Name")}
              <input
                className="text-input"
                value={createForm.fullName}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, fullName: event.target.value }))}
                placeholder={t("users.namePlaceholder", "e.g. Sok Dara")}
                required
              />
            </label>
            <label>
              {t("users.colEmail", "Email")}
              <input
                className="text-input"
                type="email"
                pattern="[^\s@]+@[^\s@]+"
                value={createForm.email}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder={t("users.emailPlaceholder", "admin@koupreng.local")}
                title={t("users.emailValidation", "Enter a valid email address containing @")}
                required
              />
            </label>
            <label>
              {t("users.passwordLabel", "Password")}
              <input
                className="text-input"
                type="password"
                value={createForm.password}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder={t("users.passwordPlaceholder", "Minimum 8 characters")}
                required
              />
            </label>
            <label>
              {t("users.roleLabel", "Role")}
              <select
                className="select"
                value={createForm.role}
                disabled
              >
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>
          </div>
          <div>
            <button type="submit" className="btn btn-primary" disabled={busyCreate}>
              {busyCreate ? t("users.creating", "Creating...") : t("users.createAdminBtn", "Create Admin")}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="toolbar">
          <input
            className="text-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("users.searchPlaceholder", "Search users...")}
          />
          <button type="button" className="btn btn-ghost" onClick={reload}>
            {t("users.refresh", "Refresh")}
          </button>
        </div>
        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label={t("users.roleFilters", "Filter users by role")}>
          {[
            ["ALL", t("users.filterAll", "ទាំងអស់")],
            ["ADMIN", t("users.filterAdmins", "អ្នកគ្រប់គ្រង")],
            ["USER", t("users.filterUsers", "អ្នកប្រើប្រាស់")],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={roleFilter === value}
              className={`btn btn-sm ${roleFilter === value ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setRoleFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState onRetry={reload} />
        ) : users.length === 0 ? (
          <Empty />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>{t("users.colId", "ID")}</th>
                  <th>{t("users.colName", "Name")}</th>
                  <th>{t("users.colEmail", "គណនី (Email / Phone)")}</th>
                  <th>{t("users.colRole", "តួនាទី (Role)")}</th>
                  <th>{t("users.colStatus", "Status")}</th>
                  <th>{t("users.colJoined", "Joined")}</th>
                  <th>{t("users.colActions", "Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const protectedUser = isProtectedAdminUser(user);

                  return (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <Link className="btn btn-ghost btn-sm" to={`/users/${user.id}`}>
                          {user.fullName || "—"}
                        </Link>
                      </td>
                      <td>{user.email || user.phone || "—"}</td>
                      <td>
                        <span className={`badge ${getRoleBadgeClass(user)}`}>
                          {getRoleLabel(user)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.active ? "badge-green" : "badge-gray"}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <div className="row-actions">
                          {protectedUser ? (
                            <span className="text-xs font-semibold text-slate-500" title="Protected master admin account">
                              Protected
                            </span>
                          ) : user.active ? (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              disabled={busyId === user.id}
                              onClick={() => updateUser(user, "deactivate")}
                            >
                              {t("users.deactivate", "Deactivate")}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={busyId === user.id}
                              onClick={() => updateUser(user, "activate")}
                            >
                              {t("users.activate", "Activate")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Toast toast={toast} onClose={clear} />
    </div>
  );
}
