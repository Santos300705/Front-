// URL CORRETA: APONTA PARA A API, NÃO PARA O FRONT
const API_URL = "https://safe-transfer-1234.onrender.com/api/validar-pix";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Script carregado e pronto.");

  const form = document.getElementById("pixForm");
  const inputNomeReal = document.getElementById("nomeReal");
  const divResultado = document.getElementById("resultado");

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

      // ⬇⬇⬇ AQUI INVERTEMOS

      // Campo "Nome real da chave" deve mostrar o NOME da pessoa
      // (que no seu JSON está vindo em data.mensagem)
      if (inputNomeReal) {
        inputNomeReal.value = data.mensagem || data.nomeReal || "";
      }

      // Abaixo, no resultado, queremos mostrar o TEXTO de alerta/situação
      // (que no seu JSON está vindo em data.nomeReal)
      if (divResultado) {
        divResultado.textContent =
          data.nomeReal || data.mensagem || "Validação concluída.";
        divResultado.className = "resultado";

        if (data.status === "VALIDO") {
          divResultado.classList.add("valido");
        } else if (data.status === "DIVERGENTE") {
          divResultado.classList.add("divergente");
        }
      }
    } catch (err) {
      console.error("Erro de rede/fetch:", err);
      alert(
        "Não foi possível falar com a API (Failed to fetch). Veja o console."
      );
    }
  });
});