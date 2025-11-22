// URL base da API no Render
const API_BASE = "https://safe-transfer-1234.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Script carregado e pronto.");

  /*
   * 1) LOGIN (/index.html)
   * ----------------------------------
   * Formulário de login: id="loginForm"
   * Campos: #email, #senha
   */
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    console.log("Login: formulário encontrado.");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email")?.value.trim();
      const senha = document.getElementById("senha")?.value.trim();

      if (!email || !senha) {
        alert("Preencha e-mail e senha.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, senha }),
        });

        console.log("Login - status da API:", response.status);

        if (!response.ok) {
          const errorBody = await response.text();
          console.error("Login - corpo de erro:", errorBody);
          alert("Falha no login. Verifique e-mail/senha.");
          return;
        }

        const data = await response.json();
        console.log("Login - resposta:", data);

        alert("Login realizado com sucesso!");
        // redireciona para o painel
        window.location.href = "dashboard.html";
      } catch (err) {
        console.error("Login - erro de rede:", err);
        alert("Erro de rede ao tentar logar.");
      }
    });
  } else {
    console.log("Login: formulário NÃO encontrado nesta página (ok).");
  }

  /*
   * 2) CADASTRO (/cadastro.html)
   * ----------------------------------
   * Formulário de cadastro: id="cadastroForm"
   * Campos: #nome, #email, #telefone, #senha, #confirmacao
   */
  const cadastroForm = document.getElementById("cadastroForm");

  if (cadastroForm) {
    console.log("Cadastro: formulário encontrado.");

    cadastroForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nome = document.getElementById("nome")?.value.trim();
      const email = document.getElementById("email")?.value.trim();
      const telefone = document.getElementById("telefone")?.value.trim();
      const senha = document.getElementById("senha")?.value.trim();
      const confirmacao = document.getElementById("confirmacao")?.value.trim();

      if (!nome || !email || !telefone || !senha || !confirmacao) {
        alert("Preencha todos os campos.");
        return;
      }

      if (senha !== confirmacao) {
        alert("As senhas não conferem.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nomeCompleto: nome,
            email,
            telefone,
            senha,
          }),
        });

        console.log("Cadastro - status da API:", response.status);

        if (!response.ok) {
          const errorBody = await response.text();
          console.error("Cadastro - corpo de erro:", errorBody);
          alert("Erro ao cadastrar usuário.");
          return;
        }

        const data = await response.json().catch(() => null);
        console.log("Cadastro - resposta:", data);

        alert("Usuário cadastrado com sucesso! Faça login.");
        window.location.href = "index.html";
      } catch (err) {
        console.error("Cadastro - erro de rede:", err);
        alert("Erro de rede ao tentar cadastrar.");
      }
    });
  } else {
    console.log("Cadastro: formulário NÃO encontrado nesta página (ok).");
  }

  /*
   * 3) VALIDAÇÃO PIX + HISTÓRICO (dashboard.html)
   * ----------------------------------
   * Formulário PIX: id="pixForm"
   * Campos: #chave, #nomeInformado, #nomeReal
   * Lista de histórico rápido: <ul id="listaHistorico">
   * Mensagem de resultado: <div id="resultado">
   */
  const pixForm = document.getElementById("pixForm");
  const inputNomeReal = document.getElementById("nomeReal");
  const divResultado = document.getElementById("resultado");
  const listaHistorico = document.getElementById("listaHistorico");

  // array em memória de últimas validações
  const historico = [];

  function renderHistorico() {
    if (!listaHistorico) {
      // estamos em outra página, tudo bem
      return;
    }

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

  // estado inicial do histórico (dashboard)
  renderHistorico();

  if (pixForm) {
    console.log("PIX: formulário encontrado.");

    pixForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const chavePix = document.getElementById("chave")?.value.trim();
      const nomeInformado = document.getElementById("nomeInformado")?.value.trim();

      if (!chavePix) {
        alert("Informe uma chave Pix.");
        return;
      }

      console.log("PIX - enviando para API:", `${API_BASE}/validar-pix`, {
        chavePix,
        nomeInformado,
      });

      try {
        const response = await fetch(`${API_BASE}/validar-pix`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chavePix,
            nomeInformado,
          }),
        });

        console.log("PIX - status da API:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("PIX - corpo de erro:", errorText);
          alert("Erro ao validar PIX: " + response.status);
          return;
        }

        const data = await response.json();
        console.log("PIX - resposta da API:", data);

        // atualiza campo Nome real da chave
        if (inputNomeReal) {
          inputNomeReal.value = data.nomeReal || "";
        }

        // mensagem principal + cores
        if (divResultado) {
          divResultado.textContent = data.mensagem || "Validação concluída.";
          divResultado.className = "resultado";

          if (data.status === "VALIDO") {
            divResultado.classList.add("valido");
          } else if (data.status === "DIVERGENTE") {
            divResultado.classList.add("divergente");
          }
        }

        // adiciona ao histórico em memória (só pra tela)
        historico.unshift({
          chavePix,
          status: data.status,
          mensagem: data.mensagem || "",
          dataHora: new Date().toLocaleString("pt-BR"),
        });

        if (historico.length > 5) {
          historico.pop();
        }

        renderHistorico();
      } catch (err) {
        console.error("PIX - erro de rede:", err);
        alert("Não foi possível falar com a API de validação PIX.");
      }
    });
  } else {
    console.log("PIX: formulário NÃO encontrado nesta página (ok).");
  }
});