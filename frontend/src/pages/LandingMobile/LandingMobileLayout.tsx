import type { ReactNode } from "react";

import Footer from "../../components/Footer/Footer";
import HeaderMobile from "../../components/Header/HeaderMobile";
import styles from "./LandingMobile.module.css";

type LandingMobileLayoutProps = {
  children: ReactNode;
};

/**
 * Estructura comun de las paginas LandingMobile.
 * Recibe como children el contenido particular de cada pagina.
 */
export default function LandingMobileLayout({ children }: LandingMobileLayoutProps) {
  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <HeaderMobile />
        {children}
      </main>

      <Footer />
    </div>
  );
}
