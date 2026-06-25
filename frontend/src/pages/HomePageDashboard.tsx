import { useState } from "react";
import { useAuth } from "../context/AuthContext";

import BebederosPanel from "../components/Dashboard/BebederosPanel/BebederosPanel";
import DashboardHeader from "../components/Dashboard/Header/DashboardHeader";
import DashboardNavTabs from "../components/Dashboard/NavTabs/DashboardNavTabs";
import UsersPanel from "../components/Dashboard/UsersPanel/UsersPanel";
import ReportsPanel from "../components/Dashboard/ReportsPanel/ReportsPanel";

import styles from "./HomePageDashboard.module.css";

export default function HomePageDashboard() {
  const { user } = useAuth();

  /**
   * Tab inicial según el rol:
   * - admin → usuarios
   * - veterinario → usuarios
   * - cliente → dispositivos (bebederos)
   */
  const getInitialTab = () => {
    if (user?.rol === "cliente") return "dispositivos";
    return "usuarios";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  return (
    <div className={styles.container}>
      <DashboardHeader />

      <DashboardNavTabs active={activeTab} onChange={setActiveTab} />

      <div className={styles.content}>
        {activeTab === "usuarios" && <UsersPanel />}
        {activeTab === "dispositivos" && <BebederosPanel />}
        {activeTab === "reportes" && <ReportsPanel />}
      </div>
    </div>
  );
}
