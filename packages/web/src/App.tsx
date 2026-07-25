import { useState } from 'react';
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
import { theme, darkTheme } from './theme';

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
      <Pricing />
      <FAQSection />
    </>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

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