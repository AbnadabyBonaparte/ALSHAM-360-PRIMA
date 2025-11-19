import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orgId: string;
  userId: string;
}

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  empresa: string;
  cargo: string;
  website: string;
  linkedin_lead: string;
  linkedin_empresa: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  pais: string;
  cnpj: string;
  tamanho_empresa: string;
  receita_anual: string;
  setor: string;
  status: string;
  temperatura: string;
  prioridade: string;
  origem: string;
  campanha: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  valor_estimado: string;
  owner_id: string;
  tags: string;
  observacoes: string;
  consentimento: boolean;
}

const INITIAL_FORM_DATA: FormData = {
  nome: '',
  email: '',
  telefone: '',
  whatsapp: '',
  empresa: '',
  cargo: '',
  website: '',
  linkedin_lead: '',
  linkedin_empresa: '',
  endereco: '',
  cidade: '',
  estado: '',
  cep: '',
  pais: 'Brasil',
  cnpj: '',
  tamanho_empresa: '',
  receita_anual: '',
  setor: '',
  status: 'novo',
  temperatura: 'morno',
  prioridade: 'média',
  origem: 'website',
  campanha: '',
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  valor_estimado: '',
  owner_id: '',
  tags: '',
  observacoes: '',
  consentimento: false,
};

const STATUS_OPTIONS = [
  { value: 'novo', label: 'Novo' },
  { value: 'contatado', label: 'Contatado' },
  { value: 'qualificado', label: 'Qualificado' },
  { value: 'proposta', label: 'Proposta Enviada' },
  { value: 'negociacao', label: 'Em Negociação' },
  { value: 'ganho', label: 'Ganho' },
  { value: 'perdido', label: 'Perdido' },
];

const TEMPERATURA_OPTIONS = [
  { value: 'frio', label: '❄️ Frio', color: 'text-blue-600' },
  { value: 'morno', label: '🌡️ Morno', color: 'text-yellow-600' },
  { value: 'quente', label: '🔥 Quente', color: 'text-orange-600' },
  { value: 'muito_quente', label: '🔥🔥 Muito Quente', color: 'text-red-600' },
];

const PRIORIDADE_OPTIONS = [
  { value: 'baixa', label: 'Baixa', color: 'text-gray-600' },
  { value: 'média', label: 'Média', color: 'text-blue-600' },
  { value: 'alta', label: 'Alta', color: 'text-orange-600' },
  { value: 'urgente', label: 'Urgente', color: 'text-red-600' },
];

const ORIGEM_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'evento', label: 'Evento' },
  { value: 'email_marketing', label: 'Email Marketing' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'outro', label: 'Outro' },
];

const SETOR_OPTIONS = [
  'Tecnologia',
  'Varejo',
  'Serviços',
  'Indústria',
  'Saúde',
  'Educação',
  'Finanças',
  'Imobiliário',
  'Alimentos',
  'Construção',
  'Marketing',
  'Consultoria',
  'Outro',
];

