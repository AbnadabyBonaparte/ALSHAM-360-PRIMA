// =====================================================
// ALSHAM 360° PRIMA - SISTEMA DE CONFIGURAÇÕES ENTERPRISE 10/10
// Arquitetura Modular para Gerenciamento de Configurações
// =====================================================

/**
 * @fileoverview Sistema enterprise de configurações organizacionais
 * @version 2.0.0
 * @author ALSHAM Team
 * @license Proprietary
 */

// =====================================================
// 0. IMPORTAÇÕES DE DEPENDÊNCIAS (CORRIGIDO/ADICIONADO)
// =====================================================

// Este arquivo DEPENDE das classes do outro arquivo. Elas devem ser importadas.
// (Ajuste o caminho 'automationApp.js' se o nome do seu arquivo anterior for diferente)
import {
    AutomationApp,
    StateManager,
    DataValidator
} from './automationApp.js';


// =====================================================
// 1. SETTINGS STATE MANAGER (Padrão Reativo 10/10)
// =====================================================

/**
 * Gerenciador de estado específico para configurações
 * Estende StateManager com funcionalidades específicas de settings
 */
class SettingsStateManager extends StateManager {
    constructor() {
        super(); // Chama o construtor da classe pai (StateManager)
        this.originalState = {};
        this.unsavedChanges = new Set();
        this.validationErrors = new Map();
        this.permissions = new Map();
        
        // Estado específico de configurações (mescla com o estado base)
        this.state = {
            ...this.state, // Herda estado da classe pai
            settings: {
                profile: {},
                organization: {},
                team: {},
                notifications: {},
                integrations: {},
                security: {},
                billing: {},
                analytics: {},
                compliance: {}
            },
            currentSection: 'profile',
            searchQuery: '',
            isDirty: false,
            isValidating: false,
            permissions: {} // Permissões específicas de settings
        };
    }

    /**
     * Carrega configurações do servidor
     */
    async loadSettings() {
        try {
            this.setState('ui', { ...this.state.ui, loading: true });
            
            const [settings, permissions] = await Promise.all([
                window.apiClient.get('/api/settings', { cache: true, ttl: 60000 }), // CORRIGIDO: Usa instância global
                window.apiClient.get('/api/settings/permissions', { cache: true, ttl: 300000 })
            ]);
            
            this.setState('settings', settings);
            this.setState('permissions', permissions);
            
            // Armazena estado original para comparação
            this.originalState = JSON.parse(JSON.stringify(settings));
            
            this.setState('ui', { ...this.state.ui, loading: false });
            
        } catch (error) {
            window.errorTracker.captureError(error, { // CORRIGIDO: Usa instância global
                component: 'SettingsStateManager', 
                action: 'loadSettings',
                severity: 'critical'
            });
            throw error;
        }
    }

    /**
     * Atualiza configuração específica
     * @param {string} section - Seção da configuração
     * @param {string} key - Chave da configuração
     * @param {*} value - Novo valor
     */
    updateSetting(section, key, value) {
        const currentSettings = this.state.settings;
        const updatedSettings = {
            ...currentSettings,
            [section]: {
                ...currentSettings[section],
                [key]: value
            }
        };
        
        this.setState('settings', updatedSettings);
        
        // Marca como alterado
        this.unsavedChanges.add(`${section}.${key}`);
        this.setState('isDirty', this.unsavedChanges.size > 0);
        
        // Valida mudança
        this.validateSetting(section, key, value);
    }

    /**
     * Valida configuração específica
     * @param {string} section - Seção da configuração
     * @param {string} key - Chave da configuração
     * @param {*} value - Valor a validar
     */
    async validateSetting(section, key, value) {
        const validationKey = `${section}.${key}`;
        
        try {
            this.setState('isValidating', true);
            
            const validation = await SettingsValidator.validate(section, key, value);
            
            if (validation.isValid) {
                this.validationErrors.delete(validationKey);
            } else {
                this.validationErrors.set(validationKey, validation.errors);
            }
            
            this.setState('isValidating', false);
            
        } catch (error) {
            this.validationErrors.set(validationKey, ['Erro de validação']);
            this.setState('isValidating', false);
            
            window.errorTracker.captureError(error, { // CORRIGIDO: Usa instância global
                component: 'SettingsStateManager', 
                action: 'validateSetting',
                section,
                key
            });
        }
    }

    /**
     * Salva todas as configurações pendentes
     */
    async saveAllSettings() {
        try {
            if (this.validationErrors.size > 0) {
                throw new Error('Existem erros de validação pendentes');
            }
            
            this.setState('ui', { ...this.state.ui, saving: true });
            
            const changedSettings = this.getChangedSettings();
            
            // Salva configurações em lote
            await window.apiClient.put('/api/settings/batch', changedSettings); // CORRIGIDO: Usa instância global
            
            // Atualiza estado original
            this.originalState = JSON.parse(JSON.stringify(this.state.settings));
            this.unsavedChanges.clear();
            this.setState('isDirty', false);
            
            this.setState('ui', { ...this.state.ui, saving: false });
            
            // Log de auditoria
            await this.logSettingsChange(changedSettings);
            
            return true;
            
        } catch (error) {
            this.setState('ui', { ...this.state.ui, saving: false });
            window.errorTracker.captureError(error, { // CORRIGIDO: Usa instância global
                component: 'SettingsStateManager', 
                action: 'saveAllSettings',
                severity: 'high'
            });
            throw error;
        }
    }

    /**
     * Obtém configurações alteradas
     * @returns {Object} Configurações que foram modificadas
     */
    getChangedSettings() {
        const changes = {};
        
        for (const changeKey of this.unsavedChanges) {
            const [section, key] = changeKey.split('.');
            if (!changes[section]) changes[section] = {};
            changes[section][key] = this.state.settings[section][key];
        }
        
        return changes;
    }

    /**
     * Descarta todas as alterações
     */
    discardChanges() {
        this.setState('settings', JSON.parse(JSON.stringify(this.originalState)));
        this.unsavedChanges.clear();
        this.validationErrors.clear();
        this.setState('isDirty', false);
    }

    /**
     * Verifica se existem alterações não salvas
     * @returns {boolean} True se existem alterações
     */
    hasUnsavedChanges() {
        return this.unsavedChanges.size > 0;
    }

    /**
     * Log de auditoria para mudanças
     * @param {Object} changes - Mudanças realizadas
     */
    async logSettingsChange(changes) {
        try {
            await window.apiClient.post('/api/audit/settings', { // CORRIGIDO: Usa instância global
                action: 'settings_updated',
                changes: changes,
                timestamp: new Date().toISOString(),
                user_id: this.getState('user')?.id, // Usa o getState local
                ip_address: await this.getClientIP()
            });
        } catch (error) {
            console.warn('Failed to log settings change:', error);
        }
    }

    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    }

    /**
     * Filtra configurações por busca
     * @param {string} query - Query de busca
     */
    searchSettings(query) {
        this.setState('searchQuery', query);
        // A lógica de filtro será implementada nos componentes UI
    }
}

// =====================================================
// 2. SETTINGS VALIDATOR (Segurança e Validação 10/10)
// =====================================================

/**
 * Validador específico para configurações com regras de negócio
 */
class SettingsValidator extends DataValidator { // CORRIGIDO: Depende de DataValidator importado
    
    /**
     * Valida configuração por seção
     * @param {string} section - Seção da configuração
     * @param {string} key - Chave da configuração
     * @param {*} value - Valor a validar
     * @returns {Promise<Object>} Resultado da validação
     */
    static async validate(section, key, value) {
        const validators = this.getValidators();
        const sectionValidator = validators[section];
        
        if (!sectionValidator) {
            return { isValid: true, errors: [] };
        }
        
        const fieldValidator = sectionValidator[key];
        if (!fieldValidator) {
            return { isValid: true, errors: [] };
        }
        
        return await fieldValidator(value);
    }

