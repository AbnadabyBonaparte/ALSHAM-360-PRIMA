import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

// Middleware para servir arquivos estáticos da pasta 'dist'
// A opção 'extensions' permite que o Express encontre 'login.html' quando a requisição é para '/login'
app.use(express.static(DIST_DIR, { extensions: ['html'] }));

// Rota de fallback para servir o index.html principal para a raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

// Tratamento para rotas não encontradas, resultando em um 404 real
app.use((req, res) => {
  res.status(404).send('404: Página não encontrada');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Express para MPA rodando na porta ${PORT}`);
});
