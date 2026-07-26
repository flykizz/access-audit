import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Header from './components/Header';
import Hero from './components/Hero';
import WhatIsAccessAudit from './components/WhatIsAccessAudit';
import HowItWorks from './components/HowItWorks';
import BuiltForSpeed from './components/BuiltForSpeed';
import ComparisonSection from './components/ComparisonSection';
import ShipFaster from './components/ShipFaster';
import HandleTheHardStuff from './components/HandleTheHardStuff';
import Pricing from './components/Pricing';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import Signup from './components/Signup';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Docs from './components/Docs';
import ScanPage from './components/ScanPage';
import ResultsPage from './components/ResultsPage';
import TestPages from './components/TestPages';
import AuthTestPage from './components/test/AuthTestPage';
import DataDisplayTestPage from './components/test/DataDisplayTestPage';
import FormTestPage from './components/test/FormTestPage';
import InteractionTestPage from './components/test/InteractionTestPage';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import OAuthCallback from './components/OAuthCallback';
import Profile from './components/Profile';
import { theme, darkTheme } from './theme';
import { useAppStore } from './store/appStore';

function Home() {
  return (
    <>
      <Hero />
      <WhatIsAccessAudit />
      <HowItWorks />
      <BuiltForSpeed />
      <ComparisonSection />
      <ShipFaster />
      <HandleTheHardStuff />
      <FAQSection />
    </>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const login = useAppStore((state) => state.login);

  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        login({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          credits: userData.credits,
          role: userData.role,
        }, savedToken);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
  }, [login]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : theme}>
      <CssBaseline />
      <Routes>
        <Route
          path="/signup"
          element={<Signup />}
        />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/docs"
          element={<Docs onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />}
        />
        <Route
          path="/scan"
          element={<ScanPage onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />}
        />
        <Route
          path="/results/:id"
          element={<ResultsPage onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />}
        />
        <Route
          path="/test-pages"
          element={<TestPages onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />}
        />
        <Route
          path="/test-pages/auth"
          element={<AuthTestPage onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />}
        />
        <Route
          path="/test-pages/data-display"
          element={<DataDisplayTestPage onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />}
        />
        <Route
          path="/test-pages/form"
          element={<FormTestPage onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />}
        />
        <Route
          path="/test-pages/interaction"
          element={<InteractionTestPage onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />}
        />
        <Route
          path="/terms-of-service"
          element={<TermsOfService />}
        />
        <Route
          path="/privacy-policy"
          element={<PrivacyPolicy />}
        />
        <Route
          path="/auth/callback"
          element={<OAuthCallback />}
        />
        <Route
          path="/profile"
          element={
            <>
              <Header onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />
              <main>
                <Profile />
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/pricing"
          element={
            <>
              <Header onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />
              <main>
                <Pricing />
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/"
          element={
            <>
              <Header onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />
              <main>
                <Home />
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;