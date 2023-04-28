import Admin from "../types/admin.type";

/**
 * @param path Without the slash at the end
 */
export const setAdminParams = (path: string, admin: Admin | null) =>
  admin ? `${path}/?username=${admin.username}&password=${admin.password}` : "";
