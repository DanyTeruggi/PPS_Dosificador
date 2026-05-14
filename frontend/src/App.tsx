import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import HomePageDesktop from "./pages/HomePageDesktop";
import HomePageMobil from "./pages/HomePageMobil";
import HomePageDashboard from "./pages/HomePageDashboard";

import PublicLayout from "./layouts/PublicLayout";
import PrivateLayout from "./layouts/PrivateLayout";

import SmartHomeRedirect from "./components/SmartHomeRedirect";
import RoleLanding from "./components/RoleLanding/RoleLanding"
import LandingPageEstablecimiento from "./pages/LandingPageEstablecimiento";
import BebederosPanel from "./components/Dashboard/BebederosPanel/BebederosPanel";


export default function App() {
  return (
    <BrowserRouter>
  <Routes>

    {/* RUTAS PÚBLICAS */}
    <Route element={<PublicLayout />}>

      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Redirección según tamaño */}
      <Route path="/home" element={<SmartHomeRedirect />} />

      {/* Vistas específicas */}
      <Route path="/home-desktop" element={<HomePageDesktop />} />
      <Route path="/home-mobile" element={<HomePageMobil />} />

      {/* RoleLanding: pantalla después del login */}
      <Route path="/role-landing" element={<RoleLanding />} />
      <Route path="/establecimiento" element={<LandingPageEstablecimiento />} />

    </Route>

    {/* RUTAS PRIVADAS */}
    <Route element={<PrivateLayout />}>
      <Route path="/dashboard" element={<HomePageDashboard />} />
      <Route path="/bebederos" element={<BebederosPanel />} />
    </Route>

  </Routes>
</BrowserRouter>

  );
}
