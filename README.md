# Unioeste Sistema - Mock Login + Academus

Mock funcional do fluxo de login da Unioeste com redirecionamento para a dashboard do Academus.

## 📁 Estrutura

```
unioeste-sistema/
├── index.html         → Tela de login (ponto de entrada)
├── dashboard.html     → Dashboard do Academus
├── css/
│   └── style.css      → Estilos compartilhados
├── js/
│   ├── login.js       → Autenticação + redirecionamento
│   └── dashboard.js   → Proteção de rota + dados do usuário
└── README.md
```

## 🔑 Credenciais de teste

| Usuário         | Senha    |
|-----------------|----------|
| `rodrigo.rosa7` | `123456` |
| `admin`         | `admin`  |

## 🚀 Como rodar

### Opção 1 — Abrir direto no navegador
Basta dar duplo clique em `index.html`. Funciona porque não há requisições a APIs externas (apenas CDNs do Bootstrap/FontAwesome).

### Opção 2 — Live Server no VS Code (recomendado)
1. Abra a pasta `unioeste-sistema` no VS Code
2. Instale a extensão **Live Server** (do autor Ritwick Dey)
3. Clique com botão direito em `index.html` → **Open with Live Server**
4. O navegador abre em `http://127.0.0.1:5500/index.html`

### Opção 3 — Python (se tiver instalado)
Dentro da pasta do projeto:
```bash
python -m http.server 8080
```
Depois acesse `http://localhost:8080`

### Opção 4 — Node (http-server)
```bash
npx http-server -p 8080
```

## 🔄 Fluxo

1. `index.html` carrega → se já tiver sessão ativa, vai direto para `dashboard.html`
2. Usuário preenche credenciais e clica em **Entrar**
3. `login.js` valida contra a lista mockada
4. Se válido: grava `sessionStorage.unioeste_user` e redireciona para `dashboard.html`
5. `dashboard.html` verifica a sessão via `dashboard.js` — se não houver, volta para `index.html`
6. Logout: menu do usuário (canto superior direito) → **Sair** limpa a sessão

## 🛠 Stack

- HTML5 + CSS3
- Bootstrap 3.4.1 (via CDN)
- FontAwesome 4.7 (via CDN)
- jQuery 1.12.4 (apenas no dashboard, para dropdowns do Bootstrap)
- JavaScript vanilla (sem frameworks)

## ⚠️ Observações

- É um **mock**: as credenciais ficam no JS do cliente. Não usar em produção.
- A persistência do "Lembrar meu usuário" usa `localStorage`; a sessão usa `sessionStorage` (zera ao fechar o navegador).
- Se abrir direto via `file://` o `sessionStorage` funciona, mas alguns navegadores tratam o escopo de forma diferente entre abas — o Live Server é mais consistente.
