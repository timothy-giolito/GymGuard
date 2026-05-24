import { Preferences } from '@capacitor/preferences';

// Tipo base per l'utente
export interface User {
  id: string;
  name: string;
}

// Tipo per la sessione restituita dall'auth service
export interface Session {
  user: User;
  token: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Servizio di Autenticazione (BaaS-agnostic)
 * 
 * Attualmente predisposto per un'integrazione futura con Supabase o Firebase.
 * Usa @capacitor/preferences per il salvataggio sicuro dei token sul dispositivo.
 */
class AuthService {
  // Simulazione di un ritardo di rete
  private async delay(ms: number = 800) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Salva la sessione in modo sicuro sul dispositivo
   */
  private async persistSession(session: Session): Promise<void> {
    await Preferences.set({ key: TOKEN_KEY, value: session.token });
    await Preferences.set({ key: USER_KEY, value: JSON.stringify(session.user) });
  }

  /**
   * Pulisce i dati di sessione dal dispositivo
   */
  private async clearSession(): Promise<void> {
    await Preferences.remove({ key: TOKEN_KEY });
    await Preferences.remove({ key: USER_KEY });
  }

  /**
   * Effettua il Login (ora basta solo il nome)
   */
  async signIn(name: string): Promise<Session> {
    await this.delay();
    
    if (!name) {
      throw new Error('Il nome è obbligatorio');
    }
    
    const session: Session = {
      user: { id: `usr_${Date.now()}`, name },
      token: `jwt_mock_${Date.now()}`
    };

    await this.persistSession(session);
    return session;
  }

  /**
   * Effettua il Logout.
   */
  async signOut(): Promise<void> {
    await this.delay(400);
    
    // TODO: Implementazione reale, es: supabase.auth.signOut()
    
    await this.clearSession();
  }

  /**
   * Recupera la sessione attuale al caricamento dell'app.
   */
  async getSession(): Promise<Session | null> {
    try {
      const tokenResult = await Preferences.get({ key: TOKEN_KEY });
      const userResult = await Preferences.get({ key: USER_KEY });

      if (tokenResult.value && userResult.value) {
        return {
          token: tokenResult.value,
          user: JSON.parse(userResult.value) as User
        };
      }
      return null;
    } catch (e) {
      console.error("Errore durante il recupero della sessione", e);
      return null;
    }
  }
}

export const authService = new AuthService();
