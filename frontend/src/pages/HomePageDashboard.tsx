import DashboardHeader from "../components/Dashboard/Header/DashboardHeader";
import DashboardNavTabs from "../components/Dashboard/NavTabs/DashboardNavTabs";
import UsersPanel from "../components/Dashboard/UsersPanel/UsersPanel";


import styles from "./HomePageDashboard.module.css";
import { useState } from "react";

export default function HomePageDashboard() {
  const [activeTab, setActiveTab] = useState("usuarios");

  return (
    <div className={styles.container}>
      <DashboardHeader />

      <DashboardNavTabs active={activeTab} onChange={setActiveTab} />

      {<div className={styles.content}>
        {activeTab === "usuarios" && <UsersPanel />}
        {/* {activeTab === "general" && <SummaryCards />}
        {activeTab === "dispositivos" && <DevicesPanel />}
        {activeTab === "reportes" && <ReportsPanel />} */}
      </div> }
    </div>
  );
}
