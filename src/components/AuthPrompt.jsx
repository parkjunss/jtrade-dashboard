import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPrompt({ title = 'Sign in to continue', message = 'This workspace contains portfolio-specific data.' }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('jvinstock@trade.app');
  const [password, setPassword] = useState('demo1234');

  const handleSubmit = (event) => {
    event.preventDefault();
    signIn({ email, password });
  };

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <div>
        <span>Protected area</span>
        <h2>{title}</h2>
        <p>{message}</p>
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
  );
}
