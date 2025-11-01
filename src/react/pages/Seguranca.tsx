import GuardianSentinel from "../components/GuardianSentinel";
import AuditCard from "../components/AuditCard";

export default function Seguranca() {
  const politicas = [
    { policy: "RLS: leads_crm", status: "OK", details: "Acesso restrito por org_id" },
    { policy: "RLS: sales_pipeline", status: "OK", details: "Acesso restrito por usuário" },
    { policy: "RLS: registros_financeiros", status: "Warning", details: "Verificar relação inversa org_id" },
    { policy: "CSP: vercel.json", status: "OK", details: "Cabeçalhos atualizados e validados" },
    { policy: "Webhooks: Make/N8N", status: "Critical", details: "Requer assinatura HMAC" },
  ];

  return (
    <div className="min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">🔐 Harmonização & Segurança Suprema</h2>
      <GuardianSentinel />
      <h3 className="text-lg font-semibold mt-8 mb-4 text-emerald-400">📜 Políticas de Acesso e Integridade</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {politicas.map((p, i) => (
          <AuditCard key={i} {...p} delay={i * 0.2} />
        ))}
      </div>
    </div>
  );
}
