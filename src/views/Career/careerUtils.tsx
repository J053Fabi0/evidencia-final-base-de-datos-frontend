import * as Yup from "yup";
import Career from "../../types/career.type";

export const defaultValues = (career?: Career) => ({ name: (career && career.name) ?? "" });

export interface Schema {
  name: string;
}

export const schema = Yup.object().shape({
  // required
  name: Yup.string().min(2, "Al menos 2 caracteres.").max(80, "No más de 80 caracteres.").required("Requerido."),
});
