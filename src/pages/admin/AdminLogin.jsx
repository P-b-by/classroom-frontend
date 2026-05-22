import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext.jsx';
import BrandLogo from '../../components/BrandLogo.jsx';
import './AdminLogin.css';
import '../../components/BrandLogo.css';

export default function AdminLogin() {
  const { loginAdmin, isAdmin } = useStore();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const showHint = import.meta.env.MODE !== 'production';

  if (isAdmin === true) {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await loginAdmin(password);
    if (ok) navigate('/admin');
    else setError('Invalid password. Please try again.');
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <BrandLogo theme="onDark" size="login" />
        <h1>Admin Portal</h1>
        <p>Sign in to manage products and orders</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter admin password"
              autoFocus
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn btn-gold" style={{ width: '100%' }}>
            Sign In
          </button>
        </form>
     
        <a href="/" className="back-link">← Back to Store</a>
      </div>
    </div>
  );
}
