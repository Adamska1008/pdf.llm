import './App.css'
import ChatWindow from './components/ChatWindow'
import { Stack, Box } from '@mui/material'
import SinglePage from './components/SinglePage'
import { useState } from 'react'

function App() {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1); // notice: the currentPage should be index from 1

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
            {pdfUrl && (
                <SinglePage fileUrl={pdfUrl} onPageChange={(n) => { setCurrentPage(n + 1); }} />
            )}
            <ChatWindow onFileUpload={handleFileUpload} currentPage={currentPage} />
        </Stack>
    )
}

export default App
