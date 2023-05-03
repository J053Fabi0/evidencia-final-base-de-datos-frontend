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

const getAdminOrNull = (search: string): AdminOrNull => {
  const queryParams = new URLSearchParams(search);
  return queryParams.has("username") && queryParams.has("password")
    ? { username: queryParams.get("username") ?? "", password: queryParams.get("password") ?? "" }
    : null;
};

const setDefaultAuthParams = (admin: AdminOrNull) => {
  // set default query params for http requests. ?password and ?username
  http.interceptors.request.clear();
  http.interceptors.request.use((config) => {
    // if the endpoint is "/" don't add the params
    if (config.url === "/") return config;

    config.params = config.params || {};
    config.params.username = admin ? admin.username : config.params.username;
    config.params.password = admin ? admin.password : config.params.password;
    return config;
  });
};

export function AdminProvider({ children }: { children: React.ReactNode | React.ReactNode[] }) {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [admin, setAdmin] = useState<Admin | null>(() => getAdminOrNull(search));

  useEffect(() => {
    setDefaultAuthParams(admin);
    if (!admin) navigate("/signin");
  }, [admin, navigate]);

  const signOut = () => {
    setAdmin(null);
    if (!admin) navigate("/signin");
  };

  const signIn: SignInFunction = (admin) => {
    setAdmin(admin);
    navigate(setAdminParams("/", admin));
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
