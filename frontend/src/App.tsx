import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import PublicLayout from "./layouts/PublicLayout";
import PrivateLayout from "./layouts/PrivateLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingSelector from "./pages/LandingSelector";

import SmartHomeRedirect from "./components/SmartHomeRedirect";
import HomePageDesktop from "./pages/HomePageDesktop";

import HomePageDashboard from "./pages/HomePageDashboard";
import BebederosPanel from "./components/Dashboard/BebederosPanel/BebederosPanel";
import NuevoUsuarioPage from "./pages/NuevoUsuarioPage";

import LandingBebederos from "./pages/LandingMobile/LandingBebederos";
import LandingClientes from "./pages/LandingMobile/LandingClientes";
import LandingEstablecimientos from "./pages/LandingMobile/LandingEstablecimientos";
import LoginPage from "./pages/LandingMobile/LoginPage";
import LandingResumen from "./pages/LandingMobile/LandingResumen";
import WelcomePage from "./pages/LandingMobile/WelcomePage";

import { Toaster } from "react-hot-toast";

export default function App() {
  

  return (
    <>
      <Toaster position="top-center" />
      <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* RUTAS PÚBLICAS */}

          <Route element={<PublicLayout />}>
            {/* Landing pública */}
            <Route path="/" element={<LandingSelector />} />


            {/* Nuevo login mobile. */}
            <Route path="/login" element={<LoginPage />} />

            {/* Ruta que decide home según rol */}
            <Route path="/home" element={<SmartHomeRedirect />} />

            {/* Ruta para nuevo usuario */}
            <Route path="/nuevo-usuario" element={<NuevoUsuarioPage />} />


            {/* Home desktop y mobile (decididos por LandingSelector) */}
            <Route path="/home-desktop" element={<HomePageDesktop />} />

         

            <Route path="/home-mobile" element={<WelcomePage />} />
          
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
    
            <Route path="/veterinarios/clientes" element={<LandingClientes />} />
            <Route path="/cliente/establecimientos" element={<LandingEstablecimientos />} />
            <Route path="/establecimiento/:id/bebederos" element={<LandingBebederos />} />
            <Route path="/establecimiento/:id/resumen" element={<LandingResumen />} />

          </Route>

        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </>
  );
}
