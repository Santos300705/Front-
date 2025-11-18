const API_URL = "https://front-lqki.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Script carregado e pronto.");

  const form = document.getElementById("pixForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const chavePix = document.getElementById("chave").value.trim();
    const nomeInformado = document.getElementById("nomeInformado").value.trim();

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

      // aqui você atualiza os campos:
      // document.getElementById("nomeReal").value = data.nomeReal;
      // mostra mensagem de válido/divergente etc.
    } catch (err) {
      console.error("Erro de rede/fetch:", err);
      alert("Não foi possível falar com a API (Failed to fetch). Veja o console.");
    }
  });
});