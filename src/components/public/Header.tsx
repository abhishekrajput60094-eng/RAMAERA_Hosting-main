import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Server, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleProductsMouseEnter = () => {
    setProductsOpen(true);
  };

  const handleProductsMouseLeave = () => {
    setProductsOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="bg-slate-900 shadow-lg shadow-cyan-500/10 sticky top-0 z-50 border-b border-cyan-500/30">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Server className="h-8 w-8 text-cyan-400" />
            <span className="text-xl font-bold text-white">Ramaera Hosting</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-300 hover:text-cyan-400 transition">
              Home
            </Link>

            <div
              className="relative group"
              onMouseEnter={handleProductsMouseEnter}
              onMouseLeave={handleProductsMouseLeave}
            >
              <button
                className="flex items-center space-x-1 text-slate-300 hover:text-cyan-400 transition"
                onClick={() => setProductsOpen(!productsOpen)}
              >
                <span>Products</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
              </button>
              {productsOpen && (
                <div className="absolute top-full left-0 pt-2 -mt-2 w-56">
                  <div className="bg-slate-800 rounded-lg shadow-lg shadow-cyan-500/20 py-2 border border-cyan-500/30">
                    <Link
                      to="/pricing"
                      className="block px-4 py-3 text-sm text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-400 transition"
                      onClick={() => setProductsOpen(false)}
                    >
                      Cloud Servers
                    </Link>
                    <Link
                      to="/dedicated-servers"
                      className="block px-4 py-3 text-sm text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-400 transition"
                      onClick={() => setProductsOpen(false)}
                    >
                      Dedicated Servers
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/pricing" className="text-slate-300 hover:text-cyan-400 transition">
              Pricing
            </Link>
            <Link to="/calculator" className="text-slate-300 hover:text-cyan-400 transition">
              Calculator
            </Link>
            <Link to="/solutions" className="text-slate-300 hover:text-cyan-400 transition">
              Solutions
            </Link>
            <Link to="/contact" className="text-slate-300 hover:text-cyan-400 transition">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {/* {user ? ( */}
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-400 hover:to-teal-400 transition shadow-lg shadow-cyan-500/50"
              >
                Dashboard
              </Link>
            {/* ) : ( */}
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-cyan-400 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1  text-white rounded-lg hover:from-cyan-400 hover:to-teal-400 transition shadow-lg border-2 border-cyan-500"
                >
                  Get Started
                </Link>
              </>
            {/* )} */}
          </div>

          <button
            className="md:hidden text-slate-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-cyan-500/30">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-slate-300 hover:text-cyan-400" onClick={closeMobileMenu}>
                Home
              </Link>
              <Link to="/pricing" className="text-slate-300 hover:text-cyan-400" onClick={closeMobileMenu}>
                Pricing
              </Link>
              <Link to="/calculator" className="text-slate-300 hover:text-cyan-400" onClick={closeMobileMenu}>
                Calculator
              </Link>
              <Link to="/dedicated-servers" className="text-slate-300 hover:text-cyan-400" onClick={closeMobileMenu}>
                Dedicated Servers
              </Link>
              <Link to="/solutions" className="text-slate-300 hover:text-cyan-400" onClick={closeMobileMenu}>
                Solutions
              </Link>
              <Link to="/contact" className="text-slate-300 hover:text-cyan-400" onClick={closeMobileMenu}>
                Contact
              </Link>
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-400 hover:to-teal-400 text-center shadow-lg shadow-cyan-500/50"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-slate-300 hover:text-cyan-400" onClick={closeMobileMenu}>
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-400 hover:to-teal-400 text-center shadow-lg shadow-cyan-500/50"
                    onClick={closeMobileMenu}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
