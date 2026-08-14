# AGENTS.md — Guia para agentes de IA neste repositório

## Visão geral do projeto

**Treinos.proswap** é um aplicativo mobile de treinos **offline-first** construído com **Expo + React Native + TypeScript**.

Objetivo central: sincronizar exercícios de uma API pública uma única vez e permitir que o app funcione completamente offline com dados locais.

- Fonte de dados: `https://oss.exercisedb.dev/api/v1/exercises`
- Persistência: SQLite (`expo-sqlite`) no mobile; `localStorage` (via `webStore`) na web
- Navegação: React Navigation (stack + bottom tabs)
- Estado global: Zustand
- Server state / queries: TanStack React Query
- Cliente HTTP: Axios

## Stack e versões

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js `>=20.19.4`, npm `10+` |
| Framework | Expo `~57.0.10`, React Native `0.86.2`, React `19.2.3` |
| Linguagem | TypeScript `~6.0.3` (strict mode) |
| Navegação | `@react-navigation/native` + `native-stack` + `bottom-tabs` |
| Persistência | `expo-sqlite` (mobile), `localStorage` fallback (web) |
| HTTP | `axios` |
| Estado global | `zustand` |
| Queries | `@tanstack/react-query` |

## Comandos essenciais

```bash
npm install                     # instala dependências
npm run start                   # Expo dev server (Metro)
npm run start:tunnel            # Expo com tunnel (porta 8081)
npm run web                     # versão web
npm run android                 # abre no Android
npm run typecheck               # valida TypeScript (tsc --noEmit)
npm run doctor                  # valida setup do Expo
```

### Docker (fluxo recomendado)

```bash
docker compose up --build mobile   # Expo Go no Android (tunnel, porta 8081)
docker compose up --build web      # versão web (porta 19006)
docker compose down                # para tudo
docker compose down -v             # limpa volumes/caches
```

## Estrutura de diretórios

```text
App.tsx                              # bootstrap: initDatabase + QueryClient + NavigationContainer (tema dark)
src/
  components/                        # componentes base reutilizáveis (Button, Input, SearchInput)
    SearchInput.tsx                  # input de busca padronizado (usa darkColors)
  db/
    index.ts                         # abre SQLite (mobile) e exporta `db`; no web fica null
    migrations.ts                    # migrations versionadas + backfill de grupos normalizados
    types.ts                         # tipos de entrada (ExerciseUpsertInput, WorkoutCreateInput, etc.)
    validators.ts                    # validações de dados antes de persistir
    webStore.ts                      # fallback de persistência em localStorage para web
  features/
    exercises/
      components/
        ExerciseGroupCard.tsx        # card de grupo muscular (frente/costas)
        ExerciseImage.tsx            # imagem do exercício (gif) com placeholder
        ExerciseListItem.tsx         # card de exercício com imagem e botão de favorito
        ExercisePickerCard.tsx       # card de exercício para seleção em treinos
      types.ts                       # tipos de feature (Exercise, ExerciseGroup, ExerciseDetails, filtros)
      normalization.ts               # normalização de grupos musculares + tradução de termos da API (EN→PT)
      mappers.ts                     # mapeamento de payload da API → ExerciseUpsertInput (mapApiExercise)
      selectors.ts                   # funções puras de filtragem/agrupamento de exercícios (usadas no caminho web)
      repository.ts                  # fachada de casos de uso (encapsula repositories; re-exporta mapApiExercise)
      hooks.ts                       # React Query hooks (useExercises, useExercise, useFavorites, etc.)
    workouts/
      components/
        MetricBox.tsx                # caixa de métrica (duração, calorias, carga, reps)
        SeriesEditorCard.tsx         # editor de séries/reps/rest de um exercício do treino
        WeekCalendar.tsx             # calendário semanal de dias de treino
        WorkoutCard.tsx              # card de treino na listagem
        WorkoutExerciseRow.tsx       # linha de exercício no detalhe do treino
        WorkoutForm.tsx              # formulário de criação de treino
      selectors.ts                   # parsing de metadados de workouts + métricas estimadas (funções puras)
      repository.ts                  # fachada de casos de uso de workouts (workoutsFeatureRepository)
      hooks.ts                       # React Query hooks (useWorkouts, useWorkoutDetails, etc.)
    sync/
      syncService.ts                 # fluxo de sync inicial (needsInitialSync, runInitialSync)
  navigation/
    RootNavigator.tsx                # stack + bottom tabs; tipos RootStackParamList e MainTabParamList
  repositories/
    ExerciseRepository.ts            # CRUD de exercícios + grupos + busca (SQLite/web)
    FavoritesRepository.ts           # favoritos (toggle, list, isFavorite)
    WorkoutRepository.ts             # workouts + treinos + séries (metadados JSON nas colunas de notas)
  screens/
    SplashScreen.tsx                 # decide Main ou Sync baseado na contagem de exercícios
    SyncScreen.tsx                   # primeira sincronização
    HomeScreen.tsx                   # início rápido, rotinas, status offline
    ExercisesScreen.tsx              # grupos musculares (frente/costas) + busca
    ExerciseDetailsScreen.tsx        # detalhes de um exercício
    ExerciseGroupExercisesScreen.tsx # lista de exercícios de um grupo
    FavoritesScreen.tsx              # exercícios favoritos
    WorkoutsScreen.tsx               # lista de treinos
    WorkoutDetailsScreen.tsx         # detalhes de treino + métricas
    WorkoutExercisePickerScreen.tsx  # adicionar exercício ao treino
    WorkoutExerciseEditScreen.tsx    # editar séries/reps/rest
    ProfileScreen.tsx                # perfil
  services/
    api/exerciseDbClient.ts          # instância axios (baseURL, timeout 20s)
    sync/SyncService.ts              # sync paginado com retry, rate-limit e batches
  store/
    useAppStore.ts                   # Zustand: lastSyncAt
  theme/
    darkColors.ts                    # tokens de cores dark/azul centralizados (usado por todas as telas)
    theme.config.ts                  # config de tema (importa tokens)
    tokens.ts                        # design tokens (cores, spacing, tipografia, radius, shadow)
```

