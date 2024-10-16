import { Worker, Viewer, PageChangeEvent } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface SinglePageProps {
    fileUrl: string,
    onPageChange: (pageNumber: number) => void;
};


const SinglePage = ({ fileUrl, onPageChange }: SinglePageProps) => {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    const handlePageChange = (e: PageChangeEvent) => {
        onPageChange(e.currentPage);
    }

    return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <div style={{
                height: '100vh',
                width: '100%'
            }}>
                <Viewer
                    fileUrl={fileUrl}
                    plugins={[defaultLayoutPluginInstance]}
                    onPageChange={handlePageChange}
                />
            </div>
        </Worker>
    )
};

export default SinglePage;

