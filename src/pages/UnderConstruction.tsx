// src/pages/UnderConstruction.tsx
import { motion } from 'framer-motion';
import { Construction, ArrowLeft, Calendar, Sparkles } from 'lucide-react';

interface UnderConstructionProps {
  pageName?: string;
}

export default function UnderConstruction({ pageName = "Esta página" }: UnderConstructionProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-12 text-center">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center"
          >
            <Construction className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            {pageName} em Construção
          </h1>
          
          <p className="text-xl text-gray-400 mb-8">
            Estamos trabalhando para trazer esta funcionalidade para você em breve!
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Lançamento previsto</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400">Em breve</span>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Dashboard
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
