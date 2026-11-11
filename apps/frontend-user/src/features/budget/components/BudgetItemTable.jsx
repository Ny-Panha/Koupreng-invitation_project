import { useState } from "react";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { BUDGET_CATEGORIES, budgetCategoryLabel } from "../budgetCategories";

function money(value, currency = "USD") {
  const formatted = Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: currency === "KHR" ? 0 : 2,
  });
  return currency === "KHR" ? `${formatted} ៛` : `$${formatted}`;
}

function editable(item) {
  return {
    category: item.category || "OTHER",
    currency: item.currency || "USD",
    itemName: item.itemName || "",
    estimatedCost: item.estimatedCost ?? 0,
    actualCost: item.actualCost ?? 0,
    vendorName: item.vendorName || "",
    notes: item.notes || "",
  };
}

export default function BudgetItemTable({ items, onUpdate, onDelete, saving }) {
  const isEn = useLanguageStore((state) => state.lang) === "en";
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);

  const startEdit = (item) => {
    setEditingId(item.id);
    setDraft(editable(item));
  };

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const save = async (itemId) => {
    await onUpdate(itemId, {
      ...draft,
      estimatedCost: Number(draft.estimatedCost || 0),
      actualCost: Number(draft.actualCost || 0),
    });
    setEditingId(null);
    setDraft(null);
  };

  if (!items?.length) {
    return (
      <div className="budget-empty">
        {isEn
          ? "No budget items yet. Add your first event expense above."
          : "មិនទាន់មានទិន្នន័យចំណាយនៅឡើយទេ។ សូមបន្ថែមមុខទំនិញចំណាយដំបូងរបស់អ្នកខាងលើ។"}
      </div>
    );
  }

  return (
    <div className="budget-table-wrap">
      <table className="budget-table">
        <thead>
          <tr>
            <th>{isEn ? "Category" : "ប្រភេទ"}</th>
            <th>{isEn ? "Item" : "មុខទំនិញ"}</th>
            <th>{isEn ? "Currency" : "រូបិយប័ណ្ណ"}</th>
            <th>{isEn ? "Estimated" : "ប៉ាន់ប្រមាណ"}</th>
            <th>{isEn ? "Actual" : "ជាក់ស្តែង"}</th>
            <th>{isEn ? "Vendor" : "អ្នកផ្គត់ផ្គង់"}</th>
            <th>{isEn ? "Notes" : "សម្គាល់"}</th>
            <th>{isEn ? "Actions" : "សកម្មភាព"}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const editing = editingId === item.id;
            return (
              <tr key={item.id}>
                <td>
                  {editing ? (
                    <select
                      value={draft.category}
                      onChange={(event) => updateDraft("category", event.target.value)}
                    >
                      {BUDGET_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {isEn ? c.labelEn : c.labelKm}
                        </option>
                      ))}
                    </select>
                  ) : (
                    budgetCategoryLabel(item.category, isEn)
                  )}
                </td>
                <td>
                  {editing ? (
                    <input
                      value={draft.itemName}
                      onChange={(event) => updateDraft("itemName", event.target.value)}
                    />
                  ) : (
                    <strong>{item.itemName}</strong>
                  )}
                </td>
                <td>
                  {editing ? (
                    <select
                      value={draft.currency}
                      onChange={(event) => updateDraft("currency", event.target.value)}
                    >
                      <option value="USD">USD</option>
                      <option value="KHR">KHR</option>
                    </select>
                  ) : (
                    item.currency || "USD"
                  )}
                </td>
                <td>
                  {editing ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft.estimatedCost}
                      onChange={(event) => updateDraft("estimatedCost", event.target.value)}
                    />
                  ) : (
                    money(item.estimatedCost, item.currency)
                  )}
                </td>
                <td>
                  {editing ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft.actualCost}
                      onChange={(event) => updateDraft("actualCost", event.target.value)}
                    />
                  ) : (
                    money(item.actualCost, item.currency)
                  )}
                </td>
                <td>
                  {editing ? (
                    <input
                      value={draft.vendorName}
                      onChange={(event) => updateDraft("vendorName", event.target.value)}
                    />
                  ) : (
                    item.vendorName || "—"
                  )}
                </td>
                <td>
                  {editing ? (
                    <input
                      value={draft.notes}
                      onChange={(event) => updateDraft("notes", event.target.value)}
                    />
                  ) : (
                    item.notes || "—"
                  )}
                </td>
                <td>
                  <div className="budget-row-actions">
                    {editing ? (
                      <>
                        <button
                          type="button"
                          className="dash-btn"
                          onClick={() => save(item.id)}
                          disabled={saving}
                        >
                          {isEn ? "Save" : "រក្សាទុក"}
                        </button>
                        <button
                          type="button"
                          className="dash-btn"
                          onClick={() => setEditingId(null)}
                          disabled={saving}
                        >
                          {isEn ? "Cancel" : "បោះបង់"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="dash-btn"
                          onClick={() => startEdit(item)}
                          disabled={saving}
                        >
                          {isEn ? "Edit" : "កែប្រែ"}
                        </button>
                        <button
                          type="button"
                          className="dash-btn budget-danger-btn"
                          onClick={() => onDelete(item.id)}
                          disabled={saving}
                        >
                          {isEn ? "Delete" : "លុប"}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
