import styles from "./UsersPanel.module.css";
import usuariosData from "../../../../public/mock/usuarios.json";

export default function UsersPanel() {
  return (
    <div className={styles.container}>
      
      {/* BUSCADOR */}
      <div className={styles.searchRow}>
        <input
          type="text"
          placeholder="Buscar por nombre o email…"
          className={styles.searchInput}
        />

        <div className={styles.filters}>
          <button className={styles.filterBtn}>Todos</button>
          <button className={styles.filterBtn}>Veterinarios</button>
          <button className={styles.filterBtn}>Clientes</button>
          <button className={styles.newUserBtn}>+ Nuevo usuario</button>
        </div>
      </div>

      {/* TABLA */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Username</th>
            <th>Rol</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {usuariosData.map((u, index) => (
            <tr key={index}>
              <td>
                <strong>{u.nombre}</strong>
                
              </td>
              <td>
                {u.userName}
              </td>
              
              <td>{u.rol}</td>

              <td>
                <label className={styles.switch}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.slider}></span>
                </label>
              </td>

              <td>
                <button className={styles.editBtn}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
