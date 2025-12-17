import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { MarketOverview, CompanySelect, CompanyProfile, Comparison } from '@/pages';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<MarketOverview />} />
        <Route path="/mercado" element={<MarketOverview />} />
        <Route path="/compania" element={<CompanySelect />} />
        <Route path="/compania/:codCia" element={<CompanyProfile />} />
        <Route path="/comparar" element={<Comparison />} />
      </Route>
    </Routes>
  );
}

export default App;
