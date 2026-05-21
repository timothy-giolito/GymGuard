import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { ZoomIn, ZoomOut } from 'lucide-react';

// Setup local worker to prevent CORS and network issues in WebViews
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfViewerProps {
  dataUrl: string;
  fileName?: string;
}

export default function PdfViewer({ dataUrl }: PdfViewerProps) {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track rendered pages to avoid re-rendering them unnecessarily
  const renderedPagesRef = useRef<Set<number>>(new Set());
  const renderTasksRef = useRef<{ [key: number]: any }>({});

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let pdfSource: any = dataUrl;
        
        // Robust Base64 to Uint8Array conversion
        if (dataUrl && dataUrl.startsWith('data:')) {
          const base64Data = dataUrl.split(',')[1];
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
        renderedPagesRef.current.clear();
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

      if (renderTasksRef.current[pageNum]) {
        try {
          await renderTasksRef.current[pageNum].cancel();
        } catch (e) {
          // ignore cancel error
        }
      }

      const renderTask = page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      });

      renderTasksRef.current[pageNum] = renderTask;
      await renderTask.promise;
      renderedPagesRef.current.add(pageNum);
    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') {
        console.error(`Errore nel rendering della pagina ${pageNum}:`, err);
      }
    }
  };

  useEffect(() => {
    if (!pdf || pageCount === 0) return;
    
    // Clear tracked pages on scale change to force re-render
    renderedPagesRef.current.clear();
    
    // Sequence rendering to not freeze the UI
    const renderAllPages = async () => {
      for (let i = 1; i <= pageCount; i++) {
        await renderPage(i);
      }
    };
    
    renderAllPages();
  }, [pdf, pageCount, scale]);

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
          border: '4px solid var(--bg-surface-active)', 
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
          <p style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '2rem' }}>⚠️</p>
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
      position: 'relative',
      backgroundColor: 'var(--bg-main)'
    }}>
      {/* Floating Toolbar for Zoom */}
      <div style={{ 
        position: 'absolute',
        bottom: '1rem',
        right: '1rem',
        display: 'flex', 
        flexDirection: 'column',
        gap: '0.5rem', 
        backgroundColor: 'var(--bg-surface)',
        padding: '0.5rem',
        borderRadius: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        zIndex: 10
      }}>
        <button 
          onClick={handleZoomIn} 
          disabled={scale >= 3}
          className="btn"
          style={{ padding: '0.75rem', borderRadius: '50%', width: '40px', height: '40px', opacity: scale >= 3 ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ZoomIn size={20} />
        </button>
        <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
          {Math.round(scale * 100)}%
        </div>
        <button 
          onClick={handleZoomOut} 
          disabled={scale <= 0.5}
          className="btn"
          style={{ padding: '0.75rem', borderRadius: '50%', width: '40px', height: '40px', opacity: scale <= 0.5 ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ZoomOut size={20} />
        </button>
      </div>

      {/* Scrollable Canvas Container */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        overflowX: 'auto',
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        padding: '1rem',
        gap: '1rem'
      }}>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map(pageNum => (
          <div key={pageNum} style={{
            position: 'relative',
            backgroundColor: '#fff',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <canvas 
              id={`pdf-canvas-${pageNum}`}
              style={{ 
                display: 'block',
                maxWidth: '100%'
              }}
            />
            {/* Page number indicator on each page */}
            <div style={{
              position: 'absolute',
              bottom: '0.5rem',
              right: '0.5rem',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '1rem',
              fontSize: '0.75rem'
            }}>
              {pageNum} / {pageCount}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
