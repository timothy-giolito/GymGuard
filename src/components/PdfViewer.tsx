import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// Setup local worker to prevent CORS and network issues in WebViews
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfViewerProps {
  dataUrl: string;
  fileName: string;
}

export default function PdfViewer({ dataUrl }: PdfViewerProps) {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let pdfSource: any = dataUrl;
        
        // Robust Base64 to Uint8Array conversion
        if (dataUrl && dataUrl.startsWith('data:')) {
          const base64Data = dataUrl.split(',')[1];
          // use binary string decode
          const binaryString = window.atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          pdfSource = { data: bytes };
        }
        
        const loadingTask = pdfjsLib.getDocument(pdfSource);
        const loadedPdf = await loadingTask.promise;
        
        setPdf(loadedPdf);
        setPageCount(loadedPdf.numPages);
        setPageNumber(1);
      } catch (err: any) {
        console.error('Errore nel caricamento del PDF:', err);
        setError(`Impossibile caricare il PDF: ${err?.message || 'File non valido o corrotto.'}`);
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [dataUrl]);

  const renderPage = async (pageNum: number) => {
    if (!pdf) return;
    
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = document.getElementById(`pdf-canvas-${pageNum}`) as HTMLCanvasElement;
      
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (renderTaskRef.current) {
        try {
          await renderTaskRef.current.cancel();
        } catch (e) {
          // ignore cancel error
        }
      }

      const renderTask = page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      });

      renderTaskRef.current = renderTask;
      await renderTask.promise;
    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') {
        console.error('Errore nel rendering della pagina:', err);
      }
    }
  };

  useEffect(() => {
    if (pdf && pageNumber > 0 && pageNumber <= pageCount) {
      renderPage(pageNumber);
    }
  }, [pdf, pageNumber, scale, pageCount]);

  const handlePrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, pageCount));
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid var(--color-primary-light)', 
          borderTop: '4px solid var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-muted)' }}>Caricamento PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div>
          <p style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>⚠️</p>
          <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Toolbar */}
      <div style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        alignItems: 'center', 
        padding: '0.75rem',
        backgroundColor: '#fff',
        borderBottom: '1px solid var(--color-border)',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={handlePrevPage} 
          disabled={pageNumber <= 1}
          className="btn"
          style={{ padding: '0.5rem', opacity: pageNumber <= 1 ? 0.5 : 1 }}
        >
          <ChevronLeft size={18} />
        </button>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.25rem 0.5rem',
          backgroundColor: 'var(--color-secondary-light)',
          borderRadius: '4px'
        }}>
          <input 
            type="number" 
            min="1" 
            max={pageCount}
            value={pageNumber}
            onChange={(e) => {
              const newPage = Math.min(Math.max(parseInt(e.target.value) || 1, 1), pageCount);
              setPageNumber(newPage);
            }}
            style={{ 
              width: '50px', 
              padding: '0.25rem',
              border: 'none',
              backgroundColor: 'transparent',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            / {pageCount}
          </span>
        </div>

        <button 
          onClick={handleNextPage} 
          disabled={pageNumber >= pageCount}
          className="btn"
          style={{ padding: '0.5rem', opacity: pageNumber >= pageCount ? 0.5 : 1 }}
        >
          <ChevronRight size={18} />
        </button>

        <div style={{ flex: 1, minWidth: '50px' }} />

        <button 
          onClick={handleZoomOut} 
          disabled={scale <= 0.5}
          className="btn"
          style={{ padding: '0.5rem', opacity: scale <= 0.5 ? 0.5 : 1 }}
        >
          <ZoomOut size={18} />
        </button>

        <div style={{ 
          padding: '0.25rem 0.5rem',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          minWidth: '45px',
          textAlign: 'center'
        }}>
          {Math.round(scale * 100)}%
        </div>

        <button 
          onClick={handleZoomIn} 
          disabled={scale >= 3}
          className="btn"
          style={{ padding: '0.5rem', opacity: scale >= 3 ? 0.5 : 1 }}
        >
          <ZoomIn size={18} />
        </button>
      </div>

      {/* Canvas Container */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <canvas 
          id={`pdf-canvas-${pageNumber}`}
          style={{ 
            maxWidth: '100%',
            maxHeight: '100%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: '4px'
          }}
        />
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
