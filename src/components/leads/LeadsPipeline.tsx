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

  const getTotalValue = (leads: any[]) => {
    return leads.reduce((sum, lead) => sum + (lead.deal_value || 0), 0);
  };

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <Droppable key={stage.id} droppableId={stage.id}>
              {(provided, snapshot) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    flex-shrink-0 w-80 bg-neutral-900 border rounded-2xl overflow-hidden
                    ${snapshot.isDraggingOver ? 'border-emerald-500 bg-emerald-500/5' : 'border-neutral-800'}
                  `}
                >
                  {/* Stage Header */}
                  <div className={`p-4 border-b border-neutral-800 bg-gradient-to-r ${stage.color}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white">{stage.name}</h3>
                      <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-semibold text-white">
                        {stage.leads.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${getTotalValue(stage.leads).toLocaleString()}
                      </div>
                      <button className="p-1 hover:bg-white/10 rounded transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Leads List */}
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="p-4 space-y-3 min-h-[500px] max-h-[calc(100vh-300px)] overflow-y-auto"
                  >
                    <AnimatePresence>
                      {stage.leads.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.8 : 1,
                              }}
                            >
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className={`
                                  ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-emerald-500' : ''}
                                `}
                              >
                                <LeadCard lead={lead} delay={index * 0.05} />
                              </motion.div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                    
                    {stage.leads.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <p className="text-sm">Nenhum lead nesta etapa</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
