import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatePath = path.resolve(__dirname, 'dashboard.html');
const outputBase = path.resolve(__dirname, 'pages');

const startToken = '<!-- PAGE_CONTENT_START -->';
const endToken = '<!-- PAGE_CONTENT_END -->';

if (!fs.existsSync(templatePath)) {
  throw new Error('dashboard.html não encontrado para servir como template.');
}

const template = fs.readFileSync(templatePath, 'utf8');
if (!template.includes(startToken) || !template.includes(endToken)) {
  throw new Error('Template principal não possui marcadores PAGE_CONTENT_START / PAGE_CONTENT_END.');
}

const [beforeContent, afterStart] = template.split(startToken);
const [, afterContent] = afterStart.split(endToken);

const catalog = [
  {
    category: 'Vendas & CRM',
    description: 'a performance comercial, ciclo de relacionamento e expansão de carteira',
    titles: [
      'Leads Diário',
      'Leads por Origem',
      'Oportunidades em Aberto',
      'Taxa de Conversão do Funil',
      'Previsão de Receita',
      'Crescimento de Contas',
      'Renovações em Andamento',
      'Carteira Enterprise',
      'Upsell Prioritário',
      'Follow-ups Atrasados'
    ]
  },
  {
    category: 'Marketing & Growth',
    description: 'a geração de demanda, campanhas multicanal e engajamento de audiência',
    titles: [
      'Visão Geral de Campanhas',
      'ROI por Canal',
      'Audiência em Tempo Real',
      'Pipeline de Conteúdo',
      'Influenciadores Estratégicos',
      'Mídia Paga',
      'SEO & Orgânico',
      'Eventos e Webinars',
      'Landing Pages',
      'Parcerias e Co-marketing'
    ]
  },
  {
    category: 'Suporte & Sucesso do Cliente',
    description: 'o atendimento, SLAs, satisfação do cliente e jornadas de sucesso',
    titles: [
      'Health Score da Base',
      'SLA de Atendimento',
      'Backlog de Tickets',
      'Onboarding em Progresso',
      'Playbooks Ativos',
      'Canais Omnichannel',
      'Base de Conhecimento',
      'Adoção de Recursos',
      'Feedbacks de Clientes',
      'Planos de Ação CS'
    ]
  },
  {
    category: 'Operações & Projetos',
    description: 'a entrega de projetos estratégicos, squads e eficiência operacional',
    titles: [
      'Roadmap Operacional',
      'Projetos Críticos',
      'Capacidade dos Squads',
      'Backlog Kanban',
      'OKRs Trimestrais',
      'Riscos Monitorados',
      'Implantações em Curso',
      'Sustentação Técnica',
      'Compliance Operacional',
      'Controle de Custos'
    ]
  },
  {
    category: 'Financeiro & Revenue Ops',
    description: 'a saúde financeira, previsões e governança de receitas',
    titles: [
      'Resumo Financeiro',
      'Fluxo de Caixa',
      'MRR & ARR',
      'Recebíveis em Aberto',
      'Faturamento por Segmento',
      'Análise de Margem',
      'Forecast Financeiro',
      'Inadimplência',
      'Indicadores de Lucro',
      'DRE Sintético'
    ]
  },
  {
    category: 'Produtos & Roadmap',
    description: 'a evolução do produto, lançamentos e análise de uso das features',
    titles: [
      'Visão do Roadmap',
      'Feedbacks de Produto',
      'Uso de Funcionalidades',
      'Solicitações de Clientes',
      'Performance da Squad Produto',
      'Backlog de Features',
      'Experimentos em Andamento',
      'Lançamentos Recentes',
      'Métricas de Retenção',
      'Planos Beta'
    ]
  },
  {
    category: 'Dados & Analytics',
    description: 'os modelos analíticos, governança de dados e relatórios executivos',
    titles: [
      'Painel de Indicadores',
      'Modelos Preditivos',
      'Qualidade de Dados',
      'Alertas Automatizados',
      'Visualizações Estratégicas',
      'Integrações de Dados',
      'Governança BI',
      'Cubo de Receitas',
      'Métricas Operacionais',
      'Auditoria de Dados'
    ]
  },
  {
    category: 'Inteligência Artificial & Automação',
    description: 'as iniciativas com IA, automações avançadas e copilotos de produtividade',
    titles: [
      'Assistente Comercial IA',
      'Automações de Marketing',
      'Chatbots Omnichannel',
      'Modelos de Previsão',
      'Roteamento Inteligente',
      'Análise de Sentimento',
      'Automação de Workflows',
      'Monitoramento com IA',
      'Laboratório de Algoritmos',
      'Playbooks Autônomos'
    ]
  },
  {
    category: 'Segurança & Compliance',
    description: 'a governança, auditoria contínua e proteção de dados sensíveis',
    titles: [
      'Centro de Segurança',
      'Alertas de Incidentes',
      'Auditoria Contínua',
      'Políticas de Acesso',
      'Conformidade LGPD',
      'Gestão de Riscos',
      'Status de Certificações',
      'Planos de Continuidade',
      'Inventário de Ativos',
      'Controles de Infraestrutura'
    ]
  },
  {
    category: 'Pessoas & Cultura',
    description: 'o engajamento do time, desenvolvimento e indicadores de RH',
    titles: [
      'People Analytics',
      'Contratações em Curso',
      'Plano de Capacitação',
      'Mapa de Talentos',
      'Engajamento do Time',
      'Diversidade & Inclusão',
      'Clima Organizacional',
      'Metas Individuais',
      'Reconhecimento & Recompensas',
      'Plano de Sucessão'
    ]
  }
];

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function formatNumber(value) {
  return value.toLocaleString('pt-BR');
}

