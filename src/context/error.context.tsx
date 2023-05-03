import { createContext, useCallback, useContext } from "react";
import useErrorDialog from "../hooks/useErrorDialog";
import { isServerError } from "../types/serverError.type";
import { useLocation, useNavigate } from "react-router-dom";

const ShowErrorContext = createContext<ReturnType<typeof useErrorDialog>["showError"]>(null as any);
// const GlobalErrorContext = createContext<Omit<ReturnType<typeof useErrorDialog>, "Dialog">>(null as any);

export const useShowError = () => useContext(ShowErrorContext);
// export const useGlobalError = () => useContext(GlobalErrorContext);

export function ErrorProvider({ children }: { children: React.ReactNode | React.ReactNode[] }) {
  const { Dialog: ErrorDialog, showError } = useErrorDialog();
  const navigate = useNavigate();
  const location = useLocation();

  const showErrorDefault = useCallback(
    (error: Parameters<typeof showError>[0], open = true) => {
      if (isServerError(error)) {
        const errorMsg = error.response?.data.error;
        if (error.response?.status === 401 || errorMsg === "Unauthorized") {
          if (!location.pathname.includes("signin")) {
            navigate("/signin");
          }
        } else showError(errorMsg as Record<string, any>, open);
      } else showError(error, open);
    },
    [location.pathname, navigate, showError]
  );

  return (
    <ShowErrorContext.Provider value={showErrorDefault}>
      {children}
      {ErrorDialog}
    </ShowErrorContext.Provider>
  );
}
