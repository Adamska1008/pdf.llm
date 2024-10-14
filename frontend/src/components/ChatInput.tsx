import React from "react";
import { Stack, TextField, Button, Divider, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { styled } from '@mui/material/styles';
import { useState } from "react";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface SendButtonProps {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const SendButton = ({ onClick }: SendButtonProps) => {
    return (
        <Button
            variant="contained"
            onClick={onClick}
            size="medium"
            startIcon={<SendIcon />}
        >
            Send
        </Button>
    )
}

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    onFileUpload: (files: File) => void;
}

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const ChatInput = ({ onSendMessage, onFileUpload }: ChatInputProps) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(text);
            setText("");
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            onFileUpload(files[0]);
        }
    };

    return (
        <Stack
            direction="row"
            maxWidth="1200px"
            width="100%"
            spacing={1}
            divider={<Divider orientation="vertical" flexItem />}
            sx={{ p: 2, alignItems: "center" }}
        >
            <IconButton
                component="label"
                role={undefined}
            >
                <CloudUploadIcon />
                <VisuallyHiddenInput
                    type="file"
                    onChange={handleFileChange}
                />
            </IconButton>
            <TextField
                label="question"
                maxRows={4}
                fullWidth
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSend();
                    }
                }}
            />
            <SendButton onClick={handleSend} />
        </Stack>
    )
}

export default ChatInput;