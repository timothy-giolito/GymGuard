import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  options: Option[];
  value: string | string[];
  onChange: (value: any) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  multiple?: boolean;
}

export function CustomSelect({ options, value, onChange, placeholder, style, multiple }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getDisplayText = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder || 'Seleziona...';
      if (value.length === 1) return options.find(opt => opt.value === value[0])?.label || value[0];
      return `${value.length} selezionati`;
    }
    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption ? selectedOption.label : (placeholder || 'Seleziona...');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          width: '100%',
          background: 'transparent',
          color: (multiple && Array.isArray(value) && value.length > 0) || (!multiple && value) ? 'var(--text-main)' : 'var(--text-muted)',
          fontSize: 'inherit'
        }}
      >
        <span>{getDisplayText()}</span>
        <ChevronDown size={18} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '0.5rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.75rem',
          zIndex: 50,
          maxHeight: '250px',
          overflowY: 'auto',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
        }}>
          {options.map((opt) => {
            const isSelected = multiple && Array.isArray(value) 
              ? value.includes(opt.value) 
              : value === opt.value;
              
            return (
              <div
                key={opt.value}
                onClick={() => {
                  if (!opt.disabled) {
                    if (multiple && Array.isArray(value)) {
                      if (isSelected) {
                        onChange(value.filter(v => v !== opt.value));
                      } else {
                        onChange([...value, opt.value]);
                      }
                    } else {
                      onChange(opt.value);
                      setIsOpen(false);
                    }
                  }
                }}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: opt.disabled ? 'not-allowed' : 'pointer',
                  color: opt.disabled ? 'var(--text-muted)' : (isSelected ? 'var(--color-primary)' : 'var(--text-main)'),
                  background: isSelected ? 'var(--bg-surface-hover)' : 'transparent',
                  borderBottom: '1px solid var(--border-color)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  if (!opt.disabled && !isSelected) {
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!opt.disabled && !isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {opt.label}
                {multiple && isSelected && (
                  <span style={{ color: 'var(--color-primary)' }}>✓</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
