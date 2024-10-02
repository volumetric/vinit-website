'use client';

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set the worker source for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;


// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url,
// ).toString();

// constructor(props){
//   super(props);
//   pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
// }

console.log('PDFViewer component loaded');

interface PDFViewerProps {
  pdfUrl: string | null;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (pdfUrl) {
      // Reset page number when a new PDF is loaded
      setPageNumber(1);
    }
  }, [pdfUrl]);

  if (!pdfUrl) {
    return <div>No PDF file selected</div>;
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  console.log('Rendering PDF viewer');
  return (
    <div className="pdf-viewer">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        // onLoadError={(error) => {
        //   console.error('Error loading PDF:', error);
        //   console.log('PDF load error details:', JSON.stringify(error));
        // }}
        onLoadError={console.error}
      >
        <Page 
          pageNumber={pageNumber} 
          onRenderSuccess={() => console.log(`Page ${pageNumber} rendered successfully`)}
          onRenderError={(error) => console.error(`Error rendering page ${pageNumber}:`, error)}
        />
      </Document>

      <p>
        Page {pageNumber} of {numPages}
      </p>
    </div>
  );
};
console.log('Exporting PDFViewer component');
export default PDFViewer;
