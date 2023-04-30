import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { setAdminParams } from "../utils/setAdminParams";
import { useAdmin } from "../context/admin.context";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";

export default function GoBack() {
  const admin = useAdmin();
  const navigate = useNavigate();

  return (
    <Button
      sx={{ position: "absolute", top: 0, left: 0, mt: 2, ml: 2 }}
      onClick={() => {
        // go back in the history if possible
        if (window.history.length > 2) window.history.back();
        // go to home if not
        else navigate(setAdminParams("/", admin));
      }}
      variant="outlined"
      startIcon={<KeyboardArrowLeftIcon />}
    >
      Regresar
    </Button>
  );
}
