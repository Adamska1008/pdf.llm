import './App.css'
import ChatWindow from './components/ChatWindow'
import SinglePage from './components/SinglePage'
import { useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import SnippetsPanel from './components/Snippets'
import { Stack } from '@mui/material'

function App() {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1); // notice: the currentPage should be index from 1
    const [selectedSnippets, setSelectedSnippets] = useState<string[] | null>(null);

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                setPdfUrl(reader.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSelectSnippets = (snippets: string[]) => {
        setSelectedSnippets(snippets);
    };

    return (
        <PanelGroup
            direction='horizontal'
        >
            {pdfUrl && (
                <>
                    <Panel defaultSize={55} minSize={25} maxSize={80} order={1}>
                        <SinglePage fileUrl={pdfUrl} onPageChange={(n) => { setCurrentPage(n + 1); }} />
                    </Panel>
                    <PanelResizeHandle style={{ width: "4px", backgroundColor: 'lightgrey' }} />
                </>
            )}
            <Panel defaultSize={45} minSize={15} order={2}>
                <Stack direction="row">
                    <ChatWindow
                        selectedSnippets={selectedSnippets}
                        currentPage={currentPage}
                        onFileUpload={handleFileUpload}
                    />
                    {pdfUrl && <SnippetsPanel
                        onSelectSnippets={handleSelectSnippets}
                    />}
                </Stack>
            </Panel>
        </PanelGroup>
    )
}

export default App
