# LJ Representações — Arquitetura Técnica (v1)

## 1. Stack escolhida

| Camada | Tecnologia | Por quê |
|---|---|---|
| Frontend + Backend | **Next.js 14 (App Router) + TypeScript** | Um único projeto full-stack (SSR, API routes/Server Actions), ótimo para mobile-first, deploy simples, ecossistema maduro. |
| Estilo | **Tailwind CSS** + componentes próprios | Consistência visual rápida, responsivo por padrão, fácil manter identidade (branco + neutros + 1 cor principal). |
| Banco de dados | **PostgreSQL** (produção) / **SQLite** (dev/demo local) | Relacional, forte em integridade referencial (essencial: orçamento sem cliente, item sem produto etc. — item 70 do briefing). |
| ORM | **Prisma** | Migrations versionadas, types automáticos, facilita auditoria e histórico. |
| Autenticação | **Auth.js (NextAuth) com Credentials Provider + bcrypt** | Sessões seguras via JWT/DB session, estrutura pronta para adicionar 2FA (TOTP) e Passkeys (WebAuthn) depois. |
| Geração de PDF | **@react-pdf/renderer** (server-side) | PDFs 100% programáticos (sem depender de headless browser), rápido, templates por representada. |
| Armazenamento de arquivos | **Local (dev)** → **S3-compatible (Cloudflare R2) em produção** | Barato, compatível com SDK S3, serve logos, anexos, comprovantes. |
| Deploy | **Vercel** (app) + **Neon/Supabase** (Postgres gerenciado) + **Cloudflare R2** (arquivos) | Baixa manutenção, escala automática, backups gerenciados pelo provedor de banco. |
| Fila/agendador (futuro) | **Vercel Cron / worker dedicado** | Notificações, tarefas recorrentes, lembretes. |

**Justificativa geral:** stack 100% TypeScript de ponta a ponta reduz bugs de integração, tem excelente suporte mobile (responsivo + PWA nativo no Next.js), e todas as peças (auth, ORM, PDF, storage) têm caminho claro de evolução para os itens "FUTURO" do briefing (IA, portal do cliente, catálogo digital, offline).

## 2. Estrutura de pastas (alto nível)

```
lj-representacoes/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ app/
│  │  ├─ (auth)/login/
│  │  ├─ (app)/                 # área autenticada
│  │  │  ├─ dashboard/
│  │  │  ├─ pendencias/
│  │  │  ├─ oportunidades/
│  │  │  ├─ representadas/
│  │  │  ├─ clientes/
│  │  │  ├─ produtos/
│  │  │  ├─ orcamentos/
│  │  │  ├─ pedidos/
│  │  │  ├─ comissoes/
│  │  │  ├─ agenda/
│  │  │  ├─ viagens/
│  │  │  ├─ eventos/
│  │  │  ├─ metas/
│  │  │  ├─ relatorios/
│  │  │  ├─ documentos/
│  │  │  └─ configuracoes/
│  │  └─ api/                   # rotas server (webhooks, pdf, upload)
│  ├─ components/
│  │  ├─ layout/ (Sidebar, MobileNav, Topbar)
│  │  └─ ui/ (Card, Badge, StatusPill, DataTable...)
│  ├─ lib/ (auth.ts, prisma.ts, pdf/, storage.ts, permissions.ts)
│  ├─ server/ (actions por módulo: clientes.actions.ts, orcamentos.actions.ts...)
│  └─ styles/
├─ public/
└─ package.json
```

## 3. Modelo de dados — entidades principais (Fase 1-3)

Entidades centrais já modeladas nesta fase inicial:

- **Empresa** (dados da LJ, único registro)
- **Usuario** (nome, email, senha hash, perfil, ativo)
- **Perfil**: enum `ADMIN | REPRESENTANTE | FINANCEIRO | AUXILIAR`
- **Auditoria** (usuário, ação, entidade, valor anterior/novo, data)
- **Representada**, **Cliente**, **ContatoCliente**, **Produto**, **TabelaPreco/ItemTabela**, **Orcamento/ItemOrcamento/VersaoOrcamento**, **Pedido/ItemPedido**, **Comissao**, **Atividade/Tarefa/Evento/Visita/Viagem/Despesa**, **Meta**, **Documento**, **Notificacao**

Regras de integridade aplicadas via Prisma (`onDelete: Restrict`, campos obrigatórios) + validação com **Zod** no frontend e backend (dupla camada, conforme item 70).

Histórico: preços e comissões nunca são sobrescritos — cada orçamento grava o **preço praticado** no momento (snapshot), nunca referencia o preço "atual" do produto (item 71).

## 4. Autenticação e permissões

- Login por e-mail/senha (bcrypt), sessão JWT.
- Middleware protege todas as rotas de `(app)`.
- Tabela `Permissao` relaciona `Perfil` × `Modulo` × `Acao` (ver/criar/editar/excluir) — pronta para granularidade futura.
- Estrutura preparada para 2FA (campo `totpSecret`) e Passkeys (tabela `Authenticator` do Auth.js), não habilitados na Fase 1.

## 5. PDF, armazenamento e backup

- PDFs gerados sob demanda no servidor (`/api/orcamentos/[id]/pdf`), com template por representada (logo + cores).
- Uploads (logos, anexos, comprovantes) gravados localmente em dev; em produção via S3-compatible, com URLs assinadas.
- Backup: dump automático diário do Postgres pelo provedor gerenciado (Neon/Supabase) + retenção de 7-30 dias; documentar processo de restauração em `docs/backup.md`.

## 6. Deploy

- `main` → deploy automático na Vercel (preview em PRs).
- Variáveis de ambiente (DB URL, secrets, storage keys) via painel da Vercel.
- Migrations do Prisma rodadas no pipeline de deploy.

## 7. Plano de desenvolvimento (fases, conforme item 74 do briefing)

1. **Fundação** — projeto, banco, auth, usuários, layout, dashboard, configurações ✅ *(iniciando agora)*
2. **Cadastros** — representadas, clientes, contatos, produtos, tabelas
3. **Orçamentos** — cálculo, PDF, modelos, versões, status
4. **Pedidos** — aprovação, conversão, faturamento, devoluções
5. **Comissões** — regras, cálculo, recebimento, ajustes
6. **CRM e Agenda** — tarefas, agenda, visitas, pendências, follow-up, notificações
7. **Viagens e Eventos**
8. **Gestão** — metas, relatórios, exportações
9. **Automações** — WhatsApp, e-mail, PWA, catálogo, portal, IA

Cada fase segue: explicar → implementar → testar → corrigir → demonstrar → avançar. Nada de telas ou botões decorativos — funcionalidades ainda não implementadas serão claramente marcadas como **FUTURO**.

---
Próximo passo: **Fase 1 — Fundação**, iniciando o scaffold do projeto.
