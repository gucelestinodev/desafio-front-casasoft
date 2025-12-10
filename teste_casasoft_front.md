# 🧪 Desafio Técnico – Desenvolvedor(a) Front-end Angular

Seja bem-vindo(a) ao nosso processo seletivo! Este teste tem como objetivo avaliar sua capacidade de integrar sistemas, lidar com autenticação, consumir APIs REST e aplicar atualizações em tempo real com SignalR, utilizando Angular.

---

## 🎯 Objetivo

Criar uma aplicação web com:

- Tela de login com autenticação JWT
- Painel de chamados
- Atualização em tempo real dos chamados via SignalR, **sem recarregar a página**

---

## 📌 Requisitos Funcionais

### 1. Autenticação

- Criar uma tela de login com os campos: `email` e `senha`
- Autenticar usando a API fornecida
- Armazenar o token retornado
- Redirecionar o usuário autenticado para a tela de painel

### 2. Painel de Chamados

- Listar os chamados utilizando o token de autenticação
- Exibir os dados em forma de tabela ou grid
- A cada novo chamado ou alteração, a listagem deve ser atualizada automaticamente

### 3. Integração com SignalR

- Conectar ao SignalR usando o método `BroadcastMessage`
- Ao receber o evento, chamar `GET /chamado/AtualizarPesquisa` para atualizar a listagem sem reload da página

---

## 🔗 APIs Fornecidas

### 🔐 Autenticação
- **Swagger:** [https://casasoftchamado.casasoftsig.net.br/autenticacao/swagger/index.html](https://casasoftchamado.casasoftsig.net.br/autenticacao/swagger/index.html)
- **Credenciais:**
  - Login: `teste@casasoft.com.br`
  - Senha: `teste#1234`

### 📄 Chamado
- **Swagger:** [https://casasoftchamado.casasoftsig.net.br/chamado/swagger](https://casasoftchamado.casasoftsig.net.br/chamado/swagger)
- **Endpoint de atualização:** `GET /chamado/AtualizarPesquisa`

### 🔁 SignalR
- **Método a escutar:** `BroadcastMessage`
- **Objetivo:** Atualizar automaticamente os chamados ao receber eventos

https://casasoftchamado.casasoftsig.net.br/chamado/AtualizarPesquisa
wss://casasoftchamado.casasoftsig.net.br/chamado/AtualizarPesquisa

---

## 🧠 O que será avaliado

| Critério | Peso |
|---------|------|
| Autenticação e uso correto do token | ⭐⭐⭐ |
| Consumo da API de chamados | ⭐⭐⭐ |
| Integração com SignalR (sem reload da tela) | ⭐⭐⭐⭐ |
| Código limpo e organizado | ⭐⭐ |
| Uso de boas práticas Angular (serviços, módulos) | ⭐⭐ |
| Responsividade básica | ⭐ |

---

## 🚀 Como entregar

1. **Crie um repositório público** no GitHub ou GitLab com o nome:  
   `desafio-front-casasoft`

2. **Inclua no repositório:**
   - O código-fonte completo da aplicação
   - Um arquivo `README.md` com:
     - Instruções para rodar o projeto (`npm install`, `ng serve`, etc.)
     - Informações de como realizar login
     - Tecnologias utilizadas
     - Decisões técnicas relevantes que tomou durante o desenvolvimento
     - (Opcional) prints da aplicação funcionando

---

Boa sorte! Ficamos à disposição para dúvidas durante o desafio. Esperamos que se divirta desenvolvendo! 😊
