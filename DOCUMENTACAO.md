# Documentação Técnica — Academus Assistente Virtual
**Sistema:** Unioeste Academus — Módulo de Assistente Virtual Acadêmico  
**Versão:** Hackathon MVP · Abril/2026  
**Stack:** HTML5 · CSS3 · JavaScript ES2017 (async/await) · Bootstrap 3.4 · FontAwesome 4.7 · Groq API (LLaMA 3.3-70B)

---

## Sumário

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [C4 — Nível 1: Contexto](#2-c4--nível-1-contexto)
3. [C4 — Nível 2: Containers](#3-c4--nível-2-containers)
4. [C4 — Nível 3: Componentes](#4-c4--nível-3-componentes)
5. [C4 — Nível 4: Código (por arquivo)](#5-c4--nível-4-código-por-arquivo)
6. [Estruturas de Dados](#6-estruturas-de-dados)
7. [Fluxos de Execução](#7-fluxos-de-execução)
8. [Integrações Externas](#8-integrações-externas)
9. [Decisões de Arquitetura](#9-decisões-de-arquitetura)

---

## 1. Visão Geral do Sistema

O sistema é um **protótipo de front-end estático** que simula uma extensão proativa ao portal acadêmico Academus da Unioeste. O problema central que resolve: alunos em risco de reprovação só descobrem a situação tarde, quando a janela de recuperação já é estreita.

**Proposta de valor:** o Assistente Virtual analisa os dados acadêmicos do aluno (notas, faltas, tópicos com baixo rendimento) assim que a página carrega, emite alertas proativos e entrega imediatamente um plano de recuperação personalizado — sem que o aluno precise perguntar nada.

**Módulos existentes:**

| Módulo | Arquivo(s) | Responsabilidade |
|---|---|---|
| Login | `index.html` + `js/login.js` | Autenticação, guarda sessão em `sessionStorage` |
| Dashboard | `dashboard.html` + `js/dashboard.js` | Visão geral: notas, aulas, avaliações |
| Assistente | `assistente.html` + `js/assistente.js` | Chat com IA (Groq), análise proativa, quiz, plano de estudos |
| Estilos | `css/style.css` | CSS compartilhado entre todos os módulos |

---

## 2. C4 — Nível 1: Contexto

```
╔══════════════════════════════════════════════════════════════════════╗
║                        DIAGRAMA DE CONTEXTO                         ║
╚══════════════════════════════════════════════════════════════════════╝

                         ┌────────────────────┐
                         │     ESTUDANTE       │
                         │  (Usuário Final)    │
                         └────────┬───────────┘
                                  │  Acessa via navegador
                                  ▼
                    ┌─────────────────────────────┐
                    │                             │
                    │   ACADEMUS — ASSISTENTE     │
                    │   VIRTUAL ACADÊMICO         │
                    │                             │
                    │  Front-end estático         │
                    │  servido via Python HTTP    │
                    │  Server / qualquer web      │
                    │  server estático            │
                    │                             │
                    └──────┬──────────┬───────────┘
                           │          │
              ┌────────────┘          └───────────────┐
              ▼                                       ▼
 ┌────────────────────────┐            ┌──────────────────────────┐
 │   GROQ API             │            │  ACADEMUS (Sistema       │
 │   api.groq.com         │            │  Legado da Unioeste)     │
 │                        │            │                          │
 │  LLaMA 3.3-70B         │            │  Representado por mock   │
 │  Respostas contextuais │            │  JSON (dadosAluno)       │
 │  e geração de quizzes  │            │  em produção seria uma   │
 │                        │            │  API REST institucional  │
 └────────────────────────┘            └──────────────────────────┘

 ┌────────────────────────┐            ┌──────────────────────────┐
 │  GOOGLE AGENDA         │            │  WHATSAPP                │
 │                        │            │                          │
 │  Exportação via .ics   │            │  Compartilhamento via    │
 │  (RFC 5545) download   │            │  deep link wa.me/?text=  │
 └────────────────────────┘            └──────────────────────────┘
```

---

## 3. C4 — Nível 2: Containers

```
╔══════════════════════════════════════════════════════════════════════╗
║                       DIAGRAMA DE CONTAINERS                        ║
╚══════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────┐
│  BROWSER (Container único — SPA multi-página)                    │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  Login Page      │  │  Dashboard Page  │  │  Assistente   │  │
│  │  index.html      │  │  dashboard.html  │  │  Page         │  │
│  │                  │  │                  │  │  assistente   │  │
│  │  js/login.js     │  │  js/dashboard.js │  │  .html +      │  │
│  └────────┬─────────┘  └────────┬─────────┘  │  js/assist.  │  │
│           │                     │             │  ente.js     │  │
│           │ sessionStorage      │             └──────┬────────┘  │
│           └──────────┬──────────┘                    │           │
│                      │                               │           │
│           ┌──────────▼──────────────────────────┐   │           │
│           │   sessionStorage                     │   │           │
│           │   Chave: "unioeste_user"             │◄──┘           │
│           │   Valor: { nome, ra, usuario }       │               │
│           └──────────────────────────────────────┘               │
│                                                                  │
│           ┌──────────────────────────────────────┐               │
│           │   localStorage                       │               │
│           │   Chave: "unioeste_remember_user"    │               │
│           │   Valor: username (string)           │               │
│           └──────────────────────────────────────┘               │
│                                                                  │
│           ┌──────────────────────────────────────┐               │
│           │   dadosAluno (variável global)       │               │
│           │   Definida inline no <script> do     │               │
│           │   assistente.html. Simula resposta   │               │
│           │   da API do Academus.                │               │
│           └──────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────────┘
                │ HTTPS fetch                   │ HTTPS fetch
                ▼                               ▼
  ┌─────────────────────────┐    ┌──────────────────────────────┐
  │ Groq Cloud API          │    │ (Futuro) Academus API REST   │
  │ /openai/v1/chat/        │    │ Endpoint institucional para  │
  │  completions            │    │ notas, faltas, horários      │
  │ Modelo: llama-3.3-70b   │    └──────────────────────────────┘
  └─────────────────────────┘
```

**Justificativa de design:** todo o estado de sessão está no `sessionStorage` do browser, eliminando necessidade de backend próprio no MVP. A "integração" com o Academus é um mock JSON inline — o contrato de dados já está definido para facilitar a substituição por uma API real.

---

## 4. C4 — Nível 3: Componentes

### 4.1 Módulo Login (`index.html` + `js/login.js`)

```
┌──────────────────────────────────────────────────────────┐
│  MÓDULO LOGIN                                            │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  RouteGuard                                     │    │
│  │  Se sessionStorage["unioeste_user"] existe →   │    │
│  │  redireciona para dashboard.html imediatamente │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  CredentialStore                                │    │
│  │  Array USUARIOS_VALIDOS em memória              │    │
│  │  (substitui banco de dados no MVP)              │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  FormController                                 │    │
│  │  - Valida campos vazios                         │    │
│  │  - Busca usuário no CredentialStore             │    │
│  │  - Grava sessão no sessionStorage               │    │
│  │  - Gerencia "Lembrar usuário" (localStorage)   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  UIController                                   │    │
│  │  - Toggle visibilidade da senha (ícone olho)   │    │
│  │  - Renderiza alertas de erro/sucesso            │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Módulo Dashboard (`dashboard.html` + `js/dashboard.js`)

```
┌──────────────────────────────────────────────────────────┐
│  MÓDULO DASHBOARD                                        │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  RouteGuard (IIFE, executa antes do DOM)        │    │
│  │  sessionStorage → parse JSON → redireciona se   │    │
│  │  sessão inválida/ausente                        │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  NavbarController                               │    │
│  │  - Injeta nome + RA do usuário no #user-label  │    │
│  │  - Gerencia botão de logout                     │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  StaticPanels (HTML puro, sem JS)               │    │
│  │  - Painel "Últimas Notas" (mock: sem dados)     │    │
│  │  - Painel "Próximas Aulas" (5 aulas mockadas)   │    │
│  │  - Painel "Próximas Avaliações" (6 provas)      │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### 4.3 Módulo Assistente (`assistente.html` + `js/assistente.js`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  MÓDULO ASSISTENTE VIRTUAL                                           │
│                                                                      │
│  ┌───────────────────────────────┐  ┌────────────────────────────┐  │
│  │  ProactiveEngine              │  │  SidebarController         │  │
│  │                               │  │                            │  │
│  │  Ao carregar, lê dadosAluno   │  │  construirSidebar()        │  │
│  │  e dispara sequência de 3     │  │  - Popula lista de         │  │
│  │  mensagens com delay:         │  │    disciplinas com ícones  │  │
│  │  1. Alert de risco (400ms)    │  │    de semáforo             │  │
│  │  2. Plano de recuperação      │  │  - Calcula e renderiza     │  │
│  │     (400+600+1000ms)          │  │    barra "Termômetro do    │  │
│  │  3. Plano de horários         │  │    Semestre"               │  │
│  │     (+900+900ms)              │  │                            │  │
│  └───────────────────────────────┘  └────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────┐  ┌────────────────────────────┐  │
│  │  ChatEngine                   │  │  QuizEngine                │  │
│  │                               │  │                            │  │
│  │  enviar(texto):               │  │  isQuiz(texto)             │  │
│  │  1. Detecta intenção:         │  │  extrairTopico(texto)      │  │
│  │     - isPlanoEstudos()?       │  │  gerarQuiz(topico, cb)     │  │
│  │     - isQuiz()?               │  │  renderizarQuiz(perguntas) │  │
│  │     - senão → chamarIA()      │  │  handleQuizAnswer(btn)     │  │
│  │  2. Mostra indicador typing   │  │                            │  │
│  │  3. Desabilita input          │  │  Renderiza cards estilo    │  │
│  │  4. Exibe resposta            │  │  Duolingo com score        │  │
│  └───────────────────────────────┘  └────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────┐  ┌────────────────────────────┐  │
│  │  GroqClient                   │  │  StudyPlanModule           │  │
│  │                               │  │                            │  │
│  │  historico[]                  │  │  respostaHorarios()        │  │
│  │  buildSystemPrompt(user)      │  │  - Lê rotina de dadosAluno │  │
│  │  chamarIA(texto, user, cb)    │  │  - Gera card com tabela    │  │
│  │  markdownParaHtml(texto)      │  │    de blocos de estudo     │  │
│  │                               │  │                            │  │
│  │  Mantém janela de histórico   │  │  sincronizarAgenda()       │  │
│  │  de até 20 mensagens          │  │  - Gera arquivo .ics       │  │
│  └───────────────────────────────┘  │  - Download automático     │  │
│                                     │                            │  │
│  ┌───────────────────────────────┐  │  enviarWhatsapp()          │  │
│  │  LayoutManager                │  │  - Monta mensagem formatada│  │
│  │                               │  │  - Abre wa.me/?text=...    │  │
│  │  ajustarLayout()              │  └────────────────────────────┘  │
│  │  - Mede altura real do navbar │                                  │
│  │  - Aplica paddingTop no body  │                                  │
│  │  - Recalcula height do wrap   │                                  │
│  │  - Re-executa em resize       │                                  │
│  └───────────────────────────────┘                                  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 5. C4 — Nível 4: Código (por arquivo)

### 5.1 `js/login.js`

#### `USUARIOS_VALIDOS` (Array constante)
```
Tipo: Array<{ usuario: string, senha: string, nome: string, ra: string }>
Escopo: global (var)
Papel: banco de dados em memória substituindo autenticação real.
       Cada entrada representa um usuário válido do sistema mock.
```

#### Listener `DOMContentLoaded` (IIFE implícita)
```
Gatilho: carregamento do DOM
Responsabilidade:
  1. Inicializa referências para todos os elementos do formulário
  2. Verifica sessão ativa → redireciona para dashboard.html se existe
  3. Restaura usuário lembrado do localStorage
  4. Configura três listeners independentes:
     - btnOlho.click → toggle visibilidade da senha
     - form.submit   → validação e autenticação
     - (implícito)   → chkLembrar para persistência
```

#### `mostrarAlerta(msg, tipo)` (função interna)
```
Parâmetros:
  msg  : string — texto da mensagem a exibir
  tipo : string — classe Bootstrap ("danger" | "success")
Efeito: injeta innerHTML no #alert-box com um .alert Bootstrap
Não retorna valor.
```

#### Lógica de autenticação (dentro do submit)
```
Algoritmo:
  1. Sanitiza: usuario.trim(), senha (sem trim — senhas podem ter espaços)
  2. Valida presença: ambos devem ser non-empty
  3. Busca linear em USUARIOS_VALIDOS (O(n), aceitável para MVP)
  4. Se encontrado:
     a. Serializa { usuario, nome, ra } como JSON → sessionStorage["unioeste_user"]
     b. Se chkLembrar marcado → localStorage["unioeste_remember_user"] = usuario
        Senão → remove a chave do localStorage
     c. Feedback visual → setTimeout(400ms) → redirect para dashboard.html
  5. Se não encontrado: limpa campo senha, foca nele, exibe erro
```

---

### 5.2 `js/dashboard.js`

#### IIFE de proteção de rota (executa ANTES do DOMContentLoaded)
```
Estratégia: script carregado no <head> sem defer — executa síncronamente
            antes de qualquer render, eliminando "flash" de conteúdo
            protegido para usuários não autenticados.
Algoritmo:
  1. sessionStorage.getItem("unioeste_user") → se null → location.replace("index.html")
  2. JSON.parse → se falha → remove chave + redirect
  3. Se ok → aguarda DOMContentLoaded para manipular DOM
```

#### `DOMContentLoaded` listener
```
Responsabilidades:
  1. Injeta "Nome (RA)" no elemento #user-label da navbar
  2. Registra handler de logout:
     - ev.preventDefault()
     - Remove "unioeste_user" do sessionStorage
     - Redireciona para index.html
  3. Handler do botão #btn-matricula → alert() com mensagem mock
```

---

### 5.3 `js/assistente.js`

> Este é o arquivo principal, com ~660 linhas. Todas as funções são encapsuladas em uma IIFE para evitar poluição do escopo global.

#### Constantes de configuração
```
GROQ_API_KEY   : string — Bearer token da Groq Cloud API
GROQ_ENDPOINT  : string — "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL     : string — "llama-3.3-70b-versatile"
SYSTEM_PROMPT  : string — Persona, regras de resposta, domínio de conhecimento
                          e formato HTML que a IA deve seguir.
                          Inclui: personalidade, estrutura mínima de respostas,
                          lista de domínios cobertos.
AULAS          : Array<{dia, hora, disciplina, docente, data}> — próximos 5 aulas
historico      : Array<{role, content}> — janela deslizante das últimas 20
                 mensagens, enviada a cada chamada Groq para contexto conversacional
PALAVRAS_QUIZ  : Array<string> — dicionário de intenção para detecção de quiz
```

---

#### `isQuiz(texto)` → boolean
```
Propósito: detectar se o usuário quer praticar com questões em vez de texto livre
Parâmetros:
  texto : string — mensagem digitada pelo usuário
Algoritmo:
  - Normaliza (lowercase + remove acentos via NFD/regex)
  - Busca linear por qualquer palavra de PALAVRAS_QUIZ no texto normalizado
Retorna: true se qualquer palavra foi encontrada, false caso contrário
Complexidade: O(n×m) onde n=palavras do dicionário, m=tamanho do texto
```

#### `extrairTopico(texto)` → string
```
Propósito: isolar o tópico de estudo de uma frase de pedido de quiz.
           Ex: "me faz perguntas sobre Hidráulica" → "Hidráulica"
Parâmetros:
  texto : string — mensagem bruta do usuário
Algoritmo: série de regex replace para remover verbos de pedido e
           palavras de categoria, depois trim()
Fallback: se resultado vazio → retorna o texto original
```

#### `gerarQuiz(topico, callback)` → async void
```
Propósito: chamar a Groq API com prompt especializado para gerar questões
           de múltipla escolha e retornar array JSON puro
Parâmetros:
  topico   : string — tópico extraído por extrairTopico()
  callback : function(err, perguntas[]) — padrão Node-style callback
             (porque é chamado de código não-async)
Prompt enviado: solicita 4 questões em formato JSON estrito com campos
                pergunta, opcoes[4], correta (índice 0-3), explicacao
Tratamento de erro:
  - HTTP não-2xx → lança Error
  - JSON.parse falha → lança SyntaxError
  - Qualquer exceção → callback(err, null)
Limpeza de resposta: strip de blocos markdown (``` json / ```) antes do parse
```

#### `renderizarQuiz(perguntas, topico)` → string (HTML)
```
Propósito: gerar o HTML completo do componente de quiz interativo
Parâmetros:
  perguntas : Array<{pergunta, opcoes, correta, explicacao}>
  topico    : string — exibido no cabeçalho do quiz
Retorna: string HTML com:
  - .quiz-wrap (container com id único baseado em Date.now())
  - .quiz-header com título e placar "0 / N"
  - Para cada questão: .quiz-q com texto e 4 botões .quiz-opcao
  - Cada botão carrega data-attributes: quiz, qi, oi, correta, explicacao
  - .quiz-feedback (oculto) para exibir explicação após resposta
Nota: usa Date.now() como namespace de ID para suportar múltiplos quizzes
      na mesma sessão sem conflito de IDs
```

#### `handleQuizAnswer(btn)` → void
```
Propósito: processar a resposta do aluno a uma questão do quiz
Parâmetros:
  btn : HTMLButtonElement — botão clicado pelo usuário
Algoritmo:
  1. Lê data-attributes: quiz (namespace), qi (índice da questão),
     oi (opção escolhida), correta (opção correta), explicacao
  2. Desabilita TODOS os botões da questão (querySelectorAll por data-quiz+data-qi)
  3. Adiciona classe .quiz-correta ou .quiz-errada ao botão clicado
  4. Se errou: destaca visualmente a opção correta com .quiz-correta
  5. Exibe div .quiz-feedback com ✅/❌ + texto da explicação
  6. Se acertou: incrementa o placar no elemento #[qid]-score
Efeito colateral: não modifica historico[] — quiz não entra no contexto da IA
```

#### `sincronizarAgenda()` → void
```
Propósito: gerar e fazer download de um arquivo .ics (RFC 5545) com
           os blocos de estudo do plano personalizado
Dependência: window.dadosAluno.rotina.blocos — array de blocos de estudo
Algoritmo:
  1. proxData(diaSemana, horaStr): calcula a próxima ocorrência do dia da
     semana a partir de hoje, aplicando o horário especificado
  2. toIcsDate(d): formata Date como YYYYMMDDTHHMMSS (sem timezone = floating)
  3. Monta string ICS com VCALENDAR + um VEVENT por bloco
  4. Cria Blob com MIME "text/calendar;charset=utf-8"
  5. URL.createObjectURL → clique programático em <a download> → revoga URL
Efeito: abre diálogo de download do OS com arquivo "plano-estudos-academus.ics"
```

#### `enviarWhatsapp()` → void
```
Propósito: compartilhar o plano de estudos via WhatsApp Web
Dependência: window.dadosAluno.rotina.blocos
Algoritmo:
  1. Monta string de mensagem formatada com emojis e marcação *bold* do WhatsApp
  2. encodeURIComponent(msg) → abre "https://wa.me/?text=..."
     em nova aba (window.open com _blank)
Nota: wa.me sem número de destino abre o WhatsApp para o usuário escolher
      o destinatário — comportamento intencional para privacidade
```

#### `respostaHorarios()` → string (HTML)
```
Propósito: gerar HTML do card "Plano de Estudos Personalizado" com tabela
           de blocos de estudo respeitando a rotina de trabalho do aluno
Dependência: window.dadosAluno.rotina (trabalho, blocos[])
Retorna: string HTML de um .panel Bootstrap com:
  - Cabeçalho: "Plano de Estudos Personalizado"
  - Parágrafo com turno de trabalho detectado
  - Tabela condensada: dia+hora × tópico
  - Botão "Confirmar no Google Agenda" (data-acao="agenda")
Fallback: se rotina ausente → string de texto explicando ausência de dados
```

#### `isPlanoEstudos(texto)` → boolean
```
Propósito: detectar intenção de consultar o plano de horários antes de
           chamar a Groq (resposta local é mais rápida e controlada)
Parâmetros:
  texto : string — mensagem do usuário
Dicionário: ["plano de estudo", "plano de estudos", "ver meu plano",
             "meu plano", "rotina de estudo", "horarios de estudo",
             "agenda de estudo"]
Algoritmo: mesmo padrão de normalização de isQuiz()
```

#### `iconStatus(risco)` → string (HTML)
```
Parâmetros:
  risco : "alto" | "medio" | "baixo"
Retorna: string com <i> do FontAwesome 4.x colorido:
  "alto"  → fa-exclamation-circle text-danger  (vermelho)
  "medio" → fa-exclamation-triangle text-warning (amarelo)
  "baixo" → fa-check-circle text-success         (verde)
```

#### `buildSystemPrompt(user)` → string
```
Propósito: construir o system prompt completo para cada chamada à Groq,
           injetando dados contextuais do aluno atual
Parâmetros:
  user : { nome, ra } | null
Compõe:
  1. SYSTEM_PROMPT (persona + regras + domínio)
  2. Dados do estudante: nome + RA
  3. Próximas aulas (AULAS[]) em formato texto
  4. Situação acadêmica completa (dadosAluno.disciplinas[]) se disponível:
     nota_p1, faltas/faltas_max, risco, nota_necessaria_p2
  5. Instruções de formato: HTML simples, sem Markdown, em português
Retorna: string concatenada — passada como messages[0].content na API
```

#### `markdownParaHtml(texto)` → string
```
Propósito: converter resposta da Groq (que pode retornar Markdown
           apesar das instruções) para HTML seguro para innerHTML
Transformações:
  **texto** → <strong>texto</strong>
  *texto*   → <em>texto</em>
  \n        → <br>
Nota: transformação superficial — não trata listas, código, tabelas.
      Para o MVP é suficiente dado o SYSTEM_PROMPT guiar o formato.
```

#### `chamarIA(texto, user, callback)` → async void
```
Propósito: enviar mensagem à Groq e receber resposta contextualizada
Parâmetros:
  texto    : string — mensagem do usuário
  user     : { nome, ra } | null
  callback : function(err, htmlString) — padrão Node-style callback
Algoritmo:
  1. Adiciona mensagem ao historico[] (role: "user")
  2. Monta messages = [system_prompt] + historico (janela completa)
  3. POST para GROQ_ENDPOINT com model, messages, temperature=0.7, max_tokens=1500
  4. Se HTTP error: lê JSON de erro e lança com mensagem descritiva
  5. Extrai resposta do choices[0].message.content
  6. Adiciona ao historico[] (role: "assistant")
  7. Trunca historico se > 20 mensagens (janela deslizante)
  8. callback(null, markdownParaHtml(resposta))
Tratamento de erro:
  - Remove a mensagem do usuário do historico[] (historico.pop()) para
    não corromper o contexto conversacional
  - callback(err, null)
```

#### `construirSidebar()` → void
```
Propósito: popular a sidebar com dados reais de dadosAluno
Dependência: window.dadosAluno, elementos DOM #sidebar-disciplinas,
             #barra-ok, #barra-atencao, #barra-risco, #sidebar-legend
Algoritmo:
  1. Limpa lista anterior (innerHTML = '')
  2. Para cada disciplina: cria <li> com iconStatus() + nome
  3. Conta disciplinas por categoria de risco
  4. Calcula percentuais e aplica como width% nas barras Bootstrap
  5. Gera texto de legenda com contadores por cor
```

#### `mensagensProativas()` → void
```
Propósito: iniciar a conversa de forma proativa, sem input do usuário
Dependência: window.dadosAluno, funções de chat (adicionarMensagem,
             mostrarDigitando, removerDigitando, respostaHorarios)
Algoritmo (sequência temporizada):
  Se dadosAluno ausente:
    → mensagem genérica de boas-vindas imediata
  Se nenhuma disciplina com risco "alto":
    → mensagem de situação ok imediata
  Se há disciplinas em risco (emRisco[]):
    +400ms  → Mensagem 1: alert alert-danger com nota + faltas da disciplina
    +1000ms → [digitando…]
    +1000ms → Mensagem 2: panel com plano de recuperação + 3 botões de ação
    +900ms  → [digitando…] (se rotina disponível)
    +900ms  → Mensagem 3: panel com plano de horários personalizado
Usa apenas a PRIMEIRA disciplina em risco (emRisco[0]) para foco narrativo
```

#### `ajustarLayout()` → void
```
Propósito: corrigir o padding-top do body e height do .assistente-wrap
           dinamicamente, pois o navbar pode ter 1 ou 2 linhas dependendo
           da largura da janela (Bootstrap 3 não usa CSS Grid)
Algoritmo:
  1. Mede navbar.offsetHeight (valor real pós-render)
  2. document.body.style.paddingTop = h + "px"
  3. wrap.style.height = "calc(100vh - " + h + "px)"
Registrada também em window.resize para adaptar a mudanças de viewport
```

#### `adicionarMensagem(html, tipo)` → void
```
Parâmetros:
  html : string — conteúdo da mensagem (HTML para bot, texto puro para usuário)
  tipo : "bot" | "user"
Heurística isCard:
  - Detecta se html contém "panel" ou "alert" (strings literais)
  - Se sim: aplica .chat-msg-wide (max-width: 88%) e .chat-bubble-card
    (background transparente, sem box-shadow) para que o Bootstrap panel/alert
    seja o único elemento visual — evita "card dentro de card"
  - Se não: bubble normal com fundo branco e box-shadow
Nota: html do usuário é escapado com escapeHtml() — o conteúdo do bot
      é renderizado como HTML bruto (confiança no código que gera)
```

#### `mostrarDigitando()` / `removerDigitando()` → void
```
mostrarDigitando:
  Cria .chat-msg.chat-msg-bot com id="chat-digitando"
  Contém 3 <span class="dot-pulse"> animados por CSS keyframes
  Adicionado ao #chat-messages + scroll para o final

removerDigitando:
  Busca #chat-digitando e remove do DOM (parentNode.removeChild)
  Idempotente: se não existe, não faz nada
```

#### `escapeHtml(s)` / `escapeAttr(s)` → string
```
escapeHtml: escapa & < > para entidades HTML — usado em conteúdo de texto
escapeAttr: escapa & " < > — usado em valores de atributos HTML (data-explicacao)
Ambas convertem argumento para String() primeiro (seguro para números/null)
```

#### `enviar(textoForce?)` → void (interna ao DOMContentLoaded)
```
Parâmetros:
  textoForce : string | undefined — se passado, usa este texto;
               se undefined, lê e limpa o #chat-input
Fluxo de decisão (pipeline de intenção):
  1. isPlanoEstudos(texto)?
     → done() imediato + adicionarMensagem(respostaHorarios())
     (resposta local, sem rede)
  2. isQuiz(texto)?
     → gerarQuiz(topico, callback)
     → callback: done() + adicionarMensagem(renderizarQuiz(...))
     (1 chamada Groq com prompt especializado)
  3. Caso geral:
     → chamarIA(texto, user, callback)
     → callback: done() + adicionarMensagem(resposta)
     (1 chamada Groq com contexto completo)
Em todos os casos:
  - adicionarMensagem(texto, 'user') antes de qualquer processamento
  - mostrarDigitando() + setLoading(true) durante processamento
  - done() = removerDigitando() + setLoading(false) + input.focus()
```

#### Event delegation (DOMContentLoaded)
```
Listener único em document.addEventListener('click'):
  - .quiz-opcao (via closest): handleQuizAnswer(t)
  - .quick-reply-btn: enviar(el.getAttribute('data-pergunta'))
  - .btn-acao-plano: switch em data-acao:
      "agenda"    → sincronizarAgenda()
      "whatsapp"  → enviarWhatsapp()
      "videoaula" → window.open(url YouTube, '_blank')
      (outros)    → alert() de mock

Botões .btn-acao da sidebar:
  Loop direto em querySelectorAll (não delegação) porque existem no DOM
  ao carregar a página — cada um chama enviar(data-pergunta)
```

---

## 6. Estruturas de Dados

### 6.1 `dadosAluno` (global, definido em `assistente.html`)

```javascript
{
  aluno: string,                  // Nome do aluno
  rotina: {
    trabalho: string,             // Turno: "manha" | "tarde" | "noite"
    horarios_livres: string[],    // Descrição textual dos horários vagos
    blocos: [{
      dia:    string,             // "Seg" | "Ter" | "Qua" | "Qui" | "Sex"
      hora:   string,             // "HH:MM-HH:MM"
      topico: string              // Descrição do bloco de estudo
    }]
  },
  disciplinas: [{
    nome:              string,    // Nome da disciplina
    nota_p1:           number,    // Nota da primeira prova (0-10)
    faltas:            number,    // Faltas acumuladas
    faltas_max:        number,    // Limite de faltas permitido
    nota_necessaria_p2: number,   // Nota mínima na P2 para aprovação
    risco:             string,    // "alto" | "medio" | "baixo"
    topicos_fracos:    string[]   // Tópicos com menor desempenho
  }]
}
```

**Regra de negócio implícita:**  
`nota_necessaria_p2 = (6.0 × 2) - nota_p1` — baseado em média simples com mínimo 6.0.

### 6.2 Sessão de usuário (`sessionStorage["unioeste_user"]`)

```javascript
{
  usuario: string,  // username para futura referência
  nome:    string,  // Nome para exibição na UI
  ra:      string   // Registro Acadêmico
}
```

### 6.3 `historico[]` (em memória, por sessão de página)

```javascript
Array<{
  role:    "user" | "assistant",
  content: string   // texto puro (não HTML)
}>
// Máximo: 20 entradas (janela deslizante)
// Zerado ao recarregar a página — não há persistência do chat
```

### 6.4 `USUARIOS_VALIDOS` (em memória)

```javascript
Array<{
  usuario: string,  // login
  senha:   string,  // plain text — aceitável em MVP sem backend
  nome:    string,
  ra:      string
}>
// Entradas atuais: "rodrigo.rosa7"/123456, "vinicius"/123456, "admin"/admin
```

---

## 7. Fluxos de Execução

### 7.1 Fluxo de Login

```
Usuário acessa index.html
    │
    ├─ sessionStorage["unioeste_user"] existe?
    │   └─ SIM → redirect dashboard.html (sem render do login)
    │
    └─ NÃO → renderiza formulário
                │
                ├─ localStorage["unioeste_remember_user"] existe?
                │   └─ SIM → pré-preenche campo usuário
                │
                └─ Usuário submete formulário
                        │
                        ├─ Campos vazios? → alerta "danger"
                        │
                        ├─ Credenciais inválidas? → alerta "danger" + limpa senha
                        │
                        └─ Credenciais válidas?
                                │
                                ├─ sessionStorage ← JSON do usuário
                                ├─ "Lembrar"? → localStorage ← username
                                ├─ Alerta "success"
                                └─ 400ms → redirect dashboard.html
```

### 7.2 Fluxo de Inicialização do Assistente

```
assistente.html carrega
    │
    ├─ <head>: dashboard.js (IIFE) → valida sessão ou redirect
    │
    ├─ DOM pronto: DOMContentLoaded
    │       │
    │       ├─ ajustarLayout() → mede navbar, ajusta CSS
    │       ├─ Lê user do sessionStorage → popula sidebar-nome/ra
    │       ├─ construirSidebar() → popula disciplinas + termômetro
    │       └─ mensagensProativas():
    │               │
    │               +400ms  → Mensagem de alerta (se há risco)
    │               +1600ms → [digitando...]
    │               +2600ms → Card plano de recuperação
    │               +3500ms → [digitando...]
    │               +4400ms → Card plano de horários
    │
    └─ Usuário começa a interagir
```

### 7.3 Fluxo de Mensagem do Usuário

```
Usuário digita + submete (ou clica quick reply / btn-acao)
    │
    enviar(texto)
    │
    ├─ adicionarMensagem(texto, 'user')
    ├─ mostrarDigitando()
    ├─ setLoading(true)
    │
    ├─ isPlanoEstudos(texto)?
    │   └─ SIM → done() + adicionarMensagem(respostaHorarios(), 'bot')
    │
    ├─ isQuiz(texto)?
    │   └─ SIM → extrairTopico()
    │              └─ gerarQuiz(topico, cb) ─── Groq API ───►
    │                  │                    ◄─── JSON ────────
    │                  └─ cb(null, perguntas) → done() + renderizarQuiz()
    │
    └─ NÃO → chamarIA(texto, user, cb) ─── Groq API ────►
                 │                      ◄── choices[0] ────
                 └─ cb(null, html) → done() + adicionarMensagem(html, 'bot')
```

---

## 8. Integrações Externas

### 8.1 Groq Cloud API

| Atributo | Valor |
|---|---|
| Endpoint | `https://api.groq.com/openai/v1/chat/completions` |
| Modelo | `llama-3.3-70b-versatile` |
| Autenticação | Bearer token no header Authorization |
| temperatura | 0.7 (chat geral) · 0.8 (geração de quiz) |
| max_tokens | 1500 por chamada |
| Protocolo | OpenAI-compatible REST API |
| Chamadas por sessão | 1 por mensagem do usuário (exceto plano de estudos) |

**Duas chamadas distintas:**
- `chamarIA()` — chat geral com system prompt completo e histórico
- `gerarQuiz()` — prompt especializado isolado, sem histórico de chat

### 8.2 Google Agenda (export ICS)

Não há OAuth2 ou API do Google envolvida. O sistema gera um arquivo `.ics` (RFC 5545) localmente no browser e dispara download. O usuário importa manualmente no Google Agenda, Apple Calendar ou qualquer cliente compatível.

**Campos ICS gerados:** `DTSTART`, `DTEND`, `SUMMARY`, `DESCRIPTION` por evento. Sem `RRULE` (recorrência) — cada bloco é evento único.

### 8.3 WhatsApp

Deep link `https://wa.me/?text=<encoded>` — abre o WhatsApp Web/App com mensagem pré-preenchida. Sem API Business, sem autenticação. O usuário escolhe o destinatário dentro do WhatsApp.

---

## 9. Decisões de Arquitetura

### 9.1 Por que front-end puro (sem backend)?
Restrição do hackathon: zero infraestrutura própria para deploy. Um servidor Python `http.server` serve os estáticos — o único backend externo é a Groq API.

### 9.2 Por que Groq em vez de OpenAI?
Latência: o LLaMA 3.3-70B na Groq tem latência de resposta ~3-5× menor que GPT-4o equivalente, essencial para a UX do chat. A API é compatível com o contrato OpenAI, facilitando migração futura.

### 9.3 Por que `sessionStorage` e não `localStorage` para sessão?
`sessionStorage` expira quando a aba/janela é fechada — comportamento correto para um portal universitário (evita sessão permanente em computadores compartilhados de laboratório). `localStorage` é usado apenas para "Lembrar usuário" (só o username, nunca a senha).

### 9.4 Por que delegação de eventos em vez de listeners diretos nos botões dinâmicos?
Cards do quiz e do plano de recuperação são gerados dinamicamente via innerHTML. `addEventListener` em elementos que ainda não existem no DOM não funciona — delegação no `document` resolve isso com um único listener.

### 9.5 Por que janela deslizante de 20 mensagens no histórico?
Cada mensagem no histórico aumenta o número de tokens enviados à API (custo e latência). 20 mensagens (~10 turnos de conversa) cobre a maioria das sessões sem desperdiçar tokens com contexto irrelevante de turnos muito antigos.

### 9.6 Por que `IIFE` em todos os arquivos JS?
Evita poluição do namespace global. As únicas variáveis globais intencionais são `dadosAluno` (definida no HTML para substituição simples por API real) e `USUARIOS_VALIDOS` (fora da IIFE por design de simplicidade no MVP).

### 9.7 Por que mock JSON inline em vez de `fetch` a um arquivo `.json`?
Em demos ao vivo, arquivos externos podem ter problemas de CORS com servidores locais simples. O script inline garante disponibilidade síncrona antes que o `assistente.js` execute, sem nenhuma dependência de rede para os dados mock.