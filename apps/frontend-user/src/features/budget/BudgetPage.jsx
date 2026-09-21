import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import budgetService from "./api/budgetApi";
import BudgetItemForm from "./components/BudgetItemForm";
import BudgetItemTable from "./components/BudgetItemTable";
import BudgetSummaryCards from "./components/BudgetSummaryCards";
import CategoryBreakdown from "./components/CategoryBreakdown";
import BudgetProgress from "./components/BudgetProgress";
import { EmptyState, ErrorState, SkeletonCard, toast } from "@/shared/ui";
import "./BudgetPages.css";

export default function BudgetPage() {
  const { invitationId } = useParams();
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
      setError(err?.message || "Could not load budget");
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
          setError(err?.message || "Could not load budget");
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
  }, [invitationId]);

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
      toast.success("បានរក្សាទុកថវិកាសរុប / Budget updated successfully");
    } catch (err) {
      setError(err?.message || "Could not save budget");
      toast.error("មិនអាចរក្សាទុកថវិកាបានទេ");
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
      toast.success("បានបន្ថែមចំណាយថ្មី / Budget item added");
    } catch (err) {
      setError(err?.message || "Could not add budget item");
      toast.error("មិនអាចបន្ថែមចំណាយបានទេ");
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
      toast.success("បានកែសម្រួលចំណាយ / Budget item updated");
    } catch (err) {
      setError(err?.message || "Could not update budget item");
      toast.error("មិនអាចកែសម្រួលចំណាយបានទេ");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("តើអ្នកប្រាកដជាចង់លុបចំណាយនេះទេ? / Delete this budget item?")) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      await budgetService.deleteItem(invitationId, itemId);
      await load();
      toast.success("បានលុបចំណាយរួចរាល់ / Budget item deleted");
    } catch (err) {
      setError(err?.message || "Could not delete budget item");
      toast.error("មិនអាចលុបចំណាយបានទេ");
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = async () => {
    setSaving(true);
    setError("");
    try {
      await budgetService.exportBudget(invitationId);
      toast.success("បានទាញយកទិន្នន័យ CSV / Exported budget CSV");
    } catch (err) {
      setError(err?.message || "Could not export budget");
      toast.error("មិនអាចទាញយក CSV បានទេ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="dash-main report-page budget-page" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <SkeletonCard height="180px" />
        <SkeletonCard height="240px" />
      </main>
    );
  }

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
          <span className="dash-kicker">Budget Management</span>
          <h1>គ្រប់គ្រងថវិកាកម្មវិធី</h1>
          <p>តាមដានការចំណាយ ប៉ាន់ប្រមាណ និងចំណាយពិតប្រាកដតាមប្រភពនីមួយៗ។</p>
        </div>
        <div className="report-actions" style={{ display: "flex", gap: "0.75rem" }}>
          {invitationId && (
            <Link to={`/dashboard/invitations/${invitationId}/edit`} className="dash-btn">
              ត្រឡប់ទៅធៀប / Back to Invitation
            </Link>
          )}
          <button type="button" className="dash-btn dash-btn-primary" onClick={exportCsv} disabled={saving}>
            ទាញយក CSV / Export CSV
          </button>
        </div>
      </header>

      {error && <ErrorState message={error} />}

      <BudgetSummaryCards budget={budget} />
      <BudgetProgress budget={budget} />

      <section className="budget-panel">
        <div className="report-panel-head">
          <h2>កំណត់ថវិកាសរុប (Total Budget Goal)</h2>
        </div>
        <form className="budget-total-form" onSubmit={saveBudget}>
          <label>
            ថវិកាសរុប (Total Budget $)
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
            កំណត់សម្គាល់បន្ថែម (Notes)
            <input
              value={budgetForm.notes}
              onChange={(event) => setBudgetForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="ជំនួយពីគ្រួសារ ព័ត៌មានកក់ប្រាក់..."
            />
          </label>
          <button type="submit" className="dash-btn dash-btn-primary" disabled={saving}>
            {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុកថវិកា / Save Budget"}
          </button>
        </form>
      </section>

      <CategoryBreakdown items={budget?.items || []} />

      <section className="budget-panel">
        <div className="report-panel-head">
          <h2>បន្ថែមមុខទំនិញចំណាយ (Add Budget Item)</h2>
        </div>
        <BudgetItemForm onSubmit={addItem} saving={saving} />
      </section>

      <section className="budget-panel">
        <div className="report-panel-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>បញ្ជីចំណាយ (Budget Items)</h2>
          <span style={{ fontSize: "0.875rem", color: "var(--brand-text-muted)" }}>
            សរុប {budget?.items?.length || 0} មុខ
          </span>
        </div>

        {!budget?.items?.length ? (
          <EmptyState
            title="មិនទាន់មានទិន្នន័យចំណាយ"
            description="សូមបន្ថែមមុខទំនិញចំណាយដំបូងរបស់អ្នកខាងលើ។"
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
