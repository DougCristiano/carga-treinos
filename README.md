# Carga — gerenciador de treinos

App web mobile-first para montar fichas, executar treinos e acompanhar a evolução.
Roda 100% no navegador (sem backend): os dados ficam no `localStorage` e o build
estático funciona no GitHub Pages.

## Funcionalidades

- **Início**: contador de treinos, lembrete fixo do vencimento da série (padrão 15/11/2026),
  treino do dia sugerido pela rotação A → B → C e atalhos.
- **Fichas e exercícios**: criar, editar e excluir fichas e exercícios. Cada exercício
  pode ter uma demonstração vinda da base aberta [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
  (busca em português: "supino", "puxada", "rosca"...; as duas fotos alternam como GIF)
  ou de qualquer URL de imagem/GIF, com atalho para procurar GIFs na web.
- **Execução com acordeão**: cada exercício começa fechado; ao marcar a última série o
  card fecha sozinho e fica verde com check. Cronômetro de descanso automático.
- **Encerramento**: escala de esforço de 1 a 5.
- **Evolução**: carga máxima, reps e volume por exercício; treinos e tonelagem por
  semana/mês; histórico de esforço; histórico detalhado com exclusão.
- **Backup**: exportar/importar JSON nas Configurações.

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
npm run preview  # serve o build
```

## Publicar no GitHub Pages

1. Crie um repositório e envie o projeto para a branch `main`.
2. Em **Settings > Pages**, escolha **Source: GitHub Actions**.
3. O workflow `.github/workflows/deploy.yml` builda e publica a cada push.

O `vite.config.js` usa `base: './'` e o app navega por hash (`#inicio`, `#treino`,
`#exercicios`, `#evolucao`), então funciona em qualquer caminho sem configuração.

## Trocar a data da série

Edite `src/config/app.config.js`:

```js
export const SERIES = { label: 'Série atual', dueDate: '2026-11-15' };
```

Também dá para ajustar pelo app (Início > Alterar data da série).

## Estrutura

```
src/
  config/app.config.js     data da série, chave de armazenamento, escala de esforço
  data/seed.js             exercícios, fichas iniciais e histórico de exemplo
  data/muscles.js          grupos musculares e tradução PT -> EN para a busca
  data/exerciseIndex.json  índice da base aberta de exercícios (876 itens)
  lib/                     armazenamento, datas, estatísticas, mídia
  store/StoreProvider.jsx  estado global + persistência no localStorage
  components/              UI reutilizável (anilha, acordeão, gráficos, editores)
  pages/                   Início, Treinar, Fichas, Evolução
```

O histórico de exemplo (marcado como `demo`) é apagado automaticamente quando você
salva o primeiro treino real, ou manualmente em Configurações.