    /**
     * Obtém validadores por seção
     * @returns {Object} Mapa de validadores
     */
    static getValidators() {
        return {
            profile: {
                name: async (value) => {
                    const validation = this.validateText(value, {
                        required: true,
                        minLength: 2,
                        maxLength: 100,
                        pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/ // Permite nomes compostos, acentos
                    });
                    return validation;
                },
                email: async (value) => {
                    const validation = this.validateEmail(value);
                    if (validation.isValid) {
                        // Verifica se email já existe
                        try {
                            const exists = await window.apiClient.get(`/api/users/email-exists?email=${encodeURIComponent(value)}`);
                            if (exists.exists && exists.userId !== window.settingsStateManager.getState('user')?.id) { // CORRIGIDO
                                return { isValid: false, errors: ['Email já está em uso'], sanitized: validation.sanitized };
                            }
                        } catch (error) {
                            console.warn('Failed to check email uniqueness:', error);
                            // Falha aberta (não bloqueia usuário se a verificação de API falhar)
                        }
                    }
                    return validation;
                },
                phone: async (value) => {
                    if (!value) return { isValid: true, errors: [], sanitized: '' }; // Não obrigatório
                    
                    const phoneRegex = /^\+?[\d\s\-\(\)]{10,20}$/;
                    const sanitized = this.sanitizeHTML(value); // Sanitiza (remove tags) mas mantém formato
                    
                    const isValid = phoneRegex.test(sanitized);
                    return {
                        isValid,
                        errors: isValid ? [] : ['Formato de telefone inválido'],
                        sanitized
                    };
                },
                timezone: async (value) => {
                    try {
                        const validTimezones = Intl.supportedValuesOf('timeZone');
                        const isValid = validTimezones.includes(value);
                        return {
                            isValid,
                            errors: isValid ? [] : ['Timezone inválido'],
                            sanitized: value
                        };
                    } catch (e) {
                        // Fallback para navegadores antigos (ex: IE)
                        console.warn("Browser não suporta Intl.supportedValuesOf. Validação de timezone pulada.");
                        return { isValid: true, errors: [], sanitized: value };
                    }
                }
            },
            organization: {
                name: async (value) => this.validateText(value, {
                    required: true,
                    minLength: 2,
                    maxLength: 200
                }),
                domain: async (value) => {
                    if (!value) return { isValid: true, errors: [], sanitized: '' }; // Não obrigatório
                    
                    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/;
                    const sanitized = this.sanitizeHTML(value);
                    
                    const isValid = domainRegex.test(sanitized);
                    return {
                        isValid,
                        errors: isValid ? [] : ['Formato de domínio inválido (ex: empresa.com)'],
                        sanitized
                    };
                },
                industry: async (value) => {
                    const validIndustries = [
                        'technology', 'finance', 'healthcare', 'education', 
                        'retail', 'manufacturing', 'consulting', 'other'
                    ];
                    const isValid = validIndustries.includes(value) || value === ""; // Permite "Selecione"
                    return {
                        isValid,
                        errors: isValid ? [] : ['Setor inválido'],
                        sanitized: value
                    };
                }
            },
            security: {
                password: async (value) => {
                    if (!value) return { isValid: true, errors: [], sanitized: '' }; // Não valida se vazio
                    
                    const errors = [];
                    
                    if (value.length < 12) errors.push('Mínimo de 12 caracteres');
                    if (!/[A-Z]/.test(value)) errors.push('Deve conter pelo menos uma letra maiúscula');
                    if (!/[a-z]/.test(value)) errors.push('Deve conter pelo menos uma letra minúscula');
                    if (!/\d/.test(value)) errors.push('Deve conter pelo menos um número');
                    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) errors.push('Deve conter pelo menos um símbolo especial');
                    
                    // Verifica contra senhas comuns
                    const isCommon = await this.checkCommonPassword(value);
                    if (isCommon) errors.push('Senha muito comum, escolha uma mais segura');
                    
                    return {
                        isValid: errors.length === 0,
                        errors,
                        sanitized: value // Senha NUNCA é sanitizada (HTML)
                    };
                },
                sessionTimeout: async (value) => {
                    const timeout = parseInt(value, 10);
                    const isValid = !isNaN(timeout) && timeout >= 5 && timeout <= 480;
                    return {
                        isValid,
                        errors: isValid ? [] : ['Timeout deve estar entre 5 e 480 minutos'],
                        sanitized: timeout
                    };
                }
            },
            notifications: {
                email: async (value) => ({
                    isValid: typeof value === 'boolean',
                    errors: typeof value === 'boolean' ? [] : ['Valor deve ser verdadeiro ou falso'],
                    sanitized: Boolean(value)
                }),
                frequency: async (value) => {
                    const validFrequencies = ['immediate', 'daily', 'weekly', 'never'];
                    const isValid = validFrequencies.includes(value);
                    return {
                        isValid,
                        errors: isValid ? [] : ['Frequência inválida'],
                        sanitized: value
                    };
                }
            }
        };
    }

    /**
     * Verifica se senha é comum/vazada
     * @param {string} password - Senha a verificar
     * @returns {Promise<boolean>} True se é comum
     */
    static async checkCommonPassword(password) {
        if (!crypto?.subtle?.digest) {
            console.warn('Web Crypto API not available. Skipping common password check.');
            return false;
        }

        try {
            // Hash SHA-1 da senha para consulta no HaveIBeenPwned
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-1', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
            
            const prefix = hashHex.substring(0, 5);
            const suffix = hashHex.substring(5);
            
            // Consulta API do HaveIBeenPwned
            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            const text = await response.text();
            
            // Verifica se o sufixo existe na lista
            return text.split('\n').some(line => line.startsWith(suffix));
            
        } catch (error) {
            console.warn('Failed to check password against breaches:', error);
            return false; // Em caso de erro, não bloqueia
        }
    }
}

// =====================================================
// 3. SETTINGS FORM MANAGER (UX/UI 10/10)
// =====================================================

/**
 * Gerenciador de formulários com validação em tempo real
 */
class SettingsFormManager {
    constructor() {
        this.forms = new Map();
        this.debounceTimers = new Map();
        this.validationDelay = 500; // ms
    }

    /**
     * Registra formulário para gerenciamento
     * @param {string} formId - ID do formulário
     * @param {HTMLFormElement} formElement - Elemento do formulário
     */
    registerForm(formId, formElement) {
        this.forms.set(formId, {
            element: formElement,
            fields: new Map(),
            isValid: true,
            isDirty: false
        });
        
        this.setupFormValidation(formId, formElement);
    }

