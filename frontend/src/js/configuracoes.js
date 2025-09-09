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
// 0. IMPORTAÇÕES DE DEPENDÊNCIAS (Adicionado)
// =====================================================
// Importa as classes base necessárias do módulo principal de automação
// (Assumindo que o arquivo anterior se chama 'automationApp.js' e exporta essas classes)
import {
    StateManager,
    DataValidator,
    AutomationApp,
    APIClient,
    ErrorTracker,
    NotificationManager
} from './automationApp.js'; // Ajuste o caminho se necessário


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
            // 'permissions' já existe no construtor, não precisa redeclarar
        };
    }

    /**
     * Carrega configurações do servidor
     */
    async loadSettings() {
        try {
            this.setState('ui', { ...this.state.ui, loading: true });
            
            const [settings, permissions] = await Promise.all([
                window.apiClient.get('/api/settings', { cache: true, ttl: 60000 }), // Corrigido: usa instância global
                window.apiClient.get('/api/settings/permissions', { cache: true, ttl: 300000 })
            ]);
            
            this.setState('settings', settings);
            this.setState('permissions', permissions);
            
            // Armazena estado original para comparação
            this.originalState = JSON.parse(JSON.stringify(settings));
            
            this.setState('ui', { ...this.state.ui, loading: false });
            
        } catch (error) {
            window.errorTracker.captureError(error, { // Corrigido: usa instância global
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
            
            window.errorTracker.captureError(error, { // Corrigido: usa instância global
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
            await window.apiClient.put('/api/settings/batch', changedSettings); // Corrigido: usa instância global
            
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
            window.errorTracker.captureError(error, { // Corrigido: usa instância global
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
            await window.apiClient.post('/api/audit/settings', { // Corrigido: usa instância global
                action: 'settings_updated',
                changes: changes,
                timestamp: new Date().toISOString(),
                user_id: window.stateManager.getState('user')?.id, // Corrigido
                ip_address: await this.getClientIP()
            });
        } catch (error) {
            console.warn('Failed to log settings change:', error);
        }
    }

    async getClientIP() {
        try {
            // API pública para IP
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
class SettingsValidator extends DataValidator { // Depende de DataValidator importado
    
    /**
     * Valida configuração por seção
     * @param {string} section - Seção da configuração
     * @param {string} key - Chave da configuração
     * @param {*} value - Valor a validar
     * @returns {Object} Resultado da validação
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
                        pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/ // Permite apóstrofos e hífens
                    });
                    return validation;
                },
                email: async (value) => {
                    const validation = this.validateEmail(value);
                    if (validation.isValid) {
                        // Verifica se email já existe
                        try {
                            const exists = await window.apiClient.get(`/api/users/email-exists?email=${encodeURIComponent(value)}`);
                            if (exists.exists && exists.userId !== window.stateManager.getState('user')?.id) {
                                return { isValid: false, errors: ['Email já está em uso'], sanitized: validation.sanitized };
                            }
                        } catch (error) {
                            console.warn('Failed to check email uniqueness:', error);
                        }
                    }
                    return validation;
                },
                phone: async (value) => {
                    if (!value) return { isValid: true, errors: [], sanitized: '' };
                    
                    const phoneRegex = /^\+?[\d\s\-\(\)]{10,20}$/;
                    const sanitized = this.sanitizeHTML(value);
                    
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
                        // Fallback for browsers que não suportam Intl.supportedValuesOf
                        console.warn("Browser não suporta API Intl TimeZone validation.");
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
                    if (!value) return { isValid: true, errors: [], sanitized: '' };
                    
                    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/;
                    const sanitized = this.sanitizeHTML(value);
                    
                    const isValid = domainRegex.test(sanitized);
                    return {
                        isValid,
                        errors: isValid ? [] : ['Formato de domínio inválido'],
                        sanitized
                    };
                },
                industry: async (value) => {
                    const validIndustries = [
                        'technology', 'finance', 'healthcare', 'education', 
                        'retail', 'manufacturing', 'consulting', 'other'
                    ];
                    const isValid = validIndustries.includes(value);
                    return {
                        isValid,
                        errors: isValid ? [] : ['Setor inválido'],
                        sanitized: value
                    };
                }
            },
            security: {
                password: async (value) => {
                    if (!value) return { isValid: true, errors: [], sanitized: '' }; // Não valida se vazio (só valida se preenchido)
                    
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
                        sanitized: value // Senha não deve ser sanitizada
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
     * @returns {boolean} True se é comum
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
            if (!response.ok) throw new Error('Failed to fetch pwned passwords API');
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
     * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} field - Campo alterado
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
        if (section && key && window.settingsStateManager) {
            window.settingsStateManager.updateSetting(section, key, this.getFieldValue(field));
        }
    }

    /**
     * Valida campo específico
     * @param {string} formId - ID do formulário
     * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} field - Campo a validar
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
            this.showFieldError(field, ['Erro inesperado na validação']);
            window.errorTracker.captureError(error, { // Corrigido: usa instância global
                component: 'SettingsFormManager', 
                action: 'validateField',
                formId,
                fieldName: field.name
            });
        }
    }

    /**
     * Obtém valor do campo baseado no tipo
     * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} field - Campo
     * @returns {*} Valor do campo
     */
    getFieldValue(field) {
        switch (field.type) {
            case 'checkbox':
                return (field).checked;
            case 'radio':
                return (field).checked ? (field).value : null;
            case 'number':
                return parseFloat((field).value) || 0;
            case 'file':
                return (field).files ? (field).files[0] : null;
            default:
                return (field).value.trim();
        }
    }

    /**
     * Parse nome do campo para seção e chave
     * @param {string} fieldName - Nome do campo
     * @returns {Array<string|null>} [section, key]
     */
    parseFieldName(fieldName) {
        const parts = fieldName.split('.');
        return parts.length >= 2 ? [parts[0], parts.slice(1).join('.')] : [null, null];
    }

    /**
     * Exibe erro no campo
     * @param {HTMLElement} field - Campo com erro
     * @param {Array<string>} errors - Lista de erros
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
        field.setAttribute('aria-describedby', (field.getAttribute('aria-describedby') || '') + ' ' + errorId);
    }

    /**
     * Remove erro do campo
     * @param {HTMLElement} field - Campo
     */
    clearFieldError(field) {
        const container = field.closest('.form-field') || field.parentElement;
        if (!container) return;
        
        // Remove elementos de erro
        container.querySelectorAll('.field-error').forEach(el => el.remove());
        
        // Remove classes de erro
        field.classList.remove('border-red-500', 'focus:ring-red-500');
        field.setAttribute('aria-invalid', 'false');
        
        // Remove descrições de erro do aria-describedby
        const describedBy = field.getAttribute('aria-describedby');
        if (describedBy) {
            const newDescribedBy = describedBy.split(' ').filter(id => !id.endsWith('-error')).join(' ');
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
            (submitBtn).disabled = !isValid;
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
                setTimeout(() => announcer.textContent = '', 2000); // Limpa após 2s
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
            window.notificationManager.error('Corrija os erros no formulário antes de salvar.');
            return;
        }
        
        try {
            await window.settingsStateManager.saveAllSettings();
            window.notificationManager.success('Configurações salvas com sucesso!');
            
        } catch (error) {
            window.notificationManager.error(error.message || 'Erro ao salvar configurações');
            window.errorTracker.captureError(error, { 
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
            window.errorTracker.captureError(error, { // Corrigido: usa instância global 
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
                                ${data.avatar ? `<img src="${data.avatar}" alt="Avatar" class="w-20 h-20 rounded-full object-cover">` : (DataValidator.sanitizeHTML(data.name?.charAt(0) || 'U'))}
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
                                <p class="text-xs text-gray-500 mt-1">JPG, PNG até 5MB</p>
                            </div>
                        </div>
                    </div>

                                        <div class="form-field">
