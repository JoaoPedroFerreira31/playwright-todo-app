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

---

# Módulo 2 — Fundamentos de teste, BDD, Gherkin, Cucumber e Linux

## Estado do Módulo 1 (a 19/11)
| Dia | Estado |
|---|---|
| 1–3 | ✅ Concluídos (fixtures, auth, paralelismo, config CI, tags, lint, pipeline GitHub Actions) |
| 4 | ✅ `@org/pw-config` e `@org/pw-fixtures` criados (falta commit do `pw-fixtures`) |
| 5 | ⬜ ADRs e guia de convenções |
| 6 | 🟡 Em curso (teoria feita; falta o `CLAUDE.md` e pôr a IA à prova) |
| 7 | ⬜ Consolidar |

Ordem sugerida: terminar o Dia 6 → Dia 8 (fundamentos de teste) → Dias 9 e 10 (Gherkin e Cucumber) → Dia 11 (Linux) → Dia 7 no fim, para consolidar tudo de uma vez. O Dia 11 também pode ser feito em sessões curtas em paralelo com os outros.

## Dia 8 — Fundamentos: o que é um teste e como se pensa sobre testes
Dia teórico. É a base que dá sentido a tudo o resto: o Gherkin descreve **comportamentos**, e só se descreve bem um comportamento quando se sabe o que se quer verificar e porquê.
**Ler:**
- ISTQB Foundation Level (syllabus v4.0): capítulos 1 (fundamentos), 2 (testes no ciclo de vida) e 4 (técnicas de desenho de testes)
- Martin Fowler, "The Practical Test Pyramid"
- Kent C. Dodds, "The Testing Trophy" (uma visão alternativa à pirâmide)
- Opcional: "Lessons Learned in Software Testing" (Kaner, Bach, Pettichord)

**1. O que é um teste**
- Um teste compara o **comportamento observado** com o **comportamento esperado**. Quem decide o que é "esperado" é o **oráculo** (requisitos, critérios de aceitação, especificação, bom senso do domínio)
- **Verificação** ("construímos bem o produto?") vs **validação** ("construímos o produto certo?")
- **Erro → defeito → falha:** a pessoa comete um erro, que introduz um defeito no código, que se manifesta como falha quando o código corre
- **Testar não prova a ausência de defeitos:** só mostra a presença. Testar é **reduzir risco** e dar **informação** para decidir (por exemplo, se se pode fazer release)
- **Teste vs verificação automática** (*testing* vs *checking*, Bach e Bolton): um script confirma o que alguém já pensou; o pensamento crítico e a exploração continuam a ser humanos

**2. Os 7 princípios do ISTQB**
1. Testar mostra a presença de defeitos, não a sua ausência
2. Testar exaustivamente é impossível → escolhe-se com base no risco
3. Testar cedo poupa tempo e dinheiro (*shift-left*)
4. Os defeitos agrupam-se (poucas áreas concentram a maioria)
5. Os testes desgastam-se: repetir sempre os mesmos deixa de encontrar defeitos novos (o "paradoxo do pesticida")
6. Testar depende do contexto (uma app bancária não se testa como um jogo)
7. A falácia da ausência de erros: um sistema sem defeitos pode não servir o utilizador

**3. Níveis e tipos de teste**
- **Níveis:** unitário → integração → sistema (E2E) → aceitação
- **Tipos funcionais** (o que o sistema faz) vs **não funcionais** (como o faz: desempenho, segurança, acessibilidade, usabilidade)
- **Estáticos** (revisões, lint, typecheck: sem executar código) vs **dinâmicos** (executam o código)
- **Caixa preta** (pela especificação), **caixa branca** (pela estrutura do código), **caixa cinzenta** (os testes E2E com preparação pela API são um exemplo)
- **Regressão** (o que funcionava continua a funcionar), **smoke** (está vivo?), **sanity**, **exploratório**
- **A pirâmide de testes:** muitos unitários, menos de integração, poucos E2E. Porquê: custo, velocidade e estabilidade. O "troféu" de testes dá mais peso à integração

**4. Técnicas de desenho de testes** (como escolher **que** casos testar)
- **Partições de equivalência:** dividir as entradas em grupos que se comportam da mesma forma e testar um valor de cada
- **Valores-limite:** os defeitos vivem nas fronteiras (por exemplo, 7, 8 e 9 caracteres numa password com mínimo de 8)
- **Tabelas de decisão:** combinações de condições → resultado esperado
- **Transição de estados:** estados e eventos (por exemplo, uma tarefa por fazer → concluída → por fazer)
- **Adivinhação de erros e testes exploratórios:** a experiência e a curiosidade a encontrar o que as técnicas formais não cobrem

