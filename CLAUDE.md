# roo-calc

Calculadora de defesa do Ragnarok Origin, inspirada em https://roo-calc.vercel.app/, com
persistência dos inputs, botão de salvar snapshot e gráficos de acompanhamento, tudo em
**cookies** do navegador. Visual imita as janelas do cliente clássico do Ragnarok sobre a
arte da War of Emperium. Site estático, sem backend.

Caminho: `C:\Users\marci_97plfk7\source\repos\marcianoandrade\roo-calc`.
Leia o `README.md` para a visão geral e o formato dos cookies.

## Stack e comandos

- React 19 + TypeScript + Vite 7; gráficos com Recharts 3; testes com Vitest 3 (jsdom).
- `npm run dev` (porta 5173) · `npm test` · `npm run build` (roda `tsc --noEmit` antes).
- Sem ESLint/Prettier configurados; siga o estilo dos arquivos existentes (aspas simples,
  ponto e vírgula, 2 espaços, largura ~120).

## Estrutura

- `src/lib/` — lógica pura, sem React (exceto `history.ts`, que tem os hooks):
  `defense.ts` (fórmulas e patamares), `cookies.ts` (store com chunking), `codec.ts`
  (serialização compacta), `persistence.ts` (codecs + chaves de cookie + layout legado),
  `share.ts` (texto do botão Share + cópia para o clipboard), `format.ts`.
- `src/components/` — `DefenseCalculator` monta as janelas; `RoWindow` é a moldura
  estilo RO; `Field` tem `StatRow` e `Meter`; `TierPanel` (nome do patamar, barra e
  tabela de patamares no hover); `TrendChart`, `HistoryTable`, `SaveControls`,
  `ShareButton`.
- Repositório **público** desde 05/09/2026 (só o Marciano tem push). README em inglês
  com resumo em português; screenshot em `docs/screenshot.jpg`.
- `src/styles.css` — CSS único com o tema RO (prefixo `ro-`). Fundo fixo:
  `public/bg/prontera.jpg` (arte enviada pelo Marciano). Janelas lado a lado na
  `.ro-grid` têm a mesma altura (ele pediu isso explicitamente).
- O botão Share **só escreve** no clipboard; nunca ler o clipboard (dispara pedido de
  permissão do navegador, que ele não quer).
- Escopo decidido pelo Marciano (05/09/2026): **só Raw PDEF/MDEF importam**. Sem aba
  PvP, sem campos de Ignore DEF, sem janela de guia. Não reintroduzir sem ele pedir.

## Regras do projeto

- **Fórmulas são um port fiel do site original.** Não "corrigir" a matemática por conta
  própria; mudanças de fórmula só a pedido, com teste atualizado.
- **Ordem dos campos gravados é contrato:** `DEFENSE_FIELDS` (`defense.ts`) define o
  layout dos cookies. Nunca reordene nem remova; campo novo entra no final com default.
  Chave de cookie descontinuada vai para `LEGACY_COOKIE_KEYS` (é apagada ao abrir).
- **Orçamento de cookies:** máx. 8 chunks × 3000 chars por chave e 80 snapshots
  (`MAX_HISTORY`). Não aumente sem considerar o tamanho do header HTTP.
- UI em três idiomas (en, pt-BR, es) via `src/i18n/`: `en.ts` é a referência; `pt-BR.ts`
  e `es.ts` precisam ter as mesmas chaves (tipo `Messages` + teste). Texto novo na UI
  entra sempre nos três arquivos; nada de string solta em componente. Inglês é o padrão
  (sem detecção pelo navegador, decisão do Marciano em 05/09/2026); a escolha nas
  bandeirinhas fica em `roo.lang`. O texto do Share ("Raw Pdef: ...") não é
  traduzido, é o formato pedido para o chat do jogo. Documentação e commits em português.
- Licença MIT (`LICENSE`, `package.json`).
- Hospedado na Vercel (deploy automático a cada push na `main`). `@vercel/analytics`
  (`<Analytics />` em `main.tsx`, só em produção) conta visitas; não adicionar outro
  rastreador nem enviar os valores digitados para lugar nenhum.
- Toda função nova em `src/lib/` precisa de teste em `*.test.ts` ao lado.
- Gráficos: cores das séries fixas em `SERIES_COLORS` (`TrendChart.tsx`), validadas para
  daltonismo no fundo claro `#fbfcfd`. Um eixo Y só; sem eixo duplo.
- Rodapé (caixa de chat) deve manter o link para a página original e para o repositório.
