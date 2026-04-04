// Legacy redirect — PSA cert scan now handled by GradedCertScan
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function PsaCertScan() {
  const { cert } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/graded/psa/${cert}`, { replace: true });
  }, [cert, navigate]);
  return null;
}