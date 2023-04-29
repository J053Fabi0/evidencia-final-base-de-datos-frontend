import Admin from "../types/admin.type";

export const setAdminParams = (path: string, admin: Admin | null, extraParams: Record<string, string> = {}) => {
  if (!admin) return "";
  const queryParams = new URLSearchParams(extraParams);

  return `${path.replace(/\/$/, "")}/?username=${admin.username}&password=${
    admin.password
  }&${queryParams.toString()}`;

  // admin ? `${path.replace(/\/$/, "")}/?username=${admin.username}&password=${admin.password}` : "";
};