    /**
     * Configura validação do formulário
     * @param {string} formId - ID do formulário
     * @param {HTMLFormElement} formElement - Elemento do formulário
     */
    setupFormValidation(formId, formElement) {
        const inputs = formElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Validação em tempo real
            input.addEventListener('input', (e) => {
                this.handleFieldChange(formId, e.target);
            });
            
            input.addEventListener('blur', (e) => {
                this.validateField(formId, e.target);
            });
            
            // Acessibilidade
            input.addEventListener('focus', (e) => {
                this.announceFieldHelp(e.target);
            });
        });
        
        // Previne envio se inválido
        formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(formId);
        });
    }

    /**
     * Manipula mudança em campo
     * @param {string} formId - ID do formulário
     * @param {HTMLElement} field - Campo alterado
     */
    handleFieldChange(formId, field) {
        const form = this.forms.get(formId);
        if (!form) return;
        
        form.isDirty = true;
        
        // Debounce validação
        const fieldKey = `${formId}.${field.name}`;
        
        if (this.debounceTimers.has(fieldKey)) {
            clearTimeout(this.debounceTimers.get(fieldKey));
        }
        
        this.debounceTimers.set(fieldKey, setTimeout(() => {
            this.validateField(formId, field);
            this.debounceTimers.delete(fieldKey);
        }, this.validationDelay));
        
        // Atualiza estado global
        const [section, key] = this.parseFieldName(field.name);
        if (section && key) {
            window.settingsStateManager.updateSetting(section, key, this.getFieldValue(field));
        }
    }

    /**
     * Valida campo específico
     * @param {string} formId - ID do formulário
     * @param {HTMLElement} field - Campo a validar
     */
    async validateField(formId, field) {
        const form = this.forms.get(formId);
        if (!form) return;
        
        const [section, key] = this.parseFieldName(field.name);
        if (!section || !key) return;
        
        try {
            // Remove erros anteriores
            this.clearFieldError(field);
            
            const value = this.getFieldValue(field);
            const validation = await SettingsValidator.validate(section, key, value);
            
            form.fields.set(field.name, validation);
            
            if (!validation.isValid) {
                this.showFieldError(field, validation.errors);
            }
            
            // Atualiza estado geral do formulário
            this.updateFormState(formId);
            
        } catch (error) {
            this.showFieldError(field, ['Erro de validação']);
            window.errorTracker.captureError(error, { // CORRIGIDO: usa instância global
                component: 'SettingsFormManager', 
                action: 'validateField',
                formId,
                fieldName: field.name
            });
        }
    }

    /**
     * Obtém valor do campo baseado no tipo
     * @param {HTMLElement} field - Campo
     * @returns {*} Valor do campo
     */
    getFieldValue(field) {
        switch (field.type) {
            case 'checkbox':
                return field.checked;
            case 'radio':
                return field.checked ? field.value : null; // Precisa de lógica complexa se não selecionado
            case 'number':
                return parseFloat(field.value) || 0;
            case 'file':
                return field.files ? field.files[0] : null;
            default:
                return field.value; // Removido .trim() para permitir espaços se necessário (ex: senhas)
        }
    }

    /**
     * Parse nome do campo para seção e chave
     * @param {string} fieldName - Nome do campo
     * @returns {Array} [section, key]
     */
    parseFieldName(fieldName) {
        const parts = fieldName.split('.');
        return parts.length >= 2 ? [parts[0], parts.slice(1).join('.')] : [null, null];
    }

    /**
     * Exibe erro no campo
     * @param {HTMLElement} field - Campo com erro
     * @param {Array} errors - Lista de erros
     */
    showFieldError(field, errors) {
        const container = field.closest('.form-field') || field.parentElement;
        if (!container) return;
        
        // Remove erros anteriores
        container.querySelectorAll('.field-error').forEach(el => el.remove());
        
        // Adiciona classe de erro
        field.classList.add('border-red-500', 'focus:ring-red-500');
        field.setAttribute('aria-invalid', 'true');
        
        // Cria elemento de erro
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error text-sm text-red-600 mt-1';
        errorElement.setAttribute('role', 'alert');
        errorElement.textContent = errors[0]; // Mostra primeiro erro
        
        container.appendChild(errorElement);
        
        // Atualiza aria-describedby
        const errorId = `${field.id || field.name}-error`;
        errorElement.id = errorId;
        const existingDescribedBy = field.getAttribute('aria-describedby') || '';
        field.setAttribute('aria-describedby', `${existingDescribedBy} ${errorId}`.trim());
    }

    /**
     * Remove erro do campo
     * @param {HTMLElement} field - Campo
     */
    clearFieldError(field) {
        const container = field.closest('.form-field') || field.parentElement;
        if (!container) return;
        
        const errorId = `${field.id || field.name}-error`;
        // Remove elementos de erro
        container.querySelectorAll(`#${errorId}`).forEach(el => el.remove());
        
        // Remove classes de erro
        field.classList.remove('border-red-500', 'focus:ring-red-500');
        field.setAttribute('aria-invalid', 'false');
        
        // Remove do aria-describedby
        const describedBy = field.getAttribute('aria-describedby');
        if (describedBy) {
            const newDescribedBy = describedBy.split(' ').filter(id => id !== errorId).join(' ');
            if (newDescribedBy) {
                field.setAttribute('aria-describedby', newDescribedBy);
            } else {
                field.removeAttribute('aria-describedby');
            }
        }
    }

    /**
     * Atualiza estado geral do formulário
     * @param {string} formId - ID do formulário
     */
    updateFormState(formId) {
        const form = this.forms.get(formId);
        if (!form) return;
        
        const isValid = Array.from(form.fields.values()).every(validation => validation.isValid);
        form.isValid = isValid;
        
        // Atualiza botão de submit
        const submitBtn = form.element.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = !isValid;
            submitBtn.classList.toggle('opacity-50', !isValid);
            submitBtn.classList.toggle('cursor-not-allowed', !isValid);
        }
    }

    /**
     * Anuncia ajuda do campo para leitores de tela
     * @param {HTMLElement} field - Campo focado
     */
    announceFieldHelp(field) {
        const helpId = field.getAttribute('aria-describedby')?.split(' ').find(id => id.endsWith('-help'));
        const helpElement = helpId ? document.getElementById(helpId) : null;
        
        if (helpElement && window.notificationManager) {
            const announcer = document.getElementById('screen-reader-announcements');
            if (announcer) {
                announcer.textContent = helpElement.textContent;
                setTimeout(() => announcer.textContent = '', 2000);
            }
        }
    }

    /**
     * Manipula envio do formulário
     * @param {string} formId - ID do formulário
     */
    async handleFormSubmit(formId) {
        const form = this.forms.get(formId);
        if (!form || !form.isValid) {
            window.notificationManager.error('Corrija os erros no formulário antes de salvar.'); // CORRIGIDO: Instância global
            return;
        }
        
        try {
            await window.settingsStateManager.saveAllSettings();
            window.notificationManager.success('Configurações salvas com sucesso!'); // CORRIGIDO: Instância global
            
        } catch (error) {
            window.notificationManager.error(error.message || 'Erro ao salvar configurações'); // CORRIGIDO: Instância global
            window.errorTracker.captureError(error, { // CORRIGIDO: Instância global
                component: 'SettingsFormManager', 
                action: 'handleFormSubmit',
                formId
            });
        }
    }
}

// =====================================================
// 4. SETTINGS SECTIONS RENDERER (Componentes UI 10/10)
// =====================================================

/**
 * Renderizador de seções de configurações
 */
class SettingsSectionsRenderer {
    constructor() {
        this.currentSection = 'profile';
        this.formManager = new SettingsFormManager();
    }

    /**
     * Renderiza seção específica
     * @param {string} section - Nome da seção
     */
    async renderSection(section) {
        const container = document.getElementById('settings-content');
        if (!container) return;
        
        this.currentSection = section;
        
        try {
            const settings = window.settingsStateManager.getState('settings');
            const permissions = window.settingsStateManager.getState('permissions');
            
            const sectionData = settings[section] || {};
            const sectionPermissions = permissions[section] || {};
            
            const html = await this.getSectionHTML(section, sectionData, sectionPermissions);
            container.innerHTML = html;
            
            // Registra formulários para validação
            const forms = container.querySelectorAll('form');
            forms.forEach((form, index) => {
                const formId = form.id || `${section}-form-${index}`;
                form.id = formId;
                this.formManager.registerForm(formId, form);
            });
            
            // Configura interações específicas da seção
            this.setupSectionInteractions(section);
            
        } catch (error) {
            container.innerHTML = this.renderErrorState(section, error);
            window.errorTracker.captureError(error, { // CORRIGIDO: Usa instância global
                component: 'SettingsSectionsRenderer', 
                action: 'renderSection',
                section
            });
        }
    }

    /**
     * Obtém HTML da seção
     * @param {string} section - Nome da seção
     * @param {Object} data - Dados da seção
     * @param {Object} permissions - Permissões da seção
     * @returns {Promise<string>} HTML da seção
     */
    async getSectionHTML(section, data, permissions) {
        const renderers = {
            profile: () => this.renderProfileSection(data, permissions),
            organization: () => this.renderOrganizationSection(data, permissions),
            team: () => this.renderTeamSection(data, permissions),
            notifications: () => this.renderNotificationsSection(data, permissions),
            integrations: () => this.renderIntegrationsSection(data, permissions),
            security: () => this.renderSecuritySection(data, permissions),
            billing: () => this.renderBillingSection(data, permissions),
            analytics: () => this.renderAnalyticsSection(data, permissions),
            compliance: () => this.renderComplianceSection(data, permissions)
        };
        
        const renderer = renderers[section];
        return renderer ? renderer() : this.renderNotFoundSection(section);
    }

