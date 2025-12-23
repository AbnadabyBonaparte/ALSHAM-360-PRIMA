// src/routes/nav.ts
import { PAGES } from "./manifest";

export type PageStatus = "implemented" | "placeholder" | "planned";

export interface SidebarLink {
  id: string;
  label: string;
  status?: PageStatus;
  badge?: string | number;
  description?: string;
  children?: SidebarLink[];
  roles?: string[];
  hidden?: boolean;
}

export interface SidebarCategory {
  id: string;
  label: string;
  icon?: string;
  accentColor?: string;
  links: SidebarLink[];
  defaultCollapsed?: boolean;
  description?: string;
  badge?: string | number;
}

export function buildSidebarStructure(): SidebarCategory[] {
  const navPages = PAGES.filter((p) => p.nav && !p.nav.hidden);

  const byCat = new Map<string, SidebarCategory>();

  for (const p of navPages) {
    const nav = p.nav!;
    const catKey = nav.categoryId;

    if (!byCat.has(catKey)) {
      byCat.set(catKey, {
        id: nav.categoryId,
        label: nav.categoryLabel,
        links: [],
      });
    }

    byCat.get(catKey)!.links.push({
      id: p.id === "customer-360-detail" ? "customer-360" : p.id, // nunca expor detail na sidebar
      label: nav.label,
      status: "implemented",
    });
  }

  // ordenar links
  for (const cat of byCat.values()) {
    cat.links = cat.links
      .sort((a, b) => {
        const pa = PAGES.find((p) => p.id === a.id)?.nav?.order ?? 9999;
        const pb = PAGES.find((p) => p.id === b.id)?.nav?.order ?? 9999;
        return pa - pb;
      });
  }

  return Array.from(byCat.values());
}
