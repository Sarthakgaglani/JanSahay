import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from './context/LanguageContext';
import { LocationProvider } from './context/LocationContext';
import { BookmarkProvider } from './context/BookmarkContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Schemes from './pages/Schemes';
import SchemeDetail from './pages/SchemeDetail';
import About from './pages/About';
import Calculator from './pages/Calculator';
import EligibilityChecker from './pages/EligibilityChecker';
import Dashboard from './pages/Dashboard';
import Reminders from './pages/Reminders';
import Locator from './pages/Locator';

function AppContent() {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/schemes/:slug" element={<SchemeDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/eligibility" element={<EligibilityChecker />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/locator" element={<Locator />} />
        </Routes>
      </main>
      {!isChatPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <LocationProvider>
          <BookmarkProvider>
            <Router>
              <AppContent />
            </Router>
          </BookmarkProvider>
        </LocationProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
