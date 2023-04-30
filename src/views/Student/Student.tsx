import "../../css/DatePicker.css";
import http from "../../http-common";
import FormInputs from "./FormInputs";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import "react-calendar/dist/Calendar.css";
import GoBack from "../../components/GoBack";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import useTextDialog from "../../hooks/useTextDialog";
import { useAdmin } from "../../context/admin.context";
import useErrorDialog from "../../hooks/useErrorDialog";
import { useNavigate, useParams } from "react-router-dom";
import { useLayoutEffect, useRef, useState } from "react";
import { useCareers } from "../../context/careers.context";
import { setAdminParams } from "../../utils/setAdminParams";
import { isServerError } from "../../types/serverError.type";
import { Formik, Form as FormikForm, FormikHelpers } from "formik";
import { useReloadStudents, useStudents } from "../../context/students.context";
import { getValuesToPatch, Schema, useDefaultValues, schema } from "./studentUtils";
import { CenteredHorizontalBox, CenteredCircularProgress } from "../../components/Mixins";

export default function Student() {
  const admin = useAdmin();
  const { id } = useParams();
  const careers = useCareers();
  const navigate = useNavigate();
  const students = useStudents();
  const reloadStudents = useReloadStudents();
  const dialog = useTextDialog({ content: null });
  const student = students?.find((s) => s.id === id);
  const loading = students === null || careers === null;
  const defaultValues = useDefaultValues(student, careers);
  const { Dialog: ErrorDialog, showError } = useErrorDialog();

  const [error, setError] = useState<string | null>(null);
  const setValuesRef =
    useRef<(values: React.SetStateAction<Schema>, shouldValidate?: boolean | undefined) => void>();

  useLayoutEffect(() => {
    if (setValuesRef.current) setValuesRef.current(defaultValues);
  }, [student, defaultValues]);

  const handleOnSubmit = async (
    values: Schema,
    deleting: FormikHelpers<Schema>["setSubmitting"] | false = false
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setError(null);
    try {
      if (student) {
        // deleting student
        if (deleting) {
          await http.delete(`/student/${id}`);
          dialog.setTitle("Eliminado exitosamente");
          dialog.setOpen(true);
          dialog.setOnClose(() => () => {
            reloadStudents();
            navigate(setAdminParams("/", admin));
            deleting(false);
          });
        }
        // editiing student
        else {
          await http.patch(`/student`, { ...getValuesToPatch(values, defaultValues), id });
          await reloadStudents();
          dialog.setTitle("Guardado exitosamente");
          dialog.setOpen(true);
        }
      }
      // registering student
      else {
        const { data } = await http.post<{ message: string }>("/student", values);
        await reloadStudents();
        dialog.setTitle("Registrado exitosamente");
        dialog.setOpen(true);
        navigate(setAdminParams(`/student/${data.message}`, admin));
      }
    } catch (e: unknown) {
      if (isServerError(e)) {
        const error = e.response?.data.error;
        if (e.response?.status === 401 || error === "Unauthorized") navigate("/signin");
        else if (error) setError(error.description);
        else setError("Error desconocido");
      } else showError(e as Error);
    }
  };

  if (loading) return <CenteredCircularProgress />;
  if (!student && id) return <Typography variant="h2">Estudiante no encontrado</Typography>;
  return (
    <Paper sx={{ p: 3, mt: 3, position: "relative" }} elevation={3}>
      <GoBack sx={{ mb: 1 }} />

      <Typography variant="h3" align="center" mb={{ xs: 3, lg: 3 }} mt={{ xs: 1, lg: 0 }}>
        {student ? `${student.name} ${student.secondName}` : "Registrar estudiante"}
      </Typography>

      <Formik
        onSubmit={async (values, { setSubmitting }) => {
          await handleOnSubmit(values);
          setSubmitting(false);
        }}
        validationSchema={schema}
        initialValues={defaultValues}
      >
        {(a) => {
          setValuesRef.current = a.setValues;
          return (
            <FormikForm onSubmit={a.handleSubmit}>
              {/* Error message */}
              {error && (
                <CenteredHorizontalBox sx={{ mt: 3 }}>
                  <Alert sx={{ mt: 2 }} severity="error">
                    {error}
                  </Alert>
                </CenteredHorizontalBox>
              )}

              <FormInputs a={a} />

              <CenteredHorizontalBox sx={{ mt: 4 }}>
                <LoadingButton
                  variant="contained"
                  onClick={a.submitForm}
                  loading={a.isSubmitting}
                  disabled={
                    student
                      ? Object.keys(getValuesToPatch(a.values, defaultValues)).length === 0
                      : a.isSubmitting || !a.isValid
                  }
                >
                  Guardar
                </LoadingButton>

                <LoadingButton
                  sx={{
                    mb: { sm: 3 },
                    mr: { sm: 3 },
                    right: { sm: 0 },
                    bottom: { sm: 0 },
                    ml: { xs: 3, sm: 0 },
                    position: { sm: "absolute" },
                    display: student ? "block" : "none",
                  }}
                  color="error"
                  variant="outlined"
                  loading={a.isSubmitting}
                  disabled={a.isSubmitting}
                  onClick={() => {
                    a.setSubmitting(true);
                    handleOnSubmit(a.values, a.setSubmitting);
                  }}
                >
                  Eliminar
                </LoadingButton>
              </CenteredHorizontalBox>
            </FormikForm>
          );
        }}
      </Formik>

      {ErrorDialog}
      {dialog.Dialog}
    </Paper>
  );
}
