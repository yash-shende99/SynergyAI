// components/Navbar.jsx
import React, { useState } from "react";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  onAuthButtonClick: () => void;
}

interface NavItem {
  label: string;
  section: string;
}

const Navbar = ({ onAuthButtonClick }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const scrollToSection = (sectionId: string) => {
    setIsOpen(false); // Close mobile menu
    const element = document.getElementById(sectionId);
    if (element) {
      // Add a small offset to account for fixed navbar
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const navItems: NavItem[] = [
    { label: "Home", section: "hero" },
    { label: "Features", section: "features" },
    { label: "How It Works", section: "how-it-works" },
    { label: "Use Cases", section: "use-cases" },
    { label: "Testimonials", section: "testimonials" },
    { label: "FAQ", section: "faq" },
  ];

  return (
    <nav className="bg-background bg-opacity-90 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <button 
              onClick={() => scrollToSection('hero')}
              className="flex items-center"
            >
              <div className="relative">
                <div className="w-3 h-3 bg-synergy-ai-primary rounded-full absolute -top-1 -right-1 animate-ping"></div>
                <span className="text-2xl font-bold bg-gradient-to-r from-synergy-ai-primary to-synergy-ai-purple-light bg-clip-text text-transparent">
                  SynergyAI
                </span>
              </div>
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.section}
                  onClick={() => scrollToSection(item.section)}
                  className="px-3 py-2 text-sm font-medium text-white hover:text-synergy-ai-primary transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onAuthButtonClick}
              className="px-4 py-2 text-sm font-medium text-white hover:text-synergy-ai-primary transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={onAuthButtonClick}
              className="bg-synergy-ai-primary hover:bg-synergy-ai-primary-hover text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Request Demo
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-surface border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.section}
                onClick={() => scrollToSection(item.section)}
                className="block w-full text-left px-3 py-2 text-base font-medium text-white hover:text-synergy-ai-primary"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 pb-2 border-t border-border">
              <div className="space-y-2">
                <button
                  onClick={onAuthButtonClick}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-white hover:text-synergy-ai-primary"
                >
                  Sign In
                </button>
                <button
                  onClick={onAuthButtonClick}
                  className="block w-full px-3 py-2 text-base font-medium bg-synergy-ai-primary text-white rounded-lg text-center hover:bg-synergy-ai-primary-hover transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;