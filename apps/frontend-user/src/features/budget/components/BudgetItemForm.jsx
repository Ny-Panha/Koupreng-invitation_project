import { useState } from "react";
import { useLanguageStore } from "@/stores/useLanguageStore";
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
  const isEn = useLanguageStore((state) => state.lang) === "en";
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
          {isEn ? "Category" : "ប្រភេទចំណាយ"}
          <select value={form.category} onChange={(event) => update("category", event.target.value)}>
            {BUDGET_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {isEn ? category.labelEn : category.labelKm}
              </option>
            ))}
          </select>
        </label>
        <label>
          {isEn ? "Currency" : "រូបិយប័ណ្ណ"}
          <select value={form.currency} onChange={(event) => update("currency", event.target.value)}>
            <option value="USD">USD ($)</option>
            <option value="KHR">KHR (៛)</option>
          </select>
        </label>
        <label>
          {isEn ? "Item name" : "ឈ្មោះមុខទំនិញ"}
          <input
            value={form.itemName}
            onChange={(event) => update("itemName", event.target.value)}
            placeholder={isEn ? "e.g. Venue deposit" : "ឧ. ប្រាក់កក់ទីតាំង"}
            required
          />
        </label>
        <label>
          {isEn ? "Estimated cost" : "ប៉ាន់ប្រមាណ"}
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.estimatedCost}
            onChange={(event) => update("estimatedCost", event.target.value)}
            placeholder="0.00"
          />
        </label>
        <label>
          {isEn ? "Actual cost" : "ចំណាយជាក់ស្តែង"}
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.actualCost}
            onChange={(event) => update("actualCost", event.target.value)}
            placeholder="0.00"
          />
        </label>
        <label>
          {isEn ? "Vendor" : "អ្នកផ្គត់ផ្គង់/ហាង"}
          <input
            value={form.vendorName}
            onChange={(event) => update("vendorName", event.target.value)}
            placeholder={isEn ? "e.g. Himawari Hotel" : "ឧ. សណ្ឋាគារ ហ៊ីម៉ាវ៉ារី"}
          />
        </label>
        <label>
          {isEn ? "Notes" : "កំណត់សម្គាល់"}
          <input
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder={isEn ? "e.g. 50% deposit paid" : "ឧ. បង់ប្រាក់កក់ ៥០%"}
          />
        </label>
      </div>
      <button type="submit" className="dash-btn dash-btn-primary" disabled={saving}>
        {saving ? (isEn ? "Saving..." : "កំពុងរក្សាទុក...") : (isEn ? "Add item" : "បន្ថែមមុខទំនិញ")}
      </button>
    </form>
  );
}