## Arquitetura e padrões

### Padrão de camadas

O projeto segue uma separação por responsabilidade:

1. **Screens** → UI + navegação. Usam hooks da camada `features`.
2. **Features** → casos de uso / orquestração (ex: `exercises/hooks.ts`, `exercises/repository.ts`).
3. **Repositories** → adaptadores de persistência (SQLite no mobile, webStore na web).
4. **Services** → integração com APIs externas (ex: `SyncService`).
5. **db** → banco de dados, migrations, types e validators.

Fluxo típico de dados:
```
Screen → features/hooks (React Query) → features/repository → repositories/* → db (SQLite) / webStore
```

### Dual persistence: mobile (SQLite) vs web (localStorage)

Todos os repositórios verificam `Platform.OS === 'web'` e delegam para o `webStore` nesta condição. No mobile, usam `db` do `src/db/index.ts`.

Regras:
- **Nunca** importar `expo-sqlite` diretamente fora de `src/db/index.ts`.
- **Nunca** usar `db` diretamente em screens — sempre via repositories.
- Ao adicionar novo método de persistência, implementar **os dois caminhos** (SQLite + webStore).

### Banco de dados (SQLite)

- Migrations versionadas em `src/db/migrations.ts`. Cada migration tem `version`, `name` e `up(db)`.
- `runMigrations` é chamado no bootstrap via `initDatabase()` em `App.tsx`.
- Tabelas: `schema_migrations`, `exercises`, `exercise_instructions`, `exercise_secondary_muscles`, `exercise_tags`, `favorites`, `workouts`, `workout_exercises`.
- Foreign keys habilitadas (`PRAGMA foreign_keys = ON`).
- `ON DELETE CASCADE` para dependências de exercícios e treinos; `ON DELETE RESTRICT` para `workout_exercises.exercise_id`.
- Índices em campos de busca (`name`, `body_part`, `target`, `equipment`, `normalized_group_key`).
- Constraints `CHECK` para qualidade de dados (ex: `name` com `length(trim(name)) >= 2`).
- Migration v2 adiciona colunas de grupo normalizado (`normalized_group_key`, `normalized_group_label`, `body_view`) e um backfill que roda após as migrations.
- Migration v3 adiciona coluna `performed_at` na tabela `workouts` para registrar a data de execução do treino.

