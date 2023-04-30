import Career from "../types/career.type";
import { createContext, useContext, useEffect, useState } from "react";
import { useAdmin } from "./admin.context";
import http from "../http-common";

export type CareersOrNull = Career[] | null;

const CareersContext = createContext<CareersOrNull>(null);
const CareersUpdateContext = createContext<React.Dispatch<React.SetStateAction<CareersOrNull>>>(null as any);

export const useCareers = () => useContext(CareersContext);
export const useCareersUpdate = () => useContext(CareersUpdateContext);

export function CareersProvider({ children }: { children: React.ReactNode | React.ReactNode[] }) {
  const admin = useAdmin();
  const [careers, setCareers] = useState<CareersOrNull>(null);

  useEffect(() => {
    if (!admin) return;

    (async () => {
      // Simulate loading for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCareers((await http.get<{ message: Career[] }>("/careers")).data.message);
    })();
  }, [admin]);

  return (
    <CareersContext.Provider value={careers}>
      <CareersUpdateContext.Provider value={setCareers}>{children}</CareersUpdateContext.Provider>
    </CareersContext.Provider>
  );
}
