import { useEffect, useState } from "react";

/* Este hook verifica el tamaño de la ventana del navegador. 
   Determina si es de escritorio según un punto de quiebre dado (por defecto 768px). 
   Devuelve un valor booleano que indica si la ventana es de escritorio o no. 
*/

export function useIsDesktop(breakpoint: number = 768) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= breakpoint);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isDesktop;
}
