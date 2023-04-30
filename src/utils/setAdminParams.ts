import Admin from "../types/admin.type";

export const setAdminParams = (path: string, admin: Admin | null, extraParams: Record<string, string> = {}) => {
  if (!admin) return "";
  const queryParams = new URLSearchParams(extraParams);
  const queryParamsString = queryParams.toString();

  return (
    `${path.replace(/\/$/, "")}/?username=${admin.username}&` +
    `password=${admin.password}${queryParamsString ? `&${queryParamsString}` : ""}`
  );
};