**5. Anatomia de um bom teste automatizado**
- **Arrange → Act → Assert** (preparar → agir → verificar); em Gherkin: Given → When → Then
- **Independente** (não depende de outros testes nem da ordem), **determinístico** (o mesmo resultado sempre), **rápido**, **com uma só razão para falhar**, **legível** (o nome diz o que prova)
- **Asserções fortes:** verificar o que interessa, e não só que "algo aparece"
- **Duplos de teste:** stub, mock, fake e spy (o que são e quando se usam, por exemplo, o `page.route()` do Playwright)

**6. Quando é que um teste está errado**
- ⚠️ **Terminologia correta:** um **falso positivo** é um teste que **falha sem haver defeito** (por exemplo, um flaky); um **falso negativo** é um teste que **passa apesar de haver defeito**. No Módulo 1 chamámos "falso positivo" a testes que passavam pela razão errada; o termo correto para esses casos é **falso negativo**
- **Testes flaky:** as causas (estado partilhado, timing, dependências externas, ordem) e como os tratar
- **Cobertura de código:** o que mede (linhas executadas) e o que **não** mede (se as asserções verificam alguma coisa)
- **Testar os testes:** *mutation testing* (introduzir defeitos de propósito e ver se algum teste falha); é a técnica do "partir de propósito" usada no Módulo 1, formalizada

**7. Testes no processo**
- **Testes baseados em risco:** probabilidade × impacto decide onde investir
- **Critérios de entrada e de saída**, *Definition of Done*
- **Shift-left** (testar mais cedo, incluindo os requisitos) e **shift-right** (monitorização em produção)

**Fazer** (aplicar a teoria ao projeto, sem escrever código novo):
- Classificar os testes atuais por **nível** e **tipo**, e desenhar a pirâmide real do projeto (quantos de API, quantos de UI). Está equilibrada?
- **Partições e valores-limite** para as regras reais da app (em `src/routes/auth.ts` e `src/routes/todos.ts`): a password com mínimo de 8 caracteres e o título com máximo de 100 → que casos escolherias? Quais faltam na suite?
- Uma **tabela de decisão** para o login (email existe? password certa? campos vazios?)
- Um **diagrama de transição de estados** para uma tarefa (por fazer, concluída, editada, apagada)
- **Mutation testing à mão:** introduzir 3 defeitos na app (por exemplo, mudar o `< 8` da password para `< 6`) e ver quais os testes que os apanham. Os que nenhum teste apanhar são lacunas na suite
- Rever 3 testes do Módulo 1 com a checklist da anatomia de um bom teste
**Saber explicar:** porque é que testar não prova a ausência de defeitos; a pirâmide e o seu porquê; como escolher casos com partições e valores-limite; a diferença entre falso positivo e falso negativo; porque é que 100% de cobertura não quer dizer testes bons.

## Dia 9 — BDD e Gherkin: descrever testes
**Ler:** cucumber.io/docs/gherkin/reference e cucumber.io/docs/bdd (o que é BDD e o "Three Amigos").
**Conceitos:**
- **BDD:** negócio, desenvolvimento e QA concordam no comportamento **antes** de o implementar, com exemplos concretos; os cenários tornam-se documentação viva e testes
- **Palavras-chave:** `Feature`, `Rule`, `Background`, `Scenario`, `Scenario Outline` + `Examples`, `Given` / `When` / `Then` / `And` / `But`, tags (`@smoke`), Data Tables, Doc Strings
- **Gherkin em português:** `# language: pt` → `Funcionalidade`, `Cenário`, `Dado`, `Quando`, `Então`, `E`, `Mas`, `Esquema do Cenário`, `Exemplos`
- **Boas práticas:**
  - estilo **declarativo** (o quê) e não **imperativo** (cliques e campos)
  - um comportamento por cenário
  - `Given` = estado inicial (que no código se prepara pela API); `When` = uma ação; `Then` = resultado observável
  - a linguagem do negócio, sem detalhes da UI (nada de test-ids nem seletores)
  - cenários independentes uns dos outros
