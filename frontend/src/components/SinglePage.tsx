import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface SinglePageProps {
    fileUrl: string
};


const SinglePage = ({ fileUrl }: SinglePageProps) => {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <div style={{
                height: '100vh',
                width: '100vh'
            }}>
                <Viewer
                    fileUrl={fileUrl}
                    plugins={[defaultLayoutPluginInstance]}
                />
            </div>
        </Worker>
    )
};

export default SinglePage;

// import React, { useState } from 'react';
// import { Document, Page } from 'react-pdf';

// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

// const options = {
//     cMapUrl: '/cmaps/',
//     standardFontDataUrl: '/standard_fonts/',
// };

// type PDFFile = string | File | null;

// const SinglePage = () => {
//     ``
//     const [file, setFile] = useState<PDFFile>('./AAAMLP.pdf');
//     const [numPages, setNumPages] = useState<number>();
//     const [pageNumber, setPageNumber] = useState<number>(1);

//     function onLoadSuccess({ numPages }: { numPages: number }): void {
//         setNumPages(numPages)
//     };

//     return (
//         <>
//             <Document
//                 file="AAAMLP.pdf"
//                 onLoadSuccess={onLoadSuccess}
//             >
//                 <Page pageNumber={pageNumber} />
//             </Document>
//             <p>
//                 Page {pageNumber} of {numPages}
//             </p>
//         </>
//     )
// }

// export default SinglePage;