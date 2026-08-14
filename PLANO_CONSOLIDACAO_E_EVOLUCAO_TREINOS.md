# Plano de consolidação e evolução — Treinos.proswap

> Documento de trabalho para agentes de IA na IDE.
>
> Este arquivo deve orientar análise, correção, refatoração e evolução do projeto sem recomeçar a arquitetura, sem copiar literalmente as imagens de referência e sem alterar tudo de uma vez.

---

## 1. Objetivo deste documento

Consolidar o projeto **Treinos.proswap** como a única fonte de verdade após a união de três protótipos anteriores:

- `treinus-app`: base funcional principal;
- `academia-app`: referência de navegação e Docker;
- `academia-app-base`: referência de arquitetura por features, repositories e sincronização.

Os projetos anteriores são apenas referências históricas. Não sincronizar novamente os três projetos e não copiar arquivos antigos sem uma decisão explícita.

O objetivo atual não é reconstruir o aplicativo. É:

1. validar o que já funciona;
2. corrigir inconsistências herdadas da fusão;
3. consolidar documentação e arquitetura;
4. criar uma fundação visual única;
5. melhorar os fluxos atuais;
6. evoluir novas features por módulo.

---

## 2. Estado atual conhecido

### Produto

Aplicativo mobile de treinos, offline-first, feito para uso pessoal e evolução progressiva.

Fluxos existentes ou parcialmente existentes:

- sincronização inicial de exercícios por API;
- persistência local;
- navegação por abas;
- consulta de exercícios;
- agrupamento por frente e costas;
- favoritos;
- criação de treinos;
- seleção dos dias do treino;
- adição de exercícios;
- configuração de séries, repetições, carga e descanso;
- cálculo estimado de métricas.

### Stack atual

- Expo
- React Native
- TypeScript em modo estrito
- React Navigation
- TanStack React Query
- Zustand
- Axios
- SQLite no mobile
- `webStore`/persistência alternativa na web

### Fluxo arquitetural atual

```text
Screen
→ feature/hooks
→ feature/repository ou fachada de casos de uso
→ repositories de persistência
→ SQLite ou webStore
```

Essa arquitetura deve ser preservada nesta etapa. Não realizar nova refatoração macro sem relatório, justificativa e aprovação.

---

## 3. Regras obrigatórias para o agente

### Antes de alterar código

1. Ler este arquivo.
2. Ler o `AGENTS.md`.
3. Ler o `README.md`.
4. Verificar o `git status` e o `git diff`.
5. Abrir somente os arquivos necessários para a fase atual.
6. Apresentar um plano curto antes de editar.
7. Não analisar o repositório inteiro automaticamente.
8. Não usar `@codebase`, pasta inteira ou diff completo sem necessidade.
9. Não alterar mais de um domínio por vez.
10. Não iniciar uma nova fase sem encerrar e validar a anterior.

### Durante as alterações

- Não copiar literalmente as telas das imagens de referência.
- Usar as imagens apenas para estudar:
  - hierarquia;
  - fluxo;
  - espaçamento;
  - composição;
  - tamanho dos elementos;
  - padrões de interação.
- Manter identidade própria:
  - tema escuro;
  - azul como cor principal;
  - cards para grupos musculares no MVP;
  - textos em português do Brasil.
- Evitar alterações cosméticas fora do escopo.
- Não criar abstrações apenas para uso futuro.
- Não duplicar componentes, serviços, hooks ou documentos.
- Não trocar React Navigation por Expo Router.
- Não trocar SQLite ou React Query sem uma decisão arquitetural aprovada.
- Não modificar banco, sync ou repositories em tarefas exclusivamente visuais.
- Não remover compatibilidade web sem discussão explícita.
- Não inventar features ou regras não aprovadas.

### Ao finalizar cada fase

1. Executar:
   ```bash
   npm run typecheck
   npm run doctor
   ```
2. Executar lint e testes quando existirem.
3. Mostrar:
   - arquivos alterados;
   - resumo das alterações;
   - riscos;
   - pendências;
   - validações executadas.
4. Atualizar a memória do projeto de forma resumida.
5. Não adicionar histórico extenso ao `AGENTS.md`.

---

## 4. Problemas já identificados

