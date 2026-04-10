import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
}

export default function AuthModal({ open, onClose, onContinueAsGuest }: AuthModalProps) {
  const { signUp, signIn, signInWithProvider } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setGender(null);
    setError('');
    setConfirmationSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && !gender) {
      setError('Please select male or female to continue.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error: err } = await signUp(email, password, gender!);
        if (err) {
          setError(err.message);
        } else {
          setConfirmationSent(true);
        }
      } else {
        const { error: err } = await signIn(email, password);
        if (err) {
          setError(err.message);
        } else {
          onClose();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: 'google' | 'apple' | 'facebook') => {
    setError('');
    const { error: err } = await signInWithProvider(provider);
    if (err) setError(err.message);
  };

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md sketch-card bg-background p-8 shadow-2xl"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="font-serif text-2xl font-semibold text-foreground tracking-tight">
              {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {mode === 'signup'
                ? 'Save your values, unlock new discoveries.'
                : 'Sign in to continue your journey.'}
            </p>
          </div>

          {confirmationSent ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/5">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <p className="font-serif text-lg text-foreground">Check your email</p>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then return here.
              </p>
              <button
                onClick={() => { resetForm(); setMode('signin'); }}
                className="mt-6 text-sm font-medium text-primary hover:underline"
              >
                Go to sign in
              </button>
            </div>
          ) : (
            <>
              {/* Google sign-in */}
              <div className="space-y-2.5 mb-6">
                <button
                  onClick={() => handleSocial('google')}
                  className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </button>
              </div>
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground uppercase tracking-widest">or</span>
                </div>
              </div>

              {/* Email/password form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-technical block mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="label-technical block mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                      placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Gender selector — signup only */}
                {mode === 'signup' && (
                  <div>
                    <label className="label-technical block mb-1.5">I am</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['male', 'female'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`rounded-md border px-4 py-2.5 text-sm font-medium transition-all ${
                            gender === g
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                          }`}
                        >
                          {g === 'male' ? 'Male' : 'Female'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-sketch-primary w-full py-2.5 text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Working...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              {/* Toggle mode */}
              <p className="mt-5 text-center text-sm text-muted-foreground">
                {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => { resetForm(); setMode(mode === 'signup' ? 'signin' : 'signup'); }}
                  className="font-medium text-primary hover:underline"
                >
                  {mode === 'signup' ? 'Sign in' : 'Create one'}
                </button>
              </p>

              {/* Guest option */}
              <div className="mt-4 pt-4 border-t border-border text-center">
                <button
                  onClick={onContinueAsGuest}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue as guest <span className="text-xs">(personal values only, results won't be saved)</span>
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
