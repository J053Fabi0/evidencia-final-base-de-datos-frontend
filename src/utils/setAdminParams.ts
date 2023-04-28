import Admin from "../types/admin.type";

export const setAdminParams = (path: string, admin: Admin | null) =>
  admin ? `${path.replace(/\/$/, "")}/?username=${admin.username}&password=${admin.password}` : "";
