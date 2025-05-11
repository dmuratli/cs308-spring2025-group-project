// src/components/RequireRole.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

interface RequireRoleProps {
  role: string;
  children: React.ReactElement;
}

const RequireRole: React.FC<RequireRoleProps> = ({ role, children }) => {
  const [allowed, setAllowed] = useState<boolean|null>(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setAllowed(false);
      return;
    }
    axios.get('http://localhost:8000/api/user-info/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const roles: string[] = res.data.roles.map((r:string) => r.toLowerCase());
      setAllowed(roles.includes(role.toLowerCase()));
    })
    .catch(() => setAllowed(false));
  }, [role]);

  // still loading
  if (allowed === null) return <div>Loading…</div>;
  // not allowed → back home
  if (!allowed) return <Navigate to="/" state={{ from: location }} replace />;
  // OK!
  return children;
};

export default RequireRole;