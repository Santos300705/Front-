// ============================
// URLs da API no Render
// ============================
const API_URL = "https://safe-transfer-1234.onrender.com/api/validar-pix";

// ENDPOINTS DE AUTENTICAÇÃO (ajusta se no backend estiver diferente)
const AUTH_REGISTER_URL = "https://safe-transfer-1234.onrender.com/api/auth/register";
const AUTH_LOGIN_URL = "https://safe-transfer-1234.onrender.com/api/auth/login";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Script carregado e pronto.");

  // ============================
  // LOGIN (/index.html)
  // ============================
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    console.log("LoginForm encontrado, ativando listener de login...");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value.trim();
      const senha = document.getElementById("senha").value.trim();

      if (!email || !senha) {
        alert("Preencha e-mail e senha.");
        return;
      }

      console.log("Enviando login para API:", AUTH_LOGIN_URL, { email });

      try {
        const resp = await fetch(AUTH_LOGIN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, senha }),
        });

        console.log("Status login:", resp.status);

        if (!resp.ok) {
          const errorText = await resp.text();
          console.error("Erro login:", errorText);
          alert("Falha no login. Verifique e-mail/senha.");
          return;
        }

        // Se a API devolver token/usuário, você poderia guardar aqui:
        // const data = await resp.json();
        // localStorage.setItem("token", data.token);

        alert("Login realizado com sucesso!");
        window.location.href = "dashboard.html";
      } catch (err) {
        console.error("Erro de rede no login:", err);
        alert("Não foi possível falar com a API de login.");
      }
    });
  }

  // ============================
  // CADASTRO (/cadastro.html)
  // ============================
  const cadastroForm = document.getElementById("cadastroForm");
  if (cadastroForm) {
    console.log("CadastroForm encontrado, ativando listener de cadastro...");

    cadastroForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nome = document.getElementById("nome").value.trim();
      const email = document.getElementById("email").value.trim();
      const telefoneInput = document.getElementById("telefone");
      const telefone = telefoneInput ? telefoneInput.value.trim() : null;
      const senha = document.getElementById("senha").value.trim();
      const confirmacao = document.getElementById("confirmacao").value.trim();

      if (!nome || !email || !senha || !confirmacao) {
        alert("Preencha todos os campos obrigatórios.");
        return;
      }

      if (senha !== confirmacao) {
        alert("As senhas não conferem.");
        return;
      }

      console.log("Enviando cadastro para API:", AUTH_REGISTER_URL, {
        nome,
        email,
        telefone,
      });

      try {
        const resp = await fetch(AUTH_REGISTER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nomeCompleto: nome, // ajusta pro que seu backend espera
            email: email,
            senha: senha,
            telefone: telefone,
          }),
        });

        console.log("Status cadastro:", resp.status);

        if (!resp.ok) {
          const errorText = await resp.text();
          console.error("Erro cadastro:", errorText);
          alert("Erro ao cadastrar usuário.");
          return;
        }

        // se a API devolver JSON, você pode usar:
        // const data = await resp.json();
        alert("Cadastro realizado com sucesso! Faça login para continuar.");
        window.location.href = "index.html";
      } catch (err) {
        console.error("Erro de rede no cadastro:", err);
        alert("Não foi possível falar com a API de cadastro.");
      }
    });
  }

  // ============================
  // VALIDAÇÃO PIX (/dashboard.html)
  // ============================
  const form = document.getElementById("pixForm");
  const inputNomeReal = document.getElementById("nomeReal");
  const divResultado = document.getElementById("resultado");
  const listaHistorico = document.getElementById("listaHistorico");

  // Array em memória para últimas validações
  const historico = [];

  // desenha a lista de "Últimas transações"
  function renderHistorico() {
    if (!listaHistorico) {
      console.warn("Elemento #listaHistorico não encontrado no HTML");
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

  // estado inicial do histórico
  renderHistorico();

  if (!form) {
    console.warn("Formulário #pixForm não encontrado (tudo bem se não for o dashboard).");
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const chavePix = document.getElementById("chave").value.trim();
    const nomeInformado = document.getElementById("nomeInformado").value.trim();

    console.log("Enviando para API PIX:", API_URL, { chavePix, nomeInformado });

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chavePix: chavePix,
          nomeInformado: nomeInformado,
        }),
      });

      console.log("Status da API PIX:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Corpo de erro da API PIX:", errorText);
        alert("Erro ao validar PIX: " + response.status);
        return;
      }

      const data = await response.json();
      console.log("Resposta da API PIX:", data);

      // Nome real da chave
      if (inputNomeReal) {
        inputNomeReal.value = data.nomeReal || "";
      }

      // Mensagem principal + cores
      if (divResultado) {
        divResultado.textContent = data.mensagem || "Validação concluída.";
        divResultado.className = "resultado"; // reseta classes

        if (data.status === "VALIDO") {
          divResultado.classList.add("valido"); // verde
        } else if (data.status === "DIVERGENTE") {
          divResultado.classList.add("divergente"); // vermelho
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
      alert("Não foi possível falar com a API de PIX. Veja o console.");
    }
  });
});