# Treinos.proswap (Projeto Unificado)

Projeto consolidado dos 3 diretórios:

- `treinus-app`: base funcional principal
- `academia-app`: referência de navegação com aba de workouts e fluxo Docker
- `academia-app-base`: referência de arquitetura repository/feature + sync

Este repositório (`treinus-app`) agora é o ponto único para evolução do app.

## Objetivo

App de treinos offline-first com Expo + React Native:

- sincronização de exercícios pela API pública
- persistência local (SQLite no mobile)
- fallback em localStorage (via `webStore`) no web
- favoritos e workouts locais

## Requisitos

- Node.js 20.19.4+
- npm 10+
- Docker e Docker Compose
- Expo Go no Android

## Comandos locais

```bash
npm install
npm run start
```

Atalhos:

- `npm run web`: abre versão web
- `npm run android`: tenta abrir Android
- `npm run typecheck`: valida TypeScript
- `npm run doctor`: valida setup do Expo

## Docker (fluxo recomendado)

Todos os passos abaixo executam Node e dependencias dentro do container.
Nao e necessario instalar Node local para rodar o app.

### 1) Mobile (Expo Go no Android)

```bash
docker compose up --build mobile
```

Depois, leia o QR Code nos logs do container e abra no Expo Go.

Observações:

- este modo usa `--tunnel` para facilitar conexão do celular ao Metro
- porta principal do bundler: `8081`

Para checar saude do servico:

```bash
docker compose ps
```

Status esperado: `healthy` no servico `mobile`.

### 2) Web

```bash
docker compose up --build web
```

Acesse:

```text
http://localhost:19006
```

Para checar saude do servico web:

```bash
docker compose ps
```

Status esperado: `healthy` no servico `web`.

### 3) Parar tudo

```bash
docker compose down
```

### 4) Limpar volumes (se quebrar dependência/cache)

```bash
docker compose down -v
docker compose up --build mobile
```

## O que foi consolidado

- Navegação principal com abas: Início, Exercícios, Favoritos, Workouts, Perfil
- Banco local normalizado com migrations versionadas
- Repositórios de domínio: exercícios, favoritos, workouts
- Sync robusto com paginação, retry e tolerância a rate limit da API
- Base Docker única para mobile e web

## Estrutura principal

```text
src/
	db/
	navigation/
	repositories/
	screens/
	services/
	store/
```

## API usada

`https://oss.exercisedb.dev/api/v1/exercises`

## Fluxo funcional

1. Splash
2. Sync inicial (quando não há dados)
3. Home
4. Exercícios offline
5. Favoritos offline
6. Workouts locais

## Próximos incrementos sugeridos

1. Tela detalhada de workout (editar séries/reps/rest)
2. Sincronização remota de usuário (ex: Supabase)
3. Persistência de estado global (`lastSyncAt`) em storage local
