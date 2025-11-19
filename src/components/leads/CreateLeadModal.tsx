// 📁 Caminho: src/components/leads/CreateLeadModal.tsx
// Descrição: Modal de criação de leads com validação completa

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { createLead } from '../../lib/supabase-full.js';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  orgId: string;
  userId: string;
}

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  cargo: string;
  status: string;
  origem: string;
  observacoes: string;
  consentimento: boolean;
}

const INITIAL_FORM_DATA: FormData = {
  nome: '',
  email: '',
  telefone: '',
  empresa: '',
  cargo: '',
  status: 'novo',
  origem: 'website',
  observacoes: '',
  consentimento: false,
};

const STATUS_OPTIONS = [
  { value: 'novo', label: 'Novo' },
  { value: 'contatado', label: 'Contatado' },
  { value: 'qualificado', label: 'Qualificado' },
];

const ORIGEM_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'indicacao', label: 'Indicação' },
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

  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_DATA);
      setErrors({});
      setSubmitStatus('idle');
    }
  }, [isOpen]);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.consentimento) {
      newErrors.consentimento = 'Consentimento LGPD é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const leadData = {
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        telefone: formData.telefone.trim() || null,
        empresa: formData.empresa.trim() || null,
        cargo: formData.cargo.trim() || null,
        status: formData.status,
        origem: formData.origem,
        observacoes: formData.observacoes.trim() || null,
        consentimento: formData.consentimento,
        score_ia: 50,
      };

      await createLead(orgId, leadData);
      
      setSubmitStatus('success');
      setTimeout(() => {
        onSuccess(leadData);
      }, 1000);

    } catch (error) {
      console.error('Erro ao criar lead:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--neutral-900)] border border-[var(--neutral-800)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--neutral-800)]">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-teal)] bg-clip-text text-transparent">
              ✨ Criar Novo Lead
            </h2>
            <p className="text-sm text-[var(--text-gray)] mt-1">
              Preencha os dados do lead abaixo
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-[var(--neutral-800)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-gray)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {submitStatus === 'success' && (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <p className="text-sm text-emerald-400">Lead criado com sucesso!</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-400">Erro ao criar lead. Tente novamente.</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-white)] mb-4">📋 Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--text-gray)] mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-[var(--neutral-950)] border ${
                      errors.nome ? 'border-red-500' : 'border-[var(--neutral-800)]'
                    } rounded-lg focus:ring-2 focus:ring-[var(--accent-emerald)] text-[var(--text-white)]`}
                    placeholder="Ex: João da Silva"
                  />
                  {errors.nome && <p className="text-sm text-red-400 mt-1">{errors.nome}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-gray)] mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-[var(--neutral-950)] border ${
                      errors.email ? 'border-red-500' : 'border-[var(--neutral-800)]'
                    } rounded-lg focus:ring-2 focus:ring-[var(--accent-emerald)] text-[var(--text-white)]`}
                    placeholder="email@exemplo.com"
                  />
                  {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-gray)] mb-2">Telefone</label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[var(--neutral-950)] border border-[var(--neutral-800)] rounded-lg focus:ring-2 focus:ring-[var(--accent-emerald)] text-[var(--text-white)]"
                    placeholder="(11) 98765-4321"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-gray)] mb-2">Empresa</label>
                  <input
                    type="text"
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[var(--neutral-950)] border border-[var(--neutral-800)] rounded-lg focus:ring-2 focus:ring-[var(--accent-emerald)] text-[var(--text-white)]"
                    placeholder="Nome da empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-gray)] mb-2">Cargo</label>
                  <input
                    type="text"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[var(--neutral-950)] border border-[var(--neutral-800)] rounded-lg focus:ring-2 focus:ring-[var(--accent-emerald)] text-[var(--text-white)]"
                    placeholder="Ex: Diretor de Marketing"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-white)] mb-4">🎯 Classificação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-gray)] mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[var(--neutral-950)] border border-[var(--neutral-800)] rounded-lg focus:ring-2 focus:ring-[var(--accent-emerald)] text-[var(--text-white)]"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-gray)] mb-2">Origem</label>
                  <select
                    name="origem"
                    value={formData.origem}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[var(--neutral-950)] border border-[var(--neutral-800)] rounded-lg focus:ring-2 focus:ring-[var(--accent-emerald)] text-[var(--text-white)]"
                  >
                    {ORIGEM_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-white)] mb-4">📝 Observações</h3>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-[var(--neutral-950)] border border-[var(--neutral-800)] rounded-lg focus:ring-2 focus:ring-[var(--accent-emerald)] text-[var(--text-white)]"
                placeholder="Adicione notas sobre o lead..."
              />
            </div>

            <div className="flex items-start gap-3 p-4 bg-[var(--neutral-950)] border border-[var(--neutral-800)] rounded-lg">
              <input
                type="checkbox"
                name="consentimento"
                checked={formData.consentimento}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-[var(--accent-emerald)] rounded"
              />
              <div>
                <label className="text-sm font-medium text-[var(--text-white)]">
                  Consentimento LGPD *
                </label>
                <p className="text-xs text-[var(--text-gray)] mt-1">
                  O lead forneceu consentimento para uso de dados
                </p>
                {errors.consentimento && (
                  <p className="text-sm text-red-400 mt-1">{errors.consentimento}</p>
                )}
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--neutral-800)] bg-[var(--neutral-950)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2 border border-[var(--neutral-700)] text-[var(--text-gray)] rounded-lg hover:bg-[var(--neutral-800)] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || submitStatus === 'success'}
            className="px-6 py-2 bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-teal)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
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