    /**
     * Renderiza seção de perfil
     */
    renderProfileSection(data, permissions) {
        const canEdit = permissions.edit !== false;
        
        // CORREÇÃO: O CÓDIGO QUEBRADO COMEÇAVA AQUI. ESTE É O CONTEÚDO RESTAURADO.
        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div class="mb-6">
                    <h2 class="text-xl font-semibold text-gray-900 mb-2">👤 Perfil do Usuário</h2>
                    <p class="text-gray-600">Gerencie suas informações pessoais e preferências</p>
                </div>
                
                <form id="profile-form" class="space-y-6">
                                        <div class="form-field">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Foto do Perfil</label>
                        <div class="flex items-center space-x-4">
                            <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                ${data.avatar ? `<img src="${data.avatar}" alt="Avatar" class="w-20 h-20 rounded-full object-cover">` : (DataValidator.sanitizeHTML(data.name?.charAt(0).toUpperCase() || 'U'))}
                            </div>
                            <div>
                                <input type="file" 
                                       id="profile-avatar"
                                       name="profile.avatar" 
                                       accept="image/*" 
                                       class="sr-only"
                                       ${canEdit ? '' : 'disabled'}>
                                <label for="profile-avatar" class="bg-white px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer ${canEdit ? '' : 'opacity-50 cursor-not-allowed'}">
                                    Alterar Foto
                                </label>
                                <p class="text-xs text-gray-500 mt-1" id="profile-avatar-help">JPG, PNG até 5MB</p>
                            </div>
                        </div>
                    </div>

                                        <div class="form-field">
                        <label for="profile.name" class="block text-sm font-medium text-gray-700 mb-1">
                            Nome Completo *
                        </label>
                        <input type="text" 
                               id="profile.name" 
                               name="profile.name" 
                               value="${DataValidator.sanitizeHTML(data.name || '')}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                               placeholder="Seu nome completo"
                               required
                               ${canEdit ? '' : 'readonly'}
                               aria-describedby="profile.name-help">
                        <p id="profile.name-help" class="text-xs text-gray-500 mt-1 sr-only">Nome que aparecerá em todo o sistema</p>
                    </div>

                                        <div class="form-field">
                        <label for="profile.email" class="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input type="email" 
                               id="profile.email" 
                               name="profile.email" 
                               value="${DataValidator.sanitizeHTML(data.email || '')}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                               placeholder="seu@email.com"
                               required
                               ${canEdit ? '' : 'readonly'}
                               aria-describedby="profile.email-help">
                        <p id="profile.email-help" class="text-xs text-gray-500 mt-1 sr-only">Email principal para notificações e login</p>
                    </div>

                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div class="form-field">
                            <label for="profile.phone" class="block text-sm font-medium text-gray-700 mb-1">
                                Telefone
                            </label>
                            <input type="tel" 
                                   id="profile.phone" 
                                   name="profile.phone" 
                                   value="${DataValidator.sanitizeHTML(data.phone || '')}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                   placeholder="+55 (11) 99999-9999"
                                   ${canEdit ? '' : 'readonly'}>
                        </div>

                                                <div class="form-field">
                            <label for="profile.timezone" class="block text-sm font-medium text-gray-700 mb-1">
                                Fuso Horário
                            </label>
                            <select id="profile.timezone" 
                                    name="profile.timezone" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                                    ${canEdit ? '' : 'disabled'}>
                                <option value="America/Sao_Paulo" ${data.timezone === 'America/Sao_Paulo' ? 'selected' : ''}>São Paulo (GMT-3)</option>
                                <option value="America/New_York" ${data.timezone === 'America/New_York' ? 'selected' : ''}>Nova York (GMT-5)</option>
                                <option value="Europe/London" ${data.timezone === 'Europe/London' ? 'selected' : ''}>Londres (GMT+0)</option>
                                <option value="Europe/Paris" ${data.timezone === 'Europe/Paris' ? 'selected' : ''}>Paris (GMT+1)</option>
                                <option value="Asia/Tokyo" ${data.timezone === 'Asia/Tokyo' ? 'selected' : ''}>Tóquio (GMT+9)</option>
                            </select>
                        </div>
                    </div>

                                        <div class="form-field">
                        <label class="block text-sm font-medium text-gray-700 mb-3">Preferências de Interface</label>
                        <div class="space-y-3">
                            <label class="flex items-center">
                                <input type="checkbox" 
                                       id="profile.preferences.darkMode"
                                       name="profile.preferences.darkMode" 
                                       ${data.preferences?.darkMode ? 'checked' : ''}
                                       class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 shadow-sm"
                                       ${canEdit ? '' : 'disabled'}>
                                <span class="ml-2 text-sm text-gray-700">Modo escuro</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" 
                                       id="profile.preferences.compactView"
                                       name="profile.preferences.compactView" 
                                       ${data.preferences?.compactView ? 'checked' : ''}
                                       class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 shadow-sm"
                                       ${canEdit ? '' : 'disabled'}>
                                <span class="ml-2 text-sm text-gray-700">Visualização compacta</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" 
                                       id="profile.preferences.emailDigest"
                                       name="profile.preferences.emailDigest" 
                                       ${data.preferences?.emailDigest ? 'checked' : ''}
                                       class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 shadow-sm"
                                       ${canEdit ? '' : 'disabled'}>
                                <span class="ml-2 text-sm text-gray-700">Receber resumo diário por email</span>
                            </label>
                        </div>
                    </div>

                    ${canEdit ? `
                        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                            <button type="button" data-action="discard" class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                Descartar
                            </button>
                            <button type="submit" class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors opacity-50 cursor-not-allowed" disabled>
                                Salvar Alterações
                            </button>
                        </div>
                    ` : ''}
                </form>
            </div>
        `;
    }

    /**
     * Renderiza seção de organização
     */
    renderOrganizationSection(data, permissions) {
        const canEdit = permissions.edit !== false;
        
        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div class="mb-6">
                    <h2 class="text-xl font-semibold text-gray-900 mb-2">🏢 Organização</h2>
                    <p class="text-gray-600">Configure os dados da sua empresa</p>
                </div>
                
                <form id="organization-form" class="space-y-6">
                                        <div class="form-field">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Logo da Empresa</label>
                        <div class="flex items-center space-x-4">
                            <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border">
                                ${data.logo ? `<img src="${data.logo}" alt="Logo" class="w-16 h-16 rounded-lg object-contain">` : '<span class="text-gray-400 text-xs">Logo</span>'}
                            </div>
                            <div>
                                <input type="file" 
                                       id="organization-logo"
                                       name="organization.logo" 
                                       accept="image/*" 
                                       class="sr-only"
                                       ${canEdit ? '' : 'disabled'}>
                                <label for="organization-logo" class="bg-white px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer ${canEdit ? '' : 'opacity-50 cursor-not-allowed'}">
                                    Alterar Logo
                                </label>
                                <p class="text-xs text-gray-500 mt-1" id="organization-logo-help">PNG, SVG até 2MB - Recomendado: 200x200px</p>
                            </div>
                        </div>
                    </div>

                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div class="form-field">
                            <label for="organization.name" class="block text-sm font-medium text-gray-700 mb-1">
                                Nome da Empresa *
                            </label>
                            <input type="text" 
                                   id="organization.name" 
                                   name="organization.name" 
                                   value="${DataValidator.sanitizeHTML(data.name || '')}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                   placeholder="Nome da sua empresa"
                                   required
                                   ${canEdit ? '' : 'readonly'}>
                        </div>

                                                <div class="form-field">
                            <label for="organization.cnpj" class="block text-sm font-medium text-gray-700 mb-1">
                                CNPJ
                            </label>
                            <input type="text" 
                                   id="organization.cnpj" 
                                   name="organization.cnpj" 
                                   value="${DataValidator.sanitizeHTML(data.cnpj || '')}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                   placeholder="00.000.000/0000-00"
                                   ${canEdit ? '' : 'readonly'}>
                        </div>

                                                <div class="form-field">
                            <label for="organization.industry" class="block text-sm font-medium text-gray-700 mb-1">
                                Setor de Atuação
                            </label>
                            <select id="organization.industry" 
                                    name="organization.industry" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                                    ${canEdit ? '' : 'disabled'}>
                                <option value="">Selecione um setor</option>
                                <option value="technology" ${data.industry === 'technology' ? 'selected' : ''}>Tecnologia</option>
                                <option value="finance" ${data.industry === 'finance' ? 'selected' : ''}>Financeiro</option>
                                <option value="healthcare" ${data.industry === 'healthcare' ? 'selected' : ''}>Saúde</option>
                                <option value="education" ${data.industry === 'education' ? 'selected' : ''}>Educação</option>
                                <option value="retail" ${data.industry === 'retail' ? 'selected' : ''}>Varejo</option>
                                <option value="manufacturing" ${data.industry === 'manufacturing' ? 'selected' : ''}>Manufatura</option>
                                <option value="consulting" ${data.industry === 'consulting' ? 'selected' : ''}>Consultoria</option>
                                <option value="other" ${data.industry === 'other' ? 'selected' : ''}>Outros</option>
                            </select>
                        </div>

                                                <div class="form-field">
                            <label for="organization.size" class="block text-sm font-medium text-gray-700 mb-1">
                                Tamanho da Empresa
                            </label>
                            <select id="organization.size" 
                                    name="organization.size" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                                    ${canEdit ? '' : 'disabled'}>
                                <option value="">Selecione o tamanho</option>
                                <option value="startup" ${data.size === 'startup' ? 'selected' : ''}>Startup (1-10 funcionários)</option>
                                <option value="small" ${data.size === 'small' ? 'selected' : ''}>Pequena (11-50 funcionários)</option>
                                <option value="medium" ${data.size === 'medium' ? 'selected' : ''}>Média (51-250 funcionários)</option>
                                <option value="large" ${data.size === 'large' ? 'selected' : ''}>Grande (250+ funcionários)</option>
                            </select>
                        </div>
                    </div>

                                        <div class="space-y-4 pt-6 border-t border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">Endereço</h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="md:col-span-2 form-field">
                                <label for="organization.address.street" class="block text-sm font-medium text-gray-700 mb-1">
                                    Logradouro
                                </label>
                                <input type="text" 
                                       id="organization.address.street" 
                                       name="organization.address.street" 
                                       value="${DataValidator.sanitizeHTML(data.address?.street || '')}"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                       placeholder="Rua, número"
                                       ${canEdit ? '' : 'readonly'}>
                            </div>
                            
                            <div class="form-field">
                                <label for="organization.address.zipCode" class="block text-sm font-medium text-gray-700 mb-1">
                                    CEP
                                </label>
                                <input type="text" 
                                       id="organization.address.zipCode" 
                                       name="organization.address.zipCode" 
                                       value="${DataValidator.sanitizeHTML(data.address?.zipCode || '')}"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                       placeholder="00000-000"
                                       ${canEdit ? '' : 'readonly'}>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="form-field">
                                <label for="organization.address.city" class="block text-sm font-medium text-gray-700 mb-1">
                                    Cidade
                                </label>
                                <input type="text" 
                                       id="organization.address.city" 
                                       name="organization.address.city" 
                                       value="${DataValidator.sanitizeHTML(data.address?.city || '')}"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                       placeholder="Sua cidade"
                                       ${canEdit ? '' : 'readonly'}>
                            </div>
                            
                            <div class="form-field">
                                <label for="organization.address.state" class="block text-sm font-medium text-gray-700 mb-1">
                                    Estado
                                </label>
                                <select id="organization.address.state" 
                                        name="organization.address.state" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                                        ${canEdit ? '' : 'disabled'}>
                                    <option value="">Selecione o estado</option>
                                    <option value="SP" ${data.address?.state === 'SP' ? 'selected' : ''}>São Paulo</option>
                                    <option value="RJ" ${data.address?.state === 'RJ' ? 'selected' : ''}>Rio de Janeiro</option>
                                    <option value="MG" ${data.address?.state === 'MG' ? 'selected' : ''}>Minas Gerais</option>
                                                                    </select>
                            </div>
                        </div>
                    </div>

                    ${canEdit ? `
                        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                            <button type="button" data-action="discard" class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                Descartar
                            </button>
                            <button type="submit" class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors opacity-50 cursor-not-allowed" disabled>
                                Salvar Alterações
                            </button>
                        </div>
                    ` : ''}
                </form>
            </div>
        `;
    }

