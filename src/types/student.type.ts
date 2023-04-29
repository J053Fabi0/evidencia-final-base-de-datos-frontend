import Status from "./status.type";

interface Student {
  id: string;
  name: string;
  status: Status;
  career: string;
  email?: string;
  phone?: string;
  birthDate: Date;
  secondName: string;
  direction?: string;
}

export type StudentRaw = Omit<Student, "birthDate"> & { birthDate: string };

export default Student;
