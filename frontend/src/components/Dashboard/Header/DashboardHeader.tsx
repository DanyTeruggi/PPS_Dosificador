import styles from "./DashboardHeader.module.css";

export default function DashboardHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.userInfo}>
        
            <div className={styles.avatar}>AG</div>
            <p className={styles.role}>Admin General</p>
      </div>
          
        <p className={styles.title}>Panel de Control</p>

      
    </header>
  );
}
