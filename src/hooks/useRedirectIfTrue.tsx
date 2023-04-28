import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/admin.context";
import { setAdminParams } from "../utils/setAdminParams";

/**
 * Redirects the user if the condition is not met.
 * @param condition If this condition is true, it will be redirected to path.
 * @param path Defaults to "/"
 */
export default function useRedirectIfTrue(condition: boolean, path = "/", preserveAdmin = true) {
  const admin = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (condition) navigate(preserveAdmin ? setAdminParams(path, admin) : path);
  }, [path, condition, navigate, admin, preserveAdmin]);
}
