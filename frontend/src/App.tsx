import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import PublicLayout from "./layouts/PublicLayout";
import PrivateLayout from "./layouts/PrivateLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingSelector from "./pages/LandingSelector";
import LoginPage from "./pages/LoginPage";

import SmartHomeRedirect from "./components/SmartHomeRedirect";
import HomePageDesktop from "./pages/HomePageDesktop";
import HomePageMobile from "./pages/HomePageMobil";

import HomePageDashboard from "./pages/HomePageDashboard";
import BebederosPanel from "./components/Dashboard/BebederosPanel/BebederosPanel";
import LandingPageEstablecimiento from "./pages/LandingPageEstablecimiento";
import NuevoUsuarioPage from "./pages/NuevoUsuarioPage";
import LandingBebederosMobile from "./pages/LandingBebederosMobile";

export default function App() {
  console.log("App.tsx REAL cargado");

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* RUTAS PÚBLICAS */}

          <Route element={<PublicLayout />}>
            {/* Landing pública */}
            <Route path="/" element={<LandingSelector />} />

            {/* Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Ruta que decide home según rol */}
            <Route path="/home" element={<SmartHomeRedirect />} />

            {/* Ruta para nuevo usuario */}
            <Route path="/nuevo-usuario" element={<NuevoUsuarioPage />} />


            {/* Home desktop y mobile (decididos por LandingSelector) */}
            <Route path="/home-desktop" element={<HomePageDesktop />} />
            <Route path="/home-mobile" element={<HomePageMobile />} />
          </Route>

          {/* RUTAS PRIVADAS */}
          <Route
            element={
              <ProtectedRoute>
                <PrivateLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<HomePageDashboard />} />
            <Route path="/dashboard/dispositivos" element={<HomePageDashboard />} />
            <Route path="/dashboard/dispositivos/nuevo" element={<HomePageDashboard />} />
            <Route path="/bebederos" element={<BebederosPanel />} />
            
            <Route path="/cliente/establecimientos" element={<LandingPageEstablecimiento />} />
            <Route path="/establecimiento/:id/bebederos" element={<LandingBebederosMobile />} />

          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
