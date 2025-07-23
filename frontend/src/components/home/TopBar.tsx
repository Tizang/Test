import { Box, Button, Typography, IconButton, Drawer, List, ListItem, ListItemText, Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginModal from '../../components/login/LoginModal';
import { auth } from '../../auth/firebase';
import useAuth from '../../auth/useAuth';
import { signOut } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../auth/firebase';

export default function TopBar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [registrationFinished, setRegistrationFinished] = useState<boolean>(false);

  const user = useAuth();
  const menuOpen = Boolean(anchorEl);

  // Firebase-Check für registrationFinished
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRegistrationFinished(userData.registrationFinished || false);
          }
        } catch (error) {
          console.error("Error checking registration status:", error);
        }
      }
    };

    checkRegistrationStatus();
  }, [user]);

  const handleAvatarClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/');
    }).catch((error) => {
      console.error("Logout failed:", error);
    });
    handleMenuClose();
  };

  const handleVorteileClick = () => {
    navigate('/');
    setTimeout(() => {
      const faqElement = document.getElementById('faq');
      if (faqElement) {
        faqElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleAccountClick = () => {
    if (!user) {
      setOpen(true);
    } else if (registrationFinished) {
      navigate('/profil');
    } else {
      navigate('/gutschein/step1');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: { xs: '0.5rem 1rem', md: '0' } }}>
        {/* Burger Menu Icon for Mobile */}
        <IconButton
          sx={{ display: { xs: 'block', md: 'none' } }}
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon sx={{ fontSize: '2rem', color: '#333' }} />
        </IconButton>

        {/* Links for Desktop */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: '2rem' }}>
          <Typography
            onClick={handleVorteileClick}
            sx={{
              cursor: 'pointer',
              fontSize: '1.1rem',
              color: '#333',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Vorteile
          </Typography>

          <Typography
            onClick={handleAccountClick}
            sx={{
              cursor: 'pointer',
              fontSize: '1.1rem',
              color: '#333',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            {user ? (registrationFinished ? "Mein Konto" : "Registrieren") : "Mein Konto"}
          </Typography>

          {user ? (
            <>
              <Tooltip title="Account">
                <IconButton onClick={handleAvatarClick}>
                  <Avatar sx={{ bgcolor: '#4F46E5', width: 36, height: 36 }}>
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem disabled>{user.email}</MenuItem>
                <MenuItem component={Link} to="/profil">Profil</MenuItem>
                <MenuItem onClick={handleLogout}>Abmelden</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="outlined"
              onClick={() => setOpen(true)}
              sx={{
                color: '#4F46E5',
                borderColor: '#4F46E5',
                backgroundColor: 'white',
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: 20,
                padding: '1rem 1.6rem',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                fontSize: '1rem',
                '&:hover': { backgroundColor: '#f0f0f0' },
              }}
            >
              Einloggen
            </Button>
          )}
        </Box>
      </Box>

      {/* Drawer for Mobile */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 250 }}>
          <ListItem component="li" onClick={() => { handleVorteileClick(); setDrawerOpen(false); }}>
            <ListItemText primary="Vorteile" />
          </ListItem>
          <ListItem component="li" onClick={() => { handleAccountClick(); setDrawerOpen(false); }}>
            <ListItemText primary={user ? (registrationFinished ? "Mein Konto" : "Registrieren") : "Mein Konto"} />
          </ListItem>
          {user ? (
            <ListItem component="li" onClick={() => { handleLogout(); setDrawerOpen(false); }}>
              <ListItemText primary="Abmelden" />
            </ListItem>
          ) : (
            <ListItem component="li" onClick={() => { setOpen(true); setDrawerOpen(false); }}>
              <ListItemText primary="Einloggen" />
            </ListItem>
          )}
        </List>
      </Drawer>

      <LoginModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
