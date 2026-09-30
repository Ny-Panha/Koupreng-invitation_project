import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import { Loading, ErrorState, Empty, Toast } from "../../shared/ui";
import { useResource, useToast } from "../../shared/hooks";
import { formatDate, readAuth } from "../../shared/utils";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import adminManagementService from "../../shared/api/adminService";

const EMPTY_CREATE_FORM = {
  fullName: "",
  email: "",
  password: "",
  role: "ADMIN",
};

const MASTER_ADMIN_EMAIL = "admin.demo@koupreng.local";

function calculatePasswordStrength(password) {
  if (!password) {
    return { score: 0, labelKey: "strengthWeak", label: "Weak", color: "bg-slate-300 dark:bg-zinc-700", text: "text-slate-400" };
  }
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score++;

  if (score <= 1) return { score: 1, labelKey: "strengthWeak", label: "Weak", color: "bg-rose-500", text: "text-rose-500" };
  if (score === 2) return { score: 2, labelKey: "strengthFair", label: "Fair", color: "bg-amber-500", text: "text-amber-500" };
  if (score === 3) return { score: 3, labelKey: "strengthGood", label: "Good", color: "bg-cyan-500", text: "text-cyan-500" };
  return { score: 4, labelKey: "strengthStrong", label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
}

export default function AdminUsersPage() {
  const { lang, t } = useAdminLanguage();
  const { data, setData, loading, error, reload } = useResource(adminManagementService.users);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [busyCreate, setBusyCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [confirmModal, setConfirmModal] = useState(null);
  const { toast, show, clear } = useToast();

  const currentUser = useMemo(() => readAuth()?.user || null, []);

  const isMasterAdmin = (user) => {
    if (!user) return false;
    return user.email?.toLowerCase() === MASTER_ADMIN_EMAIL;
  };

  const isCurrentAccount = (user) => {
    if (!user || !currentUser) return false;
    const sameId = currentUser.id != null && user.id != null && String(user.id) === String(currentUser.id);
    const sameEmail = currentUser.email && user.email && user.email.toLowerCase() === currentUser.email.toLowerCase();
    return Boolean(sameId || sameEmail);
  };

  const isProtectedAdminUser = (user) => {
    if (!user) return false;
    return isMasterAdmin(user) || Number(user.id) === 2 || isCurrentAccount(user);
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

  const pwdStrength = useMemo(() => calculatePasswordStrength(createForm.password), [createForm.password]);

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

  const executeUserUpdate = async (user, action, value) => {
    if (action === "deactivate" && isCurrentAccount(user)) {
      show(t("users.cannotDeactivateSelf", "You cannot deactivate your own account"), "error");
      setConfirmModal(null);
      return;
    }
    setBusyId(user.id);
    try {
      let updated;
      if (action === "activate") updated = await adminManagementService.activateUser(user.id);
      if (action === "deactivate") updated = await adminManagementService.deactivateUser(user.id);
      if (action === "role") updated = await adminManagementService.updateUserRole(user.id, value);
      setData((current) => (current || []).map((item) => (item.id === user.id ? updated : item)));
      show(t("users.toastSuccess", "User updated successfully"));
      setConfirmModal(null);
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
              {t("users.emailLabel", "Email")}
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
                minLength={8}
                value={createForm.password}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder={t("users.passwordPlaceholder", "Minimum 8 characters")}
                required
              />
              {createForm.password && (
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-zinc-400">{t("users.passwordStrength", "Password Strength")}:</span>
                    <span className={`font-bold ${pwdStrength.text}`}>{t(`users.${pwdStrength.labelKey}`, pwdStrength.label)}</span>
                  </div>
                  <div className="flex h-1.5 w-full gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          pwdStrength.score >= step ? pwdStrength.color : "bg-slate-200 dark:bg-zinc-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
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
            ["ALL", t("users.filterAll", "All")],
            ["ADMIN", t("users.filterAdmins", "Admins")],
            ["USER", t("users.filterUsers", "Users")],
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
                  <th>{t("users.colEmail", "Account (Email / Phone)")}</th>
                  <th>{t("users.colRole", "Role")}</th>
                  <th>{t("users.colStatus", "Status")}</th>
                  <th>{t("users.colJoined", "Joined")}</th>
                  <th>{t("users.colActions", "Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const protectedUser = isProtectedAdminUser(user);
                  const isCurrent = isCurrentAccount(user);

                  return (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <Link className="btn btn-ghost btn-sm font-semibold" to={`/users/${user.id}`}>
                          {user.fullName || "—"}
                        </Link>
                        {isCurrent && (
                          <span className="ml-1.5 inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                            {t("users.youBadge", "You")}
                          </span>
                        )}
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
                            <span
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400"
                              title={isCurrent ? t("users.protectedSelf", "Your current account") : "Protected master admin account"}
                            >
                              <Shield size={12} />
                              {isCurrent ? `${t("users.youBadge", "You")} (Protected)` : "Protected"}
                            </span>
                          ) : user.active ? (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              disabled={busyId === user.id}
                              onClick={() => setConfirmModal({ user, action: "deactivate" })}
                            >
                              {busyId === user.id ? "..." : t("users.deactivate", "Deactivate")}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={busyId === user.id}
                              onClick={() => setConfirmModal({ user, action: "activate" })}
                            >
                              {busyId === user.id ? "..." : t("users.activate", "Activate")}
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

      {/* Confirmation Modal */}
      {confirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setConfirmModal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-[#151518]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  confirmModal.action === "deactivate"
                    ? "bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400"
                    : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400"
                }`}
              >
                {confirmModal.action === "deactivate" ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  {confirmModal.action === "deactivate"
                    ? t("users.confirmDeactivateTitle", "Deactivate User")
                    : t("users.confirmActivateTitle", "Activate User")}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-zinc-300">
                  {confirmModal.action === "deactivate"
                    ? (lang === "en"
                        ? `Are you sure you want to deactivate "${confirmModal.user.fullName || confirmModal.user.email}"? They will lose access immediately.`
                        : `តើអ្នកពិតជាចង់បិទដំណើរការ "${confirmModal.user.fullName || confirmModal.user.email}" មែនទេ? គណនីនេះនឹងបាត់បង់សិទ្ធិចូលភ្លាមៗ។`)
                    : (lang === "en"
                        ? `Are you sure you want to activate "${confirmModal.user.fullName || confirmModal.user.email}"?`
                        : `តើអ្នកពិតជាចង់បើកដំណើរការ "${confirmModal.user.fullName || confirmModal.user.email}" ឡើងវិញមែនទេ?`)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmModal(null)}
                disabled={busyId === confirmModal.user.id}
              >
                {t("users.cancel", "Cancel")}
              </button>
              <button
                type="button"
                className={`btn btn-sm ${confirmModal.action === "deactivate" ? "btn-danger" : "btn-primary"}`}
                disabled={busyId === confirmModal.user.id}
                onClick={() => executeUserUpdate(confirmModal.user, confirmModal.action, confirmModal.value)}
              >
                {busyId === confirmModal.user.id ? (
                  <span>{t("users.processing", "Processing...")}</span>
                ) : confirmModal.action === "deactivate" ? (
                  t("users.deactivate", "Deactivate")
                ) : (
                  t("users.activate", "Activate")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={clear} />
    </div>
  );
}
