import { useState } from "react";
import { Plus, Download, Package, AlertTriangle, Building2, DollarSign, X } from "lucide-react";
import { PageTemplate } from "../../components/layout/PageTemplate";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const PRIMARY = "#031B4E";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";
const INFO = "#3B82F6";

type ItemCategory = "All" | "Furniture" | "Electronics" | "Lab Equipment" | "Sports" | "Stationery";
type ItemCondition = "Good" | "Fair" | "Poor" | "New";

interface InventoryItem {
  id: string;
  name: string;
  category: Exclude<ItemCategory, "All">;
  quantity: number;
  minQuantity: number;
  unit: string;
  location: string;
  condition: ItemCondition;
  unitValue: number;
  lastUpdated: string;
}

const conditionColor: Record<ItemCondition, string> = {
  New: SUCCESS,
  Good: INFO,
  Fair: WARNING,
  Poor: DANGER,
};

const CATEGORIES: ItemCategory[] = [
  "All",
  "Furniture",
  "Electronics",
  "Lab Equipment",
  "Sports",
  "Stationery",
];

const ITEM_CATEGORIES: Exclude<ItemCategory, "All">[] = ["Furniture", "Electronics", "Lab Equipment", "Sports", "Stationery"];

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<ItemCategory>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", category: "Furniture" as Exclude<ItemCategory,"All">, quantity: "", minQuantity: "", unit: "Pcs", location: "", condition: "Good" as ItemCondition, unitValue: "" });

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const lowStockItems = items.filter((i) => i.quantity < i.minQuantity).length;
  const departments = new Set(items.map((i) => i.location)).size;
  const totalValue = items.reduce((sum, i) => sum + i.quantity * i.unitValue, 0);

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((i) => i.category === activeCategory);

  const isLowStock = (item: InventoryItem) => item.quantity < item.minQuantity;

  return (
    <PageTemplate
      title="Inventory"
      description="Track school assets, equipment and stock levels"
      breadcrumb={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Inventory" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm"
            style={{ background: "white", color: PRIMARY, border: `1px solid ${PRIMARY}30` }}
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white"
            style={{ background: PRIMARY }}
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: totalItems.toLocaleString(), icon: Package, color: NAVY },
          { label: "Low Stock", value: lowStockItems, icon: AlertTriangle, color: DANGER },
          { label: "Departments", value: departments, icon: Building2, color: INFO },
          {
            label: "Total Value (GHS)",
            value: `₵${(totalValue / 1000).toFixed(0)}K`,
            icon: DollarSign,
            color: SUCCESS,
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="p-5 rounded-lg flex items-start gap-4"
            style={{ background: "white", border: `1px solid ${NAVY}20` }}
          >
            <div
              className="p-2.5 rounded-lg flex-shrink-0"
              style={{ background: `${color}15` }}
            >
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <div style={{ color: MUTED, fontSize: "0.8rem", fontWeight: 500 }}>{label}</div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color,
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginTop: "0.25rem",
                }}
              >
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems > 0 && (
        <div
          className="p-4 rounded-lg flex items-start gap-3"
          style={{ background: `${WARNING}12`, border: `1px solid ${WARNING}35` }}
        >
          <AlertTriangle size={20} style={{ color: WARNING, flexShrink: 0, marginTop: "0.1rem" }} />
          <div>
            <div style={{ color: WARNING, fontWeight: 600, fontSize: "0.95rem" }}>
              {lowStockItems} item{lowStockItems > 1 ? "s are" : " is"} below minimum stock level
            </div>
            <div style={{ color: MUTED, fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Highlighted rows below indicate items that need restocking.
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div
        className="p-1 rounded-xl flex items-center gap-1 flex-wrap"
        style={{ background: `${NAVY}06`, border: `1px solid ${NAVY}15` }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeCategory === cat ? "white" : "transparent",
              color: activeCategory === cat ? NAVY : MUTED,
              boxShadow: activeCategory === cat ? `0 1px 3px ${NAVY}15` : "none",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${NAVY}20` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: `${NAVY}08`, borderBottom: `1px solid ${NAVY}20` }}>
                {["Item Name", "Category", "Qty", "Unit", "Location", "Condition", "Unit Value", "Last Updated"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold"
                      style={{ color: NAVY, textTransform: "uppercase" }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const lowStock = isLowStock(item);
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                    style={{
                      borderBottom: `1px solid ${NAVY}10`,
                      background: lowStock ? `${DANGER}06` : undefined,
                    }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {lowStock && (
                          <AlertTriangle size={13} style={{ color: DANGER, flexShrink: 0 }} />
                        )}
                        <div style={{ color: NAVY, fontWeight: 600 }}>{item.name}</div>
                      </div>
                      {lowStock && (
                        <div style={{ color: DANGER, fontSize: "0.72rem", marginTop: "0.1rem" }}>
                          Min required: {item.minQuantity} {item.unit}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: `${INFO}15`, color: INFO }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        style={{
                          fontWeight: 700,
                          color: lowStock ? DANGER : item.quantity > item.minQuantity * 1.5 ? SUCCESS : WARNING,
                        }}
                      >
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: MUTED }}>
                      {item.unit}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: MUTED }}>
                      {item.location}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          background: `${conditionColor[item.condition]}15`,
                          color: conditionColor[item.condition],
                        }}
                      >
                        {item.condition}
                      </span>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: MUTED }}>
                      ₵{item.unitValue.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: MUTED, fontSize: "0.8rem" }}>
                      {item.lastUpdated}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && (
          <div className="py-12 text-center" style={{ color: MUTED }}>
            No items in this category.
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="p-4 rounded-lg"
        style={{ background: `${NAVY}08`, border: `1px solid ${NAVY}20` }}
      >
        <p style={{ color: MUTED, fontSize: "0.875rem" }}>
          Showing <strong>{filteredItems.length}</strong> of <strong>{items.length}</strong> items
          &nbsp;·&nbsp; Total value:{" "}
          <strong style={{ color: SUCCESS }}>
            ₵
            {filteredItems
              .reduce((s, i) => s + i.quantity * i.unitValue, 0)
              .toLocaleString()}
          </strong>
        </p>
      </div>
      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold" style={{ color: NAVY }}>Add Inventory Item</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={16} style={{ color: MUTED }} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Item Name *</label>
                <input className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} placeholder="e.g. Student Chair" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Category</label>
                  <select className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value as any }))}>
                    {ITEM_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Condition</label>
                  <select className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} value={addForm.condition} onChange={e => setAddForm(f => ({ ...f, condition: e.target.value as any }))}>
                    {(["New","Good","Fair","Poor"] as ItemCondition[]).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Quantity *</label>
                  <input type="number" min="0" className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} placeholder="0" value={addForm.quantity} onChange={e => setAddForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Unit (Pcs/Sets…)</label>
                  <input className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} placeholder="Pcs" value={addForm.unit} onChange={e => setAddForm(f => ({ ...f, unit: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Min Stock Level</label>
                  <input type="number" min="0" className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} placeholder="0" value={addForm.minQuantity} onChange={e => setAddForm(f => ({ ...f, minQuantity: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Unit Value (GHS)</label>
                  <input type="number" min="0" className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} placeholder="0" value={addForm.unitValue} onChange={e => setAddForm(f => ({ ...f, unitValue: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Location</label>
                <input className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} placeholder="e.g. Classrooms" value={addForm.location} onChange={e => setAddForm(f => ({ ...f, location: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ color: MUTED, background: `${NAVY}08` }}>Cancel</button>
              <button
                disabled={!addForm.name || !addForm.quantity}
                onClick={() => {
                  if (!addForm.name || !addForm.quantity) return;
                  const newItem: InventoryItem = { id: String(Date.now()), name: addForm.name, category: addForm.category, quantity: Number(addForm.quantity), minQuantity: Number(addForm.minQuantity) || 0, unit: addForm.unit || "Pcs", location: addForm.location || "—", condition: addForm.condition, unitValue: Number(addForm.unitValue) || 0, lastUpdated: new Date().toISOString().split("T")[0] };
                  setItems(prev => [newItem, ...prev]);
                  setAddForm({ name: "", category: "Furniture", quantity: "", minQuantity: "", unit: "Pcs", location: "", condition: "Good", unitValue: "" });
                  setShowAddModal(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity"
                style={{ background: PRIMARY, opacity: !addForm.name || !addForm.quantity ? 0.6 : 1 }}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}
