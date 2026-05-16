import { useState } from 'react';
import { LockKeyhole, LogIn, ShieldCheck, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('jvinstock@trade.app');
  const [password, setPassword] = useState('demo1234');

  const handleSubmit = (event) => {
    event.preventDefault();
    signIn({ email, password });
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <div className="brand-mark">J</div>
          <div>
            <strong>JTrade</strong>
            <span>Portfolio dashboard</span>
          </div>
        </div>

        <div className="auth-copy">
          <h1>Sign in to your trading workspace</h1>
          <p>Access portfolio performance, holdings, allocation, research, reports, and account settings.</p>
        </div>

        <div className="auth-highlights">
          <div><TrendingUp size={18} /><span>Live portfolio workspace</span></div>
          <div><ShieldCheck size={18} /><span>Session-aware dashboard UI</span></div>
          <div><LockKeyhole size={18} /><span>Protected navigation shell</span></div>
        </div>
      </section>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div>
          <span>Secure access</span>
          <h2>Sign in</h2>
        </div>

        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>

        <label>
          <span>Password</span>
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>

        <button type="submit"><LogIn size={17} />Sign in</button>
        <p>Demo mode accepts any email and password.</p>
      </form>
    </main>
  );
}
