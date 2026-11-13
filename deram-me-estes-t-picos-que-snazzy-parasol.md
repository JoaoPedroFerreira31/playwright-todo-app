# Plano intensivo de 7 dias: arquitetura Playwright, framework partilhada e IA

## Contexto
Tens de dominar em **1 semana** três temas:
1. Arquitetura de um projeto Playwright
2. Projeto-referência para outras equipas + bibliotecas que normalizam a implementação
3. Uso de IA para acelerar o desenvolvimento sem perder qualidade

Estratégia: **aprender fazendo no teu repo `playwright-todo`**, que já tem app Express + SQLite, `playwright.config.ts` com `webServer`, endpoint `POST /api/test/reset`, Page Objects (`pages/LoginPage.ts`, `pages/RegisterPage.ts`) e testes UI + API (`tests/*.spec.ts`). Falta-lhe o que distingue uma framework de equipa: fixtures, factories, auth por storageState, paralelismo, lint, CI e pacotes partilhados. Cada dia ≈ 3–4 h: ~1 h teoria, ~2–3 h prática, 15 min a escrever em 5 linhas o que aprendeste (vais usar isso no Dia 7).

---

## Dia 1 — Fundamentos da arquitetura
**Ler (playwright.dev/docs):** Best Practices, Locators, Test configuration, Projects, Fixtures, Page Object Models.
**Fazer:**
- Criar `fixtures/index.ts` com `test.extend` que expõe `loginPage` e `registerPage`; migrar `tests/auth.spec.ts` para usar as fixtures
- Rever locators: usar `getByRole`/`getByLabel`/`getByTestId`
**Saber explicar:** POM vs fixtures (composição > herança), porquê locators por role, porquê nunca `waitForTimeout`.

## Dia 2 — Auth, dados e paralelismo
**Ler:** Authentication (setup project + storageState), Parallelism, Retries, API testing (`request`).
**Fazer:**
- Projeto `setup` (`tests/auth.setup.ts`) que gera `storageState`; fixture `authenticatedPage`
- Factory de utilizadores/todos com dados únicos (criados via API)
- Ativar `fullyParallel: true` e `workers: 4`, eliminando a dependência do reset global da BD
- Validar com `npx playwright test --repeat-each=5`
**Saber explicar:** setup via API + verificação via UI; isolamento de testes; como combater flakiness.

## Dia 3 — Estrutura final, observabilidade e CI
**Ler:** Trace viewer, Reporters, Annotations/tags, Sharding, CI (GitHub Actions).
**Fazer:**
- Reorganizar em camadas: `src/pages`, `src/components`, `src/api`, `src/fixtures`, `src/data`, `config/` (envs validados), `tests/e2e|api`
- Tags `@smoke`/`@regression` + script `test:smoke`
- Reporters HTML + JUnit; `trace: 'on-first-retry'`
- GitHub Actions com `--shard=1/2` e upload de relatório/traces
- `eslint-plugin-playwright` + `tsconfig` strict
**Saber explicar:** desenhar a arquitetura em 5 min (camadas, pirâmide de testes, CI).

## Dia 4 — Bibliotecas partilhadas (o projeto-guia)
**Ideia central:** distribuir uma **plataforma versionada** + um **template fino** que a consome (não copiar código entre equipas).
**Pacotes a criar (npm workspaces, como se fossem publicados num registry interno):**
| Pacote | Responsabilidade |
|---|---|
| `@org/pw-config` | `defineOrgConfig()` com defaults (reporters, retries, trace, timeouts, browsers, envs); equipas só fazem override |
| `@org/pw-fixtures` | Fixtures base: auth por role, `apiClient`, cleanup automático de dados, logging |
| `@org/pw-core` | `BasePage`/`BaseComponent`, wrappers de `test.step` para relatórios legíveis |
| `@org/pw-data` | Factories/builders (faker), seeds determinísticos |
| `@org/eslint-config-playwright` | Regras: sem `waitForTimeout`, sem `test.only`, sem locators CSS crus |
| `@org/tsconfig` | TS strict partilhado |
| `@org/pw-reporters` (só conceito) | Envio de resultados/flakiness para dashboard/Teams |
| `create-org-pw` (só conceito) | Scaffolder `npm create org-pw` com CI e exemplos |

**Fazer:** extrair `packages/pw-config`, `packages/pw-fixtures`, `packages/pw-core` e pôr os testes do todo a consumi-los.

## Dia 5 — Governança e adoção por outras equipas
**Fazer (sobretudo documentação, é o que mostra senioridade):**
- README "Getting started em 15 minutos"
- Guia de convenções (naming, tags, estrutura de pastas, quando usar API vs UI)
- 2 ADRs curtos: "Fixtures em vez de herança" e "Dados únicos por teste em vez de reset global"
- Esboço de reusable workflow de CI que as equipas importam
**Saber explicar:** semver + changesets/CHANGELOG, Renovate para propagar updates, modelo inner-source (equipa core + PRs de outras equipas), métricas de adoção (nº de equipas, flaky rate, duração da suite), quality gates.

## Dia 6 — IA para acelerar com qualidade
**Ler/experimentar:** Playwright MCP e os agentes de teste do Playwright (planner / generator / healer); Playwright codegen.
**Fazer:**
- Criar `CLAUDE.md`/`AGENTS.md` no repo com as convenções e exemplos de fixtures/POMs → a IA gera código já normalizado
- Pedir à IA um teste novo (ex.: editar/apagar todo) e passá-lo pelos guardrails: lint, typecheck, `--repeat-each=5`, revisão humana
- Usar o MCP para explorar a app e gerar um teste a partir de um critério de aceitação
**Saber explicar:**
- Onde acelera: gerar testes a partir de user stories, POMs, dados de teste, análise de falhas via traces, refactors em massa, revisão de PRs
- Como garante qualidade: instruções no repo, mesmos guardrails para humano e IA, self-healing só como sugestão em PR, deteção de asserts fracos
- Como medir ROI: tempo para criar teste, flakiness, defeitos escapados, cobertura de critérios de aceitação
- Riscos: testes que não verificam nada, dados sensíveis em prompts, dependência excessiva

## Dia 7 — Consolidar
- Desenhar um diagrama único: camadas do projeto + pacotes partilhados + CI + onde entra a IA
- Ensaiar respostas em voz alta (2 min cada): "Como evitas flakiness?", "Como escalas para 10 equipas?", "POM vs fixtures vs screenplay?", "Como medes o ROI da IA?", "Que bibliotecas criarias e porquê?"
- Rever as notas dos dias 1–6 e o repo final como portfólio

## Verificação (sabes que aprendeste quando)
- A suite corre em paralelo (`workers: 4`) sem falhas 5x seguidas (`--repeat-each=5`)
- Um projeto novo numa pasta à parte funciona só a importar os pacotes `@org/*`, sem copiar código
- Consegues explicar cada decisão do diagrama sem notas

## Se o tempo apertar (mínimo essencial)
Dias 1–2 (fixtures, auth, paralelismo) + tabela de pacotes do Dia 4 + secção "Saber explicar" do Dia 6. É isso que sustenta qualquer conversa sobre os três temas.
