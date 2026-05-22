import { Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';

export default function ProtectedAdminRoute({ children }) {
  const { isAdmin } = useStore();

  // while we don't know admin status, render nothing (or a loader)
  if (isAdmin === null) return null;

  if (isAdmin !== true) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