### 4.1 Origem e documentação

A documentação mistura:

- planejamento inicial;
- estruturas herdadas dos três protótipos;
- arquitetura atual;
- decisões futuras;
- histórico detalhado de refatorações.

Há contradições conhecidas, por exemplo:

- componentes descritos como React Native em uma seção e HTML em outra;
- cores descritas como centralizadas, mas ainda existem cores hardcoded;
- persistência web descrita ora como memória, ora como `localStorage`;
- documentos antigos ainda sugerem criação inicial do projeto;
- planejamento antigo menciona tecnologias não adotadas na implementação atual.

### 4.2 Design system

Existem duas fontes visuais conflitantes:

- `src/theme/darkColors.ts`: tema dark/azul atual;
- `src/theme/tokens.ts`: tokens claros e valores em `rem`, herdados de base web.

Também existem:

- cores hexadecimais hardcoded;
- tamanhos de fonte isolados;
- botões com alturas e raios inconsistentes;
- títulos muito grandes;
- ícones renderizados como caracteres de texto;
- componentes visuais com estilos repetidos.

### 4.3 Navegação e ícones

A barra inferior utiliza símbolos como:

```text
⌂  ⚙  ♥  ▣  ◉
```

Esses símbolos devem ser substituídos por uma biblioteca de ícones consistente.

Biblioteca recomendada:

```bash
npx expo install lucide-react-native react-native-svg
```

Mapeamento sugerido:

- Início: `House`
- Exercícios: `Dumbbell`
- Favoritos: `Heart`
- Treinos: `ClipboardList` ou `ListChecks`
- Perfil: `UserRound`
- Criar/adicionar: `Plus`
- Iniciar: `Play`
- Calendário: `CalendarDays`
- Duração: `Clock`
- Calorias: `Flame`
- Carga: `Weight`
- Avançar: `ChevronRight`
- Busca: `Search`

Não usar emojis ou caracteres Unicode como ícones principais.

### 4.4 Home

Problemas atuais:

- calendário dividido em grandes cards semanais;
- falta de ação principal para criar treino;
- atalhos não representam claramente o fluxo principal;
- status “offline-first” possui linguagem técnica;
- avatar ainda é emoji;
- falta um bloco claro de treino do dia ou estado vazio;
- estilos estão inline e alguns textos usam cores hardcoded.

Direção desejada:

```text
Olá, Fábio                            [avatar]
Subtítulo curto e natural

[ calendário horizontal contínuo ]

Treino de hoje
[ card do treino ou estado vazio ]
[ Iniciar treino / Criar treino ]

Ações rápidas
[ Criar treino ] [ Explorar exercícios ]

Seus treinos
[ cards resumidos ]
```

O status de sincronização deve ser discreto ou movido para Perfil/Configurações.

### 4.5 Exercícios

Manter cards por grupos musculares como solução atual.

Estrutura desejada:

```text
Busca
Frente | Costas
Cards de grupos musculares
→ exercícios do grupo
→ detalhe do exercício
```

Não implementar o corpo humano interativo agora. Registrar como evolução futura, pois exigirá SVG segmentado, mapeamento de regiões e acessibilidade.

Remover informações técnicas da interface final, como contagens de banco ou diagnósticos.

### 4.6 Treinos

Separar responsabilidades:

```text
Meus treinos
→ Criar treino
→ Detalhes do treino
→ Adicionar exercícios
→ Editar exercício
→ Iniciar sessão
→ Finalizar sessão
→ Histórico
```

A tela de listagem não deve manter o formulário completo sempre aberto.

Fluxo desejado:

#### Meus treinos

```text
Treinos

[ + Criar treino ]

Treino A
Seg, Qua e Sex
5 exercícios                           >
```

#### Criação

```text
Criar treino

Nome
[ Treino A ]

Dias
[Dom] [Seg] [Ter] [Qua] [Qui] [Sex] [Sáb]

[ Criar treino ]
```

Pode ser modal inferior ou tela dedicada. A decisão deve considerar acessibilidade e espaço disponível.

#### Detalhe

```text
Treino A
Seg, Qua e Sex

[Duração] [Calorias] [Carga]

[ Iniciar treino ]

Exercícios                         + Adicionar

Supino reto                              >
3 séries • 10 repetições • 20 kg
```

