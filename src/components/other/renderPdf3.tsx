import { Suspense, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

// server
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`; // original beam

// ใช้ worker จาก public เพื่อหลีกเลี่ยง CORS เมื่อรันบน localhost
// pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfViewerProps {
  pdfUrl: string;
}

const PdfViewer3: React.FC<PdfViewerProps> = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const containerRef: any = useRef(null); // Create a ref for the document container
  const [scale, setScale] = useState(1.2); // 👈 default zoom

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3)); // max 300%
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 1)); // min 100%
  };

  const resetZoom = () => setScale(1); // reset = 100%

  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const resize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const scrollHeight = containerRef.current.scrollHeight;
        const clientHeight = containerRef.current.clientHeight;

        // Check if scrolled to bottom of the container
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          setScrolledToBottom(true);
        } else {
          setScrolledToBottom(false);
        }
      }
    };

    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);

    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center items-center relative">
      <div className="flex flex-col gap-2 mb-2 justify-end fixed z-10 right-10 top-20 bg-white/40 p-2 backdrop-blur-sm rounded-sm">
        <button onClick={zoomIn} className="w-10 h-10 bg-gray-200 rounded"><ZoomInIcon sx={{ color: "#00ADEF", fontSize: '30px' }}/></button>
        <button onClick={zoomOut} className="w-10 h-10 bg-gray-200 rounded"><ZoomOutIcon sx={{ fontSize: '30px' }}/></button>
      </div>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        className={'w-full'}
      // file={{ url: "/assets/pdf/sample_2.pdf" }}
      >
        {numPages > 0 && Array.from({ length: numPages }, (_, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} className={'w-full h-auto'} devicePixelRatio={2} scale={scale} width={containerWidth} renderTextLayer={true} renderAnnotationLayer={true} />
        ))}
      </Document>
    </div>
  );
};

export default PdfViewer3;