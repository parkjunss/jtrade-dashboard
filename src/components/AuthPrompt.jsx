import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPrompt({ title = 'Sign in to continue', message = 'This workspace contains portfolio-specific data.' }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('Jun Portfolio');
  const [email, setEmail] = useState('jvinstock@trade.app');
  const [password, setPassword] = useState('demo1234');
  const isSignUp = mode === 'signup';

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = { email, name, password };
    if (isSignUp) {
      signUp(payload);
      return;
    }
    signIn(payload);
  };

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <div>
        <span>Protected area</span>
        <h2>{isSignUp ? 'Create account' : title}</h2>
        <p>{message}</p>
      </div>

      <div className="auth-mode-tabs" aria-label="Authentication mode">
        <button className={!isSignUp ? 'active' : ''} onClick={() => setMode('signin')} type="button">Sign in</button>
        <button className={isSignUp ? 'active' : ''} onClick={() => setMode('signup')} type="button">Sign up</button>
      </div>

      {isSignUp ? (
        <label>
          <span>Name</span>
          <input
            autoComplete="name"
            onChange={(event) => setName(event.target.value)}
            type="text"
            value={name}
          />
        </label>
      ) : null}

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

      <button type="submit">
        {isSignUp ? <UserPlus size={17} /> : <LogIn size={17} />}
        {isSignUp ? 'Create account' : 'Sign in'}
      </button>
      <p>Demo mode accepts any email and password.</p>
    </form>
  );
}
