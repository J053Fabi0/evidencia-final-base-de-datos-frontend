import http from "../http-common";
import { useEffect } from "react";
import Admin from "../types/admin.type";
import { setAdminParams } from "../utils/setAdminParams";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, createContext, useState } from "react";

type AdminOrNull = Admin | null;
type SignOutFunction = () => void;
type SignInFunction = (admin: Admin) => void;

const AdminContext = createContext<AdminOrNull>(null);
const SignInContext = createContext<SignInFunction>(() => {});
const SignOutContext = createContext<SignOutFunction>(() => {});

export const useSignIn = (): SignInFunction => useContext(SignInContext);
export const useAdmin = (): AdminOrNull => useContext(AdminContext);
export const useSignOut = (): SignOutFunction => useContext(SignOutContext);

export function AdminProvider({ children }: { children: React.ReactNode | React.ReactNode[] }) {
  const navigate = useNavigate();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const [admin, setAdmin] = useState<Admin | null>(
    queryParams.has("username") && queryParams.has("password")
      ? { username: queryParams.get("username") ?? "", password: queryParams.get("password") ?? "" }
      : null
  );

  useEffect(() => {
    // set default query params for http requests. ?password and ?username
    http.interceptors.request.use((config) => {
      config.params = config.params || {};
      config.params.username = admin ? admin.username : config.params.username;
      config.params.password = admin ? admin.password : config.params.password;
      console.log(config.params);
      return config;
    });

    if (!admin) navigate("/signin");
  }, [admin, navigate]);

  const signOut = () => {
    setAdmin(null);
    if (!admin) navigate("/signin");
  };

  const signIn: SignInFunction = (admin) => {
    setAdmin(admin);
    navigate(setAdminParams("", admin));
  };

  return (
    <SignInContext.Provider value={signIn}>
      <AdminContext.Provider value={admin}>
        <SignOutContext.Provider value={signOut}>
          {/**/}
          {children}
        </SignOutContext.Provider>
      </AdminContext.Provider>
    </SignInContext.Provider>
  );
}
