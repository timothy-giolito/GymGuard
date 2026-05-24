import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', backgroundColor: '#0a0a0a' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ color: 'var(--color-primary)' }}
        >
          <Dumbbell size={48} />
        </motion.div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
