import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/admin.context";
import { setAdminParams } from "../utils/setAdminParams";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";

type ButtonProps = React.ComponentProps<typeof Button> & { homePath?: string };

export const breakPoint = "lg" as const;

/**
 * This component is a button that goes back in the history if possible, or goes to homePath if not.
 * Make sure the parent component has a position relative.
 */
export default function GoBack({ sx, homePath = "/", ...props }: ButtonProps) {
  const admin = useAdmin();
  const navigate = useNavigate();

  return (
    <Button
      sx={{
        mt: { [breakPoint]: 3 },
        ml: { [breakPoint]: 3 },
        top: { [breakPoint]: 0 },
        left: { [breakPoint]: 0 },
        position: { [breakPoint]: "absolute" },
        ...sx,
      }}
      onClick={() => {
        // go back in the history if possible
        if (window.history.length > 2) window.history.back();
        // go to home if not
        else navigate(setAdminParams(homePath, admin));
      }}
      variant="outlined"
      startIcon={<KeyboardArrowLeftIcon />}
      {...props}
    >
      Regresar
    </Button>
  );
}