Correções visuais importantes:

- título do treino: aproximadamente 24;
- título de seção: aproximadamente 20;
- não usar título de seção com 42;
- botão iniciar deve seguir o componente primário;
- “Adicionar” deve ser ação compacta de cabeçalho;
- manter “Exercícios” e “Adicionar” na mesma linha.

### 4.7 Seleção de exercícios

Evitar duplicar a experiência de navegação de exercícios.

Criar ou evoluir uma estrutura reutilizável, por exemplo:

```text
ExerciseBrowser
```

Modos possíveis:

```text
browse  → abre detalhes
select  → adiciona exercício ao treino
```

O fluxo de seleção deve reaproveitar:

- busca;
- frente/costas;
- grupos;
- cards;
- lista de exercícios.

---

## 5. Plano de execução por fases

> Executar uma fase por vez. Não executar todo este plano em uma única sessão.

### Fase 0 — Segurança e inventário

Objetivo: proteger o estado atual e entender o impacto da refatoração anterior.

Tarefas:

- revisar `git status`;
- revisar arquivos modificados por domínio;
- conferir `.gitignore`;
- garantir que `node_modules`, `.expo` e builds não sejam versionados;
- criar snapshot/commit de segurança quando aprovado;
- listar componentes, telas, hooks, repositories e documentos existentes;
- identificar arquivos não utilizados e duplicados, sem removê-los ainda.

Saída esperada:

- inventário;
- riscos;
- proposta de agrupamento dos changes;
- nenhuma mudança funcional.

### Fase 1 — Consolidação documental

Objetivo: produzir documentação atual e sem contradições.

Tarefas:

- declarar `treinus-app` como única fonte de verdade;
- marcar projetos anteriores como referências históricas;
- classificar documentos como:
  - atual;
  - histórico;
  - planejado;
  - descartado;
- remover do `AGENTS.md` o histórico extenso de sessões;
- manter no `AGENTS.md` apenas:
  - objetivo;
  - stack;
  - arquitetura;
  - regras;
  - comandos;
  - cuidados;
  - índice de documentos;
- mover histórico para `docs/history/`;
- corrigir contradições sobre:
  - Button/Input;
  - tema;
  - persistência web;
  - navegação;
  - stack planejada versus atual.

Estrutura sugerida:

```text
docs/
├── README.md
├── product/
│   ├── vision.md
│   ├── scope.md
│   ├── user-flows.md
│   └── roadmap.md
├── architecture/
│   ├── overview.md
│   ├── layers.md
│   ├── offline-first.md
│   ├── database.md
│   └── decisions/
├── features/
│   ├── exercises.md
│   ├── workouts.md
│   ├── workout-session.md
│   ├── favorites.md
│   └── sync.md
├── design/
│   ├── design-system.md
│   ├── navigation.md
│   └── references.md
├── operations/
│   ├── local-development.md
│   └── docker.md
└── history/
```

Não criar todos os arquivos vazios. Criar somente os necessários para o conteúdo existente.

### Fase 2 — Fundação visual

Objetivo: criar uma única fonte de verdade visual.

Tarefas:

- instalar Lucide;
- substituir símbolos e emojis usados como ícones;
- consolidar tema;
- decidir destino de `tokens.ts`;
- remover tokens web incompatíveis com React Native;
- criar tokens numéricos para:
  - cores;
  - espaçamento;
  - tipografia;
  - radius;
  - tamanhos de ícones;
- criar ou consolidar componentes base:
  - `ScreenContainer`;
  - `ScreenHeader`;
  - `SectionHeader`;
  - `PrimaryButton`;
  - `SecondaryButton`;
  - `IconButton`;
  - `Card`;
  - `Input`;
  - `SearchInput`;
  - `SelectableChip`;
  - `EmptyState`;
- substituir cores hardcoded gradualmente;
- mudar `app.json` para tema `dark`, após validação.

Critérios:

- nenhuma alteração de regra de negócio;
- nenhum repository ou banco alterado;
- barra inferior visualmente consistente;
- typecheck aprovado;
- principais componentes documentados.

### Fase 3 — Home

Objetivo: transformar a Home na entrada do fluxo de treino.

