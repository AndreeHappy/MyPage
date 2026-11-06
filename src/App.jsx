import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Certifications from "./components/Certifications";
import Projects from "./components/Projects";
import Leadership from "./components/Leadership";
import Footer from "./components/Footer";
import KoiLagoon from "./components/KoiLagoon";

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("theme-light", isLightMode);
  }, [isLightMode]);

  const handleToggleTheme = () => {
    setIsLightMode((prev) => !prev);
  };

  return (
    <div
      className="min-h-[100dvh] transition-colors duration-300"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--fg)"
      }}
    >
      <Navbar
        activePage={activePage}
        onNavigate={setActivePage}
        isLightMode={isLightMode}
        onToggleTheme={handleToggleTheme}
      />

      <main>
        {activePage === "home" && (
          <>
            <Hero isLightMode={isLightMode} />
            <KoiLagoon isLightMode={isLightMode}>
              <About isLightMode={isLightMode} />
            </KoiLagoon>
            <Experience isLightMode={isLightMode} />
            {/* Shared 3D Koi Lagoon spanning behind both Skills and the Final Contact Section */}
            <KoiLagoon isLightMode={isLightMode}>
              <Skills isLightMode={isLightMode} />
              <Footer isLightMode={isLightMode} />
            </KoiLagoon>
          </>
        )}

        {activePage === "certificaciones" && (
          <>
            <Certifications />
            <Leadership />
            <KoiLagoon isLightMode={isLightMode}>
              <Footer />
            </KoiLagoon>
          </>
        )}

        {activePage === "proyectos" && (
          <>
            <Projects />
            <KoiLagoon isLightMode={isLightMode}>
              <Footer />
            </KoiLagoon>
          </>
        )}
      </main>
    </div>
  );
}
