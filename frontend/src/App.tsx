import './App.css'
import ChatWindow from './components/ChatWindow'
import SinglePage from './components/SinglePage'
import { useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import SplitPane from 'react-split-pane';

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
        <PanelGroup
            direction='horizontal'
        >
            {pdfUrl && (
                <>
                    <Panel defaultSize={60} minSize={25} maxSize={80} order={1}>
                        <SinglePage fileUrl={pdfUrl} onPageChange={(n) => { setCurrentPage(n + 1); }} />
                    </Panel>
                    <PanelResizeHandle style={{ width: "4px", backgroundColor: 'lightgrey' }} />
                </>
            )}
            <Panel minSize={15} order={2}>
                <ChatWindow onFileUpload={handleFileUpload} currentPage={currentPage} />
            </Panel>
        </PanelGroup>
        // <Stack direction="row" sx={{ alignItems: "center" }}>
        //     {pdfUrl && (
        //         <SinglePage fileUrl={pdfUrl} onPageChange={(n) => { setCurrentPage(n + 1); }} />
        //     )}
        //     <ChatWindow onFileUpload={handleFileUpload} currentPage={currentPage} />
        // </Stack>
    )
}

export default App
