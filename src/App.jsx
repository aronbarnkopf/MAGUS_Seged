import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Spellbook from './pages/spellbook/Spellbook';
import Rulebook from './pages/rulebook/Rulebook';
import Characters from './pages/characters/Characters';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DatabaseSeeder from './components/admin/DatabaseSeeder';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/spells" replace />} />
            <Route path="spells" element={<Spellbook />} />
            <Route path="rules" element={<Rulebook />} />
            <Route path="characters" element={<Characters />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="admin" element={<DatabaseSeeder />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
