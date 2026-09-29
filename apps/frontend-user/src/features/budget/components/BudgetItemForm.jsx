import { useState } from "react";
import { BUDGET_CATEGORIES } from "../budgetCategories";

const initialForm = {
  category: "OTHER",
  currency: "USD",
  itemName: "",
  estimatedCost: "",
  actualCost: "",
  vendorName: "",
  notes: "",
};

function toPayload(form) {
  return {
    ...form,
    estimatedCost: form.estimatedCost === "" ? 0 : Number(form.estimatedCost),
    actualCost: form.actualCost === "" ? 0 : Number(form.actualCost),
  };
}

export default function BudgetItemForm({ onSubmit, saving }) {
  const [form, setForm] = useState(initialForm);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit(toPayload(form));
    setForm(initialForm);
  };

  return (
    <form className="budget-item-form" onSubmit={submit}>
      <div className="budget-form-grid">
        <label>
          Category
          <select value={form.category} onChange={(event) => update("category", event.target.value)}>
            {BUDGET_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </label>
        <label>
          Currency
          <select value={form.currency} onChange={(event) => update("currency", event.target.value)}>
            <option value="USD">USD ($)</option>
            <option value="KHR">KHR (៛)</option>
          </select>
        </label>
        <label>
          Item name
          <input
            value={form.itemName}
            onChange={(event) => update("itemName", event.target.value)}
            placeholder="Venue deposit"
            required
          />
        </label>
        <label>
          Estimated
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.estimatedCost}
            onChange={(event) => update("estimatedCost", event.target.value)}
          />
        </label>
        <label>
          Actual
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.actualCost}
            onChange={(event) => update("actualCost", event.target.value)}
          />
        </label>
        <label>
          Vendor
          <input value={form.vendorName} onChange={(event) => update("vendorName", event.target.value)} />
        </label>
        <label>
          Notes
          <input value={form.notes} onChange={(event) => update("notes", event.target.value)} />
        </label>
      </div>
      <button type="submit" className="dash-btn dash-btn-primary" disabled={saving}>
        {saving ? "Saving..." : "Add item"}
      </button>
    </form>
  );
}