function buildMetrics(pageTitle, index) {
  const base = index + 1;
  return [
    { label: `${pageTitle} ativos`, value: formatNumber(20 + base * 3) },
    { label: 'Meta atingida', value: `${65 + (base % 25)}%` },
    { label: 'Impacto financeiro', value: `R$ ${formatNumber(48000 + base * 1250)}` },
    { label: 'Tendência semanal', value: `${base % 2 === 0 ? '+' : '-'}${12 + (base % 9)}%` }
  ];
}

function buildContent({ title, summary, insights }, index) {
  const metrics = buildMetrics(title, index);
  const metricCards = metrics
    .map(
      (metric) => `      <article class="kpi-card">
        <span>${metric.label}</span>
        <strong>${metric.value}</strong>
        <p>Dados consolidados nas últimas 24h</p>
      </article>`
    )
    .join('\n');

  const insightsList = insights
    .map((item) => `<li>${item}</li>`)
    .join('\n          ');

  return `    <section class="kpi-grid" aria-label="Indicadores para ${title}">
${metricCards}
    </section>

    <section class="content-columns">
      <article class="panel">
        <h2>${title}</h2>
        <p>${summary}</p>
      </article>
      <article class="panel">
        <h2>Insights principais</h2>
        <ul>
          ${insightsList}
        </ul>
      </article>
      <article class="panel">
        <h2>Próximas ações sugeridas</h2>
        <ul>
          <li>Priorizar iniciativas com maior impacto em receita.</li>
          <li>Compartilhar aprendizados com as squads responsáveis.</li>
          <li>Configurar alertas automáticos para desvios relevantes.</li>
        </ul>
      </article>
    </section>`;
}

const pages = [];

catalog.forEach(({ category, description, titles }) => {
  titles.forEach((title) => {
    pages.push({
      category,
      title,
      summary: `${title} monitora ${description}.`,
      insights: [
        `Evolução dos KPIs vinculados ao módulo ${category}.`,
        `Segmentação personalizada para ${title.toLowerCase()}.`,
        `Recomendações do time de inteligência para o próximo ciclo.`
      ]
    });
  });
});

const selectedPages = pages.slice(0, 97);

selectedPages.forEach((page, index) => {
  const htmlContent = buildContent(page, index);
  const finalHtml = [
    beforeContent,
    startToken,
    '\n',
    htmlContent,
    '\n    ',
    endToken,
    afterContent
  ].join('');

  const dirName = slugify(page.category.replace(/ & /g, ' '));
  const dirPath = path.join(outputBase, dirName);
  fs.mkdirSync(dirPath, { recursive: true });

  const fileName = `${slugify(page.title)}.html`;
  const filePath = path.join(dirPath, fileName);
  fs.writeFileSync(filePath, finalHtml, 'utf8');
});

console.log(`✅ Páginas geradas: ${selectedPages.length}`);
