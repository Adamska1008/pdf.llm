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
        console.log(selectedSnippets)
        setMessages((prevMessages) => [...prevMessages, ""])
        try {
            await apiStream(message, (data) => {
                setMessages((prevMessages) => {
                    let newMessages = [...prevMessages];
                    const lastIndex = newMessages.length - 1;
                    newMessages[lastIndex] += data; // 更新对应索引的消息
                    return newMessages;
                });
            });
        } catch (error) {
            console.error("Error on handleSendMessage: ", error);
        }
    }


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