# roo-calc

Calculadora de defesa do **Ragnarok Origin** (réplica de <https://roo-calc.vercel.app/>) com
três adições:

- **Lembra o que você digitou por último** (todas as abas e a aba ativa).
- **Botão "Save snapshot"** que grava um registro com data, rótulo opcional e os valores do momento.
- **Gráficos de acompanhamento** gerados a partir dos snapshots, com tabela para carregar/excluir.

Tudo é gravado **em cookies** do navegador (nenhum servidor envolvido).

## Abas

| Aba | O que calcula | O que o snapshot guarda |
|-----|---------------|-------------------------|
| **Defense Calculator** | Raw PDEF/MDEF (`DEF / (1 + DEF%)`), DEF após Ignore, referência de redução | Os 8 inputs (os resultados são recalculados na hora). "Load" restaura os inputs. |
| **PvP Counter Lab** | Estimativa de dano físico/mágico, camadas de DEF, tamanho, raça, elemento e PvP | Estimativas de dano, % de dano que passa pela DEF e RAW DEF. |

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest (fórmulas, codecs, cookies)
npm run build      # tsc --noEmit + vite build -> dist/
npm run preview    # serve o build
```

Deploy: é um site estático (Vite). Na Vercel basta importar o repositório; o preset
"Vite" já usa `npm run build` e publica `dist/`.

## Como os cookies são usados

Todos os cookies têm prefixo `roo.`, `SameSite=Lax`, `path=/` e validade de 1 ano.

| Cookie | Conteúdo |
|--------|----------|
| `roo.tab` | Aba ativa |
| `roo.def.inputs` | Últimos inputs da Defense Calculator |
| `roo.def.history` | Snapshots da Defense Calculator |
| `roo.pvp.inputs` | Últimos inputs do PvP Counter Lab |
| `roo.pvp.history` | Snapshots do PvP Counter Lab |

Detalhes de implementação (`src/lib/cookies.ts`, `src/lib/codec.ts`):

- Um cookie aguenta ~4 KB, então cada chave é dividida em `chave.0`, `chave.1`, ... com a
  contagem em `chave.n` (máximo 8 pedaços de 3000 caracteres).
- Os registros usam um formato compacto (`campo|campo|...` e `registro~registro`) em vez de
  JSON, porque JSON escapado para cookie fica ~3x maior.
- Histórico limitado a **80 snapshots por aba**; ao passar disso o mais antigo é descartado.
  O limite existe porque o navegador envia todos os cookies em cada requisição, e headers
  muito grandes são rejeitados por servidores/CDNs.
- **A ordem dos campos em `DEFENSE_FIELDS` e `PVP_FIELDS` faz parte do formato gravado.**
  Nunca reordene; para adicionar campo, acrescente no final.

## Estrutura

```
src/
  lib/
    defense.ts       fórmulas da Defense Calculator
    pvp.ts           fórmulas do PvP Counter Lab
    cookies.ts       store chave/valor em cookies (chunking, escape)
    codec.ts         serialização compacta de registros
    history.ts       hooks useCookieState / useCookieHistory
    persistence.ts   codecs de cada tela + nomes dos cookies
    format.ts        formatação de números e datas
    *.test.ts        testes (vitest + jsdom)
  components/
    DefenseCalculator.tsx, PvpCounterLab.tsx   telas
    TrendChart.tsx   gráfico de linhas (Recharts)
    HistoryTable.tsx tabela de snapshots (load / delete / clear)
    SaveControls.tsx rótulo + botão salvar + feedback
    Field.tsx, LabControls.tsx, StatsGuide.tsx
  App.tsx, main.tsx, styles.css
```

## Stack

React 19 · TypeScript · Vite 7 · Recharts 3 · Vitest 3 (jsdom).
