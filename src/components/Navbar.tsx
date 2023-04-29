import { useState } from "react";
import { useAdmin, useSignOut } from "../context/admin.context";
import { AccountCircle, Add, School, Logout, Menu as MenuIcon } from "@mui/icons-material";

import { Container, ListItemIcon, ListItemText } from "@mui/material";
import { Typography, Menu, MenuItem, IconButton, Toolbar, AppBar, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { setAdminParams } from "../utils/setAdminParams";

type MenuAnchor = "user" | "menu";

export default function Navbar() {
  const admin = useAdmin();
  const [anchorEl, setAnchorEl] = useState<Record<MenuAnchor, (EventTarget & HTMLButtonElement) | null>>({
    user: null,
    menu: null,
  });
  const signOut = useSignOut();

  const handleClose = (menuAnchor: MenuAnchor) => () => setAnchorEl({ ...anchorEl, [menuAnchor]: null });
  const handleMenu = (menuAnchor: MenuAnchor) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
    setAnchorEl({ ...anchorEl, [menuAnchor]: event.currentTarget });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Container>
          <Toolbar>
            <IconButton
              onClick={handleMenu("menu")}
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              noWrap
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
            >
              <Link to={setAdminParams("/", admin)} style={{ textDecoration: "none", color: "inherit" }}>
                Estudiantes
              </Link>
            </Typography>
            <IconButton size="large" color="inherit" onClick={handleMenu("user")}>
              <AccountCircle />
            </IconButton>

            <Menu
              keepMounted
              id="user-appbar"
              anchorEl={anchorEl.user}
              onClose={handleClose("user")}
              open={Boolean(anchorEl.user)}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={signOut}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText>Cerrar sesión</ListItemText>
              </MenuItem>
            </Menu>

            <Menu
              keepMounted
              id="menu-appbar"
              anchorEl={anchorEl.menu}
              onClose={handleClose("menu")}
              open={Boolean(anchorEl.menu)}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleClose("menu")}>
                <ListItemIcon>
                  <Add />
                </ListItemIcon>
                <ListItemText>Registrar estudiante</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleClose("menu")}>
                <ListItemIcon>
                  <School />
                </ListItemIcon>
                <ListItemText>Crear carrera</ListItemText>
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}