**Fazer:**
- Escrever `features/autenticacao.feature` e `features/tarefas.feature` com 5–6 cenários, a partir das ideias da lista em `tests/todo.spec.ts`
- Um `Scenario Outline` para as validações do registo (password curta, passwords diferentes, email já existente)
- Reescrever um cenário imperativo em declarativo e comparar
**Saber explicar:** declarativo vs imperativo; porque é que o Gherkin não deve mencionar a UI; o papel do Gherkin numa conversa "Three Amigos".

## Dia 10 — Cucumber com Playwright: executar o Gherkin
**Ler:** cucumber.io/docs/cucumber/step-definitions, Cucumber Expressions (`{string}`, `{int}`) e a documentação do `playwright-bdd`.
**Conceitos:**
- **Step definitions:** o código que liga cada frase do Gherkin a uma ação
- **Duas abordagens:**
  - `@cucumber/cucumber` + Playwright como biblioteca: o Cucumber é o runner, e perdes as fixtures, o trace, os retries e o paralelismo do Playwright Test (tens de os reconstruir com World e hooks)
  - **`playwright-bdd`** (recomendado aqui): gera testes Playwright a partir dos `.feature` e mantém as fixtures (`user`, `todo`), os POMs, o trace, os reporters, as tags e a pipeline
**Fazer:**
- Instalar o `playwright-bdd` e configurar `defineBddConfig` (ou um projeto à parte) no `playwright.config.ts`
- Step definitions com `createBdd(test)` usando **as tuas fixtures** (`user`, `todo`, `loginPage`, `todoPage`)
- Correr os `.feature` do Dia 9; as tags `@smoke` do Gherkin devem funcionar com `npm run test:smoke`
- Confirmar que typecheck, lint e CI continuam verdes
**Saber explicar:**
- quando o BDD compensa (o negócio lê e escreve cenários) e quando é só sobrecarga (só a QA lê os `.feature`)
- o risco da explosão de step definitions
- uma biblioteca de steps partilhados como mais um pacote da plataforma (Dia 4)

## Dia 11 — Linux e pipes Unix
**Ler:** "The Linux Command Line" (capítulos sobre redirecionamento e pipes) ou o tutorial "Unix philosophy".
**Conceitos:**
- **Os três canais:** stdin, stdout, stderr
- **Redirecionamento:** `>`, `>>`, `2>`, `2>&1`, `<`
- **Pipes:** `|` liga o stdout de um comando ao stdin do seguinte; a filosofia "ferramentas pequenas compostas"
- **Encadear comandos com exit codes:** `&&`, `||`, `;`, `$?`, `set -e`, `set -o pipefail` (porque é que um pipe pode esconder uma falha numa pipeline de CI)
- **Variáveis de ambiente:** `CI=true npx playwright test`, `export`, `PATH`
**Comandos:** `ls`, `cd`, `cat`, `less`, `head`, `tail -f`, `grep` (`-r -n -i -c -v -E`), `wc -l`, `sort`, `uniq -c`, `cut`, `tr`, `sed`, `awk`, `find`, `xargs`, `jq`, `curl`, `ps`, `kill`, `which`, `chmod`
**Fazer** (no Git Bash, sobre este projeto):
- Contar os testes por tag: `grep -rn "@smoke" tests | wc -l`
- Listar os testes que falharam a partir do `test-results/junit.xml`
- Com `npx playwright test --reporter=json | jq ...`, listar os testes ordenados por duração
- `curl -s http://localhost:9100/api/health` com o servidor de testes a correr
- Reproduzir com `set -o pipefail` porque é que `npx playwright test | tee log.txt` pode dar exit 0 com testes a falhar
**Saber explicar:** porque é que as pipelines correm em Linux; como ler um log de CI; o que é um exit code e como decide se um passo passa ou falha.

---

## Verificação (sabes que aprendeste quando)
- A suite corre em paralelo (`workers: 4`) sem falhas 5x seguidas (`--repeat-each=5`)
- Um projeto novo numa pasta à parte funciona só a importar os pacotes `@org/*`, sem copiar código
- Consegues explicar cada decisão do diagrama sem notas
- Dada uma regra da app, escolhes os casos de teste com partições de equivalência e valores-limite, e explicas porquê
- Escreves um cenário Gherkin declarativo a partir de uma user story, e ele corre com as fixtures do projeto
- Lês um log de CI e extrais os testes que falharam só com comandos de terminal encadeados

## Se o tempo apertar (mínimo essencial)
Dias 1–2 (fixtures, auth, paralelismo) + tabela de pacotes do Dia 4 + secção "Saber explicar" do Dia 6. É isso que sustenta qualquer conversa sobre os três temas.
