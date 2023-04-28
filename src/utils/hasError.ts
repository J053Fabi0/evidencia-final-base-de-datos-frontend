import { FormikErrors, FormikTouched } from "formik";

function hasError<T extends Object>(
  type: keyof T,
  touched: FormikTouched<T>,
  errors: FormikErrors<T>,
  submitCount: number
) {
  return (touched[type] || submitCount >= 1) && !!errors[type];
}
export default hasError;
