# LJ Representações — Sistema de Gestão Comercial

Fase 1 (Fundação) implementada: autenticação, layout responsivo (desktop +
mobile), Dashboard com dados demonstrativos e página de Configurações
funcional (dados da empresa + lista de usuários), lendo e gravando no banco.

## Como rodar localmente

```bash
npm install
npx drizzle-kit push     # cria as tabelas no arquivo lj.db (SQLite)
npx tsx src/db/seed.ts   # cria a empresa demo e o usuário admin
npm run dev               # http://localhost:3000
```

Login de demonstração:
- **E-mail:** admin@lj.com
- **Senha:** lj@2026

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind CSS v4 + Drizzle ORM
(SQLite em dev / Postgres em produção) + Auth.js (NextAuth v5).

Veja `docs/arquitetura-lj-representacoes.md` para a arquitetura completa e o
plano das 9 fases de desenvolvimento.

## Estrutura

- `src/app/(app)/*` — páginas autenticadas (menu lateral / navegação mobile)
- `src/app/login` — autenticação
- `src/db` — schema Drizzle, cliente do banco e seed
- `src/lib/auth.ts` / `auth.config.ts` — configuração do Auth.js (split
  edge-safe / node.js, necessário porque o middleware roda em Edge Runtime)
- `src/components` — componentes de layout e UI reutilizáveis

## Decisão técnica: Drizzle no lugar de Prisma

O documento de arquitetura original previa Prisma. Durante o desenvolvimento,
o ambiente de build não teve acesso ao domínio que distribui os binários
nativos do Prisma (`binaries.prisma.sh`), então o ORM foi trocado por
**Drizzle**, que é 100% TypeScript e não depende de binário externo. Em
produção (Vercel + Postgres gerenciado) o Drizzle funciona da mesma forma,
apenas trocando o driver de `better-sqlite3` para `postgres.js`/Neon.

## Próximos passos (Fase 2)

Cadastros: Representadas, Clientes/CRM, Produtos, Tabelas de preço —
conforme `docs/arquitetura-lj-representacoes.md`.
