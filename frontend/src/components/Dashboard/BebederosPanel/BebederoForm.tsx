import { useState } from "react";
import styles from "./BebederosPanel.module.css";
import type { Bebedero } from "../../../types/Bebedero";

interface Props {
  bebedero: Bebedero;
  onSave: (b: Bebedero) => void;
}

export default function BebederoForm({ bebedero, onSave }: Props) {
  const [form, setForm] = useState<Bebedero>(bebedero);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    const numericFields = [
      "largo",
      "ancho",
      "profundidad",
      "coberturaMinima",
      "tiempoDosis",
      "watertank",
      "ultrasound"
    ];

    setForm({
      ...form,
      [name]: numericFields.includes(name) ? Number(value) : value
    });
  }

  const campos = [
    "nombre",
    "ubicacion",
    "establecimiento",
    "veterinario",
    "productor",
    "largo",
    "ancho",
    "profundidad",
    "coberturaMinima",
    "tiempoDosis",
    "watertank",
    "ultrasound"
  ];

  return (
    <div className={styles.form}>
      <h2 className={styles.title}>Editar Bebedero</h2>

      {/* ID solo lectura */}
      <div className={styles.group}>
        <label className={styles.label}>ID</label>
        <input className={styles.input} value={form.id} readOnly />
      </div>

      {/* Campos editables */}
      {campos.map((campo) => (
        <div className={styles.group} key={campo}>
          <label className={styles.label}>{campo}</label>
          <input
            name={campo}
            className={styles.input}
            value={String(form[campo as keyof Bebedero])}
            onChange={handleChange}
          />
        </div>
      ))}

      <button className={styles.saveBtn} onClick={() => onSave(form)}>
        Guardar
      </button>
    </div>
  );
}