    /**
     * Renderiza seção de segurança
     */
    renderSecuritySection(data, permissions) {
        const canEdit = permissions.edit !== false;
        
        return `
            <div class="space-y-6">
                                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Alteração de Senha</h3>
                        <p class="text-gray-600">Mantenha sua conta segura com uma senha forte</p>
                    </div>
                    
                    <form id="password-form" class="space-y-4">
                        <div class="form-field">
                            <label for="security.currentPassword" class="block text-sm font-medium text-gray-700 mb-1">
                                Senha Atual *
                            </label>
                            <input type="password" 
                                   id="security.currentPassword" 
                                   name="security.currentPassword" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                   required
                                   ${canEdit ? '' : 'disabled'}>
                        </div>
                        
                        <div class="form-field">
                            <label for="security.newPassword" class="block text-sm font-medium text-gray-700 mb-1">
                                Nova Senha *
                            </label>
                            <input type="password" 
                                   id="security.newPassword" 
                                   name="security.newPassword" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                   required
                                   ${canEdit ? '' : 'disabled'}
                                   aria-describedby="password-requirements password-strength-text">
                            
                                                        <div id="password-strength" class="mt-2 hidden">
                                <div class="flex space-x-1 mb-2">
                                    <div class="h-1 flex-1 bg-gray-200 rounded"></div>
                                    <div class="h-1 flex-1 bg-gray-200 rounded"></div>
                                    <div class="h-1 flex-1 bg-gray-200 rounded"></div>
                                    <div class="h-1 flex-1 bg-gray-200 rounded"></div>
                                </div>
                                <p class="text-xs text-gray-500" id="password-strength-text">Digite uma senha</p>
                            </div>
                            
                            <div id="password-requirements" class="mt-2 text-xs text-gray-500">
                                <p class="mb-1 sr-only">Sua senha deve ter:</p>
                                <ul class="space-y-1 ml-4 list-none p-0">
                                    <li class="flex items-center"><span id="req-length" class="w-4 text-center text-gray-400">○</span> <span class="ml-2">Mínimo 12 caracteres</span></li>
                                    <li class="flex items-center"><span id="req-upper" class="w-4 text-center text-gray-400">○</span> <span class="ml-2">Uma letra maiúscula</span></li>
                                    <li class="flex items-center"><span id="req-lower" class="w-4 text-center text-gray-400">○</span> <span class="ml-2">Uma letra minúscula</span></li>
                                    <li class="flex items-center"><span id="req-number" class="w-4 text-center text-gray-400">○</span> <span class="ml-2">Um número</span></li>
                                    <li class="flex items-center"><span id="req-special" class="w-4 text-center text-gray-400">○</span> <span class="ml-2">Um símbolo especial</span></li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="form-field">
                            <label for="security.confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar Nova Senha *
                            </label>
                            <input type="password" 
                                   id="security.confirmPassword" 
                                   name="security.confirmPassword" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                   required
                                   ${canEdit ? '' : 'disabled'}>
                        </div>
                        
                        ${canEdit ? `
                            <div class="flex justify-end pt-4">
                                <button type="submit" class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors opacity-50 cursor-not-allowed" disabled>
                                    Alterar Senha
                                </button>
                            </div>
                        ` : ''}
                    </form>
                </div>

                                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Autenticação de Dois Fatores (2FA)</h3>
                        <p class="text-gray-600">Adicione uma camada extra de segurança à sua conta</p>
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 ${data.twoFactorEnabled ? 'bg-green-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 ${data.twoFactorEnabled ? 'text-green-600' : 'text-gray-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                            </div>
                            <div>
                                <div class="font-medium text-gray-900">2FA ${data.twoFactorEnabled ? 'Ativado' : 'Desativado'}</div>
                                <div class="text-sm text-gray-500">
                                    ${data.twoFactorEnabled ? 'Sua conta está protegida com 2FA' : 'Recomendamos ativar para maior segurança'}
                                </div>
                            </div>
                        </div>
                        <button id="toggle-2fa-btn" 
                                class="px-4 py-2 text-sm ${data.twoFactorEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition-colors"
                                ${canEdit ? '' : 'disabled'}>
                            ${data.twoFactorEnabled ? 'Desativar' : 'Ativar'} 2FA
                        </button>
                    </div>
                </div>

                                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Sessões Ativas</h3>
                        <p class="text-gray-600">Gerencie todos os dispositivos conectados à sua conta</p>
                    </div>
                    
                    <div class="space-y-4" id="active-sessions">
                                                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <div class="font-medium text-gray-900">Chrome - Windows (Atual)</div>
                                    <div class="text-sm text-gray-500">São Paulo, Brasil • Agora</div>
                                </div>
                            </div>
                            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Ativa</span>
                        </div>
                                            </div>
                    
                    <div class="flex justify-end mt-4">
                        <button id="revoke-all-sessions-btn" 
                                class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                ${canEdit ? '' : 'disabled'}>
                            Encerrar Todas as Outras Sessões
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza estado de erro
     */
    renderErrorState(section, error) {
        return `
            <div class="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
                <div class="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Erro ao Carregar Seção</h3>
                <p class="text-gray-600 mb-4">Não foi possível carregar as configurações de ${section}. Erro: ${error.message}</p>
                <button onclick="window.settingsApp.retryLoadSection('${section}')" 
                        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    Tentar Novamente
                </button>
            </div>
        `;
    }

    /**
     * Renderiza seção não encontrada
     */
    renderNotFoundSection(section) {
        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div class="text-gray-400 text-4xl mb-4">❓</div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Seção Não Encontrada</h3>
                <p class="text-gray-600">A seção "${section}" não foi implementada ainda</p>
            </div>
        `;
    }

