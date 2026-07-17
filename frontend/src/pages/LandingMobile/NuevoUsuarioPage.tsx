import { useNavigate } from "react-router-dom";
import UserForm from "../../components/UserForm/UserForm";


import styles from "./NuevoUsuarioPage.module.css";

export default function NuevoUsuarioPage() {
  const navigate = useNavigate();



  return (
    <main className={styles.container}>

      <UserForm
        variant="mobile"
        onClose={() => navigate("/login")}
      />

    </main>
  );
}
