// Base da API no Render (mesma da validação PIX)
const API_BASE = "https://safe-transfer-1234.onrender.com/api";

const PIX_URL      = `${API_BASE}/validar-pix`;
const REGISTER_URL = `${API_BASE}/register`;
const LOGIN_URL    = `${API_BASE}/login`;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Script carregado e pronto.");

  // ========= ELEMENTOS COMUNS =========
  const inputNomeReal   = document.getElementById("nomeReal");
  const divResultado    = document.getElementById("resultado");
  const listaHistorico  = document.getElementById("listaHistorico");

  // ========= HISTÓRICO EM MEMÓRIA (dashboard) =========
  const historico = [];

  function renderHistorico() {
    if (!listaHistorico) return;

    if (historico.length === 0) {
      listaHistorico.innerHTML = "<li>Nenhuma transação registrada.</li>";
      return;
    }

    listaHistorico.innerHTML = "";

    historico.forEach((item) => {
      const li = document.createElement("li");
      li.classList.add("historico-item");

      if (item.status === "VALIDO") {
        li.classList.add("historico-valido");
      } else if (item.status === "DIVERGENTE") {
        li.classList.add("historico-divergente");
      }

      const tituloStatus =
        item.status === "VALIDO"
          ? "PIX Válido"
          : item.status === "DIVERGENTE"
          ? "Alerta de divergência"
          : item.status;

      li.innerHTML = `
        <div>
          <strong>${item.chavePix}</strong> — ${tituloStatus}
        </div>
        <small>${item.dataHora} • ${item.mensagem}</small>
      `;

      listaHistorico.appendChild(li);
    });
  }

  renderHistorico(); // estado inicial

  // ========= 1) FORMULÁRIO DE VALIDAÇÃO PIX (dashboard.html) =========
  const pixForm = document.getElementById("pixForm");

  if (pixForm) {
    pixForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const chavePix = document.getElementById("chave").value.trim();
      const nomeInformado = document.getElementById("nomeInformado").value.trim();

      console.log("Enviando para API (PIX):", PIX_URL, { chavePix, nomeInformado });

      try {
        const response = await fetch(PIX_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chavePix: chavePix,
            nomeInformado: nomeInformado,
          }),
        });

        console.log("Status da API (PIX):", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Corpo de erro da API (PIX):", errorText);
          alert("Erro ao validar PIX: " + response.status);
          return;
        }

        const data = await response.json();
        console.log("Resposta da API (PIX):", data);

        // Preenche nome real da chave
        if (inputNomeReal) {
          inputNomeReal.value = data.nomeReal || "";
        }

        // Mensagem principal + cores
        if (divResultado) {
          divResultado.textContent = data.mensagem || "Validação concluída.";
          divResultado.className = "resultado"; // reseta classes

          if (data.status === "VALIDO") {
            divResultado.classList.add("valido");       // verde
          } else if (data.status === "DIVERGENTE") {
            divResultado.classList.add("divergente");   // vermelho
          }
        }

        // Adiciona no histórico em memória
        historico.unshift({
          chavePix,
          status: data.status,
          mensagem: data.mensagem || "",
          dataHora: new Date().toLocaleString("pt-BR"),
        });

        // mantém só as 5 últimas
        if (historico.length > 5) {
          historico.pop();
        }

        renderHistorico();
      } catch (err) {
        console.error("Erro de rede/fetch (PIX):", err);
        alert("Não foi possível falar com a API (PIX). Veja o console.");
      }
    });
  }

  // ========= 2) FORMULÁRIO DE CADASTRO (cadastro.html) =========
  const cadastroForm = document.getElementById("cadastroForm");

  if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nome        = document.getElementById("nome").value.trim();
      const email       = document.getElementById("email").value.trim();
      const telefone    = document.getElementById("telefone").value.trim();
      const senha       = document.getElementById("senha").value;
      const confirmacao = document.getElementById("confirmacao").value;

      if (senha !== confirmacao) {
        alert("As senhas não conferem.");
        return;
      }

      console.log("Enviando para API (REGISTER):", REGISTER_URL, {
        nomeCompleto: nome,
        email,
        telefone,
        senha,
      });

      try {
        const response = await fetch(REGISTER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nomeCompleto: nome,
            email: email,
            telefone: telefone,
            senha: senha,
          }),
        });

        console.log("Status da API (REGISTER):", response.status);

        const data = await response.json().catch(() => ({}));
        console.log("Resposta da API (REGISTER):", data);

        if (!response.ok) {
          alert(data.mensagem || "Erro ao cadastrar usuário.");
          return;
        }

        alert(data.mensagem || "Cadastro realizado com sucesso!");
        // após cadastrar, manda pro login
        window.location.href = "index.html";
      } catch (err) {
        console.error("Erro de rede/fetch (REGISTER):", err);
        alert("Não foi possível falar com a API de cadastro.");
      }
    });
  }

  // ========= 3) FORMULÁRIO DE LOGIN (index.html) =========
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value.trim();
      const senha = document.getElementById("senha").value;

      console.log("Enviando para API (LOGIN):", LOGIN_URL, { email, senha });

      try {
        const response = await fetch(LOGIN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            senha: senha,
          }),
        });

        console.log("Status da API (LOGIN):", response.status);

        const data = await response.json().catch(() => ({}));
        console.log("Resposta da API (LOGIN):", data);

        if (!response.ok) {
          alert(data.mensagem || "Erro ao fazer login.");
          return;
        }

        alert(data.mensagem || "Login realizado com sucesso!");
        // depois do login, manda pro painel
        window.location.href = "dashboard.html";
      } catch (err) {
        console.error("Erro de rede/fetch (LOGIN):", err);
        alert("Não foi possível falar com a API de login.");
      }
    });
  }
});