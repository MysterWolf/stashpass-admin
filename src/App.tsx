import { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { getSecret } from './api/client';
import Setup from './pages/Setup';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Operators from './pages/Operators';
import OperatorEdit from './pages/OperatorEdit';
import Strains from './pages/Strains';
import StrainEdit from './pages/StrainEdit';
import Queue from './pages/Queue';

export default function App() {
  const [unlocked, setUnlocked] = useState(() => !!getSecret());

  if (!unlocked) {
    return <Setup onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/operators" element={<Operators />} />
          <Route path="/operators/:id" element={<OperatorEdit />} />
          <Route path="/strains" element={<Strains />} />
          <Route path="/strains/:id" element={<StrainEdit />} />
          <Route path="/queue" element={<Queue />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
