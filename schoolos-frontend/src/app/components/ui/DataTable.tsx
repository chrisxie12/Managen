import { useState, useMemo, type ReactNode } from "react";
import {
  ChevronLeft, ChevronRight, ArrowUpDown, Download, Columns, X, Search, Trash2,
} from "lucide-react";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";
import { exportToCSV } from "../../utils/exportToCSV";
import { useIsMobile } from "./use-mobile";

const NAVY = "#031B4E";
const NAVY_LIGHT = "#0069D9";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  hideable?: boolean;
}

interface DataTableProps<T> {
  tableKey: string;
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string, order: "asc" | "desc") => void;
  loading?: boolean;
  emptyState?: ReactNode;
  searchable?: boolean;
  searchValue?: string;
  onSearch?: (value: string) => void;
  filters?: { key: string; label: string; value: string; onRemove: () => void }[];
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string;
  exportFilename?: string;
  bulkActions?: { label: string; icon?: ReactNode; onClick: (selectedIds: string[]) => void; variant?: "danger" | "default" }[];
  rowClassName?: (row: T) => string | undefined;
}

export function DataTable<T extends Record<string, unknown>>({
  tableKey,
  columns,
  data,
  total,
  page,
  pageSize,
  onPageChange,
  sortBy,
  sortOrder,
  onSort,
  loading,
  emptyState,
  searchable,
  searchValue,
  onSearch,
  filters = [],
  onRowClick,
  rowKey,
  exportFilename,
  bulkActions,
  rowClassName,
}: DataTableProps<T>) {
  const { getColumnPrefs, setColumnPrefs } = useUserPreferences();
  const isMobile = useIsMobile();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [scrollHint, setScrollHint] = useState(true);

  const savedPrefs = getColumnPrefs(tableKey);
  const visibleColumns = useMemo(() => {
    if (savedPrefs.length > 0) {
      return savedPrefs
        .filter((c) => c.visible)
        .sort((a, b) => a.order - b.order)
        .map((c) => columns.find((col) => col.key === c.key))
        .filter(Boolean) as Column<T>[];
    }
    return columns;
  }, [columns, savedPrefs]);

  const allSelected = data.length > 0 && data.every((row) => selectedIds.has(rowKey(row)));
  const someSelected = data.some((row) => selectedIds.has(rowKey(row))) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((row) => rowKey(row))));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = () => {
    if (!exportFilename) return;
    const visibleKeys = visibleColumns.map((c) => c.key);
    const exportData = data.map((row) => {
      const obj: Record<string, unknown> = {};
      visibleColumns.forEach((col) => {
        obj[col.label] = row[col.key];
      });
      return obj;
    });
    exportToCSV(exportData, visibleColumns.map((c) => ({ key: c.label, label: c.label })), exportFilename);
  };

  const toggleColumnVisibility = (columnKey: string) => {
    const prefs = getColumnPrefs(tableKey);
    const existing = prefs.find((c) => c.key === columnKey);
    if (existing) {
      setColumnPrefs(
        tableKey,
        prefs.map((c) => (c.key === columnKey ? { ...c, visible: !c.visible } : c)),
      );
    } else {
      const col = columns.find((c) => c.key === columnKey);
      if (col) {
        setColumnPrefs(tableKey, [
          ...prefs,
          { key: col.key, label: col.label, visible: false, order: columns.indexOf(col) },
        ]);
      }
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollLeft > 0) setScrollHint(false);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {searchable && onSearch && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[200px]"
            style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)" }}
          >
            <Search size={14} color={MUTED} />
            <input
              placeholder="Search..."
              value={searchValue || ""}
              onChange={(e) => onSearch(e.target.value)}
              className="bg-transparent outline-none text-sm flex-1"
              style={{ color: NAVY }}
            />
            {searchValue && (
              <button onClick={() => onSearch("")}>
                <X size={14} color={MUTED} />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {exportFilename && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
              style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY_LIGHT }}
            >
              <Download size={13} /> Export CSV
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
              style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY_LIGHT }}
            >
              <Columns size={13} /> Columns
            </button>
            {showColumnMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowColumnMenu(false)} />
                <div
                  className="absolute right-0 top-full mt-1 z-50 w-52 rounded-xl overflow-hidden shadow-lg"
                  style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)" }}
                >
                  {columns.map((col) => {
                    const prefs = getColumnPrefs(tableKey);
                    const saved = prefs.find((c) => c.key === col.key);
                    const visible = saved ? saved.visible : true;
                    if (col.hideable === false) return null;
                    return (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:opacity-80"
                        style={{ color: NAVY }}
                      >
                        <input
                          type="checkbox"
                          checked={visible}
                          onChange={() => toggleColumnVisibility(col.key)}
                          className="rounded"
                        />
                        {col.label}
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {filters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: `${NAVY}12`, color: NAVY }}
            >
              {f.label}: {f.value}
              <button onClick={f.onRemove} className="ml-0.5 hover:opacity-70">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Table Container */}
      <div
        className="rounded-xl overflow-hidden relative"
        style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}
      >
        {/* Scroll Hint */}
        {scrollHint && !isMobile && (
          <div
            className="absolute right-2 top-2 z-10 px-2 py-1 rounded-lg text-[10px] font-medium animate-pulse"
            style={{ background: NAVY, color: CREAM }}
          >
            Scroll →
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="space-y-3 w-full px-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 rounded animate-pulse" style={{ background: `${NAVY}08` }} />
              ))}
            </div>
          </div>
        ) : data.length === 0 ? (
          emptyState || (
            <div className="text-center py-12" style={{ color: MUTED }}>
              <p className="font-semibold" style={{ color: NAVY }}>No data found</p>
            </div>
          )
        ) : (
          <div className="overflow-x-auto" onScroll={handleScroll}>
            <table className="w-full min-w-[700px]">
              <thead>
                <tr
                  className="text-left text-xs uppercase tracking-wider"
                  style={{ color: MUTED, borderBottom: "1px solid rgba(10,36,114,0.07)" }}
                >
                  {bulkActions && (
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="rounded"
                      />
                    </th>
                  )}
                  {visibleColumns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 font-medium ${col.sortable ? "cursor-pointer select-none" : ""}`}
                      onClick={() => {
                        if (col.sortable && onSort) {
                          const isActive = sortBy === col.key;
                          onSort(col.key, isActive && sortOrder === "asc" ? "desc" : "asc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.label}</span>
                        {col.sortable && (
                          <ArrowUpDown
                            size={12}
                            style={{
                              color: sortBy === col.key ? NAVY : MUTED,
                              opacity: sortBy === col.key ? 1 : 0.4,
                            }}
                          />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row) => {
                  const id = rowKey(row);
                  const isSelected = selectedIds.has(id);
                  return (
                    <tr
                      key={id}
                      className={`text-sm transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                      style={{
                        borderBottom: "1px solid rgba(10,36,114,0.05)",
                        background: isSelected ? `${NAVY}06` : "transparent",
                      }}
                      onClick={() => onRowClick?.(row)}
                    >
                      {bulkActions && (
                        <td className="px-4 py-3 w-10" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(id)}
                            className="rounded"
                          />
                        </td>
                      )}
                      {visibleColumns.map((col) => (
                        <td key={col.key} className="px-4 py-3" style={{ color: NAVY }}>
                          {col.render ? col.render(row) : (row[col.key] as ReactNode) ?? "—"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Selection Action Bar */}
        {selectedIds.size > 0 && bulkActions && bulkActions.length > 0 && (
          <div
            className="flex items-center gap-2 px-4 py-2.5 border-t"
            style={{
              background: NAVY,
              borderColor: NAVY_LIGHT,
            }}
          >
            <span className="text-sm font-medium mr-2" style={{ color: CREAM }}>
              {selectedIds.size} selected
            </span>
            {bulkActions.map((action) => (
              <button
                key={action.label}
                onClick={() => action.onClick(Array.from(selectedIds))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                style={{
                  background: action.variant === "danger" ? "rgba(239,68,68,0.2)" : "rgba(248,249,250,0.15)",
                  color: action.variant === "danger" ? "#EF4444" : CREAM,
                  border: `1px solid ${action.variant === "danger" ? "rgba(239,68,68,0.3)" : "rgba(248,249,250,0.2)"}`,
                }}
              >
                {action.icon || <Trash2 size={12} />}
                {action.label}
              </button>
            ))}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto px-2 py-1 rounded text-xs"
              style={{ color: "rgba(248,249,250,0.6)" }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3 text-sm"
            style={{ borderTop: "1px solid rgba(10,36,114,0.07)" }}
          >
            <span style={{ color: MUTED }}>
              {total} record{total !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg disabled:opacity-30"
                style={{ color: NAVY, border: "1px solid rgba(10,36,114,0.12)" }}
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-medium px-2" style={{ color: NAVY }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg disabled:opacity-30"
                style={{ color: NAVY, border: "1px solid rgba(10,36,114,0.12)" }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
