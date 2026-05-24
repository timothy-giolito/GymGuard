import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { profileStore, type BodyMetricLog } from '../lib/profileStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Plus, Trash2, Activity, User, Save, X } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<BodyMetricLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form fields
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [arms, setArms] = useState('');
  const [legs, setLegs] = useState('');
  
  useEffect(() => {
    if (user) {
      loadMetrics();
    }
  }, [user]);

  const loadMetrics = async () => {
    if (!user) return;
    try {
      const data = await profileStore.getMetrics(user.id);
      setMetrics(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !weight) return;
    
    const newMetric: BodyMetricLog = {
      id: profileStore.createId(),
      date: new Date().toISOString(),
      weight: parseFloat(weight),
      height: height ? parseFloat(height) : undefined,
      chest: chest ? parseFloat(chest) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      arms: arms ? parseFloat(arms) : undefined,
      legs: legs ? parseFloat(legs) : undefined,
      userId: user.id
    };
    
    await profileStore.saveMetric(newMetric);
    setShowForm(false);
    resetForm();
    loadMetrics();
  };
  
  const resetForm = () => {
    setWeight(''); setHeight(''); setChest(''); setWaist(''); setArms(''); setLegs('');
  };

  const requestDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!user || !deleteId) return;
    await profileStore.deleteMetric(deleteId, user.id);
    setDeleteId(null);
    loadMetrics();
  };

  const chartData = [...metrics].reverse().map(m => ({
    date: format(new Date(m.date), 'dd MMM', { locale: it }),
    peso: m.weight
  }));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--color-primary-dim)', color: 'var(--color-primary)' }}>
          <User size={32} />
        </div>
        <div>
          <h2 className="app-title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Profilo Personale</h2>
          <div style={{ color: 'var(--text-muted)' }}>{user?.email}</div>
        </div>
      </div>
      
      {/* Grafico Andamento */}
      {metrics.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            <Activity size={18} color="var(--color-primary)" />
            Andamento Peso Corporeo
          </h3>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-primary)' }}
                />
                <Line type="monotone" dataKey="peso" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-surface)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Nuova Misurazione */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Storico Misurazioni</h3>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} />
            Nuovo
          </button>
        )}
      </div>

      {showForm && (
        <div className="card animate-in zoom-in-95 duration-200" style={{ marginBottom: '1.5rem', border: '1px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h4 style={{ fontWeight: 'bold' }}>Nuova Misurazione</h4>
            <button className="btn" style={{ padding: '0.25rem' }} onClick={() => setShowForm(false)}>
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="label">Peso (kg) *</label>
                <input type="number" step="0.1" required className="input-field" value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
              <div>
                <label className="label">Altezza (cm)</label>
                <input type="number" step="1" className="input-field" value={height} onChange={e => setHeight(e.target.value)} />
              </div>
              <div>
                <label className="label">Petto (cm)</label>
                <input type="number" step="0.1" className="input-field" value={chest} onChange={e => setChest(e.target.value)} />
              </div>
              <div>
                <label className="label">Vita (cm)</label>
                <input type="number" step="0.1" className="input-field" value={waist} onChange={e => setWaist(e.target.value)} />
              </div>
              <div>
                <label className="label">Braccia (cm)</label>
                <input type="number" step="0.1" className="input-field" value={arms} onChange={e => setArms(e.target.value)} />
              </div>
              <div>
                <label className="label">Gambe (cm)</label>
                <input type="number" step="0.1" className="input-field" value={legs} onChange={e => setLegs(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Save size={18} />
              Salva Misurazione
            </button>
          </form>
        </div>
      )}

      {/* Lista Storico */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {metrics.length === 0 && !showForm ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Nessuna misurazione registrata. Inizia aggiungendo la tua prima pesata!
          </div>
        ) : (
          metrics.map((m) => (
            <div key={m.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                  {m.weight} kg
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {format(new Date(m.date), 'dd MMMM yyyy, HH:mm', { locale: it })}
                </div>
                
                {/* Visualizzazione compatta delle altre misure */}
                {(m.chest || m.waist || m.arms || m.legs) && (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {m.height && <span>Alt: {m.height}</span>}
                    {m.chest && <span>Petto: {m.chest}</span>}
                    {m.waist && <span>Vita: {m.waist}</span>}
                    {m.arms && <span>Braccia: {m.arms}</span>}
                    {m.legs && <span>Gambe: {m.legs}</span>}
                  </div>
                )}
              </div>
              
              <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => requestDelete(m.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {deleteId && (
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
              Sei sicuro di voler eliminare questa misurazione? Questa azione non può essere annullata.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setDeleteId(null)}>
                Annulla
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
