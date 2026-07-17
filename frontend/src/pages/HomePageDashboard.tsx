import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import BebederosPanel from "../components/Dashboard/BebederosPanel/BebederosPanel";
import DashboardHeader from "../components/Header/DashboardHeader";
import DashboardNavTabs from "../components/Dashboard/NavTabs/DashboardNavTabs";
import UsersPanel from "../components/Dashboard/UsersPanel/UsersPanel";
import ReportsPanel from "../components/Dashboard/ReportsPanel/ReportsPanel";

import styles from "./HomePageDashboard.module.css";
import EstablecimientoPanel from "../components/Dashboard/EstablecimientoPanel/EstablecimientoPanel";

export default function HomePageDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role;

  // Hardening extra: este componente solo se renderiza para admin.
  if (role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  const getTabFromPath = () => {
    if (location.pathname.includes("/establecimientos")) return "establecimientos";
    if (location.pathname.includes("/reportes")) return "reportes";
    if (location.pathname.includes("/dispositivos")) return "dispositivos";
    if (location.pathname.includes("/usuarios")) return "usuarios";

    return "usuarios";
  };

  const getInitialTab = () => getTabFromPath();

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname, user]);

  return (
    <div className={styles.container}>
      <DashboardHeader />

      <DashboardNavTabs active={activeTab} onChange={setActiveTab} />

      <div className={styles.content}>
        {activeTab === "establecimientos" && <EstablecimientoPanel />}
        {activeTab === "usuarios" && <UsersPanel />}
        {activeTab === "dispositivos" && <BebederosPanel />}
        {activeTab === "reportes" && <ReportsPanel />}
      </div>
    </div>
  );
}
