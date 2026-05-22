import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CustomSelect({ value, options, onChange, placeholder = 'Seleziona...' }: CustomSelectProps) {
  const [showModal, setShowModal] = useState(false);

  const selectedOption = options.find(o => o.value === value);

  return (
    <>
      <div 
        className="input-field" 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none', backgroundColor: 'var(--bg-surface)' }}
        onClick={() => setShowModal(true)}
      >
        <span style={{ color: selectedOption ? 'var(--text)' : 'var(--text-muted)' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card animate-in fade-in zoom-in duration-200" style={{ width: '100%', maxWidth: '350px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Seleziona opzione</h3>
            
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className="btn"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '1rem',
                  backgroundColor: value === option.value ? 'var(--color-primary)' : 'var(--bg-surface-hover)',
                  color: value === option.value ? 'white' : 'var(--text)',
                  border: 'none',
                  textAlign: 'left'
                }}
                onClick={() => {
                  onChange(option.value);
                  setShowModal(false);
                }}
              >
                {option.label}
              </button>
            ))}
            
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn" onClick={() => setShowModal(false)}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
