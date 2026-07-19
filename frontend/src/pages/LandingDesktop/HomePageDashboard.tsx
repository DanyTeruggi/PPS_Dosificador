import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

import BebederosPanel from "../../components/Dashboard/BebederosPanel/BebederosPanel";
import DashboardHeader from "../../components/Header/DashboardHeader";
import DashboardNavTabs from "../../components/Dashboard/NavTabs/DashboardNavTabs";
import UsersPanel from "../../components/Dashboard/UsersPanel/UsersPanel";
import ReportsPanel from "../../components/Dashboard/ReportsPanel/ReportsPanel";

import styles from "./HomePageDashboard.module.css";
import EstablecimientoPanel from "../../components/Dashboard/EstablecimientoPanel/EstablecimientoPanel";

function getTabFromPath(pathname: string) {
  if (pathname.includes("/establecimientos")) return "establecimientos";
  if (pathname.includes("/reportes")) return "reportes";
  if (pathname.includes("/dispositivos")) return "dispositivos";
  return "usuarios";
}

export default function HomePageDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role;

  const [activeTab, setActiveTab] = useState(() =>
    getTabFromPath(location.pathname),
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setActiveTab(getTabFromPath(location.pathname));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname]);

  // Hardening extra: este componente solo se renderiza para admin.
  if (role !== "admin") {
    return <Navigate to="/home" replace />;
  }

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
