import axios from "axios";

const API_URL = "";

const apiChat = axios.create({
    baseURL: API_URL,
});

export interface ChatRequest {
    pergunta: string;
    cooperativaId?: string;
    usuarioId: string;
    sessionId?: string;
}
export interface ChatResponse {
    resposta: string;
    agentesChamados: string[];
}

// POST /chat
export async function enviarMensagem(data: ChatRequest): Promise<ChatResponse> {
    const response = await apiChat.post<ChatResponse>("/chat", data);
    return response.data;
}