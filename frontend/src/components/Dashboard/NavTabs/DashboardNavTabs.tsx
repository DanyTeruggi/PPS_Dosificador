import Button from "../../Button/Button";
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
        <Button
          key={tab.id}
          variant={active === tab.id ? "selectedActive" : "selected"} 
          label={tab.label}
          onClick={() => onChange(tab.id)}
        />

      ))}
    </nav>
  );
}
