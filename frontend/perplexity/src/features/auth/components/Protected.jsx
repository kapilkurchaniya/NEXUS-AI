import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router';

const Protected = ({children}) => {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const checked = useSelector((state) => state.auth.checked);

  if (!checked || loading) {
      return <div className="loading-screen"><div className="loading-spinner" /></div>;
  }

  if (!user) {
      return <Navigate to="/" />;
  }

  return children
  
}

export default Protected