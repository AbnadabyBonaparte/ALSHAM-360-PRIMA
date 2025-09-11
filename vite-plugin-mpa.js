// vite-plugin-mpa.js
import { resolve } from 'path';
import fs from 'fs-extra';

export function mpaPlugin() {
  return {
    name: 'mpa-plugin',
    apply: 'build',
    generateBundle(options, bundle) {
      // Lista de páginas que devem ser movidas para a raiz
      const pagesToMove = [
        'dashboard.html',
        'leads.html', 
        'leads-real.html',
        'login.html',
        'register.html',
        'automacoes.html',
        'gamificacao.html',
        'relatorios.html',
        'configuracoes.html'
      ];

      // Encontrar e mover arquivos HTML
      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName];
        
        // Se é um arquivo HTML que está em src/pages/
        if (fileName.includes('src/pages/') && fileName.endsWith('.html')) {
          const baseName = fileName.split('/').pop();
          
          if (pagesToMove.includes(baseName)) {
            // Criar nova entrada na raiz
            bundle[baseName] = {
              ...chunk,
              fileName: baseName
            };
            
            // Remover entrada antiga
            delete bundle[fileName];
          }
        }
      });
    },
    
    writeBundle(options, bundle) {
      // Pós-processamento: garantir que arquivos estão nos lugares corretos
      const outDir = options.dir || 'dist';
      
      const pagesToCheck = [
        'dashboard.html',
        'leads.html',
        'leads-real.html', 
        'login.html',
        'register.html',
        'automacoes.html',
        'gamificacao.html',
        'relatorios.html',
        'configuracoes.html'
      ];

      pagesToCheck.forEach(async (page) => {
        const srcPath = resolve(outDir, 'src', 'pages', page);
        const destPath = resolve(outDir, page);
        
        if (await fs.pathExists(srcPath)) {
          await fs.move(srcPath, destPath, { overwrite: true });
          console.log(`✅ Moved ${page} to root`);
        }
      });
    }
  };
}

