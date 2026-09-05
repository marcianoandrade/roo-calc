# roo-calc

Calculadora de defesa do **Ragnarok Origin** (site estático, sem backend), inspirada em
https://roo-calc.vercel.app/. Converte Equipment PDEF/MDEF em **Raw PDEF/MDEF**, lembra os
inputs, salva snapshots com gráficos de acompanhamento e copia o resultado para o chat do
jogo, tudo em **cookies** do navegador. Visual imita as janelas do cliente clássico do
Ragnarok sobre uma arte de Prontera. Interface em inglês, português (BR) e espanhol.

- Caminho: `C:\Users\marci_97plfk7\source\repos\marcianoandrade\roo-calc`
  (aberto pelo `roocalc.bat` da pasta Assistente).
- Repositório **público**: https://github.com/marcianoandrade/roo-calc — só o Marciano
  tem push. Licença MIT. Push é feito por ele, salvo pedido explícito.
- Produção na **Vercel**, deploy automático a cada push na `main`.
- Leia o `README.md` (inglês + resumo em português) para a visão geral e o formato dos
  cookies; screenshot em `docs/screenshot.jpg`.

## Stack e comandos

- React 19 + TypeScript + Vite 7; gráficos com Recharts 3; testes com Vitest 3 (jsdom);
  `@vercel/analytics` (só em produção).
- `npm run dev` (porta 5173) · `npm test` · `npm run build` (roda `tsc --noEmit` antes).
- Sem ESLint/Prettier configurados; siga o estilo dos arquivos existentes (aspas simples,
  ponto e vírgula, 2 espaços, largura ~120).

## Estrutura

- `src/lib/` — lógica pura, sem React (exceto `history.ts`, que tem os hooks):
  `defense.ts` (fórmulas, patamares, parse com vírgula decimal), `cookies.ts` (store com
  chunking), `codec.ts` (serialização compacta), `persistence.ts` (codecs + chaves de
  cookie + layout legado), `share.ts` (texto do Share + cópia para o clipboard),
  `format.ts` (números/datas por idioma).
- `src/i18n/` — `en.ts` (referência), `pt-BR.ts`, `es.ts`, `index.ts` (tipos, `LOCALES`),
  `LocaleContext.tsx` (`LocaleProvider`/`useLocale`).
- `src/components/` — `DefenseCalculator` monta as janelas; `RoWindow` é a moldura estilo
  RO; `Field` (`StatRow`, `Meter`); `TierPanel` (patamar, barra e tabela no hover);
  `TrendChart`, `HistoryTable`, `SaveControls` (Calculate/Save/Reset), `ShareButton`,
  `LanguageSwitcher` + `Flags` (bandeirinhas SVG).
- `src/styles.css` — CSS único com o tema RO (prefixo `ro-`). Fundo fixo em
  `public/bg/prontera.jpg`. `src/vite-env.d.ts` dá os tipos de `import.meta.env`.

## Decisões do Marciano (05/09/2026) — não reverter sem ele pedir

- **Só Raw PDEF/MDEF importam.** Sem aba PvP, sem campos de Ignore DEF, sem janela de guia.
- Janela **Status à esquerda, Basic Info à direita**, ambas com a **mesma altura**; sobra de
  altura distribuída entre os blocos, nunca empurrada para baixo.
- **Ordem do Tab na Status:** PDEF, MDEF, PDEF %, MDEF %, PDMG, MDMG. O DOM é em ordem de
  linha e o grid pinta as duas colunas; não usar `tabindex`.
- **Inglês é o idioma padrão** (sem detecção pelo navegador); a escolha nas bandeirinhas
  fica no cookie `roo.lang`.
- Botão **Share** copia `Raw Pdef: {valor} Raw Mdef: {valor}` (formato fixo, não
  traduzido) e **só escreve** no clipboard; nunca ler o clipboard (dispara pedido de
  permissão do navegador, que ele não quer).
- Botão **Calculate** só refaz a conta e dá feedback; digitar continua recalculando ao vivo.
- Rodapé (caixa de chat) mantém o link para a página original e para o repositório.

## Regras do projeto

- **Fórmulas são um port fiel do site original.** Não "corrigir" a matemática por conta
  própria; mudanças só a pedido, com teste atualizado.
- **Ordem dos campos gravados é contrato:** `DEFENSE_FIELDS` (`defense.ts`) define o
  layout dos cookies. Nunca reordene nem remova; campo novo entra no final com default.
  Layout antigo de 8 campos continua legível (`LEGACY_DEFENSE_FIELDS_V1`); chave de cookie
  descontinuada vai para `LEGACY_COOKIE_KEYS` (apagada ao abrir).
- **Orçamento de cookies:** máx. 8 chunks × 3000 chars por chave e 80 snapshots
  (`MAX_HISTORY`). Não aumente sem considerar o tamanho do header HTTP.
- **i18n:** texto novo na UI entra sempre em `en.ts`, `pt-BR.ts` e `es.ts` (o tipo
  `Messages` e um teste garantem as mesmas chaves); nada de string solta em componente.
  Números e datas passam por `format.ts` com o `locale` ativo.
- Toda função nova em `src/lib/` ou `src/i18n/` precisa de teste em `*.test.ts` ao lado.
- Gráficos: cores das séries fixas em `SERIES_COLORS` (`TrendChart.tsx`), validadas para
  daltonismo no fundo claro `#fbfcfd`. Um eixo Y só; sem eixo duplo.
- Analytics: só a Vercel Web Analytics (sem cookies). Não adicionar outro rastreador nem
  enviar os valores digitados para lugar nenhum.
- Documentação e commits em português; a UI segue os dicionários de `src/i18n/`.
