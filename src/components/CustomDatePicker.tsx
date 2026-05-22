import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // 'yyyy-MM-dd'
  onChange: (value: string) => void;
}

export function CustomDatePicker({ value, onChange }: CustomDatePickerProps) {
  const [showModal, setShowModal] = useState(false);
  
  // Parse initial value carefully to avoid timezone issues
  const initialDate = value ? new Date(value + 'T12:00:00') : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate);

  const selectedDate = value ? new Date(value + 'T12:00:00') : new Date();

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const onDateClick = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setShowModal(false);
  };

  return (
    <>
      <div 
        className="input-field" 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => {
          setCurrentMonth(selectedDate);
          setShowModal(true);
        }}
      >
        <CalendarIcon size={18} style={{ color: 'var(--text-muted)' }} />
        <span>{value ? format(selectedDate, 'dd MMMM yyyy', { locale: it }) : 'Seleziona data'}</span>
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
          <div className="card animate-in fade-in zoom-in duration-200" style={{ width: '100%', maxWidth: '350px', padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <button type="button" className="btn" style={{ padding: '0.5rem' }} onClick={handlePrevMonth}>
                <ChevronLeft size={20} />
              </button>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem', textTransform: 'capitalize' }}>
                {format(currentMonth, 'MMMM yyyy', { locale: it })}
              </div>
              <button type="button" className="btn" style={{ padding: '0.5rem' }} onClick={handleNextMonth}>
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Days of week */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'bold' }}>
              {weekDays.map(day => <div key={day}>{day}</div>)}
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
              {days.map((day, i) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onDateClick(day)}
                    style={{
                      padding: '0.5rem 0',
                      borderRadius: '0.5rem',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                      color: isSelected ? 'white' : (isCurrentMonth ? 'var(--text)' : 'var(--text-muted)'),
                      fontWeight: isSelected ? 'bold' : 'normal',
                      cursor: 'pointer',
                      opacity: isCurrentMonth ? 1 : 0.5,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '0.875rem'
                    }}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn" onClick={() => setShowModal(false)}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
