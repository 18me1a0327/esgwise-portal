
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';

import Layout from './components/Layout/Layout';
import PageTransition from './components/Layout/PageTransition';

import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import FormEntry from './pages/FormEntry';
import ApprovalQueue from './pages/ApprovalQueue';
import UserManagement from './pages/admin/UserManagement';
import Sites from './pages/Sites';
import EmissionFactors from './pages/EmissionFactors';
import Reports from './pages/Reports';

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Routes>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/form" element={<PageTransition><FormEntry /></PageTransition>} />
          <Route path="/form/:id" element={<PageTransition><FormEntry /></PageTransition>} />
          <Route path="/approvals" element={<PageTransition><ApprovalQueue /></PageTransition>} />
          <Route path="/reports" element={<PageTransition><Reports /></PageTransition>} />
          <Route path="/admin/users" element={<PageTransition><UserManagement /></PageTransition>} />
          <Route path="/sites" element={<PageTransition><Sites /></PageTransition>} />
          <Route path="/admin/emission-factors" element={<PageTransition><EmissionFactors /></PageTransition>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
