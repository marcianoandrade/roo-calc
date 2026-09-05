# roo-calc

Calculadora de defesa do Ragnarok Origin (réplica de https://roo-calc.vercel.app/) com
persistência dos inputs, botão de salvar snapshot e gráficos de acompanhamento, tudo em
**cookies** do navegador. Site estático, sem backend.

Caminho: `C:\Users\marci_97plfk7\source\repos\marcianoandrade\roo-calc`.
Leia o `README.md` para a visão geral e o formato dos cookies.

## Stack e comandos

- React 19 + TypeScript + Vite 7; gráficos com Recharts 3; testes com Vitest 3 (jsdom).
- `npm run dev` (porta 5173) · `npm test` · `npm run build` (roda `tsc --noEmit` antes).
- Sem ESLint/Prettier configurados; siga o estilo dos arquivos existentes (aspas simples,
  ponto e vírgula, 2 espaços, largura ~120).

## Estrutura

- `src/lib/` — lógica pura, sem React (exceto `history.ts`, que tem os hooks):
  `defense.ts`, `pvp.ts` (fórmulas), `cookies.ts` (store com chunking),
  `codec.ts` (serialização compacta), `persistence.ts` (codecs por tela + chaves),
  `format.ts`.
- `src/components/` — telas (`DefenseCalculator`, `PvpCounterLab`) e peças
  (`TrendChart`, `HistoryTable`, `SaveControls`, `Field`, `LabControls`, `StatsGuide`).
- `src/styles.css` — CSS único; a parte original do site vem primeiro, o que foi
  adicionado está sob "Save row + tracking (new)".

## Regras do projeto

- **Fórmulas são um port fiel do site original.** Não "corrija" a matemática por conta
  própria; mudanças de fórmula só a pedido, com teste atualizado.
- **Ordem dos campos gravados é contrato:** `DEFENSE_FIELDS` (`defense.ts`),
  `PVP_FIELDS` (`pvp.ts`) e `PVP_SNAPSHOT_FIELDS` (`persistence.ts`) definem o layout dos
  cookies. Nunca reordene nem remova; campo novo entra no final com default.
- **Orçamento de cookies:** máx. 8 chunks × 3000 chars por chave e 80 snapshots por aba
  (`MAX_HISTORY`). Não aumente sem considerar o tamanho do header HTTP.
- UI em inglês (igual ao site original); documentação e commits em português.
- Toda função nova em `src/lib/` precisa de teste em `*.test.ts` ao lado.
- Gráficos: cores das séries fixas em `SERIES_COLORS` (`TrendChart.tsx`), validadas para
  daltonismo no fundo `#0c1223`. Um eixo Y só; sem eixo duplo.
