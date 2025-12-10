import { useEffect } from "react";
import { resolveRouteOrDefault } from "../routes";

export function useUrlSync(activePage: string, setActivePage: (page: string) => void) {
  // Sincronização inicial com a URL (deep link)
  useEffect(() => {
    const path = window.location.pathname.replace(/^\/+/, "");
    const resolved = resolveRouteOrDefault(path || "dashboard-principal");
    if (resolved !== activePage) {
      setActivePage(resolved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Responde ao botão voltar/avançar do navegador
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+/, "");
      const resolved = resolveRouteOrDefault(path || "dashboard-principal");
      setActivePage(resolved);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setActivePage]);

  // Atualiza a URL quando o estado muda
  useEffect(() => {
    const currentPath = window.location.pathname.replace(/^\/+/, "") || "dashboard-principal";
    if (currentPath !== activePage) {
      const url = activePage === "dashboard-principal" ? "/" : `/${activePage}`;
      window.history.pushState(null, "", url);
    }
  }, [activePage]);
}

