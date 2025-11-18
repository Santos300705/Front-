document.getElementById("pixForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    // Pegando os elementos corretamente (baseado no seu HTML)
    const chavePix = document.getElementById("chave").value.trim();
    const nomeInformado = document.getElementById("nomeInformado").value.trim();
    const campoNomeReal = document.getElementById("nomeReal");
    const resultado = document.getElementById("resultado");

    // Limpa mensagens anteriores
    resultado.textContent = "";
    campoNomeReal.value = "";

    // Validação básica
    if (!chavePix || !nomeInformado) {
        resultado.textContent = "Preencha todos os campos antes de validar.";
        resultado.style.color = "red";
        return;
    }

    try {
        const response = await fetch("https://safe-transfer-api-1234.onrender.com/api/validar-pix", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chavePix: chavePix,
                nomeInformado: nomeInformado
            })
        });

        if (!response.ok) {
            const erro = await response.json();
            resultado.textContent = erro.mensagem || "Erro ao validar chave Pix.";
            resultado.style.color = "red";
            return;
        }

        const data = await response.json();

        // Preenche o nome real
        campoNomeReal.value = data.nomeReal || "";

        // Exibe mensagem
        resultado.textContent = data.mensagem;
        resultado.style.color = data.status === "VÁLIDO" ? "green" : "red";

    } catch (error) {
        resultado.textContent = "Erro de conexão com o servidor.";
        resultado.style.color = "red";
        console.error(error);
    }
});