    /**
     * Configura interações específicas da seção
     */
    setupSectionInteractions(section) {
        switch (section) {
            case 'security':
                this.setupPasswordStrengthIndicator();
                this.setup2FAToggle();
                this.setupSessionManagement();
                break;
            case 'profile':
                this.setupAvatarUpload();
                break;
            // Mais seções...
        }
    }

    /**
     * Configura indicador de força da senha
     */
    setupPasswordStrengthIndicator() {
        const passwordInput = document.getElementById('security.newPassword');
        if (!passwordInput) return;

        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const strengthDiv = document.getElementById('password-strength');
            const strengthText = document.getElementById('password-strength-text');
            
            if (password.length > 0) {
                strengthDiv?.classList.remove('hidden');
                
                const strength = this.calculatePasswordStrength(password);
                this.updatePasswordStrengthUI(strength, strengthText);
                this.updatePasswordRequirements(password);
            } else {
                strengthDiv?.classList.add('hidden');
                this.updatePasswordRequirements(""); // Limpa requisitos
            }
        });
    }

    /**
     * Calcula força da senha
     */
    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
        
        return score; // Retorna 0-5
    }

    /**
     * Atualiza UI do indicador de força
     */
    updatePasswordStrengthUI(strength, textElement) {
        const bars = document.querySelectorAll('#password-strength .h-1');
        const colors = ['bg-red-500', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-500'];
        const texts = ['Inválida', 'Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte'];
        const colorClasses = ['text-gray-500', 'text-red-600', 'text-red-600', 'text-yellow-600', 'text-green-600', 'text-green-600'];

        if (!textElement) return;
        
        bars.forEach((bar, index) => {
            if (index < (strength > 0 ? Math.max(1, strength - 1) : 0) ) { // Garante que pelo menos 1 barra apareça se score > 0
                bar.className = `h-1 flex-1 rounded ${colors[strength]}`;
            } else if (index === 0 && strength > 0) {
                bar.className = `h-1 flex-1 rounded ${colors[strength]}`;
            } else {
                bar.className = `h-1 flex-1 rounded bg-gray-200`;
            }
        });
        
        // Ajuste para mapear score 0-5 para 4 barras (score 1 e 2 = 1 barra, 3 = 2 barras, 4 = 3 barras, 5 = 4 barras)
        const barScore = strength <= 1 ? 1 : (strength <= 3 ? 2 : (strength === 4 ? 3 : 4));
        bars.forEach((bar, index) => {
            if (index < barScore && strength > 0) {
                bar.className = `h-1 flex-1 rounded ${colors[strength]}`;
            } else {
                bar.className = `h-1 flex-1 rounded bg-gray-200`;
            }
        });

        
        textElement.textContent = texts[strength] || 'Digite uma senha';
        textElement.className = `text-xs ${colorClasses[strength]}`;
    }

    /**
     * Atualiza requisitos da senha
     */
    updatePasswordRequirements(password) {
        const requirements = [
            { id: 'req-length', test: password.length >= 12 },
            { id: 'req-upper', test: /[A-Z]/.test(password) },
            { id: 'req-lower', test: /[a-z]/.test(password) },
            { id: 'req-number', test: /\d/.test(password) },
            { id: 'req-special', test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) }
        ];
        
        requirements.forEach(req => {
            const element = document.getElementById(req.id);
            if (element) {
                element.textContent = req.test ? '✓' : '○';
                element.className = `w-4 text-center ${req.test ? 'text-green-600' : 'text-gray-400'}`;
            }
        });
    }

    /**
     * Configura toggle de 2FA
     */
    setup2FAToggle() {
        const toggle2FABtn = document.getElementById('toggle-2fa-btn');
        if (!toggle2FABtn) return;

        toggle2FABtn.addEventListener('click', async () => {
            try {
                const isEnabled = toggle2FABtn.textContent.trim() === 'Desativar';
                
                if (isEnabled) {
                    await this.disable2FA();
                } else {
                    await this.enable2FA();
                }
                
                // Recarrega seção
                await this.renderSection('security');
                
            } catch (error) {
                window.notificationManager.error('Erro ao alterar 2FA');
                window.errorTracker.captureError(error, { 
                    component: 'SettingsSectionsRenderer', 
                    action: 'toggle2FA' 
                });
            }
        });
    }

    /**
     * Habilita 2FA
     */
    async enable2FA() {
        // Implementação específica para habilitar 2FA
        window.notificationManager.info('Funcionalidade de 2FA em desenvolvimento');
        // Simula a ativação para UI
        const settings = window.settingsStateManager.getState('settings');
        settings.security.twoFactorEnabled = true;
        window.settingsStateManager.setState('settings', settings);
    }

    /**
     * Desabilita 2FA
     */
    async disable2FA() {
        // Implementação específica para desabilitar 2FA
        window.notificationManager.info('Funcionalidade de 2FA em desenvolvimento');
        // Simula a desativação para UI
        const settings = window.settingsStateManager.getState('settings');
        settings.security.twoFactorEnabled = false;
        window.settingsStateManager.setState('settings', settings);
    }

    /**
     * Configura gerenciamento de sessões
     */
    setupSessionManagement() {
        const revokeAllBtn = document.getElementById('revoke-all-sessions-btn');
        if (!revokeAllBtn) return;

        revokeAllBtn.addEventListener('click', async () => {
            const confirmed = confirm('Tem certeza que deseja encerrar todas as outras sessões? Isso irá desconectar todos os outros dispositivos.');
            
            if (confirmed) {
                try {
                    await window.apiClient.post('/api/auth/revoke-all-sessions');
                    window.notificationManager.success('Todas as outras sessões foram encerradas');
                    // TODO: Atualizar a lista de sessões na UI
                    
                } catch (error) {
                    window.notificationManager.error('Erro ao encerrar sessões');
                    window.errorTracker.captureError(error, { 
                        component: 'SettingsSectionsRenderer', 
                        action: 'revokeAllSessions' 
                    });
                }
            }
        });
    }

    /**
     * Configura upload de avatar
     */
    setupAvatarUpload() {
        const avatarInput = document.getElementById('profile-avatar');
        if (!avatarInput) return;

        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                // Validações do arquivo
                if (file.size > 5 * 1024 * 1024) { // 5MB
                    throw new Error('Arquivo muito grande. Máximo 5MB.');
                }

                if (!file.type.startsWith('image/')) {
                    throw new Error('Apenas imagens são permitidas.');
                }

                // Upload do arquivo
                const formData = new FormData();
                formData.append('avatar', file);

                const response = await window.apiClient.post('/api/upload/avatar', formData, {
                    // O APIClient adiciona Content-Type JSON por padrão, precisamos removê-lo para FormData
                    headers: { 'Content-Type': null } // Deixa o browser definir o multipart boundary
                });

                // Atualiza preview
                const avatarContainer = avatarInput.closest('.form-field').querySelector('.w-20.h-20');
                if (avatarContainer && response.url) {
                    avatarContainer.innerHTML = `<img src="${response.url}" alt="Avatar" class="w-20 h-20 rounded-full object-cover">`;
                    // Atualiza o estado
                    window.settingsStateManager.updateSetting('profile', 'avatar', response.url);
                }

                window.notificationManager.success('Avatar atualizado com sucesso!');

            } catch (error) {
                window.notificationManager.error(error.message || 'Erro ao fazer upload do avatar');
                window.errorTracker.captureError(error, { 
                    component: 'SettingsSectionsRenderer', 
                    action: 'uploadAvatar' 
                });
            }
        });
    }

    /**
     * Renderiza outras seções (implementação básica)
     */
    renderNotificationsSection(data, permissions) {
        return `<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h3 class="text-lg font-semibold mb-2">🔔 Notificações</h3>
            <p class="text-gray-600">Seção em desenvolvimento</p>
        </div>`;
    }

    renderTeamSection(data, permissions) {
        return `<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h3 class="text-lg font-semibold mb-2">👥 Equipe</h3>
            <p class="text-gray-600">Seção em desenvolvimento</p>
        </div>`;
    }

    renderIntegrationsSection(data, permissions) {
        return `<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h3 class="text-lg font-semibold mb-2">🔗 Integrações</h3>
            <p class="text-gray-600">Seção em desenvolvimento</p>
        </div>`;
    }

    renderBillingSection(data, permissions) {
        return `<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h3 class="text-lg font-semibold mb-2">💳 Faturamento</h3>
            <p class="text-gray-600">Seção em desenvolvimento</p>
        </div>`;
    }

    renderAnalyticsSection(data, permissions) {
        return `<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h3 class="text-lg font-semibold mb-2">📊 Analytics</h3>
            <p class="text-gray-600">Seção em desenvolvimento</p>
        </div>`;
    }

    renderComplianceSection(data, permissions) {
        return `<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h3 class="text-lg font-semibold mb-2">⚖️ Compliance</h3>
            <p class="text-gray-600">Seção em desenvolvimento</p>
        </div>`;
    }
}

