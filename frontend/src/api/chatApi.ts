export interface AskMessage {
    question: string,
    sid: string | null,
};

export interface AskResponse {
    sid: string,
    ai_message: string,
};

export const apiAsk = async (message: AskMessage): Promise<AskResponse> => {
    const response = await fetch('http://localhost:5000/api/ask', {
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

export interface UploadFileRequest {
    file: File,
    sid: string | null
};

export interface UploadFileResponse {
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
        throw new Error("Network response was not ok");
    }
    return response.json();
};