### Normalização de grupos musculares

`src/features/exercises/normalization.ts` é central para o produto:

- Mapeia dados crus da API (ex: `chest`, `quadriceps`, `hamstrings`) para grupos normalizados com **label em português** e **bodyView** (`front` / `back` / `both`).
- Grupos: ombros, peitoral, bíceps, abdômen, oblíquos, antebraços, abdutores, adutores, quadriceps, cardio, trapézio, tríceps, dorsais, lombares, glúteos, isquiotibiais, panturrilhas.
- `translateApiTerm()` traduz termos da API (EN→PT) para exibição.
- `normalizeExerciseGroup()` é usado no sync e no repository ao upsertar.

### Sincronização (SyncService)

`src/services/sync/SyncService.ts`:

- Fetch paginado (`limit=100`) com controle de cursor (`after`, `nextCursor`, `hasNextPage`), até 80 páginas.
- Tratamento de **rate limit (HTTP 429)**: espera `retry-after` (header ou body), default 15s, até 6 tentativas.
- Retry com backoff exponencial (`withRetry`, 700ms base).
- **Não contém lógica de transformação de payload** — apenas orquestração de rede/persistência.
- Mapeia payload da API → `ExerciseUpsertInput` via `mapApiExercise` (importado de `src/features/exercises/mappers.ts`):
  - Traduz `bodyPart`, `target` e `equipment` usando `normalization.ts`.
  - Itens inválidos são descartados.
- Deduplica por `id`; persiste em lotes de 200 (`splitInBatches`).
- Salva `lastSyncAt` no Zustand ao concluir.

### Mappers de API (features)

`src/features/exercises/mappers.ts` centraliza o mapeamento de payload da API:

- `mapApiExercise(raw)` → `ExerciseUpsertInput | null` — transforma o payload cru da API em entrada normalizada para persistência.
- Inclui helpers `toText()` e `toStringArray()` para extração segura de campos.
- Usa `normalizeExerciseGroup` e `translateApiTerm` de `normalization.ts`.
- Re-exportado pela fachada `src/features/exercises/repository.ts` (`export { mapApiExercise }`).
- **O `ExerciseRepository.upsertMany` confia nos campos normalizados do input** (`normalizedGroupKey`, `normalizedGroupLabel`, `bodyView`) — não re-normaliza.

### Favoritos e Workouts

- **Favoritos**: tabela `favorites` (FK → `exercises`). Toggle via `FavoritesRepository.toggle()`.
- **Workouts**: tabela `workouts` com metadados serializados em JSON na coluna `note` (v1: `{ note, trainingDays }`).
- **Data de execução**: coluna `performed_at` (ISO string) indica quando um treino foi realizado.
- **Workout exercises**: tabela `workout_exercises` com config de séries também serializada em JSON na coluna `notes` (v1: `{ restSeconds, note, series: [{reps, loadKg}] }`).
- Helpers: `parseWorkoutMetadata`, `serializeWorkoutMetadata`, `parseWorkoutExerciseConfig`, `serializeWorkoutExerciseConfig`, `estimateWorkoutMetrics` (todos em `src/features/workouts/selectors.ts`; `WorkoutRepository.ts` importa e re-exporta `parseWorkoutExerciseConfig` e `estimateWorkoutMetrics`).
- **Fachada de workouts**: `src/features/workouts/repository.ts` expõe `workoutsFeatureRepository` (list, create, getDetails, addExercise, updateExerciseConfig) e `src/features/workouts/hooks.ts` expõe os hooks React Query (`useWorkouts`, `useWorkoutDetails`, `useCreateWorkout`, `useAddWorkoutExercise`, `useUpdateWorkoutExerciseConfig`).
- **Métricas estimadas**: `estimateWorkoutMetrics` calcula:
  - `durationMin`: (séries * 40s) + (descanso entre séries).
  - `calories`: `totalReps * 0.35 + totalLoadKg * 0.02`.
