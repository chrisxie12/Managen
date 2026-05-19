import { createContext, useContext, useCallback, type ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  order: number;
}

type ColumnPreferences = Record<string, ColumnConfig[]>;

type DashboardWidget =
  | { id: "metrics"; visible: boolean }
  | { id: "chart"; visible: boolean }
  | { id: "quick-actions"; visible: boolean }
  | { id: "school-glance"; visible: boolean };

interface DashboardLayout {
  widgets: DashboardWidget[];
}

interface UserPreferences {
  sidebarCollapsed: boolean;
  recentItems: { path: string; label: string; timestamp: number }[];
  columnPreferences: ColumnPreferences;
  dashboardLayout: DashboardLayout;
}

interface UserPreferencesContextValue {
  preferences: UserPreferences;
  toggleSidebar: () => void;
  addRecentItem: (path: string, label: string) => void;
  getColumnPrefs: (tableKey: string) => ColumnConfig[];
  setColumnPrefs: (tableKey: string, columns: ColumnConfig[]) => void;
  updateDashboardWidgets: (widgets: DashboardWidget[]) => void;
  clearRecentItems: () => void;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [];

const DEFAULT_PREFERENCES: UserPreferences = {
  sidebarCollapsed: false,
  recentItems: [],
  columnPreferences: {},
  dashboardLayout: {
    widgets: [
      { id: "metrics", visible: true },
      { id: "chart", visible: true },
      { id: "quick-actions", visible: true },
      { id: "school-glance", visible: true },
    ],
  },
};

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    "managen-user-preferences",
    DEFAULT_PREFERENCES,
  );

  const toggleSidebar = useCallback(() => {
    setPreferences((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  }, [setPreferences]);

  const addRecentItem = useCallback(
    (path: string, label: string) => {
      setPreferences((prev) => {
        const filtered = prev.recentItems.filter((r) => r.path !== path);
        return {
          ...prev,
          recentItems: [{ path, label, timestamp: Date.now() }, ...filtered].slice(0, 5),
        };
      });
    },
    [setPreferences],
  );

  const getColumnPrefs = useCallback(
    (tableKey: string): ColumnConfig[] => {
      return preferences.columnPreferences[tableKey] ?? DEFAULT_COLUMNS;
    },
    [preferences.columnPreferences],
  );

  const setColumnPrefs = useCallback(
    (tableKey: string, columns: ColumnConfig[]) => {
      setPreferences((prev) => ({
        ...prev,
        columnPreferences: { ...prev.columnPreferences, [tableKey]: columns },
      }));
    },
    [setPreferences],
  );

  const updateDashboardWidgets = useCallback(
    (widgets: DashboardWidget[]) => {
      setPreferences((prev) => ({
        ...prev,
        dashboardLayout: { ...prev.dashboardLayout, widgets },
      }));
    },
    [setPreferences],
  );

  const clearRecentItems = useCallback(() => {
    setPreferences((prev) => ({ ...prev, recentItems: [] }));
  }, [setPreferences]);

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        toggleSidebar,
        addRecentItem,
        getColumnPrefs,
        setColumnPrefs,
        updateDashboardWidgets,
        clearRecentItems,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) throw new Error("useUserPreferences must be used within UserPreferencesProvider");
  return ctx;
}
