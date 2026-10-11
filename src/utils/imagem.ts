const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024;

/**
 * Lê uma imagem do computador, reduz para no máximo `maxLado` px e devolve
 * um data URL (JPEG). Rejeita se não for imagem ou passar de 5 MB.
 */
export async function arquivoParaDataUrl(arquivo: File, maxLado = 256, qualidade = 0.85): Promise<string> {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
        throw new Error("Escolha uma imagem JPG, PNG, WEBP ou GIF.");
    }
    if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
        throw new Error("A imagem deve ter no máximo 5 MB.");
    }

    const bitmap = await createImageBitmap(arquivo);
    const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
    const largura = Math.round(bitmap.width * escala);
    const altura = Math.round(bitmap.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Não foi possível processar a imagem.");

    // Fundo branco: PNG/WEBP transparentes não viram preto ao converter para JPEG
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, largura, altura);
    ctx.drawImage(bitmap, 0, 0, largura, altura);
    bitmap.close();

    return canvas.toDataURL("image/jpeg", qualidade);
}
