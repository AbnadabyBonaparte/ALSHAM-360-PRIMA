// src/routes/manifest.ts
import React from "react";

export type Gate = {
  auth: "public" | "private";
  org: "required" | "optional" | "none";
};

export type NavMeta = {
  categoryId: string;
  categoryLabel: string;
  label: string;
  order: number;
  icon?: string; // nome do ícone (string) ou key para map
  hidden?: boolean;
  premium?: boolean;
};

export type PageDef = {
  id: string;         // imutável
  path: string;       // canônico
  gate: Gate;
  nav?: NavMeta;      // se aparecer na sidebar
  element: React.LazyExoticComponent<() => JSX.Element>;
};

// helper
const lazyPage = (importer: () => Promise<{ default: any }>) => React.lazy(importer);

export const PAGES: PageDef[] = [
  // Auth
  {
    id: "login",
    path: "/login",
    gate: { auth: "public", org: "none" },
    element: lazyPage(() => import("@/pages/auth/Login")),
  },
  {
    id: "signup",
    path: "/signup",
    gate: { auth: "public", org: "none" },
    element: lazyPage(() => import("@/pages/auth/SignUp")),
  },
  {
    id: "forgot-password",
    path: "/forgot-password",
    gate: { auth: "public", org: "none" },
    element: lazyPage(() => import("@/pages/auth/ForgotPassword")),
  },
  {
    id: "reset-password",
    path: "/auth/reset-password",
    gate: { auth: "public", org: "none" },
    element: lazyPage(() => import("@/pages/auth/ResetPassword")),
  },

  // App shell (private + org)
  {
    id: "dashboard",
    path: "/dashboard",
    gate: { auth: "private", org: "required" },
    nav: { categoryId: "crm-core", categoryLabel: "CRM Core", label: "Dashboard Principal", order: 1, icon: "LayoutDashboard" },
    element: lazyPage(() => import("@/pages/Dashboard")),
  },

  // Customer 360 hub
  {
    id: "customer-360",
    path: "/customer-360",
    gate: { auth: "private", org: "required" },
    nav: { categoryId: "crm-core", categoryLabel: "CRM Core", label: "Customer 360", order: 2, icon: "Users" },
    element: lazyPage(() => import("@/pages/Customer360Hub")),
  },

  // Customer 360 detail
  {
    id: "customer-360-detail",
    path: "/customer-360/:id",
    gate: { auth: "private", org: "required" },
    nav: { categoryId: "crm-core", categoryLabel: "CRM Core", label: "Customer 360 (Lead)", order: 9999, hidden: true },
    element: lazyPage(() => import("@/pages/Customer360")),
  },
];
