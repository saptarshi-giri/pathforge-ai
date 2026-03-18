import { Link, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, Sparkles, Menu, X, LogOut } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = user
    ? [
      { label: "Home", to: "/" },
      { label: "Upload", to: "/upload" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Profile", to: "/profile" },
    ]
    : [
      { label: "Home", to: "/" },
    ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/logo.png"
            alt="PathForge AI"
            className="h-8 w-8 object-contain"
          />
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Path<span className="text-[#3B82F6]">Forge</span> AI
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={toggle} className="rounded-lg h-8 w-8 text-muted-foreground hover:text-foreground">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {user ? (
            <Button variant="outline" size="sm" className="hidden md:flex rounded-lg h-8 text-xs" onClick={handleSignOut}>
              <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out
            </Button>
          ) : (
            <Link to="/login" className="hidden md:block">
              <Button size="sm" className="rounded-lg gradient-bg text-primary-foreground h-8 text-xs font-medium shadow-sm shadow-primary/20">
                Sign In
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-lg h-8 w-8"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border"
          >
            <nav className="flex flex-col p-3 gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <Button variant="outline" size="sm" className="w-full mt-2 rounded-lg" onClick={() => { setMobileOpen(false); handleSignOut(); }}>
                  <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out
                </Button>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full mt-2 rounded-lg gradient-bg text-primary-foreground">
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
