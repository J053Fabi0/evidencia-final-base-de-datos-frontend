import * as Yup from "yup";

export const defaultValues = { name: "" };

export interface Schema {
  name: string;
}

export const schema = Yup.object().shape({
  // required
  name: Yup.string().min(2, "Al menos 2 caracteres.").required("Requerido."),
});
