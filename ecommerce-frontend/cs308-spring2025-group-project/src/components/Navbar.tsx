import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Kullanıcının giriş durumunu kontrol et
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = async () => {
    try {
      // Backend API'ye logout isteği
      const response = await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Yerel depolamadan kullanıcı bilgilerini temizle
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Login durumunu güncelle
        setIsLoggedIn(false);
        
        // Kullanıcıyı ana sayfaya yönlendir
        navigate('/');
      } else {
        console.error('Çıkış yapılamadı!');
      }
    } catch (error) {
      console.error('Logout hatası:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            My E-Commerce Store
          </Link>
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        
        {isLoggedIn ? (
          // Kullanıcı giriş yaptıysa Logout butonu göster
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          // Kullanıcı giriş yapmadıysa Login ve Register butonlarını göster
          <>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;