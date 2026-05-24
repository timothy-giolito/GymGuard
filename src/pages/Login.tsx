import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { Lock, Mail, Dumbbell, ArrowRight, UserPlus } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Per favore compila tutti i campi.');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/subscriptions', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'autenticazione');
    }
  };

  const variants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      backgroundColor: '#0a0a0a',
      color: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, var(--color-primary-dim) 0%, transparent 70%)',
        opacity: 0.3,
        filter: 'blur(40px)',
        zIndex: 0
      }} />

      <motion.div 
        initial="enter"
        animate="center"
        variants={variants}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '400px', zIndex: 1 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            style={{ 
              display: 'inline-flex', 
              padding: '1rem', 
              borderRadius: '50%', 
              backgroundColor: 'var(--color-primary-dim)',
              color: 'var(--color-primary)',
              marginBottom: '1rem',
              boxShadow: '0 0 20px var(--color-primary-dim)'
            }}
          >
            <Dumbbell size={40} />
          </motion.div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            GymGuard
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Il tuo compagno di allenamento</p>
        </div>

        <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
          <AnimatePresence mode="wait">
            <motion.h2 
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}
            >
              {isLogin ? 'Accedi al tuo account' : 'Crea un nuovo account'}
            </motion.h2>
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              style={{ backgroundColor: 'var(--danger-dim)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  className="input-field" 
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="La tua email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  className="input-field" 
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="La tua password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span style={{ opacity: 0.7 }}>Caricamento...</span>
              ) : (
                <>
                  {isLogin ? 'Accedi' : 'Registrati'}
                  {isLogin ? <ArrowRight size={18} /> : <UserPlus size={18} />}
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button 
              type="button" 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}
              disabled={isLoading}
            >
              {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
