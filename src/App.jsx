import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import Auth from './pages/Auth';
import MyCards from './pages/MyCards';
import Dashboard from './pages/Dashboard';
import CardDetail from './pages/CardDetail';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<MyCards />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cards/:id" element={<CardDetail />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App