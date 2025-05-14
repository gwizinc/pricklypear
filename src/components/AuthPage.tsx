import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from './auth';

type FormState = {
  email: string;
  password: string;
};

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ children, ...props }) => (
  <label {...props}>
    {children}
  </label>
);

const AuthPage: React.FC = () => {
  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [error, setError] = useState<string>('');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await signIn({ email: form.email, password: form.password });
      if (isAdminMode) {
        const response = await fetch('/functions/v1/check-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: form.email }),
        });
        const { isAdmin } = await response.json();
        if (!isAdmin) {
          throw new Error('Unauthorized: not an admin');
        }
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      <form onSubmit={handleSignIn}>
        <Label>
          Role
          <select
            value={isAdminMode ? 'admin' : 'user'}
            onChange={(e) => setIsAdminMode(e.target.value === 'admin')}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </Label>
        <Label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </Label>
        <Label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </Label>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default AuthPage;
