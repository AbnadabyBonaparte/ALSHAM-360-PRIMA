import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

/**
 * Gate de pré-condições.
 * Se algum módulo/guard mandar para /precondition/BK_LOGIN, aqui você decide o destino correto.
 */
export default function PreconditionGate() {
  const nav = useNavigate();
  const { code } = useParams<{ code: string }>();

  useEffect(() => {
    const c = (code || "").toUpperCase();

    // Mapeamento mínimo para não travar o app
    if (c === "BK_LOGIN") {
      nav("/login", { replace: true });
      return;
    }

    // Se aparecerem outros códigos, redirecione para uma página segura
    nav("/login", { replace: true });
  }, [code, nav]);

  return null;
}
