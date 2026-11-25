import { Link, useLocation } from 'react-router-dom';

const NavBar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/home';
  const isProdutos = location.pathname === '/produtos';

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/home" className="navbar-brand">
          <span className="brand-badge">🛒</span>
          <span>LojaTech</span>
        </Link>
        <nav className="navbar-links">
          <Link to="/home" className={`nav-link ${isHome ? 'active' : ''}`}>
            Loja (/home)
          </Link>
          <Link to="/produtos" className={`nav-link ${isProdutos ? 'active' : ''}`}>
            Produtos (CRUD)
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
