import axios from "axios";

const API_URL = "http://ad0d8c99545a84713891def8a28f1d46-c7cd4a13dc3dd2e8.elb.us-east-1.amazonaws.com/";

const apiChat = axios.create({
    baseURL: API_URL,
});

export interface ChatRequest {
    pergunta: string;
    cooperativa_id: string;
    user_id: string;
    session_id: string;
}
export interface ChatResponse {
    resposta: string;
    agentes_chamados: string[];
}

// POST /chat
export async function enviarMensagem(data: ChatRequest): Promise<ChatResponse> {
    const response = await apiChat.post<ChatResponse>("/chat", data);
    return response.data;
}