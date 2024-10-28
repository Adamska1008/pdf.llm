export const apiPing = async () : Promise<void> => {
    const response = await fetch('http://localhost:5000/api/ping');
    console.log(response.json());
}

export interface AskMessage {
    question: string,
    sid: string | null,
    fid: string | null,
    pageNumber: number | null,
    selectedSnippets: string[] | null,
};

export interface AskResponse {
    sid: string,
    ai_message: string,
};

export const apiAsk = async (message: AskMessage): Promise<AskResponse> => {
    const response = await fetch('http://127.0.0.1:5000/api/ask', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
    })
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}

export const apiStream = async (message: AskMessage, onMessage: (data: string) => void) : Promise<void> => {
    console.log("Send message", message);
    const response = await fetch('http://localhost:5000/api/stream', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
    });
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    if (reader) {
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                break;
            }
            const chunk = decoder.decode(value, {stream: true});
            onMessage(chunk);
        }
    }
}

export interface UploadFileRequest {
    file: File,
    sid: string | null
};

export interface UploadFileResponse {
    fid: string,
    error: string,
}

export const apiUploadFile = async (request: UploadFileRequest): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', request.file);
    let url = "http://localhost:5000/api/upload/pdf";
    if (request.sid) {
        url += `?sid=${request.sid}`;
    }
    const response = await fetch(url, {
        method: "PUT",
        headers: {}, // FormData sets it automatically
        body: formData
    });
    if (!response.ok) {
        throw new Error("Reponse error: " + response.status + response.json());
    }
    return response.json();
};
