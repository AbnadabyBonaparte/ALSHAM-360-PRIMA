// src/components/ThemeSwitcher.tsx
// ⚜️ ALSHAM 360° PRIMA - Theme Switcher Supremo
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { themes, type ThemeKey } from "@/lib/themes";

const themeList = Object.values(themes);

export function ThemeSwitcher() {
  const { currentTheme, setTheme } = useTheme();

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
          Escolha sua Dimensão
        </h2>
        <p className="text-[var(--text-secondary)]">
          6 universos visuais criados para sua obsessão por resultados
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {themeList.map((theme, index) => {
          const isActive = currentTheme === theme.key;

          return (
            <motion.button
              key={theme.key}
              onClick={() => setTheme(theme.key as ThemeKey)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-500 ${
                isActive
                  ? "border-[var(--accent-primary)] shadow-2xl shadow-[var(--accent-primary)]/30"
                  : "border-[var(--border)]/50 hover:border-[var(--accent-primary)]/40"
              }`}
            >
              {/* Background com swatch animado */}
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  background: theme.swatch,
                  backgroundSize: "200% 200%",
                  animation: isActive ? "gradientShift 8s ease infinite" : "none",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40" />

              {/* Glow pulsante no ativo */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(var(--accent-primary-rgb), 0.4)",
                      "0 0 40px rgba(var(--accent-primary-rgb), 0.6)",
                      "0 0 20px rgba(var(--accent-primary-rgb), 0.4)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    boxShadow: "0 0 30px rgba(var(--accent-primary-rgb), 0.5)",
                  }}
                />
              )}

              {/* Conteúdo */}
              <div className="relative p-6 sm:p-8 text-left">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl sm:text-5xl">{theme.emoji}</span>
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs font-bold uppercase tracking-wider text-white bg-[var(--accent-primary)]/80 px-3 py-1 rounded-full"
                    >
                      Ativo
                    </motion.span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {theme.name}
                </h3>
                <p className="text-sm text-white/80">{theme.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Estilo global para animação do gradient (adicione no themes.css ou index.css) */}
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
