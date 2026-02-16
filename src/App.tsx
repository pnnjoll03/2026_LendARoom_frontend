import { useState, useEffect} from 'react'
import "./App.css";
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
  const [page, setPage] = useState<'login' | 'register' | 'dashboard'>('login');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");

    if(storedUser){
      const pasrsedUser = JSON.parse(storedUser);
      setCurrentUser(pasrsedUser);
      setPage("dashboard")
    }
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setCurrentUser(userData);
    setPage("dashboard");
    localStorage.setItem("loggedInUser", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage("login");
    localStorage.removeItem("loggedInUser")
  };
  return(
    <div className='container'>
      {page === "login" && (
        <Login onSwitch={() => setPage("register")} onLoginSuccess={handleLoginSuccess}
        />
      )}

      {page === "register" && (
        <Register onSwitch={() => setPage("login")}/>
      )}

      {page === "dashboard" && currentUser && (
        <Dashboard user={currentUser} onLogout={handleLogout}/>
      )}
    </div>
  )
}

export default App
