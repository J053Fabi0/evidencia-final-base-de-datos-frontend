import http from "../http-common";
import isError from "../utils/isError";
import { useAdmin } from "./admin.context";
import { useShowError } from "./error.context";
import Student, { StudentRaw } from "../types/student.type";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type StudentsOrNull = Student[] | null;

const StudentsContext = createContext<StudentsOrNull>(null);
const ReloadContext = createContext<() => Promise<void>>(() => Promise.resolve());
const StudentsUpdateContext = createContext<React.Dispatch<React.SetStateAction<StudentsOrNull>>>(null as any);

export const useStudents = () => useContext(StudentsContext);
export const useReloadStudents = () => useContext(ReloadContext);
export const useStudentsUpdate = () => useContext(StudentsUpdateContext);

export function StudentsProvider({ children }: { children: React.ReactNode | React.ReactNode[] }) {
  const admin = useAdmin();
  const showError = useShowError();
  const [students, setStudents] = useState<StudentsOrNull>(null);

  const reload = useCallback(async () => {
    if (!admin) return;

    try {
      const { message: studentsRaw } = (await http.get<{ message: StudentRaw[] }>("/students")).data;
      setStudents(
        studentsRaw.map((s) => ({
          ...s,
          birthDate: new Date(s.birthDate),
        }))
      );
    } catch (e) {
      if (isError(e)) showError(e);
    }
  }, [admin, showError]);

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
      <StudentsContext.Provider value={students}>
        <StudentsUpdateContext.Provider value={setStudents}>{children}</StudentsUpdateContext.Provider>
      </StudentsContext.Provider>
    </ReloadContext.Provider>
  );
}
