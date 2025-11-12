// src/components/leads/LeadsPipeline.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, TrendingUp, DollarSign } from 'lucide-react';
import LeadCard from './LeadCard';

interface Stage {
  id: string;
  name: string;
  color: string;
  leads: any[];
}

interface LeadsPipelineProps {
  stages: Stage[];
  onLeadMove?: (leadId: string, newStageId: string) => void;
}

export default function LeadsPipeline({ stages: initialStages, onLeadMove }: LeadsPipelineProps) {
  const [stages, setStages] = useState(initialStages);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStage = stages.find(s => s.id === source.droppableId);
    const destStage = stages.find(s => s.id === destination.droppableId);
    if (!sourceStage || !destStage) return;

    // Remove from source
    const newSourceLeads = Array.from(sourceStage.leads);
    const [movedLead] = newSourceLeads.splice(source.index, 1);

    // Add to destination
    const newDestLeads = Array.from(destStage.leads);
    newDestLeads.splice(destination.index, 0, movedLead);

    // Update stages
    const newStages = stages.map(stage => {
      if (stage.id === source.droppableId) {
        return { ...stage, leads: newSourceLeads };
      }
      if (stage.id === destination.droppableId) {
        return { ...stage, leads: newDestLeads };
      }
      return stage;
    });

    setStages(newStages);
    onLeadMove?.(draggableId, destination.droppableId);
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 FIX: ADICIONAR NOVO LEAD NO STAGE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleAddLead = (stageId: string) => {
    console.log('➕ Adicionar lead ao stage:', stageId);
    // TODO: Abrir modal de criação de lead com status pré-selecionado
    const leadName = prompt(`Criar novo lead no stage "${stages.find(s => s.id === stageId)?.name}".\n\nNome do lead:`);
    if (!leadName) return;

    const newLead = {
      id: `temp-${Date.now()}`,
      nome: leadName,
      email: '',
      empresa: '',
      status: stageId,
      score_ia: 50,
      created_at: new Date().toISOString()
    };

    const newStages = stages.map(stage => {
      if (stage.id === stageId) {
        return { ...stage, leads: [...stage.leads, newLead] };
      }
      return stage;
    });

    setStages(newStages);
    // TODO: Salvar no banco de dados
    alert(`Lead "${leadName}" criado! (Salvar no banco em breve)`);
  };

  const getTotalValue = (leads: any[]) => {
    return leads.reduce((sum, lead) => sum + (lead.deal_value || 0), 0);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <Droppable key={stage.id} droppableId={stage.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-shrink-0 w-80 ${snapshot.isDraggingOver ? 'bg-[var(--neutral-gray-800-50)] rounded-lg' : ''}`} // AJUSTE: Vars
              >
                {/* Stage Header */}
                <div className="bg-[var(--neutral-800)] rounded-t-lg p-4 border-b border-[var(--neutral-700)]"> // AJUSTE: Vars
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[var(--text-white)]">{stage.name}</h3> // AJUSTE: Var
                    <span className="text-xs text-[var(--text-gray-400)]">{stage.leads.length}</span> // AJUSTE: Var
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[var(--text-gray-400)]"> // AJUSTE: Var
                    <DollarSign className="w-3 h-3" />
                    <span>{getTotalValue(stage.leads).toLocaleString()}</span>
                  </div>
                </div>

                {/* Add Lead Button */}
                <button
                  onClick={() => handleAddLead(stage.id)}
                  className="p-1 hover:bg-[var(--text-white-10)] rounded transition-colors" // AJUSTE: Var
                  title={`Adicionar lead em ${stage.name}`}
                >
                  <Plus className="w-4 h-4 text-[var(--text-gray-400)]" /> // AJUSTE: Var
                </button>

                {/* Leads List */}
                <div className="space-y-2 p-2">
                  {stage.leads.map((lead, index) => (
                    <Draggable key={lead.id} draggableId={lead.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`transition-all ${snapshot.isDragging ? 'rotate-12' : ''}`}
                        >
                          <LeadCard lead={lead} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>

                {stage.leads.length === 0 && (
                  <div className="text-center py-8 text-[var(--text-gray-500)]"> // AJUSTE: Var
                    Nenhum lead nesta etapa
                  </div>
                )}

                {stage.leads.length === 0 && (
                  <button
                    onClick={() => handleAddLead(stage.id)}
                    className="w-full mt-2 px-4 py-2 bg-[var(--accent-emerald-10)] border border-[var(--accent-emerald-20)] text-[var(--accent-emerald)] rounded-lg text-sm hover:bg-[var(--accent-emerald-20)] transition-colors inline-flex items-center gap-2" // AJUSTE: Vars
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar primeiro lead
                  </button>
                )}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
