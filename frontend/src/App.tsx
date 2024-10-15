import './App.css'
import ChatWindow from './components/ChatWindow'
import { Stack } from '@mui/material'
import SinglePage from './components/SinglePage'
import { useState } from 'react'

function App() {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                setPdfUrl(reader.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <Stack direction="row" sx={{ alignItems: "center" }}>
            {pdfUrl && <SinglePage fileUrl={pdfUrl} />}
            <ChatWindow onFileUpload={handleFileUpload} />
        </Stack>
    )
}

export default App
