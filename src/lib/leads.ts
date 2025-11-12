export type LeadStatus =
  | "novo"
  | "qualificado"
  | "em-negociacao"
  | "conquistado"
  | "perdido";

export interface Lead {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  status: LeadStatus;
  valorPotencial: number;
  score: number;
  origem: string;
  criadoEm: string;
  ultimaAtividade: string;
  proximaAcao: string;
  notas: string[];
}

const leads: Lead[] = [
  {
    id: "lead-98124",
    nome: "Isadora Martins",
    empresa: "Quantum Logistics",
    email: "isadora.martins@quantumlog.com",
    telefone: "+55 11 99999-1020",
    status: "qualificado",
    valorPotencial: 185000,
    score: 92,
    origem: "Inbound - Webinar IA",
    criadoEm: "2025-03-18T13:45:00.000Z",
    ultimaAtividade: "2025-04-02T16:35:00.000Z",
    proximaAcao: "Demonstração executiva agendada para 05/04 às 10h",
    notas: [
      "Equipe de inovação busca plataforma única para automações e CRM.",
      "Solicitar estudo de ROI customizado com dados logísticos.",
      "Interessada na trilha de ativação com IA de atendimento."
    ]
  },
  {
    id: "lead-88217",
    nome: "Thiago Azevedo",
    empresa: "Nova Aurora Energia",
    email: "thiago.azevedo@novaaurora.com",
    telefone: "+55 31 98888-4411",
    status: "em-negociacao",
    valorPotencial: 247000,
    score: 88,
    origem: "Outbound Account Based",
    criadoEm: "2025-02-06T11:20:00.000Z",
    ultimaAtividade: "2025-04-01T14:15:00.000Z",
    proximaAcao: "Revisar proposta com diretoria financeira",
    notas: [
      "Equipe comercial quer unificar funil B2B e B2C.",
      "Necessidade de monitoramento CSP rígido para central energética.",
      "Solicitar integração com ERP Orion Cloud."
    ]
  },
  {
    id: "lead-77503",
    nome: "Laura Nascimento",
    empresa: "Atlas Retail Group",
    email: "laura.nascimento@atlasretail.co",
    telefone: "+55 21 97777-5522",
    status: "novo",
    valorPotencial: 96000,
    score: 76,
    origem: "Parceria - Evento Tech Retail",
    criadoEm: "2025-03-27T09:05:00.000Z",
    ultimaAtividade: "2025-03-30T19:40:00.000Z",
    proximaAcao: "Enviar blueprint de onboarding omnichannel",
    notas: [
      "Precisa de suporte multilíngue para franquias LATAM.",
      "Marketing quer automação de campanhas por segmento.",
      "Deseja ativar Post-Sales Hub com SLA em 4h."
    ]
  },
  {
    id: "lead-66418",
    nome: "Eduardo Ramos",
    empresa: "Helios Aerospace",
    email: "eduardo.ramos@helios.aero",
    telefone: "+55 41 96666-7733",
    status: "conquistado",
    valorPotencial: 312000,
    score: 95,
    origem: "Referral - Programa Sparta",
    criadoEm: "2025-01-15T10:10:00.000Z",
    ultimaAtividade: "2025-03-22T08:55:00.000Z",
    proximaAcao: "Kickoff do programa de expansão internacional",
    notas: [
      "Time de operações já integrado ao Supabase realtime.",
      "Ativar módulo de IA Copiloto para engenharia de campo.",
      "Solicitou trilha de gamificação para squads técnicos."
    ]
  },
  {
    id: "lead-55992",
    nome: "Camila Teixeira",
    empresa: "Pulse Healthtech",
    email: "camila.teixeira@pulsehealth.io",
    telefone: "+55 19 95555-8844",
    status: "perdido",
    valorPotencial: 72000,
    score: 64,
    origem: "Inbound - Landing Page",
    criadoEm: "2025-02-22T15:30:00.000Z",
    ultimaAtividade: "2025-03-18T12:05:00.000Z",
    proximaAcao: "Registrar lições aprendidas com time médico",
    notas: [
      "Preferiu solução concorrente por tempo de implementação.",
      "Feedback positivo sobre jornadas educativas.",
      "Solicitou contato futuro para módulo de telemedicina."
    ]
  }
];

export function getLeads(): Lead[] {
  return leads;
}

export function getLeadById(id: string): Lead | undefined {
  return leads.find((lead) => lead.id === id);
}
