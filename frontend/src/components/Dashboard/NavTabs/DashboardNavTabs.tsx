import styles from "./DashboardNavTabs.module.css";

interface DashboardNavTabsProps {
  active: string;
  onChange: (tabId: string) => void;
}

export default function DashboardNavTabs({ active, onChange }: DashboardNavTabsProps) {
  const tabs = [
    { id: "establecimientos", label: "Establecimientos" },
    { id: "usuarios", label: "Usuarios" },
    { id: "dispositivos", label: "Dispositivos" },
    { id: "reportes", label: "Reportes" }
  ];

  return (
    <nav className={styles.nav}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`${styles.tab} ${active === tab.id ? styles.active : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