Tarefas:

- criar cabeçalho com saudação e avatar/placeholder;
- substituir emoji por ícone ou imagem;
- redesenhar calendário como faixa horizontal contínua;
- adicionar ação “Criar treino”;
- adicionar bloco “Treino de hoje”;
- criar estado vazio quando não houver treino;
- renomear ações pouco claras;
- mover status técnico de sincronização;
- reduzir estilos inline quando houver reutilização real.

Não implementar histórico ou sessão completa nesta fase.

### Fase 4 — Fluxo de treinos atual

Objetivo: melhorar o que já existe sem criar ainda toda a execução.

Tarefas:

- separar listagem e criação;
- criar modal ou tela de criação;
- padronizar seleção de dias;
- melhorar cards de treino;
- corrigir detalhe do treino;
- reduzir títulos exagerados;
- padronizar botão iniciar;
- colocar “Exercícios” e “Adicionar” na mesma linha;
- garantir estados vazios;
- preservar APIs, hooks e persistência existentes.

### Fase 5 — Navegador de exercícios reutilizável

Objetivo: unificar consulta e seleção.

Tarefas:

- mapear duplicações entre telas;
- reaproveitar busca, grupos e cards;
- suportar modo de consulta e modo de seleção;
- manter frente/costas;
- evitar carregar mil itens sem paginação ou estratégia clara;
- preservar favoritos e detalhes.

### Fase 6 — Domínio de execução de treino

Objetivo: definir antes de implementar.

Não codificar imediatamente. Primeiro produzir proposta de domínio.

Entidades conceituais:

```text
WorkoutTemplate
WorkoutTemplateExercise
WorkoutSession
WorkoutSessionExercise
WorkoutSet
```

Questões a fechar:

- treino planejado versus treino executado;
- status da sessão;
- série concluída;
- edição durante a sessão;
- pausa e retomada;
- duração;
- calorias;
- carga;
- histórico;
- evolução;
- cancelamento;
- persistência offline;
- compatibilidade com dados legados.

Após aprovação, criar migrations e implementação em fases pequenas.

### Fase 7 — Histórico e evolução

Somente após a Fase 6.

Possíveis entregas:

- histórico por data;
- resumo de sessão;
- volume por exercício;
- evolução de carga;
- frequência semanal;
- calendário com treinos realizados.

---

## 6. Diretrizes de arquitetura

### Manter

- TypeScript strict;
- React Navigation;
- React Query;
- Zustand;
- SQLite;
- dual persistence quando aplicável;
- migrations versionadas;
- validators;
- mappers fora do serviço de sync;
- lógica pura em selectors;
- componentes específicos dentro da feature;
- componentes globais apenas quando realmente reutilizáveis.

### Evitar

- telas acessando banco diretamente;
- telas acessando repositories diretamente;
- lógica de negócio em componentes visuais;
- duplicação entre mobile e web;
- JSON crescente como solução permanente para histórico;
- arquivos `final`, `novo`, `v2`, `ajustado`;
- novas camadas sem necessidade real;
- refatoração transversal sem fases;
- 50 ou mais arquivos alterados em uma única tarefa sem aprovação.

### Observação sobre nomenclatura

Atualmente existe:

```text
features/<feature>/repository.ts
repositories/<Domain>Repository.ts
```

As responsabilidades são diferentes, mas o nome pode confundir.

Não renomear agora em massa. Registrar como possível melhoria futura:

```text
features/<feature>/service.ts
```

ou:

```text
features/<feature>/useCases.ts
```

Aplicar somente quando houver benefício claro e com migração controlada.

---

## 7. Diretrizes de interface

### Identidade

- tema dark;
- azul como cor primária;
- linguagem simples;
- português do Brasil;
- ícones lineares consistentes;
- cards compactos;
- hierarquia clara;
- ações principais fáceis de localizar.

### Tipografia inicial sugerida

```text
screenTitle: 24 / 700
sectionTitle: 20 / 700
cardTitle: 16 / 600 ou 700
body: 14 ou 16 / 400
caption: 12 / 400
button: 15 ou 16 / 600 ou 700
```

Evitar tamanhos isolados como 38 ou 42 sem justificativa de design.

