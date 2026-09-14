import { useMemo, useState } from "react";
import { Loading, ErrorState, Empty } from "../../components/States";
import Toast from "../../components/Toast";
import { useResource } from "../../hooks/useResource";
import { useToast } from "../../hooks/useToast";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import adminManagementService from "./adminManagementService";
import "./AdminFeature.css";

const EMPTY_FORM = {
  packageName: "",
  code: "",
  description: "",
  price: "0.00",
  currency: "USD",
  billingInterval: "YEARLY",
  durationDays: "365",
  maxInvitations: "1",
  maxGuests: "40",
  maxGuestsPerInvitation: "40",
  maxTeamMembers: "1",
  featuresJson: "{}",
  premiumTemplatesEnabled: false,
  qrInvitationsEnabled: true,
  qrCheckInEnabled: false,
  seatingEnabled: false,
  advancedAnalyticsEnabled: false,
  customBrandingEnabled: false,
  teamMembersEnabled: false,
  aiAssistantEnabled: false,
  active: true,
  sortOrder: "0",
};

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toForm(plan) {
  return {
    ...EMPTY_FORM,
    ...plan,
    price: plan?.price ?? "0.00",
    durationDays: plan?.durationDays ?? "",
    maxInvitations: plan?.maxInvitations ?? "",
    maxGuests: plan?.maxGuests ?? "",
    maxGuestsPerInvitation: plan?.maxGuestsPerInvitation ?? "",
    maxTeamMembers: plan?.maxTeamMembers ?? "",
    sortOrder: plan?.sortOrder ?? "0",
    featuresJson: plan?.featuresJson || "{}",
  };
}

function toPayload(form) {
  return {
    ...form,
    price: numberOrNull(form.price),
    durationDays: numberOrNull(form.durationDays),
    maxInvitations: numberOrNull(form.maxInvitations),
    maxGuests: numberOrNull(form.maxGuests),
    maxGuestsPerInvitation: numberOrNull(form.maxGuestsPerInvitation),
    maxTeamMembers: numberOrNull(form.maxTeamMembers),
    sortOrder: numberOrNull(form.sortOrder) || 0,
  };
}

