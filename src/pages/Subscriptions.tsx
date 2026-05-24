import { useState, useEffect } from 'react';
import { CreditCard, Calendar, Plus, Trash2 } from 'lucide-react';
import { format, addMonths, isAfter, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { store } from '../lib/store';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { CustomSelect } from '../components/CustomSelect';

interface Subscription {
  id: string;
  activeDays: string;
  startDate: string;
  durationMonths: number;
  price: number;
  userId?: string;
}

const getActiveDaysLabel = (sub: any) => {
  if (sub.activeDays) return sub.activeDays;
  if (sub.plan === 'lun-sab') return 'Lunedì - Sabato';
  if (sub.plan === 'lun-ven') return 'Lunedì - Venerdì';
  return 'Non specificato';
};

export default function Subscriptions() {
  const [activeSub, setActiveSub] = useState<Subscription | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [activeDays, setActiveDays] = useState('Lunedì - Venerdì');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [duration, setDuration] = useState(1);
  const [price, setPrice] = useState(45);

  useEffect(() => {
    store.getItem<Subscription>('active_subscription').then((data) => {
      if (data) setActiveSub(data);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSub: Subscription = {
      id: Date.now().toString(),
      activeDays,
      startDate,
      durationMonths: duration,
      price
    };
    
    await store.setItem('active_subscription', newSub);
    setActiveSub(newSub);
    setShowForm(false);
  };

  const handleDeleteRequest = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    await store.removeItem('active_subscription');
    setActiveSub(null);
    setShowConfirmDelete(false);
  };

  const getEndDate = (sub: Subscription) => {
    return addMonths(new Date(sub.startDate), sub.durationMonths);
  };

  const isExpired = (sub: Subscription) => {
    return isAfter(new Date(), getEndDate(sub));
  };

  const getDaysRemaining = (sub: Subscription) => {
    const end = getEndDate(sub);
    const today = new Date();
    // Reset time for accurate day count
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return differenceInDays(end, today);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="app-title" style={{ fontSize: '1.5rem' }}>Il Mio Abbonamento</h2>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={20} />
            Nuovo
          </button>
        )}
      </div>

      {showForm ? (
        <div className="card">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label">Giorni attivi</label>
              <CustomSelect 
                value={activeDays} 
                onChange={setActiveDays}
                options={[
                  { value: 'Lunedì - Venerdì', label: 'Lunedì - Venerdì' },
                  { value: 'Lunedì - Domenica', label: 'Lunedì - Domenica' }
                ]}
              />
            </div>
            
            <div>
              <label className="label">Data di Inizio</label>
              <CustomDatePicker 
                value={startDate}
                onChange={setStartDate}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Durata (Mesi)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="24" 
                  className="input-field" 
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              <div>
                <label className="label">Importo Totale (€)</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01"
                  className="input-field" 
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>
            
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowForm(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">Salva</button>
              </div>
            </div>
          </form>
        </div>
      ) : activeSub ? (
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, var(--bg-surface-hover) 0%, var(--bg-surface) 100%)',
          border: '1px solid var(--color-primary-dim)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute', 
            top: '-20px', 
            right: '-20px', 
            opacity: 0.1, 
            color: 'var(--color-primary)' 
          }}>
            <CreditCard size={120} />
          </div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Giorni Attivi</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  {getActiveDaysLabel(activeSub)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '1rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold',
                  background: isExpired(activeSub) ? 'var(--danger-dim)' : 'var(--color-primary-dim)',
                  color: isExpired(activeSub) ? 'var(--danger)' : 'var(--color-primary)'
                }}>
                  {isExpired(activeSub) ? 'Scaduto' : 'Attivo'}
                </div>
                <button 
                  className="btn btn-danger" 
                  style={{ padding: '0.35rem 0.5rem', border: 'none' }}
                  onClick={handleDeleteRequest}
                  title="Cancella abbonamento"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={14} /> Inizio
                </div>
                <div style={{ fontWeight: '500' }}>{format(new Date(activeSub.startDate), 'dd MMM yyyy', { locale: it })}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={14} /> Scadenza
                </div>
                <div style={{ fontWeight: '500' }}>{format(getEndDate(activeSub), 'dd MMM yyyy', { locale: it })}</div>
                <div style={{ fontSize: '0.75rem', color: isExpired(activeSub) ? 'var(--danger)' : 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {isExpired(activeSub) ? 'Scaduto' : `${getDaysRemaining(activeSub)} giorni rimanenti`}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Durata: {activeSub.durationMonths} {activeSub.durationMonths === 1 ? 'mese' : 'mesi'}
              </div>
              <div style={{ fontWeight: 'bold' }}>
                €{activeSub.price}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Nessun abbonamento attivo</div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Aggiungi Abbonamento
          </button>
        </div>
      )}

      {showConfirmDelete && (
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
          <div className="card animate-in fade-in zoom-in duration-200" style={{ width: '100%', maxWidth: '350px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Conferma Cancellazione</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Sei sicuro di voler cancellare l'abbonamento attivo? Questa azione non può essere annullata.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowConfirmDelete(false)}>
                Annulla
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Cancella Abbonamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
