import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import HomePageDesktop from "./pages/HomePageDesktop";
import HomePageMobil from "./pages/HomePageMobil";

import PublicLayout from "./layouts/PublicLayout";
import PrivateLayout from "./layouts/PrivateLayout";

import SmartHomeRedirect from "./components/SmartHomeRedirect";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* RUTAS PÚBLICAS */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />

          {/* Redirección según tamaño */}
          <Route path="/home" element={<SmartHomeRedirect />} />

          {/* Vistas específicas */}
          <Route path="/home-desktop" element={<HomePageDesktop />} />
          <Route path="/home-mobile" element={<HomePageMobil />} />
        </Route>

        {/* RUTAS PRIVADAS */}
        <Route element={<PrivateLayout />}>
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
