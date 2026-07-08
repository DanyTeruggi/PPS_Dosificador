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
import LandingPageClientes from "./pages/LandingPageClientes";
import NuevoUsuarioPage from "./pages/NuevoUsuarioPage";
import LandingBebederosMobile from "./pages/LandingBebederosMobile";
import LandingResumenEstablecimientoMobile from "./pages/LandingResumenEstablecimientoMobile";

export default function App() {
  

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
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <HomePageDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/dispositivos"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <HomePageDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/dispositivos/nuevo"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <HomePageDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route path="/bebederos" element={<BebederosPanel />} />

            <Route path="/veterinarios/clientes" element={<LandingPageClientes />} />
            
            <Route path="/cliente/establecimientos" element={<LandingPageEstablecimiento />} />
            
            <Route path="/establecimiento/:id/bebederos" element={<LandingBebederosMobile />} />
            <Route path="/establecimiento/:id/resumen" element={<LandingResumenEstablecimientoMobile />} />

          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