export default function AdminPackagesPage() {
  const { lang, t } = useAdminLanguage();
  const { data, setData, loading, error, reload } = useResource(adminManagementService.packages);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const { toast, show, clear } = useToast();

  const packages = useMemo(() => [...(data || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)), [data]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const save = async (event) => {
    event.preventDefault();
    setBusyId(editingId || "new");
    try {
      const payload = toPayload(form);
      const saved = editingId
        ? await adminManagementService.updatePackage(editingId, payload)
        : await adminManagementService.createPackage(payload);
      setData((current) => {
        const rows = current || [];
        return editingId
          ? rows.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...rows];
      });
      show(lang === "en" ? "Package saved successfully" : "កញ្ចប់ត្រូវបានរក្សាទុកជោគជ័យ");
      resetForm();
    } catch (err) {
      show(err?.message || (lang === "en" ? "Package save failed" : "ការរក្សាទុកកញ្ចប់បរាជ័យ"), "error");
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = async (plan) => {
    setBusyId(plan.id);
    try {
      const saved = plan.active
        ? await adminManagementService.deactivatePackage(plan.id)
        : await adminManagementService.activatePackage(plan.id);
      setData((current) => (current || []).map((item) => (item.id === saved.id ? saved : item)));
      show(lang === "en" ? "Package status updated" : "ស្ថានភាពកញ្ចប់ត្រូវបានកែប្រែ");
    } catch (err) {
      show(err?.message || (lang === "en" ? "Package action failed" : "ប្រតិបត្តិការបរាជ័យ"), "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 className="page-title">{t("packages.title", "Packages")}</h2>
          <p className="page-subtitle">{t("packages.subtitle", "Manage subscription packages exposed to users.")}</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={reload}>
          {t("common.refresh", "Refresh")}
        </button>
      </div>

      <section className="card" style={{ marginBottom: 18 }}>
        <form onSubmit={save}>
          <div className="admin-form-grid">
            <label>
              {t("packages.colName", "Package Name")}
              <input className="text-input" value={form.packageName} onChange={(event) => setField("packageName", event.target.value)} required />
            </label>
            <label>
              {t("packages.colCode", "Code")}
              <input className="text-input" value={form.code} onChange={(event) => setField("code", event.target.value.toUpperCase())} required />
            </label>
            <label>
              {t("packages.colPrice", "Price")}
              <input className="text-input" type="number" step="0.01" value={form.price} onChange={(event) => setField("price", event.target.value)} />
            </label>
            <label>
              Currency
              <input className="text-input" value={form.currency} onChange={(event) => setField("currency", event.target.value.toUpperCase())} />
            </label>
            <label>
              Billing interval
              <input className="text-input" value={form.billingInterval} onChange={(event) => setField("billingInterval", event.target.value.toUpperCase())} />
            </label>
            <label>
              Duration days
              <input className="text-input" type="number" value={form.durationDays} onChange={(event) => setField("durationDays", event.target.value)} />
            </label>
            <label>
              Max invitations
              <input className="text-input" type="number" value={form.maxInvitations} onChange={(event) => setField("maxInvitations", event.target.value)} />
            </label>
            <label>
              Max guests
              <input className="text-input" type="number" value={form.maxGuests} onChange={(event) => setField("maxGuests", event.target.value)} />
            </label>
            <label>
              Sort order
              <input className="text-input" type="number" value={form.sortOrder} onChange={(event) => setField("sortOrder", event.target.value)} />
            </label>
            <label>
              Description
              <textarea className="text-input" value={form.description || ""} onChange={(event) => setField("description", event.target.value)} />
            </label>
          </div>
          <div className="admin-tabs">
            {[
              ["premiumTemplatesEnabled", "Premium templates"],
              ["qrInvitationsEnabled", "QR invitations"],
              ["qrCheckInEnabled", "QR check-in"],
              ["seatingEnabled", "Seating"],
              ["advancedAnalyticsEnabled", "Analytics"],
              ["teamMembersEnabled", "Team"],
              ["aiAssistantEnabled", "AI"],
              ["active", "Active"],
            ].map(([field, label]) => (
              <label key={field} className="btn btn-ghost btn-sm">
                <input type="checkbox" checked={Boolean(form[field])} onChange={(event) => setField(field, event.target.checked)} /> {label}
              </label>
            ))}
          </div>
          <div className="row-actions">
            <button type="submit" className="btn btn-primary" disabled={busyId === (editingId || "new")}>
              {editingId ? (lang === "en" ? "Update package" : "កែប្រែកញ្ចប់") : (lang === "en" ? "Create package" : "បង្កើតកញ្ចប់")}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                {t("common.cancel", "Cancel")}
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState onRetry={reload} />
        ) : packages.length === 0 ? (
          <Empty />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>{t("packages.colCode", "Code")}</th>
                  <th>{t("packages.colName", "Name")}</th>
                  <th>{t("packages.colPrice", "Price")}</th>
                  <th>{lang === "en" ? "Limits" : "ដែនកំណត់"}</th>
                  <th>{t("packages.colStatus", "Status")}</th>
                  <th>{t("packages.colActions", "Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((plan) => (
                  <tr key={plan.id}>
                    <td>{plan.code}</td>
                    <td>{plan.packageName}</td>
                    <td>{plan.currency} {plan.price}</td>
                    <td>{plan.maxInvitations || "—"} invitations / {plan.maxGuests || "—"} guests</td>
                    <td><span className={`badge ${plan.active ? "badge-green" : "badge-gray"}`}>{plan.active ? "ACTIVE" : "INACTIVE"}</span></td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setEditingId(plan.id); setForm(toForm(plan)); }}>
                          {t("common.edit", "Edit")}
                        </button>
                        <button type="button" className={plan.active ? "btn btn-danger btn-sm" : "btn btn-primary btn-sm"} disabled={busyId === plan.id} onClick={() => toggleActive(plan)}>
                          {plan.active ? (lang === "en" ? "Deactivate" : "បិទ") : (lang === "en" ? "Activate" : "បើក")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Toast toast={toast} onClose={clear} />
    </div>
  );
}