const CreateLeadModal: React.FC<CreateLeadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  orgId,
  userId,
}) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...INITIAL_FORM_DATA, owner_id: userId });
      setErrors({});
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen, userId]);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s()-]{10,}$/;
    return phoneRegex.test(phone) || phone === '';
  };

  const validateCNPJ = (cnpj: string): boolean => {
    if (cnpj === '') return true;
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    return cleanCNPJ.length === 14;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Required fields
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Optional validations
    if (formData.telefone && !validatePhone(formData.telefone)) {
      newErrors.telefone = 'Telefone inválido';
    }

    if (formData.whatsapp && !validatePhone(formData.whatsapp)) {
      newErrors.whatsapp = 'WhatsApp inválido';
    }

    if (formData.cnpj && !validateCNPJ(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido (deve ter 14 dígitos)';
    }

    if (formData.email && formData.email.trim() && !validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.consentimento) {
      newErrors.consentimento = 'É necessário o consentimento LGPD';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user types
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Import supabase2.js functions dynamically
      const { default: supabase2 } = await import('../../lib/supabase2.js');

      // Prepare lead data
      const leadData = {
        org_id: orgId,
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        telefone: formData.telefone.trim() || null,
        whatsapp: formData.whatsapp.trim() || null,
        empresa: formData.empresa.trim() || null,
        cargo: formData.cargo.trim() || null,
        website: formData.website.trim() || null,
        linkedin_lead: formData.linkedin_lead.trim() || null,
        linkedin_empresa: formData.linkedin_empresa.trim() || null,
        endereco: formData.endereco.trim() || null,
        cidade: formData.cidade.trim() || null,
        estado: formData.estado.trim() || null,
        cep: formData.cep.trim() || null,
        pais: formData.pais.trim() || 'Brasil',
        cnpj: formData.cnpj.trim() || null,
        tamanho_empresa: formData.tamanho_empresa || null,
        receita_anual: formData.receita_anual ? parseFloat(formData.receita_anual) : null,
        setor: formData.setor || null,
        status: formData.status,
        temperatura: formData.temperatura,
        prioridade: formData.prioridade,
        origem: formData.origem,
        campanha: formData.campanha.trim() || null,
        utm_source: formData.utm_source.trim() || null,
        utm_medium: formData.utm_medium.trim() || null,
        utm_campaign: formData.utm_campaign.trim() || null,
        valor_estimado: formData.valor_estimado ? parseFloat(formData.valor_estimado) : null,
        owner_id: formData.owner_id || userId,
        tags: formData.tags.trim() ? formData.tags.split(',').map(t => t.trim()) : [],
        observacoes: formData.observacoes.trim() || null,
        consentimento: formData.consentimento,
        consentimento_at: formData.consentimento ? new Date().toISOString() : null,
        score_ia: 50, // Default score
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Create lead using supabase2.js
      const result = await supabase2.leads.create(leadData);

      if (result.error) {
        throw new Error(result.error.message || 'Erro ao criar lead');
      }

      setSubmitStatus('success');
      
      // Wait a bit to show success message
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error creating lead:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao criar lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Criar Novo Lead
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Preencha os dados do lead abaixo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Success/Error Messages */}
            {submitStatus === 'success' && (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  Lead criado com sucesso!
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-800 dark:text-red-200">
                  {errorMessage || 'Erro ao criar lead. Tente novamente.'}
                </p>
              </div>
            )}

            {/* Section 1: Informações Básicas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📋 Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.nome ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: João da Silva"
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.nome}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="email@exemplo.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.telefone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="(11) 98765-4321"
                  />
                  {errors.telefone && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.telefone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.whatsapp ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="(11) 98765-4321"
                  />
                  {errors.whatsapp && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.whatsapp}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Nome da empresa"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Informações Profissionais */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                💼 Informações Profissionais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cargo
                  </label>
                  <input
                    type="text"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ex: Diretor de Marketing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Setor
                  </label>
                  <select
                    name="setor"
                    value={formData.setor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Selecione...</option>
                    {SETOR_OPTIONS.map((setor) => (
                      <option key={setor} value={setor}>
                        {setor}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.cnpj ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                  />
                  {errors.cnpj && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.cnpj}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tamanho da Empresa
                  </label>
                  <select
                    name="tamanho_empresa"
                    value={formData.tamanho_empresa}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Selecione...</option>
                    <option value="1-10">1-10 funcionários</option>
                    <option value="11-50">11-50 funcionários</option>
                    <option value="51-200">51-200 funcionários</option>
                    <option value="201-500">201-500 funcionários</option>
                    <option value="501-1000">501-1000 funcionários</option>
                    <option value="1001+">1001+ funcionários</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="https://exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Receita Anual (R$)
                  </label>
                  <input
                    type="number"
                    name="receita_anual"
                    value={formData.receita_anual}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="1000000"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Classificação */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🎯 Classificação
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Temperatura
                  </label>
                  <select
                    name="temperatura"
                    value={formData.temperatura}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {TEMPERATURA_OPTIONS.map((temp) => (
                      <option key={temp.value} value={temp.value}>
                        {temp.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioridade
                  </label>
                  <select
                    name="prioridade"
                    value={formData.prioridade}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {PRIORIDADE_OPTIONS.map((pri) => (
                      <option key={pri.value} value={pri.value}>
                        {pri.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Origem
                  </label>
                  <select
                    name="origem"
                    value={formData.origem}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {ORIGEM_OPTIONS.map((origem) => (
                      <option key={origem.value} value={origem.value}>
                        {origem.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    name="valor_estimado"
                    value={formData.valor_estimado}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="10000"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="vip, urgente, potencial"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Marketing */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📢 Informações de Marketing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campanha
                  </label>
                  <input
                    type="text"
                    name="campanha"
                    value={formData.campanha}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Black Friday 2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    UTM Source
                  </label>
                  <input
                    type="text"
                    name="utm_source"
                    value={formData.utm_source}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="google"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    UTM Medium
                  </label>
                  <input
                    type="text"
                    name="utm_medium"
                    value={formData.utm_medium}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="cpc"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    UTM Campaign
                  </label>
                  <input
                    type="text"
                    name="utm_campaign"
                    value={formData.utm_campaign}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="summer_sale"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Observações */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📝 Observações
              </h3>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Adicione notas e observações sobre o lead..."
              />
            </div>

            {/* Section 6: LGPD Consent */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🔒 Consentimento LGPD
              </h3>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="consentimento"
                  checked={formData.consentimento}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    O lead forneceu consentimento para uso de dados *
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Conforme Lei Geral de Proteção de Dados (LGPD)
                  </p>
                  {errors.consentimento && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.consentimento}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || submitStatus === 'success'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando...
              </>
            ) : submitStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Criado!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Criar Lead
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateLeadModal;