- **Sempre manter compatibilidade com payload legado** (notas em texto puro) — `parse*` faz fallback.

## Convenções de código

- **TypeScript strict mode** (`tsconfig.json` com `strict: true`).
- Componentes de tela: `export function NomeScreen()` (named export) em `src/screens/*.tsx`.
- Repositórios: objetos com métodos (`export const XRepository = { ... }`).
- Validações antes de persistir: sempre chamar validators (`validateExerciseInput`, `validateWorkoutCreateInput`, `validateWorkoutExerciseAddInput`).
- IDs gerados externamente (passados como parâmetro) — não usar autoincrement para entidades de domínio.
- **Cores centralizadas em `src/theme/darkColors.ts`** — todas as telas devem importar `colors` deste arquivo. Não usar cores hex hardcoded em novas telas.
- **Paleta dark/azul**: background `#111315`, card `#17191c`, primary `#0a84ff`, primaryLight `#72b6ff`, primaryAlpha `#0a84ff22`, textPrimary `#f5f7fa`, textStrong `#f3f7fc`, textSecondary `#b1bdcb`, textMuted `#9aa4b2`, border `#2a2f36`, borderCard `#23262b`.
- **Dias da semana**: usar `['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']` (com acento em Sáb) — tanto na UI quanto nos validators/repository.
- **Botões e seleção**: quando selecionado/ativo, usar `colors.primary` (#0a84ff) com `colors.primaryAlpha` de fundo e `colors.primaryLight` no texto. Botões primários usam `colors.primary` com texto `colors.textInverse`.
- O design system em `src/theme/tokens.ts` descreve cores claras (ex: background `#FFFFFF`) mas o app usa tema dark — **não usar** `tokens.ts` em novas telas; usar `darkColors.ts`.
- Atualizar as **duas camadas de persistência** ao modificar repositórios (SQLite + webStore).

## Histórico de mudanças recentes

### Sessão: Padronização de cores e tema dark/azul

**Objetivo:** Substituir cores inconsistentes (âmbar/laranja) por uma paleta dark/azul unificada em todo o app.

**Mudanças realizadas:**

1. **Criado `src/theme/darkColors.ts`** — arquivo central com todos os tokens de cor do tema dark/azul:
   - Backgrounds: `background`, `card`, `cardPressed`, `imagePlaceholder`
   - Borders: `border`, `borderCard`, `borderSecondary`
   - Textos: `textPrimary`, `textStrong`, `textInverse`, `textBody`, `textSecondary`, `textMuted`, `textSubtle`, `textPlaceholder`
   - Azul: `primary` (#0a84ff), `primaryDark`, `primaryLight`, `primaryAlpha`

2. **Corrigidas cores âmbar/laranja → azul** em 4 telas de workout:
   - `WorkoutsScreen.tsx` — dias da semana selecionados (antes âmbar, agora azul com primaryAlpha)
   - `WorkoutDetailsScreen.tsx` — botões, labels de métricas, header do card
   - `WorkoutExercisePickerScreen.tsx` — chips de filtro, botão "+ Adicionar"
   - `WorkoutExerciseEditScreen.tsx` — botão "Salvar", texto "+ Adicionar série"

3. **Corrigida abreviação do sábado:** `'Sab'` → `'Sáb'` (com acento) em:
   - `src/screens/WorkoutsScreen.tsx`
   - `src/repositories/WorkoutRepository.ts`
   - `src/db/validators.ts`

4. **Reescritos componentes `Button.tsx` e `Input.tsx`**:
   - Migrados de HTML (`<button>`, `<input>`) para React Native (`Pressable`, `TextInput`)
   - Adicionadas tipagens corretas (eliminando `any` implícitos)
   - Passaram a usar `darkColors.ts` em vez de `theme.config.ts`

5. **Padronizadas todas as telas** para usar `colors` do `darkColors.ts`:
   - `App.tsx`, `RootNavigator.tsx`, `SplashScreen`, `SyncScreen`, `HomeScreen`
   - `ExercisesScreen`, `ExerciseDetailsScreen`, `ExerciseGroupExercisesScreen`
   - `FavoritesScreen`, `ProfileScreen`

6. **TypeScript typecheck:** passou com sucesso (`EXIT_CODE=0`).

### Convenções estabelecidas

- **Sempre** importar `colors` de `src/theme/darkColors.ts` em novas telas
- **Nunca** usar cores hex hardcoded (ex: `#111315`, `#0a84ff`)
- **Botões/seleção ativa:** `colors.primary` + `colors.primaryAlpha` (fundo) + `colors.primaryLight` (texto)
- **Botões primários:** `colors.primary` (fundo) + `colors.textInverse` (texto)
- **Dias da semana:** usar `['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']` com acento em Sáb

### Sessão: Componentização de UI (Fase 1)

**Objetivo:** Extrair componentes reutilizáveis das telas para reduzir duplicação de código e padronizar a UI.

**Mudanças realizadas:**

1. **Criado `src/components/SearchInput.tsx`** — input de busca padronizado:
   - Encapsula `TextInput` com estilo dark/azul (usa `colors` de `darkColors.ts`)
   - Props: `placeholder`, `value`, `onChangeText`
   - Substitui os `TextInput` duplicados nas telas de busca

2. **Criado `src/features/exercises/components/ExerciseGroupCard.tsx`** — card de grupo muscular:
   - Exibe label do grupo, contagem de exercícios e badge de vista (frente/costas)
   - Usado na `ExercisesScreen` (view frente/costas)
   - Props: `group`, `count`, `onPress`

3. **Criado `src/features/exercises/components/ExerciseListItem.tsx`** — card de exercício:
   - Exibe imagem (gif), nome, detalhes (bodyPart • target • equipment) e botão de favorito
   - Usado em `ExerciseGroupExercisesScreen` e `FavoritesScreen`
   - Props: `item`, `isFavorite`, `onPress`, `onToggleFavorite`

4. **Refatorada `ExerciseGroupExercisesScreen.tsx`**:
   - Substituiu `TextInput` inline por `SearchInput`
   - Substituiu o card inline por `ExerciseListItem`
   - Removeu imports não utilizados (`Image`, `Pressable`, `TextInput`)

5. **TypeScript typecheck:** passou com sucesso (`EXIT_CODE=0`).

### Convenções estabelecidas (Fase 1)

- **Componentes de feature** ficam em `src/features/<feature>/components/`
- **Componentes base** ficam em `src/components/`
- Ao extrair um componente reutilizável, usar `colors` de `darkColors.ts` e tipagem estrita
- Preferir componentes extraídos em vez de JSX inline duplicado nas telas

### Sessão: Extração de selectors compartilhados (Fase 2)

**Objetivo:** Eliminar duplicação de lógica de negócio entre o caminho web (webStore) e o caminho mobile (SQLite), centralizando funções puras em selectors reutilizáveis.

**Mudanças realizadas:**

1. **Criado `src/features/exercises/selectors.ts`** — funções puras de filtragem/agrupamento de exercícios:
   - `filterExercises(exercises, { search, bodyPart, limit, offset })` — filtra, ordena e pagina exercícios
   - `filterExercisesByGroup(exercises, { groupKey, bodyView, search, limit, offset })` — filtra exercícios de um grupo muscular
   - `groupExercisesByView(exercises, view, allowedGroups, search)` — agrupa exercícios por grupo muscular para uma vista (frente/costas)

2. **Criado `src/features/workouts/selectors.ts`** — funções puras de parsing de metadados e métricas de workouts:
   - `parseWorkoutMetadata` / `serializeWorkoutMetadata` — parsing/serialização de metadados de treino (JSON na coluna `note`)
   - `parseWorkoutExerciseConfig` / `serializeWorkoutExerciseConfig` — parsing/serialização de config de séries (JSON na coluna `notes`)
   - `estimateWorkoutMetrics` — cálculo de métricas estimadas (duração, calorias, carga, reps)

3. **Refatorado `ExerciseRepository.ts`**:
   - Caminho web de `list()`, `listGroupsByView()` e `listByGroup()` agora usam os selectors compartilhados
   - Eliminada a duplicação de lógica de filtragem/agrupamento entre web e mobile

4. **Refatorado `WorkoutRepository.ts`**:
   - Removidas as funções locais duplicadas de parsing/serialização de metadados
   - Agora importa dos selectors compartilhados em `features/workouts/selectors.ts`
   - Re-exporta `parseWorkoutExerciseConfig` e `estimateWorkoutMetrics` para manter compatibilidade com as telas

5. **Corrigido import em `ExerciseGroupCard.tsx`** — caminho do `darkColors` corrigido de `../theme/` para `../../../theme/`

6. **TypeScript typecheck:** passou com sucesso (`EXIT_CODE=0`).

### Convenções estabelecidas (Fase 2)

- **Selectors de feature** ficam em `src/features/<feature>/selectors.ts`
- **Lógica de negócio pura** (filtragem, agrupamento, parsing, métricas) deve viver em selectors, não nos repositórios
- **Repositórios** devem delegar para selectors compartilhados no caminho web, evitando duplicação com o caminho SQLite
- **Compatibilidade**: ao mover funções de um repositório para selectors, re-exportar do repositório para não quebrar imports existentes

### Sessão: Criação da camada de features (Fase 3)

**Objetivo:** Consolidar a arquitetura por feature, criando uma fachada de casos de uso e hooks de React Query que abstraem as telas dos repositórios de persistência, seguindo o padrão do `academia-app-base`.

**Mudanças realizadas:**

1. **Criado `src/features/exercises/repository.ts`** — fachada de casos de uso de exercícios e favoritos:
   - `exercisesFeatureRepository.list(filters)` — lista exercícios com filtros (search, bodyPart, limit, offset)
   - `getBodyParts()` — lista partes do corpo disponíveis
   - `count()` — total de exercícios
   - `listGroupsByView(view, search)` — grupos musculares por vista (frente/costas)
   - `listByGroup(filters)` — exercícios de um grupo muscular
   - `listFavorites()` — lista favoritos
   - `toggleFavorite(exerciseId)` — alterna favorito
   - Encapsula `ExerciseRepository` e `FavoritesRepository`, delegando a persistência aos repositórios.

2. **Criado `src/features/exercises/hooks.ts`** — hooks de React Query que consomem a fachada:
   - `useExercises(filters)` — lista exercícios
   - `useExerciseBodyParts()` — partes do corpo
   - `useExercisesCount()` — total de exercícios
   - `useExerciseGroupsByView(view, search)` — grupos por vista
   - `useExercisesByGroup(filters)` — exercícios de um grupo
   - `useFavorites()` — lista favoritos
   - `useToggleFavorite()` — mutation que alterna favorito e invalida as queries relacionadas (`favorites`, `exercises`, `exercise-count`, `exercise-group-items`, `exercise-groups`).

3. **Criado `src/features/README.md`** — documenta a camada features e sua inspiração no `academia-app-base`.

4. **Telas passaram a usar os hooks da camada features** em vez de acessar repositórios diretamente, seguindo o fluxo `Screen → features/hooks → features/repository → repositories/*`.

5. **TypeScript typecheck:** passou com sucesso (`EXIT_CODE=0`).

### Convenções estabelecidas (Fase 3)

- **Fachada de casos de uso** fica em `src/features/<feature>/repository.ts` (ex: `exercisesFeatureRepository`)
- **Hooks de React Query** ficam em `src/features/<feature>/hooks.ts`
- **Telas** devem usar os hooks da camada features, nunca acessar repositórios diretamente
- **Persistência** continua centralizada nos repositórios em `src/repositories` — a fachada apenas orquestra
- **Mutations** devem invalidar as queries relacionadas para manter o cache consistente

### Sessão: Extração de mappers de API (Fase 4)

**Objetivo:** Centralizar o mapeamento de payload da API para `ExerciseUpsertInput` na camada de feature, removendo a lógica de transformação do `SyncService`.

**Mudanças realizadas:**

1. **Criado `src/features/exercises/mappers.ts`**:
   - Movido `mapApiExercise()` (antes inline no `SyncService`) para a camada de feature.
   - Inclui os helpers `toText()` e `toStringArray()` (antes duplicados no SyncService).
   - Usa `normalizeExerciseGroup` e `translateApiTerm` de `normalization.ts`.

2. **Atualizado `src/features/exercises/repository.ts`**:
   - Re-exporta `mapApiExercise` como porta de entrada da feature (`export { mapApiExercise }`).

3. **Simplificado `src/repositories/ExerciseRepository.ts`**:
   - Removida a re-normalização redundante no `upsertMany` (que recalculava `normalizedGroupKey`, `normalizedGroupLabel` e `bodyView`).
   - Agora usa diretamente os campos normalizados já presentes no `ExerciseUpsertInput` (produzidos pelo mapper).
   - Removido o import de `normalizeExerciseGroup`.

4. **Simplificado `src/services/sync/SyncService.ts`**:
   - Removido o `mapApiExercise` inline e os helpers `toText`/`toStringArray` (agora em `mappers.ts`).
   - Passa a importar `mapApiExercise` da feature.

5. **TypeScript typecheck:** passou com sucesso (`EXIT_CODE=0`).

### Convenções estabelecidas (Fase 4)

- **Mappers de feature** ficam em `src/features/<feature>/mappers.ts`
- **SyncService** não deve conter lógica de transformação de payload — apenas orquestração de rede/persistência
- **Repositórios** devem confiar nos campos normalizados do input, evitando re-normalização redundante

### Sessão: Componentização de UI de workouts + camada features de workouts (Fase 5)

**Objetivo:** Extrair componentes reutilizáveis das telas de workout e criar a camada features de workouts, completando a migração das telas para os hooks da camada features.

**Mudanças realizadas:**

1. **Criados componentes de workout** em `src/features/workouts/components/`:
   - `MetricBox.tsx` — caixa de métrica (duração, calorias, carga, reps)
   - `SeriesEditorCard.tsx` — editor de séries/reps/rest de um exercício do treino
   - `WeekCalendar.tsx` — calendário semanal de dias de treino
   - `WorkoutCard.tsx` — card de treino na listagem
   - `WorkoutExerciseRow.tsx` — linha de exercício no detalhe do treino
   - `WorkoutForm.tsx` — formulário de criação de treino

2. **Criados componentes de exercício** em `src/features/exercises/components/`:
   - `ExerciseImage.tsx` — imagem do exercício (gif) com placeholder
   - `ExercisePickerCard.tsx` — card de exercício para seleção em treinos

3. **Criada a camada features de workouts**:
   - `src/features/workouts/repository.ts` — fachada `workoutsFeatureRepository` (list, create, getDetails, addExercise, updateExerciseConfig)
   - `src/features/workouts/hooks.ts` — hooks React Query (`useWorkouts`, `useWorkoutDetails`, `useCreateWorkout`, `useAddWorkoutExercise`, `useUpdateWorkoutExerciseConfig`)

4. **Adicionado `getById` ao `ExerciseRepository`** e exposto via `exercisesFeatureRepository.getById()` e hook `useExercise()`.

5. **Telas de workout migradas** para os hooks da camada features:
   - `HomeScreen` → `useWorkouts()`
   - `ExerciseDetailsScreen` → `useExercise()`
   - `SplashScreen`/`SyncScreen` → `exercisesFeatureRepository.count()`

6. **Eliminada duplicação de código**: `parseNumber` e `defaultSeries` exportados de `features/workouts/selectors.ts` e importados pelo `WorkoutRepository`.

7. **TypeScript typecheck:** passou com sucesso (`EXIT_CODE=0`).

### Convenções estabelecidas (Fase 5)

- **Telas** devem usar os hooks da camada features, nunca acessar repositórios diretamente
- **Componentes de workout** ficam em `src/features/workouts/components/`
- **Fachada de workouts** fica em `src/features/workouts/repository.ts` (`workoutsFeatureRepository`)
- **Hooks de workouts** ficam em `src/features/workouts/hooks.ts`
- **Funções puras compartilhadas** (ex: `parseNumber`, `defaultSeries`) devem viver em selectors e ser importadas pelos repositórios, evitando duplicação

### Sessão: Consolidação da camada de features

**Objetivo:** Verificar e consolidar a consistência arquitetural entre as features de exercícios e workouts, eliminando duplicações residuais de tipos e garantindo que nenhuma tela acesse repositórios diretamente.

**Verificações realizadas:**

1. **Tipos de feature centralizados** — `ExerciseRepository.ts` importa `Exercise`, `ExerciseBodyView` e `ExerciseGroup` de `src/features/exercises/types.ts` (não redefine tipos locais). A fachada `exercisesFeatureRepository` também importa os tipos da feature. `FavoritesRepository` e `WorkoutRepository` retornam objetos inline sem tipos locais duplicados.

2. **Nenhuma tela acessa repositórios diretamente** — busca por imports de `repositories/` nas telas retornou vazio. Os únicos consumidores de repositórios são as fachadas de features (`features/*/repository.ts`) e o `SyncService`, seguindo o fluxo `Screen → features/hooks → features/repository → repositories/*`.

3. **Fachada de workouts completa** — `features/workouts/repository.ts` (`workoutsFeatureRepository`) e `features/workouts/hooks.ts` (hooks React Query) existem e são usados por todas as telas de workout (`WorkoutsScreen`, `WorkoutDetailsScreen`, `WorkoutExercisePickerScreen`, `WorkoutExerciseEditScreen`) e pela `HomeScreen`.

4. **Duplicação de helpers eliminada** — `parseNumber` e `defaultSeries` vivem apenas em `features/workouts/selectors.ts` e são importados pelo `WorkoutRepository`.

5. **`getById` exposto na fachada** — `exercisesFeatureRepository.getById()` e hook `useExercise()` disponíveis para a tela de detalhes.

6. **TypeScript typecheck:** passou com sucesso (`EXIT_CODE=0`).

### Convenções estabelecidas (Consolidação)

- **Tipos de feature** devem viver em `src/features/<feature>/types.ts` e ser importados pelos repositórios — nunca redefinir tipos locais no repositório
- **Repositórios** retornam objetos inline tipados pela fachada da feature, sem tipos locais duplicados
- **Telas** nunca importam de `repositories/` — sempre via hooks da camada features

## Fluxo funcional do app

```
1. Splash → conta exercícios locais
   ├─ > 0 → Main (tabs)
   └─ = 0 → Sync
2. Sync → baixa exercícios da API → persiste → Main
3. Main → Home / Exercises / Favorites / Workouts / Profile
```

- Home: criação de treino, atalhos para exercícios e favoritos, status `lastSyncAt`.
- Exercises: busca + view frente/costas com grupos musculares → detalhe do grupo → detalhe do exercício.
- Favorites: lista de exercícios favoritos (toggle).
- Workouts: criação e listagem → detalhe do treino (métricas estimadas: duração, calorias, carga, reps) → editar séries/reps/rest.

## Gotchas e cuidados

- **Web store** (`webStore`) não oferece todos os métodos que o SQLite oferece — verifique antes de usar.
- **Componentes `Button.tsx` e `Input.tsx`** usam HTML (`<button>`, `<input>`) e tokens de tema; não são componentes React Native. Em telas, prefira `Pressable` e `TextInput` do React Native.
- O `theme/tokens.ts` descreve cores claras (ex: background `#FFFFFF`) mas o app usa tema dark com cores hardcoded — ao integrar o design system, priorize as cores atuais das telas.
- `expo-sqlite` é importado **somente** em `src/db/index.ts` via `require()` condicional para não quebrar na web.
- Ao rodar em Docker, Node roda dentro do container — `npm install` é executado pelo entrypoint.
- Mensagens e nomes de telas estão em **português** (`pt-BR`). Mantenha o padrão em novos códigos e textos.
- Sempre rodar `npm run typecheck` antes de finalizar mudanças.