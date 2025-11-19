// URL da API no Render
const API_URL = "https://safe-transfer-1234.onrender.com/api/validar-pix";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Script carregado e pronto.");

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

  // estado inicial
  renderHistorico();

  if (!form) {
    console.error("Formulário #pixForm não encontrado");
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const chavePix = document.getElementById("chave").value.trim();
    const nomeInformado = document.getElementById("nomeInformado").value.trim();

    console.log("Enviando para API:", API_URL, { chavePix, nomeInformado });

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

      console.log("Status da API:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Corpo de erro da API:", errorText);
        alert("Erro ao validar PIX: " + response.status);
        return;
      }

      const data = await response.json();
      console.log("Resposta da API:", data);

      // Nome real da chave
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
      console.error("Erro de rede/fetch:", err);
      alert("Não foi possível falar com a API (Failed to fetch). Veja o console.");
    }
  });
});