# roo-calc

Calculadora de defesa do **Ragnarok Origin**, feita com inspiração na
[Defense Calculator original](https://roo-calc.vercel.app/), com visual das janelas do
cliente clássico do Ragnarok e três adições:

- **Lembra o que você digitou por último.**
- **Botão "Save snapshot"** que grava data, rótulo opcional e os valores do momento.
- **Gráficos de acompanhamento** de Raw PDEF e Raw MDEF ao longo do tempo, com tabela
  para carregar/excluir.

Tudo é gravado **em cookies** do navegador (nenhum servidor envolvido).

## Telas (janelas)

| Janela | Conteúdo |
|--------|----------|
| **Basic Info** | Raw PDEF, Raw MDEF, total, botão **Share** (copia `Raw Pdef: {valor} Raw Mdef: {valor}` para a área de transferência), barra estilo EXP com a classificação atual ("solid tank" etc.) e o próximo patamar, reduções (referência). |
| **Status** | Os 6 inputs (Equipment PDEF/MDEF, PDEF/MDEF %, PDMG/MDMG Reduction), rótulo do snapshot, botões Save/Reset. |
| **Progress tracking** | Dois gráficos: Raw PDEF e Raw MDEF por snapshot. |
| **Saved snapshots** | Tabela com Load (restaura os inputs), Delete e Clear all. |

O rodapé imita a caixa de chat do jogo e traz o link para a página original e para
este repositório. O fundo é sorteado a cada carregamento entre as artes em `public/bg/`
(como as telas de login do cliente clássico).

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
| `roo.def.inputs` | Últimos inputs digitados |
| `roo.def.history` | Snapshots salvos |

Detalhes de implementação (`src/lib/cookies.ts`, `src/lib/codec.ts`):

- Um cookie aguenta ~4 KB, então cada chave é dividida em `chave.0`, `chave.1`, ... com a
  contagem em `chave.n` (máximo 8 pedaços de 3000 caracteres).
- Os registros usam um formato compacto (`campo|campo|...` e `registro~registro`) em vez de
  JSON, porque JSON escapado para cookie fica ~3x maior.
- Histórico limitado a **80 snapshots**; ao passar disso o mais antigo é descartado.
  O limite existe porque o navegador envia todos os cookies em cada requisição, e headers
  muito grandes são rejeitados por servidores/CDNs.
- **A ordem dos campos em `DEFENSE_FIELDS` faz parte do formato gravado.** Nunca reordene;
  para adicionar campo, acrescente no final. O layout da primeira versão (8 campos, com
  Ignore PDEF/MDEF) continua sendo lido (`LEGACY_DEFENSE_FIELDS_V1`).
- Cookies de versões anteriores da página (`roo.tab`, `roo.pvp.*`) são apagados ao abrir.

## Estrutura

```
public/bg/               artes de fundo (woe.jpg, castle.jpg, party.jpg)
src/
  lib/
    defense.ts           fórmulas e patamares (port fiel do site original)
    background.ts        sorteio da arte de fundo
    cookies.ts           store chave/valor em cookies (chunking, escape)
    codec.ts             serialização compacta de registros
    history.ts           hooks useCookieState / useCookieHistory
    persistence.ts       codecs dos inputs/snapshots + nomes dos cookies
    format.ts            formatação de números e datas
    *.test.ts            testes (vitest + jsdom)
  components/
    DefenseCalculator.tsx  monta as janelas
    RoWindow.tsx           janela estilo cliente RO (barra de título + corpo)
    Field.tsx              StatRow (linha da janela Status) e Meter (barra HP/EXP)
    TrendChart.tsx         gráfico de linhas (Recharts)
    HistoryTable.tsx       tabela de snapshots (load / delete / clear)
    SaveControls.tsx       rótulo + botão salvar + feedback
  App.tsx, main.tsx, styles.css
```

## Stack

React 19 · TypeScript · Vite 7 · Recharts 3 · Vitest 3 (jsdom).

Ferramenta feita por fã. Ragnarok Online e suas artes são © Gravity Co., Ltd.