// =====================================================
// 5. SETTINGS APP CONTROLLER (Controlador Principal 10/10)
// =====================================================

/**
 * Controlador principal da aplicação de configurações
 */
class SettingsApp extends AutomationApp { // CORRIGIDO: Depende de AutomationApp importado
    constructor() {
        super(); // Chama o construtor da classe pai (AutomationApp)
        this.settingsStateManager = new SettingsStateManager();
        this.sectionsRenderer = new SettingsSectionsRenderer();
        this.currentSection = 'profile';
        
        // Substituir StateManager global pelo específico de settings
        // NOTA: Isso sobrescreve o stateManager global definido no AutomationApp.
        // Se ambos precisarem coexistir, a arquitetura de dependência precisa ser revista.
        // Por enquanto, assumimos que esta página *só* usa o settingsStateManager.
        window.settingsStateManager = this.settingsStateManager; 
    }

    /**
     * Inicializa aplicação de configurações
     */
    async initialize() {
        try {
            console.info('🚀 Iniciando ALSHAM 360° PRIMA - Configurações...');
            
            // Inicializa módulos base (herdado de AutomationApp, que os instancia no window)
            this.modules.notificationManager.initialize();
            this.setupEventListeners(); // Configura listeners específicos de settings
            this.setupOfflineDetection(); // Herda da classe pai
            
            // Carrega configurações (usando o state manager específico)
            await this.settingsStateManager.loadSettings();
            
            // Inicializa componentes da UI (subscreve aos eventos do settingsStateManager)
            this.initializeUIComponents();
            
            // Renderiza seção inicial
            await this.sectionsRenderer.renderSection(this.currentSection);
            
            // Remove loading screen
            this.hideLoadingScreen();
            
            this.isInitialized = true;
            console.info('✅ Configurações inicializadas com sucesso');
            
            this.modules.notificationManager.success('Configurações carregadas!');
            
        } catch (error) {
            this.modules.errorTracker.captureError(error, { 
                component: 'SettingsApp', 
                action: 'initialize',
                severity: 'critical'
            });
            
            this.showErrorScreen(error);
        }
    }

    /**
     * Configura event listeners específicos de configurações
     */
    setupEventListeners() {
        super.setupEventListeners(); // Configura listeners da classe PAI (AutomationApp)
        
        // Navegação entre seções
        this.setupSectionNavigation();
        
        // Busca de configurações
        this.setupSettingsSearch();
        
        // Botões de ação globais da página de settings
        this.setupActionButtons();
        
        // Warning para mudanças não salvas
        this.setupUnsavedChangesWarning();
    }

