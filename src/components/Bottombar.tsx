import { useState } from "react";
import Paper from "@mui/material/Paper";
import HomeIcon from "@mui/icons-material/Home";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BottomNavigation from "@mui/material/BottomNavigation";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";

export default function BottomBar() {
  const [value, setValue] = useState("recents");

  const handleChange = (_: React.SyntheticEvent<Element, Event>, newValue: string) => setValue(newValue);

  return (
    <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0, display: { lg: "none" } }} elevation={3}>
      <BottomNavigation sx={{ width: "100%" }} value={value} onChange={handleChange}>
        <BottomNavigationAction label="Inicio" value="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Favoritos" value="favorites" icon={<FavoriteIcon />} />
        <BottomNavigationAction label="Carrito" value="AddShoppingCart" icon={<AddShoppingCartIcon />} />
        <BottomNavigationAction label="Cuenta" value="AccountCircle" icon={<AccountCircleIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
