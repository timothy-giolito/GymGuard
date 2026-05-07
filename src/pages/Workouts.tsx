import { useState, useEffect, useRef } from 'react';
import { Upload, File, Image as ImageIcon, Trash2 } from 'lucide-react';
import { store } from '../lib/store';

interface WorkoutFile {
  id: string;
  name: string;
  type: string;
  data: Blob; // Stored as Blob in IndexedDB via localforage
}

export default function Workouts() {
  const [files, setFiles] = useState<WorkoutFile[]>([]);
  const [activeFile, setActiveFile] = useState<WorkoutFile | null>(null);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = async () => {
    const savedFiles = await store.getItem<WorkoutFile[]>('workout_files');
    if (savedFiles) {
      setFiles(savedFiles);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // When activeFile changes, create an object URL for it
  useEffect(() => {
    if (activeFile && activeFile.data) {
      const url = URL.createObjectURL(activeFile.data);
      setActiveUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setActiveUrl(null);
    }
  }, [activeFile]);



  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Basic validation
      if (!file.type.includes('pdf') && !file.type.includes('image')) {
        alert('Per favore carica solo PDF o Immagini.');
        return;
      }

      const newFile: WorkoutFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        data: file
      };

      const updatedFiles = [...files, newFile];
      await store.setItem('workout_files', updatedFiles);
      setFiles(updatedFiles);
      setActiveFile(newFile);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedFiles = files.filter(f => f.id !== id);
    await store.setItem('workout_files', updatedFiles);
    setFiles(updatedFiles);
    if (activeFile?.id === id) {
      setActiveFile(null);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Le Mie Schede</h2>
        <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
          <Upload size={20} />
          Carica
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="application/pdf,image/*"
          onChange={handleFileUpload}
        />
      </div>

      {activeFile && activeUrl ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeFile.name}
            </h3>
            <button className="btn" style={{ padding: '0.5rem' }} onClick={() => setActiveFile(null)}>
              Chiudi
            </button>
          </div>
          
          <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {activeFile.type.includes('pdf') ? (
              <iframe 
                src={activeUrl} 
                style={{ width: '100%', height: '100%', border: 'none', minHeight: '400px' }}
                title={activeFile.name}
              />
            ) : (
              <img 
                src={activeUrl} 
                alt={activeFile.name} 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1 }}>
          {files.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Nessuna scheda caricata</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Carica un PDF o un'immagine per iniziare
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {files.map(file => (
                <div 
                  key={file.id} 
                  className="card" 
                  style={{ 
                    padding: '1rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease'
                  }}
                  onClick={() => setActiveFile(file)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
                    <div style={{ color: 'var(--color-primary)' }}>
                      {file.type.includes('pdf') ? <File size={24} /> : <ImageIcon size={24} />}
                    </div>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </div>
                  </div>
                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '0.5rem' }}
                    onClick={(e) => handleDelete(file.id, e)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
