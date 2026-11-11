import { PageSkeleton } from '@/shared/ui/LoadingState';
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguageStore } from "@/stores/useLanguageStore";
import budgetService from "./api/budgetApi";
import BudgetItemForm from "./components/BudgetItemForm";
import BudgetItemTable from "./components/BudgetItemTable";
import BudgetSummaryCards from "./components/BudgetSummaryCards";
import CategoryBreakdown from "./components/CategoryBreakdown";
import BudgetProgress from "./components/BudgetProgress";
import { EmptyState, ErrorState, toast } from "@/shared/ui";
import "./BudgetPages.css";

export default function BudgetPage() {
  const isEn = useLanguageStore((state) => state.lang) === "en";
  const { eventId, invitationId = eventId } = useParams();
  const [budget, setBudget] = useState(null);
  const [budgetForm, setBudgetForm] = useState({ totalBudget: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await budgetService.getBudget(invitationId);
      setBudget(data);
      setBudgetForm({
        totalBudget: data?.totalBudget ?? "",
        notes: data?.notes || "",
      });
    } catch (err) {
      setError(err?.message || (isEn ? "Could not load budget" : "មិនអាចទាញយកទិន្នន័យថវិកាបានទេ"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (!invitationId) {
      setLoading(false);
      return;
    }

    budgetService
      .getBudget(invitationId)
      .then((data) => {
        if (active) {
          setBudget(data);
          setBudgetForm({
            totalBudget: data?.totalBudget ?? "",
            notes: data?.notes || "",
          });
          setError("");
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || (isEn ? "Could not load budget" : "មិនអាចទាញយកទិន្នន័យថវិកាបានទេ"));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [invitationId, isEn]);

  const saveBudget = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = await budgetService.updateBudget(invitationId, {
        totalBudget: budgetForm.totalBudget === "" ? 0 : Number(budgetForm.totalBudget),
        notes: budgetForm.notes,
      });
      setBudget(data);
      toast.success(isEn ? "Budget updated successfully" : "បានរក្សាទុកថវិកាសរុបជោគជ័យ");
    } catch (err) {
      setError(err?.message || (isEn ? "Could not save budget" : "មិនអាចរក្សាទុកថវិកាបានទេ"));
      toast.error(isEn ? "Could not save budget" : "មិនអាចរក្សាទុកថវិកាបានទេ");
    } finally {
      setSaving(false);
    }
  };

  const addItem = async (payload) => {
    setSaving(true);
    setError("");
    try {
      const updated = await budgetService.addItem(invitationId, payload);
      setBudget(updated);
      toast.success(isEn ? "Budget item added" : "បានបន្ថែមចំណាយថ្មីជោគជ័យ");
    } catch (err) {
      setError(err?.message || (isEn ? "Could not add budget item" : "មិនអាចបន្ថែមចំណាយបានទេ"));
      toast.error(isEn ? "Could not add budget item" : "មិនអាចបន្ថែមចំណាយបានទេ");
    } finally {
      setSaving(false);
    }
  };

  const updateItem = async (itemId, payload) => {
    setSaving(true);
    setError("");
    try {
      const updated = await budgetService.updateItem(invitationId, itemId, payload);
      setBudget(updated);
      toast.success(isEn ? "Budget item updated" : "បានកែសម្រួលចំណាយជោគជ័យ");
    } catch (err) {
      setError(err?.message || (isEn ? "Could not update budget item" : "មិនអាចកែសម្រួលចំណាយបានទេ"));
      toast.error(isEn ? "Could not update budget item" : "មិនអាចកែសម្រួលចំណាយបានទេ");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm(isEn ? "Delete this budget item?" : "តើអ្នកប្រាកដជាចង់លុបចំណាយនេះទេ?")) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      await budgetService.deleteItem(invitationId, itemId);
      await load();
      toast.success(isEn ? "Budget item deleted" : "បានលុបចំណាយរួចរាល់");
    } catch (err) {
      setError(err?.message || (isEn ? "Could not delete budget item" : "មិនអាចលុបចំណាយបានទេ"));
      toast.error(isEn ? "Could not delete budget item" : "មិនអាចលុបចំណាយបានទេ");
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = async () => {
    setSaving(true);
    setError("");
    try {
      await budgetService.exportBudget(invitationId);
      toast.success(isEn ? "Exported budget CSV" : "បានទាញយកទិន្នន័យ CSV រួចរាល់");
    } catch (err) {
      setError(err?.message || (isEn ? "Could not export budget" : "មិនអាចទាញយក CSV បានទេ"));
      toast.error(isEn ? "Could not export budget" : "មិនអាចទាញយក CSV បានទេ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSkeleton layout="dashboard" />;

  if (error && !budget) {
    return (
      <main className="dash-main report-page budget-page">
        <ErrorState message={error} onRetry={load} />
      </main>
    );
  }

  return (
    <main className="dash-main report-page budget-page" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <header className="dash-page-header report-header">
        <div>
          <span className="dash-kicker">{isEn ? "Budget Management" : "ការគ្រប់គ្រងថវិកា"}</span>
          <h1>{isEn ? "Budget Planning & Expenses" : "គ្រប់គ្រងថវិកាកម្មវិធី"}</h1>
          <p>
            {isEn
              ? "Track expenses, estimates, and actual payments across all categories."
              : "តាមដានការចំណាយ ប៉ាន់ប្រមាណ និងចំណាយពិតប្រាកដតាមប្រភពនីមួយៗ។"}
          </p>
        </div>
        <div className="report-actions" style={{ display: "flex", gap: "0.75rem" }}>
          {invitationId && (
            <Link to={`/dashboard/invitations/${invitationId}/edit`} className="dash-btn">
              {isEn ? "Back to Invitation" : "ត្រឡប់ទៅសំបុត្រអញ្ជើញ"}
            </Link>
          )}
          <button
            type="button"
            className="dash-btn"
            onClick={() => window.print()}
            title={isEn ? "Print budget report" : "បោះពុម្ពរបាយការណ៍ថវិកា"}
          >
            {isEn ? "Print Report" : "បោះពុម្ពរបាយការណ៍"}
          </button>
          <button type="button" className="dash-btn dash-btn-primary" onClick={exportCsv} disabled={saving}>
            {isEn ? "Export CSV" : "ទាញយក CSV (Export CSV)"}
          </button>
        </div>
      </header>

      {error && <ErrorState message={error} />}

      <BudgetSummaryCards budget={budget} />
      <BudgetProgress budget={budget} />

      <section className="budget-panel">
        <div className="report-panel-head">
          <h2>{isEn ? "Set Total Budget" : "កំណត់ថវិកាសរុប"}</h2>
        </div>
        <form className="budget-total-form" onSubmit={saveBudget}>
          <label>
            {isEn ? "Total Budget ($)" : "ថវិកាសរុប ($)"}
            <input
              type="number"
              min="0"
              step="0.01"
              value={budgetForm.totalBudget}
              onChange={(event) => setBudgetForm((current) => ({ ...current, totalBudget: event.target.value }))}
              placeholder="5000"
            />
          </label>
          <label>
            {isEn ? "Additional Notes" : "កំណត់សម្គាល់បន្ថែម"}
            <input
              value={budgetForm.notes}
              onChange={(event) => setBudgetForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder={isEn ? "Family contribution, deposit info..." : "ជំនួយពីគ្រួសារ ព័ត៌មានកក់ប្រាក់..."}
            />
          </label>
          <button type="submit" className="dash-btn dash-btn-primary" disabled={saving}>
            {saving
              ? isEn ? "Saving..." : "កំពុងរក្សាទុក..."
              : isEn ? "Save Budget (រក្សាទុកថវិកា)" : "រក្សាទុកថវិកា"}
          </button>
        </form>
      </section>

      <CategoryBreakdown items={budget?.items || []} />

      <section className="budget-panel">
        <div className="report-panel-head">
          <h2>{isEn ? "Add Budget Item" : "បន្ថែមមុខទំនិញចំណាយ"}</h2>
        </div>
        <BudgetItemForm onSubmit={addItem} saving={saving} />
      </section>

      <section className="budget-panel">
        <div className="report-panel-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>{isEn ? "Budget Items" : "បញ្ជីចំណាយ"}</h2>
          <span style={{ fontSize: "0.875rem", color: "var(--brand-text-muted)" }}>
            {isEn ? `Total ${budget?.items?.length || 0} items` : `សរុប ${budget?.items?.length || 0} មុខ`}
          </span>
        </div>

        {!budget?.items?.length ? (
          <EmptyState
            title={isEn ? "No budget items recorded yet" : "មិនទាន់មានទិន្នន័យចំណាយ"}
            description={
              isEn
                ? "Add your first event expense item above."
                : "សូមបន្ថែមមុខទំនិញចំណាយដំបូងរបស់អ្នកខាងលើ។"
            }
          />
        ) : (
          <BudgetItemTable
            items={budget?.items || []}
            onUpdate={updateItem}
            onDelete={deleteItem}
            saving={saving}
          />
        )}
      </section>
    </main>
  );
}
