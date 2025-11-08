// src/hooks/useLeadsAI.ts
import { useState, useEffect, useCallback } from 'react';
import { leadsService } from '../services/leads.service';

export function useLeadsAI() {
  const [leads, setLeads] = useState<any[]>([]);
  const [enrichedLeads, setEnrichedLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [filters, setFilters] = useState<any>({});

  // Load leads with AI enrichment
  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const result = await leadsService.getLeadsIntelligent(filters);
      if (result.success) {
        setLeads(result.data);
        setEnrichedLeads(result.enriched);
        
        // Calculate analytics
        const analyticsData = await leadsService.getAnalytics(result.enriched);
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = leadsService.subscribe(() => {
      loadLeads();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadLeads]);

  // Filter leads
  const applyFilters = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  // Get lead by ID with AI data
  const getLeadById = useCallback((id: string) => {
    return enrichedLeads.find(lead => lead.id === id);
  }, [enrichedLeads]);

  // Filter by AI criteria
  const filterByAI = useCallback((criteria: string) => {
    switch (criteria) {
      case 'hot':
        return enrichedLeads.filter(l => (l.ai_conversion_probability || 0) > 70);
      case 'at_risk':
        return enrichedLeads.filter(l => (l.ai_risk_score || 0) > 60);
      case 'urgent':
        return enrichedLeads.filter(l => l.ai_priority?.includes('P0') || l.ai_priority?.includes('P1'));
      case 'needs_followup':
        const daysSince = (date: string) => {
          if (!date) return 999;
          return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
        };
        return enrichedLeads.filter(l => daysSince(l.last_contact) > 7 && (l.ai_conversion_probability || 0) > 50);
      default:
        return enrichedLeads;
    }
  }, [enrichedLeads]);

  return {
    leads,
    enrichedLeads,
    loading,
    analytics,
    loadLeads,
    applyFilters,
    getLeadById,
    filterByAI
  };
}
