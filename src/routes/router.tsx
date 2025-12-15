// src/routes/router.tsx
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PAGES } from "./manifest";
import { useAuthStore } from "@/lib/supabase/useAuthStore";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProtectedLayout } from "@/components/ProtectedLayout";

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <LoadingSpinner size="lg" />
    </div>
  );
}

function elementOf(def: (typeof PAGES)[number]) {
  const Comp = def.element;
  return (
    <Suspense fallback={<PageLoader />}>
      <Comp />
    </Suspense>
  );
}

export function AppRouter() {
  const user = useAuthStore((s) => s.user);
  const currentOrgId = useAuthStore((s) => s.currentOrgId);
  const currentOrg = useAuthStore((s) => s.currentOrg);
  const hasOrg = !!(currentOrgId && currentOrg);

  const publicPages = PAGES.filter((p) => p.gate.auth === "public");
  const privatePages = PAGES.filter((p) => p.gate.auth === "private");

  return (
    <Routes>
      {/* Public */}
      {publicPages.map((p) => (
        <Route key={p.id} path={p.path} element={elementOf(p)} />
      ))}

      {/* Protected shell */}
      <Route element={<ProtectedLayout />}>
        {privatePages.map((p) => (
          <Route
            key={p.id}
            path={p.path}
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : p.gate.org === "required" && !hasOrg ? (
                <Navigate to="/select-organization" replace />
              ) : (
                elementOf(p)
              )
            }
          />
        ))}

        {/* Root */}
        <Route path="/" element={<Navigate to={user ? (hasOrg ? "/dashboard" : "/select-organization") : "/login"} replace />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to={user ? (hasOrg ? "/dashboard" : "/select-organization") : "/login"} replace />} />
    </Routes>
  );
}
