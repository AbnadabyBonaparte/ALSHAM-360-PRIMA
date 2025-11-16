// src/components/leads/LeadsPipeline.tsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, DollarSign } from 'lucide-react';
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

    const newSourceLeads = Array.from(sourceStage.leads);
    const [movedLead] = newSourceLeads.splice(source.index, 1);

    const newDestLeads = Array.from(destStage.leads);
    newDestLeads.splice(destination.index, 0, movedLead);

    const newStages = stages.map(stage => {
      if (stage.id === source.droppableId) return { ...stage, leads: newSourceLeads };
      if (stage.id === destination.droppableId) return { ...stage, leads: newDestLeads };
      return stage;
    });

    setStages(newStages);
    onLeadMove?.(draggableId, destination.droppableId);
  };

  const handleAddLead = (stageId: string) => {
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
      if (stage.id === stageId) return { ...stage, leads: [...stage.leads, newLead] };
      return stage;
    });

    setStages(newStages);
    alert(`Lead "${leadName}" criado!`);
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
                className="flex-shrink-0 w-80"
                style={snapshot.isDraggingOver ? { backgroundColor: 'rgba(122, 143, 128, 0.1)', borderRadius: '8px' } : {}}
              >
                <div className="bg-[var(--surface-strong)] rounded-t-lg p-4 border-b border-[var(--border)]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[var(--text-primary)]">{stage.name}</h3>
                    <span className="text-xs text-[var(--text-secondary)]">{stage.leads.length}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                    <DollarSign className="w-3 h-3" />
                    <span>{getTotalValue(stage.leads).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddLead(stage.id)}
                  className="p-1 hover:opacity-70 rounded transition-opacity"
                  title={`Adicionar lead em ${stage.name}`}
                >
                  <Plus className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>

                <div className="space-y-2 p-2">
                  {stage.leads.map((lead, index) => (
                    <Draggable key={lead.id} draggableId={lead.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="transition-all"
                          style={{
                            ...provided.draggableProps.style,
                            transform: snapshot.isDragging ? 'rotate(2deg)' : provided.draggableProps.style?.transform
                          }}
                        >
                          <LeadCard lead={lead} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>

                {stage.leads.length === 0 && (
                  <div className="text-center py-8 text-[var(--text-secondary)]">
                    Nenhum lead nesta etapa
                    <button
                      onClick={() => handleAddLead(stage.id)}
                      className="w-full mt-2 px-4 py-2 border border-[var(--border)] rounded-lg text-sm hover:opacity-80 transition-opacity inline-flex items-center justify-center gap-2"
                      style={{ backgroundColor: 'rgba(122, 143, 128, 0.1)', color: 'var(--accent-emerald)' }}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar primeiro lead
                    </button>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
