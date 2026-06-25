import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import HomePageDesktop from "./pages/HomePageDesktop";
import HomePageMobil from "./pages/HomePageMobil";
import HomePageDashboard from "./pages/HomePageDashboard";

import PublicLayout from "./layouts/PublicLayout";
import PrivateLayout from "./layouts/PrivateLayout";

import SmartHomeRedirect from "./components/SmartHomeRedirect";

import LandingPageEstablecimiento from "./pages/LandingPageEstablecimiento";
import BebederosPanel from "./components/Dashboard/BebederosPanel/BebederosPanel";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* RUTAS PÚBLICAS */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<SmartHomeRedirect />} />
            <Route path="/home-desktop" element={<HomePageDesktop />} />
            <Route path="/home-mobile" element={<HomePageMobil />} />
          </Route>

          {/* RUTAS PRIVADAS */}
          <Route
            element={
              <ProtectedRoute>
                <PrivateLayout />
              </ProtectedRoute>
            }
          >
            {/* Pantalla principal después del login */}
            <Route path="/" element={<SmartHomeRedirect />} />

            {/* Pantalla de establecimiento */}
            <Route path="/establecimiento/:id" element={<LandingPageEstablecimiento />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<HomePageDashboard />} />

            {/* Bebederos */}
            <Route path="/bebederos" element={<BebederosPanel />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
