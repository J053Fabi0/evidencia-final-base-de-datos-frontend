import Student, { StudentRaw } from "../types/student.type";
import { createContext, useContext, useEffect, useState } from "react";
import { useAdmin } from "./admin.context";
import http from "../http-common";

type StudentsOrNull = Student[] | null;

const StudentsContext = createContext<StudentsOrNull>(null);
const StudentsUpdateContext = createContext<React.Dispatch<React.SetStateAction<StudentsOrNull>>>(null as any);

export const useStudents = () => useContext(StudentsContext);
export const useStudentsUpdate = () => useContext(StudentsUpdateContext);

export function StudentsProvider({ children }: { children: React.ReactNode | React.ReactNode[] }) {
  const admin = useAdmin();
  const [students, setStudents] = useState<StudentsOrNull>(null);

  useEffect(() => {
    if (!admin) return;

    (async () => {
      // Simulate loading for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { message: studentsRaw } = (await http.get<{ message: StudentRaw[] }>("/students")).data;
      setStudents(
        studentsRaw.map((s) => ({
          ...s,
          birthDate: new Date(s.birthDate),
        }))
      );
    })();
  }, [admin]);

  return (
    <StudentsContext.Provider value={students}>
      <StudentsUpdateContext.Provider value={setStudents}>{children}</StudentsUpdateContext.Provider>
    </StudentsContext.Provider>
  );
}
