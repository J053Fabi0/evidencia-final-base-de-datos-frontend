import * as Yup from "yup";
import { useMemo } from "react";
import Student from "../../types/student.type";
import { statuses } from "../../types/status.type";
import { CareersOrNull } from "../../context/careers.context";

const minYears = 18;
const maxYears = 35;
export const maxDate = new Date();
maxDate.setFullYear(maxDate.getFullYear() - minYears);
export const minDate = new Date();
minDate.setFullYear(minDate.getFullYear() - maxYears);

export const spacerFor1 = { xs: 12 };
export const spacerFor2 = { xs: 12, md: 6 };
export const spacerFor3 = { xs: 12, md: 4 };
export const spacerFor = {
  1: spacerFor1,
  2: spacerFor2,
  3: spacerFor3,
};

export interface Schema {
  name: string;
  career: string;
  email?: string;
  phone?: string;
  birthDate: Date;
  direction?: string;
  secondName: string;
  status: "inscrito" | "no inscrito";
}

export const getValuesToPatch = (values: Schema, defaultValues: Schema) => {
  return Object.fromEntries(
    (Object.entries(values) as [keyof Schema, string | Date][])
      // filter out values that are the same as the student's
      .filter(([key, value]) => `${value}` !== `${defaultValues[key]}`)
      // trim all strings
      .map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
  ) as Partial<Schema>;
};

export function useDefaultValues(student: Student | undefined, careers: CareersOrNull) {
  const defaultValues: Schema = useMemo(
    () => ({
      name: (student && student.name) ?? "",
      email: (student && student.email) ?? "",
      phone: (student && student.phone) ?? "",
      direction: (student && student.direction) ?? "",
      secondName: (student && student.secondName) ?? "",
      birthDate: (student && student.birthDate) ?? maxDate,
      career: (careers && student && student.career) ?? "",
      status: (student && student.status) ?? ("" as "inscrito"),
    }),
    [student, careers]
  );

  return defaultValues;
}

export const schema = Yup.object().shape({
  // required
  name: Yup.string().min(2, "Al menos 2 caracteres.").max(40, "No más de 40 caracteres.").required("Requerido."),
  career: Yup.string().required("Requerido."),
  secondName: Yup.string()
    .min(2, "Al menos 2 caracteres.")
    .max(80, "No más de 80 caracteres.")
    .required("Requerido."),
  status: Yup.string().oneOf(statuses).required("Requerido."),
  birthDate: Yup.date().max(maxDate).min(minDate).required("Requerido."),
  // optional
  direction: Yup.string().max(200, "No más de 200 caracteres."),
  email: Yup.string().email("Correo inválido."),
  phone: Yup.string().max(20, "Máximo 20 caracteres."),
});
