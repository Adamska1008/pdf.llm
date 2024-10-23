import { Stack, Container, Typography } from "@mui/material";
import ChatInput from "./ChatInput";
import { useState } from "react";
import { AskMessage, AskResponse, UploadFileRequest, apiAsk, apiStream, apiUploadFile } from "../api/chatApi";
import MessageDisplay from "./MessageDisplay"

interface ChatWindowProps {
    currentPage: number,
    selectedSnippets: string[] | null,
    onFileUpload: (file: File) => void;
};

const ChatWindow = ({ currentPage, selectedSnippets, onFileUpload }: ChatWindowProps) => {
    const [messages, setMessages] = useState<string[]>([]);
    const [sid, setSid] = useState<string | null>(null);
    const [fid, setFid] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);

    const handleSendMessage = async (newMessage: string) => {
        setMessages((prevMessages) => [...prevMessages, newMessage])

        const message: AskMessage = {
            question: newMessage,
            sid: sid,
            fid: fid,
            pageNumber: currentPage,
            selectedSnippets: selectedSnippets,
        }

        try {
            const idx = messages.length;
            let msg = ""; 
            setMessages((prevMessages) => [...prevMessages, msg])
            await apiStream(message, (data) => {
                msg += data;
                setMessages((prevMessages) => [...prevMessages, msg])
            });
        } catch (error) {
            console.error("Error on handleSendMessage: ", error);
        }
    }
    //     try {
    //         const response: AskResponse = await apiAsk(message);

    //         if (response.sid) {
    //             console.log(`Get sid ${response.sid} from response`);
    //             setSid(response.sid);
    //             console.log("The sid is set to", sid);
    //         } else {
    //             console.error("missing session_id in response from /api/ask", response);
    //         }
    //         if (response.ai_message) {
    //             setMessages((prevMessages) => [...prevMessages, response.ai_message]);
    //         } else {
    //             console.error("missing ai in response from /api/ask", response);
    //         }
    //     } catch (error) {
    //         console.error("Error on handleSendMessage: ", error);
    //     }
    // }

    const handleFileUpload = async (file: File) => {
        const request: UploadFileRequest = {
            file: file,
            sid: sid,
        };
        try {
            const response = await apiUploadFile(request);
            if (response.fid) {
                console.log(`Get fid ${response.fid} from response`);
                setFid(response.fid);
                console.log("The fid is set to", fid);
            } else {
                console.error("missing fid in repsonse from api upload pdf: ", response);
            }
        } catch (error) {
            console.error("File upload failed:", error);
        }
        onFileUpload(file);
    };

    return (
        <Container
            maxWidth="sm"
            sx={{
                height: "100vh",
                display: 'flex',
            }}>
            <Stack sx={{ flexGrow: 1, alignContent: "center" }}>
                <MessageDisplay messages={messages} />
                <Typography
                    align="center"
                    variant="caption"
                    sx={{ color: "gray", fontSize: '1rem' }}
                >
                    {filename}
                </Typography>
                <ChatInput
                    onSendMessage={handleSendMessage}
                    onFileUpload={(file) => { handleFileUpload(file); setFilename(file.name); }}
                />
            </Stack>
        </Container>
    )
}

export default ChatWindow;