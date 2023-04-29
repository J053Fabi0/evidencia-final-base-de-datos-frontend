import * as Yup from "yup";
import { useState } from "react";
import "../../css/DatePicker.css";
import http from "../../http-common";
import { LoadingButton } from "@mui/lab";
import "react-calendar/dist/Calendar.css";
import isError from "../../utils/isError";
import DatePicker from "react-date-picker";
import hasError from "../../utils/hasError";
import { useParams } from "react-router-dom";
import { Formik, Form as FormikForm } from "formik";
import useErrorDialog from "../../hooks/useErrorDialog";
import { useCareers } from "../../context/careers.context";
import { useStudents } from "../../context/students.context";
import { CenteredBox, CenteredCircularProgress, FormikSimpleTextField } from "../../components/Mixins";
import { Grid, Alert, Paper, Select, MenuItem, InputLabel, Typography, FormControl } from "@mui/material";

const minYears = 18;
const maxYears = 35;
const maxDate = new Date();
maxDate.setFullYear(maxDate.getFullYear() - minYears);
const minDate = new Date();
minDate.setFullYear(minDate.getFullYear() - maxYears);

interface Schema {
  name: string;
  career: string;
  email?: string;
  phone?: string;
  birthDate: Date;
  direction?: string;
  secondName: string;
  status: "inscrito" | "no inscrito";
}

export default function Student() {
  const { id } = useParams();
  const careers = useCareers();
  const students = useStudents();
  const student = students?.find((s) => s.id === id);
  const loading = students === null || careers === null;

  const [error, setError] = useState<string | null>(null);
  const { Dialog: ErrorDialog, showError } = useErrorDialog();

  const schema = Yup.object().shape({
    direction: Yup.string(),
    name: Yup.string().required("Requerido."),
    career: Yup.string().required("Requerido."),
    birthDate: Yup.date().required("Requerido."),
    email: Yup.string().email("Correo inválido."),
    secondName: Yup.string().required("Requerido."),
    phone: Yup.string().matches(/^\d{10}$/, "Teléfono inválido."),
    status: Yup.string().oneOf(["inscrito", "no inscrito"]).required("Requerido."),
  });

  const defaultValues: Schema = {
    name: student ? student.name : "",
    email: student ? student.email : "",
    phone: student ? student.phone : "",
    direction: student ? student.direction : "",
    secondName: student ? student.secondName : "",
    status: student ? student.status : "inscrito",
    birthDate: (student && student.birthDate) ?? new Date(),
    career: careers && student ? student.career : careers?.[0].id ?? "",
  };

  const handleOnSubmit = async (values: Schema) => {
    setError(null);
    try {
      const { status } = await http.post("/", values);
      if (status === 200) alert("Estudiante creado con éxito");
      else throw new Error("Usuario o contraseña equivocada");
    } catch (e: unknown) {
      if (isError(e) && e.message === "Request failed with status code 401")
        setError("Usuario o contraseña equivocada");
      else showError(e as Error);
      return false;
    }
    return true;
  };

  const spacerFor3 = { xs: 12, md: 4 };
  const spacerFor2 = { xs: 12, md: 6 };

  if (loading) return <CenteredCircularProgress />;
  if (!student && id) return <Typography variant="h2">Estudiante no encontrado</Typography>;
  return (
    <Paper sx={{ p: 3, mt: 3 }} elevation={3}>
      <Typography variant="h2" align="center">
        {student ? `${student.name} ${student.secondName}` : "Registrar estudiante"}
      </Typography>
      <Formik
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          if (await handleOnSubmit(values)) resetForm({ values: defaultValues });
          setSubmitting(false);
        }}
        validationSchema={schema}
        initialValues={defaultValues}
      >
        {({
          values,
          errors,
          touched,
          submitForm,
          handleBlur,
          submitCount,
          isSubmitting,
          handleSubmit,
          handleChange,
        }) => (
          <FormikForm onSubmit={handleSubmit}>
            {/* Error message */}
            {error && (
              <CenteredBox sx={{ mt: 3 }}>
                <Alert sx={{ mt: 2 }} severity="error">
                  {error}
                </Alert>
              </CenteredBox>
            )}

            <Grid container spacing={2}>
              <Grid item {...spacerFor3}>
                {/* Name */}
                <FormikSimpleTextField
                  id="name"
                  label="Nombre"
                  onBlur={handleBlur}
                  value={values.name}
                  disabled={isSubmitting}
                  onChange={handleChange}
                  errorName={errors.name}
                  hasError={hasError("name", touched, errors, submitCount)}
                />
              </Grid>

              <Grid item {...spacerFor3}>
                {/* Second name */}
                <FormikSimpleTextField
                  id="secondName"
                  label="Apellidos"
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  onChange={handleChange}
                  value={values.secondName}
                  errorName={errors.secondName}
                  hasError={hasError("secondName", touched, errors, submitCount)}
                />
              </Grid>

              {/* Birthday */}
              <Grid sx={{ mt: 3 }} item {...spacerFor3}>
                <DatePicker
                  locale="es-ES"
                  clearIcon={null}
                  format="dd/MMM/y"
                  maxDate={maxDate}
                  minDate={minDate}
                  disabled={isSubmitting}
                  value={values.birthDate}
                  onCalendarClose={() => handleBlur({ target: { id: "birthDate" } })}
                  onChange={(v) => handleChange({ target: { id: "birthDate", value: v } })}
                />
              </Grid>

              <Grid item {...spacerFor2}>
                {/* Career */}
                <FormControl fullWidth>
                  <InputLabel id="career-select">Carrera</InputLabel>
                  <Select
                    label="Carrera"
                    value={values.career}
                    disabled={isSubmitting}
                    labelId="career-select"
                    onChange={(e) => {
                      handleChange({ target: { id: "career", value: e.target.value } });
                    }}
                  >
                    {careers.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <CenteredBox sx={{ mt: 3 }}>
              <LoadingButton variant="contained" onClick={submitForm} loading={isSubmitting}>
                Guardar
              </LoadingButton>
            </CenteredBox>
          </FormikForm>
        )}
      </Formik>

      {ErrorDialog}
    </Paper>
  );
}
