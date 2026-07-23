import { useNavigate, useParams } from "react-router-dom";
import BebederoCard from "../../components/BebederoCard/BebederoCard";
import Button from "../../components/Button/Button";
import EmptyState from "../../components/EmptyState/EmptyState";
import { useAuth } from "../../context/useAuth";
import useEstablecimientoBebederos from "../../hooks/useEstablecimientoBebederos";
import styles from "./LandingBebederos.module.css";
import LandingHeader from "./LandingHeader";
import LandingMobileLayout from "./LandingMobileLayout";
import LandingPageStatus from "./LandingPageStatus";


export default function LandingBebederos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = user?.role ?? user?.rol;
  const { establecimientoNombre, bebederos, loading, error } =
    useEstablecimientoBebederos(id);

  function handleBack() {
    const destination =
      role === "cliente"
        ? "/cliente/establecimientos"
        : "/veterinarios/clientes";

    navigate(destination);
  }

  function handleShowSummary() {
    navigate(`/establecimiento/${id}/resumen`);
  }

  return (
    <LandingMobileLayout>
      <LandingPageStatus loading={loading} error={error} loadingMessage="Cargando dispositivos..." />

      {!loading && !error && establecimientoNombre && (
        <>
          <LandingHeader
            title={establecimientoNombre}
            onBack={handleBack}
            rightAction={
              <Button
                label="Resumen"
                variant="dashboard"
                fullWidth={false}
                onClick={handleShowSummary}
              />
            }
          />

          <div className={styles.bebederosList}>
            {bebederos.length === 0 ? (
              <EmptyState message="Este establecimiento no tiene bebederos asociados." />
            ) : (
              bebederos.map((bebedero) => (
                <div key={bebedero.id} className={styles.cardWrapper}>
                  <BebederoCard bebedero={bebedero} />
                </div>
              ))
            )}
          </div>
        </>
      )}
    </LandingMobileLayout>
  );
}
