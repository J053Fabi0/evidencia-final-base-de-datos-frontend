import { useState } from "react";
import { useSignOut } from "../context/admin.context";
import { AccountCircle, Menu as MenuIcon } from "@mui/icons-material";

import { Container } from "@mui/material";
import { Typography, Menu, MenuItem, IconButton, Toolbar, AppBar, Box } from "@mui/material";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState<(EventTarget & HTMLButtonElement) | null>(null);
  const signOut = useSignOut();

  const handleClose = () => setAnchorEl(null);
  function handleMenu(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    return setAnchorEl(event.currentTarget);
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Container>
          <Toolbar>
            <IconButton size="large" edge="start" color="inherit" aria-label="open drawer" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>

            <Typography
              noWrap
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
            >
              Estudiantes
            </Typography>
            <IconButton size="large" color="inherit" onClick={handleMenu}>
              <AccountCircle />
            </IconButton>

            <Menu
              keepMounted
              id="menu-appbar"
              anchorEl={anchorEl}
              onClose={handleClose}
              open={Boolean(anchorEl)}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={signOut}>Cerrar sesión</MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}
