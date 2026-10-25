import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/60 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="font-display text-2xl font-semibold tracking-tight text-white">
          Rewind<span className="text-ember-500">.</span>
        </Link>

        {user && (
          <>
            <nav className="ml-4 hidden items-center gap-1 sm:flex">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm transition ${
                    isActive ? "bg-ink-700 text-white" : "text-slate-400 hover:text-white"
                  }`
                }
              >
                Home
              </NavLink>
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <Link to="/add" className="btn-ember !px-4 !py-2">
                + Add memory
              </Link>
              <span className="hidden text-sm text-slate-400 md:block">
                Hi, <span className="font-medium text-slate-200">{user.name.split(" ")[0]}</span>
              </span>
              <button onClick={handleLogout} className="btn-ghost !px-4 !py-2">
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
