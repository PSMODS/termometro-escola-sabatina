# Termômetro da Escola Sabatina

Um painel interativo para acompanhar os indicadores da Escola Sabatina, incluindo comunhão, presença, pequenos grupos, projetos e ofertas.

## Funcionalidades

- 📊 Visualização em tempo real dos dados
- 📱 Interface responsiva e moderna
- 💾 Armazenamento local (localStorage)
- 📥📤 Exportar/importar dados como arquivos JSON
- 🖨️ Geração de relatórios em PDF
- 🎨 Temas visuais com faces expressivas

## Como usar

1. **Instalação**:
   ```bash
   npm install
   ```

2. **Desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Build para produção**:
   ```bash
   npm run build
   ```

## Estrutura dos dados

O aplicativo acompanha as seguintes métricas:
- 👥 Membros da Igreja e Alunos Presentes
- 📖 Estudaram a Lição
- 🏠 Participaram do PG (Pequeno Grupo)
- 🤝 Realizaram Projetos na Semana
- 📚 Deram Estudos Bíblicos
- 💰 Ofertas

## Armazenamento

Os dados são salvos localmente no navegador. Use as funções de exportar/importar no modal de configurações para backup e compartilhamento.

## Tecnologias

- React + TypeScript
- Vite
- Tailwind CSS
- Lucide Icons
- html2canvas + jsPDF
