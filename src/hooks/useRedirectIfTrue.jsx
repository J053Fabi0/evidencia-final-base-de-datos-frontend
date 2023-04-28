import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/admin.context";
import { setAdminParams } from "../utils/setAdminParams";

/**
 * Redirects the user if the condition is not met.
 * @param condition {boolean} If this condition is true, it will be redirected to path.
 * @param path Defaults to "/"
 */
export default function useRedirectIfTrue(condition, path = "/") {
  const admin = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (condition) navigate(setAdminParams(path, admin));
  }, [path, condition, navigate, admin]);
}