### Espaçamento inicial sugerido

```text
xs: 4
sm: 8
md: 12
lg: 16
xl: 24
xxl: 32
```

### Radius inicial sugerido

```text
sm: 8
md: 12
lg: 16
pill: 999
```

Pill deve ser usado somente em chips e ações apropriadas, não automaticamente em todos os botões.

### Acessibilidade

- área de toque mínima próxima de 44x44;
- labels compreensíveis;
- contraste adequado;
- não depender apenas de cor;
- suporte a texto maior;
- ícones com contexto textual quando necessário.

---

## 8. Critérios de aceite globais

Uma fase só está concluída quando:

- escopo foi respeitado;
- não houve mudança fora do domínio;
- TypeScript passou;
- Expo Doctor não apresentou novo problema causado pela mudança;
- app abre;
- navegação principal funciona;
- comportamento mobile foi testado;
- comportamento web foi testado quando afetado;
- não surgiram novos hardcodes sem justificativa;
- documentação correspondente foi atualizada;
- diff foi revisado;
- agente apresentou pendências reais, sem afirmar conclusão falsa.

---

## 9. Modelo de resposta esperado do agente

Antes de editar:

```markdown
## Entendimento
...

## Arquivos que preciso ler
...

## Plano
1. ...
2. ...
3. ...

## Fora do escopo
...
```

Ao finalizar:

```markdown
## Entregue
...

## Arquivos alterados
- ...

## Validações
- typecheck:
- doctor:
- testes:
- execução mobile:
- execução web:

## Riscos e pendências
...

## Próximo passo recomendado
...
```

---

## 10. Prompt para iniciar o trabalho

Use este prompt em uma conversa nova na IDE:

```text
Leia primeiro o arquivo PLANO_CONSOLIDACAO_E_EVOLUCAO.md, depois AGENTS.md e README.md.

Este projeto surgiu da consolidação de três protótipos, mas o repositório atual é a única fonte de verdade. Não tente sincronizar novamente os projetos antigos.

Trabalhe somente na fase que eu indicar.

Antes de editar:
1. verifique git status e git diff;
2. leia apenas os arquivos necessários;
3. apresente um plano curto;
4. informe o que ficará fora do escopo.

Durante a execução:
- não faça refatoração macro;
- não copie literalmente imagens de referência;
- não altere banco, repositories ou sync em tarefas visuais;
- não crie componentes duplicados;
- não use símbolos ou emojis como ícones;
- mantenha TypeScript strict e o fluxo arquitetural atual.

Ao finalizar:
- execute npm run typecheck;
- execute npm run doctor;
- informe arquivos alterados;
- informe testes e riscos;
- atualize a documentação correspondente de forma curta;
- pare e aguarde aprovação antes de iniciar a fase seguinte.

Fase atual: [INFORMAR A FASE]
Objetivo específico: [INFORMAR O OBJETIVO]
```

---

## 11. Primeira tarefa recomendada

```text
Fase 1 — Consolidação documental.

Não altere código.

Leia:
- AGENTS.md
- README.md
- docs/
- package.json
- app.json
- App.tsx
- src/navigation/RootNavigator.tsx
- src/theme/
- estrutura de src/

Objetivo:
1. identificar afirmações atuais, históricas, planejadas e descartadas;
2. listar contradições;
3. propor a nova organização documental;
4. apresentar o diff planejado;
5. aguardar minha aprovação antes de editar.

Não varra node_modules, dist-web, assets ou imagens nesta tarefa.
```

Depois da documentação, executar:

```text
Fase 2 — Fundação visual, etapa 1: ícones e navegação inferior.

Escopo:
- instalar Lucide;
- substituir os símbolos atuais da tab bar;
- padronizar nomes em português;
- não alterar telas, banco, hooks, repositories ou fluxo funcional;
- rodar typecheck e doctor;
- parar após essa etapa.
```

---

## 12. Princípio principal

```text
Planejar o macro
→ escolher um módulo
→ dividir em microtarefas
→ alterar poucos arquivos
→ validar
→ registrar o estado
→ continuar
```

Não voltar ao modelo:

```text
“Analise tudo, refatore tudo e melhore tudo.”
```

A evolução deve ser incremental, verificável e compreensível.
