import http from "../http-common";
import Career from "../types/career.type";
import { useAdmin } from "./admin.context";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type CareersOrNull = Career[] | null;

const CareersContext = createContext<CareersOrNull>(null);
const ReloadContext = createContext<() => Promise<void>>(() => Promise.resolve());
const CareersUpdateContext = createContext<React.Dispatch<React.SetStateAction<CareersOrNull>>>(null as any);

export const useCareers = () => useContext(CareersContext);
export const useReloadCareers = () => useContext(ReloadContext);
export const useCareersUpdate = () => useContext(CareersUpdateContext);

export function CareersProvider({ children }: { children: React.ReactNode | React.ReactNode[] }) {
  const admin = useAdmin();
  const [careers, setCareers] = useState<CareersOrNull>(null);

  const reload = useCallback(async () => {
    if (!admin) return;

    setCareers((await http.get<{ message: Career[] }>("/careers")).data.message);
  }, [admin]);

  useEffect(() => {
    if (!admin) return;

    (async () => {
      // Simulate loading for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await reload();
    })();
  }, [admin, reload]);

  return (
    <ReloadContext.Provider value={reload}>
      <CareersContext.Provider value={careers}>
        <CareersUpdateContext.Provider value={setCareers}>{children}</CareersUpdateContext.Provider>
      </CareersContext.Provider>
    </ReloadContext.Provider>
  );
}