    /**
     * Configura navegação entre seções
     */
    setupSectionNavigation() {
        const navContainer = document.getElementById('settings-nav');
        if (!navContainer) return;

        navContainer.addEventListener('click', async (e) => {
            const item = e.target.closest('.settings-nav-item');
            if (!item) return;

            const section = item.dataset.section;
            if (section && section !== this.currentSection) {
                await this.switchToSection(section);
            }
        });
        
        navContainer.addEventListener('keydown', async (e) => {
            const item = e.target.closest('.settings-nav-item');
            if (!item) return;

            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const section = item.dataset.section;
                if (section && section !== this.currentSection) {
                    await this.switchToSection(section);
                }
            }
        });
    }

    /**
     * Troca para uma seção específica
     */
    async switchToSection(section) {
        try {
            // Verifica mudanças não salvas
            if (this.settingsStateManager.hasUnsavedChanges()) {
                const confirmSwitch = confirm('Você tem alterações não salvas. Deseja descartá-las e continuar?');
                if (!confirmSwitch) return;
                this.settingsStateManager.discardChanges(); // Descarta se o usuário confirmar
            }
            
            // Atualiza navegação visual
            this.updateSectionNavigationUI(section);
            
            // Esconde todas as seções e mostra a correta (baseado no HTML fornecido)
            this.updateSectionVisibility(section);

            // Renderiza nova seção (injeta o HTML)
            await this.sectionsRenderer.renderSection(section);
            
            this.currentSection = section;
            this.settingsStateManager.setState('currentSection', section);
            
            // Scroll para o topo do conteúdo principal
            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.scrollIntoView({ behavior: 'smooth' });
            }
            
        } catch (error) {
            this.modules.errorTracker.captureError(error, { 
                component: 'SettingsApp', 
                action: 'switchToSection',
                section
            });
            this.modules.notificationManager.error('Erro ao carregar seção');
        }
    }

    /**
     * Atualiza visibilidade da seção no DOM (baseado no HTML)
     */
    updateSectionVisibility(activeSection) {
        document.querySelectorAll('.settings-section').forEach(sectionEl => {
            if (sectionEl.id === `${activeSection}-section`) {
                sectionEl.classList.remove('hidden');
            } else {
                sectionEl.classList.add('hidden');
            }
        });
    }

    /**
     * Atualiza navegação visual
     */
    updateSectionNavigationUI(activeSection) {
        const navItems = document.querySelectorAll('.settings-nav-item');
        
        navItems.forEach(item => {
            const isActive = item.dataset.section === activeSection;
            
            item.classList.toggle('active', isActive); // 'active' é a classe personalizada do HTML
            item.classList.toggle('bg-blue-50', isActive);
            item.classList.toggle('text-blue-700', isActive); // Classe de texto ativo
            item.classList.toggle('border-blue-200', isActive); // Classe de borda ativa
            item.setAttribute('aria-selected', String(isActive));
            item.setAttribute('tabindex', isActive ? '0' : '-1');
        });
    }

    /**
     * Configura busca de configurações
     */
    setupSettingsSearch() {
        const searchInput = document.getElementById('settings-search');
        if (!searchInput) return;
        
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSettingsSearch(e.target.value);
            }, 300); // 300ms debounce
        });
    }

    /**
     * Executa busca nas configurações
     */
    performSettingsSearch(query) {
        this.settingsStateManager.searchSettings(query);
        
        if (query.trim()) {
            // Implementar filtro visual das configurações
            this.highlightMatchingSettings(query);
        } else {
            this.clearSearchHighlights();
        }
    }

    /**
     * Destaca configurações que correspondem à busca (Lógica de exemplo)
     */
    highlightMatchingSettings(query) {
        console.info('Searching for:', query);
        const lowerQuery = query.toLowerCase();
        document.querySelectorAll('.form-field').forEach(field => {
            const label = field.querySelector('label');
            const helpText = field.querySelector('p');
            const matches = (label?.textContent.toLowerCase().includes(lowerQuery)) || 
                            (helpText?.textContent.toLowerCase().includes(lowerQuery));
            
            if (matches) {
                field.style.outline = "2px solid #F59E0B"; // Highlight (ex: amarelo)
                field.style.borderRadius = "8px";
            } else {
                field.style.outline = "none";
            }
        });
    }

    /**
     * Remove destaques da busca
     */
    clearSearchHighlights() {
        document.querySelectorAll('.form-field').forEach(field => {
            field.style.outline = "none";
        });
    }

    /**
     * Configura botões de ação globais (fora dos formulários)
     */
    setupActionButtons() {
        // (Estes botões não existem no HTML fornecido, mas a lógica está aqui se forem adicionados)
        // Restaurar padrões
        document.getElementById('reset-defaults-btn')?.addEventListener('click', () => {
            this.handleResetDefaults();
        });
        
        // Exportar configurações
        document.getElementById('export-settings-btn')?.addEventListener('click', () => {
            this.handleExportSettings();
        });
        
        // Backup
        document.getElementById('backup-settings-btn')?.addEventListener('click', () => {
            this.handleBackupSettings();
        });
        
        // Log de auditoria
        document.getElementById('audit-log-btn')?.addEventListener('click', () => {
            this.handleShowAuditLog();
        });
    }

    /**
     * Configura aviso de mudanças não salvas (Barra inferior)
     */
    setupUnsavedChangesWarning() {
        this.settingsStateManager.subscribe('isDirty', (isDirty) => {
            const warning = document.getElementById('unsaved-warning-bar'); // Assumindo ID para a barra
            
            if (warning) {
                warning.classList.toggle('hidden', !isDirty); // Mostra/esconde barra
            }

            // Atualiza botões de submit em *todos* os formulários para refletir o estado 'isDirty' e 'isValid'
            this.sectionsRenderer.formManager.forms.forEach((form, formId) => {
                const submitBtn = form.element.querySelector('[type="submit"]');
                if (submitBtn) {
                    const canSave = isDirty && form.isValid;
                    submitBtn.disabled = !canSave;
                    submitBtn.classList.toggle('opacity-50', !canSave);
                    submitBtn.classList.toggle('cursor-not-allowed', !canSave);
                }
                
                // Botão de descarte
                const discardBtn = form.element.querySelector('[data-action="discard"]');
                if (discardBtn) {
                    discardBtn.disabled = !isDirty;
                    discardBtn.classList.toggle('opacity-50', !isDirty);
                    discardBtn.classList.toggle('cursor-not-allowed', !isDirty);
                    
                    // Adiciona listener se ainda não tiver
                    if (!discardBtn.dataset.listenerAttached) {
                        discardBtn.addEventListener('click', () => this.handleDiscardChanges());
                        discardBtn.dataset.listenerAttached = 'true';
                    }
                }
            });

        });
    }

    /**
     * Handlers para ações
     */
    async handleSaveAllSettings() {
        try {
            await this.settingsStateManager.saveAllSettings();
            this.modules.notificationManager.success('Todas as configurações foram salvas!');
            
        } catch (error) {
            this.modules.notificationManager.error(error.message || 'Erro ao salvar configurações');
            this.modules.errorTracker.captureError(error, { 
                component: 'SettingsApp', 
                action: 'handleSaveAllSettings' 
            });
        }
    }

    async handleDiscardChanges() {
        const confirmed = confirm('Tem certeza que deseja descartar todas as alterações não salvas?');
        if (confirmed) {
            this.settingsStateManager.discardChanges();
            // Rerenderiza a seção atual para voltar aos valores originais
            await this.sectionsRenderer.renderSection(this.currentSection);
            this.modules.notificationManager.info('Alterações descartadas');
        }
    }

    async handleResetDefaults() {
        const confirmed = confirm('Tem certeza que deseja restaurar TODAS as configurações para os valores padrão? Esta ação não pode ser desfeita.');
        if (confirmed) {
            try {
                await window.apiClient.post('/api/settings/reset-defaults');
                await this.settingsStateManager.loadSettings(); // Recarrega do servidor
                await this.sectionsRenderer.renderSection(this.currentSection); // Rerenderiza
                this.modules.notificationManager.success('Configurações restauradas para os padrões');
                
            } catch (error) {
                this.modules.notificationManager.error('Erro ao restaurar configurações');
                this.modules.errorTracker.captureError(error, { 
                    component: 'SettingsApp', 
                    action: 'handleResetDefaults' 
              _x000D_
  });
            }
        }
    }

    async handleExportSettings() {
        try {
            const settings = this.settingsStateManager.getState('settings');
            const exportData = {
                version: '2.0', // Corresponde à versão do arquivo
                timestamp: new Date().toISOString(),
                settings: settings
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `alsham-settings-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a); // Necessário para Firefox
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.modules.notificationManager.success('Configurações exportadas com sucesso!');
            
        } catch (error) {
            this.modules.notificationManager.error('Erro ao exportar configurações');
            this.modules.errorTracker.captureError(error, { 
                component: 'SettingsApp', 
                action: 'handleExportSettings' 
            });
        }
    }

    async handleBackupSettings() {
        try {
            await window.apiClient.post('/api/settings/backup');
            this.modules.notificationManager.success('Backup das configurações criado com sucesso!');
            
        } catch (error) {
            this.modules.notificationManager.error('Erro ao criar backup');
            this.modules.errorTracker.captureError(error, { 
                component: 'SettingsApp', 
                action: 'handleBackupSettings' 
            });
        }
    }

    handleShowAuditLog() {
        this.modules.notificationManager.info('Log de auditoria em desenvolvimento');
        // Lógica para abrir modal de log de auditoria
    }

    /**
     * Verifica se existem mudanças não salvas
     */
    hasUnsavedChanges() {
        return this.settingsStateManager.hasUnsavedChanges();
    }

    /**
     * Tenta recarregar uma seção específica (chamado pelo botão de erro)
     */
    async retryLoadSection(section) {
        try {
            await this.sectionsRenderer.renderSection(section);
            this.modules.notificationManager.success('Seção recarregada com sucesso!');
            
        } catch (error) {
            this.modules.notificationManager.error('Erro ao recarregar seção');
            this.modules.errorTracker.captureError(error, { 
                component: 'SettingsApp', 
                action: 'retryLoadSection',
                section
            });
        }
    }
}

// =====================================================
// INICIALIZAÇÃO DA APLICAÇÃO DE CONFIGURAÇÕES
// =====================================================

/**
 * Inicializa a aplicação quando DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Cria instância global da aplicação de configurações
        // Nota: Isso assume que 'automationApp.js' (que define as classes base) foi carregado ANTES deste script.
        window.settingsApp = new SettingsApp();
        
        // Inicializa aplicação
        await window.settingsApp.initialize();
        
    } catch (error) {
        console.error('❌ Falha crítica na inicialização das configurações:', error);
        
        // Fallback para erro crítico
        document.getElementById('loading-screen')?.classList.add('hidden');
        const errorBoundary = document.getElementById('error-boundary');
        if (errorBoundary) {
            errorBoundary.classList.remove('hidden');
            const errorMsgEl = errorBoundary.querySelector('#error-message');
            if (errorMsgEl) {
                errorMsgEl.textContent = error.message;
            }
        }
    }
});

// =====================================================
// EXPORTS PARA MÓDULOS EXTERNOS
// =====================================================

export {
    SettingsStateManager,
    SettingsValidator,
    SettingsFormManager,
    SettingsSectionsRenderer,
    SettingsApp
};
