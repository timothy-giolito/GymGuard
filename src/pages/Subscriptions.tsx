import { useState, useEffect } from 'react';
import { CreditCard, Calendar, Plus } from 'lucide-react';
import { format, addMonths, isAfter } from 'date-fns';
import { store } from '../lib/store';

type PlanType = 'lun-ven' | 'lun-sab';

interface Subscription {
  id: string;
  plan: PlanType;
  startDate: string;
  durationMonths: number;
  price: number;
}

const PLAN_PRICES = {
  'lun-ven': 45,
  'lun-sab': 50
};

const PLAN_LABELS = {
  'lun-ven': 'Lunedì - Venerdì',
  'lun-sab': 'Lunedì - Sabato'
};

export default function Subscriptions() {
  const [activeSub, setActiveSub] = useState<Subscription | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [plan, setPlan] = useState<PlanType>('lun-ven');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    store.getItem<Subscription>('active_subscription').then((data) => {
      if (data) setActiveSub(data);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSub: Subscription = {
      id: Date.now().toString(),
      plan,
      startDate,
      durationMonths: duration,
      price: PLAN_PRICES[plan] * duration
    };
    
    await store.setItem('active_subscription', newSub);
    setActiveSub(newSub);
    setShowForm(false);
  };

  const getEndDate = (sub: Subscription) => {
    return addMonths(new Date(sub.startDate), sub.durationMonths);
  };

  const isExpired = (sub: Subscription) => {
    return isAfter(new Date(), getEndDate(sub));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Il Mio Abbonamento</h2>
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
              <label className="label">Piano</label>
              <select 
                className="input-field" 
                value={plan} 
                onChange={(e) => setPlan(e.target.value as PlanType)}
              >
                <option value="lun-ven">Lunedì - Venerdì (€45/mese)</option>
                <option value="lun-sab">Lunedì - Sabato (€50/mese)</option>
              </select>
            </div>
            
            <div>
              <label className="label">Data di Inizio</label>
              <input 
                type="date" 
                className="input-field" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="label">Durata (Mesi)</label>
              <input 
                type="number" 
                min="1" 
                max="12" 
                className="input-field" 
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                required
              />
            </div>
            
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                Totale: €{PLAN_PRICES[plan] * duration}
              </div>
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
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Piano Attivo</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  {PLAN_LABELS[activeSub.plan]}
                </div>
              </div>
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={14} /> Inizio
                </div>
                <div style={{ fontWeight: '500' }}>{format(new Date(activeSub.startDate), 'dd MMM yyyy')}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={14} /> Scadenza
                </div>
                <div style={{ fontWeight: '500' }}>{format(getEndDate(activeSub), 'dd MMM yyyy')}</div>
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
    </div>
  );
}
