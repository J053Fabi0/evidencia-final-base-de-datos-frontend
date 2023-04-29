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
import { statuses } from "../../types/status.type";
import { Formik, Form as FormikForm } from "formik";
import useErrorDialog from "../../hooks/useErrorDialog";
import { useCareers } from "../../context/careers.context";
import { useStudents } from "../../context/students.context";
import {
  CenteredBox,
  CenteredCircularProgress,
  CenteredHorizontalBox,
  FormikSimpleTextField,
} from "../../components/Mixins";
import { Box, Grid, Alert, Paper, Select, MenuItem, InputLabel, Typography, FormControl } from "@mui/material";

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
    // required
    name: Yup.string().required("Requerido."),
    career: Yup.string().required("Requerido."),
    secondName: Yup.string().required("Requerido."),
    birthDate: Yup.date().max(maxDate).min(minDate).required("Requerido."),
    status: Yup.string().oneOf(statuses).required("Requerido."),
    // optional
    direction: Yup.string(),
    email: Yup.string().email("Correo inválido."),
    phone: Yup.string().matches(/^\d{10}$/, "Teléfono inválido."),
  });

  const defaultValues: Schema = {
    name: student ? student.name : "",
    email: student ? student.email : "",
    phone: student ? student.phone : "",
    direction: student ? student.direction : "",
    secondName: student ? student.secondName : "",
    status: student ? student.status : "inscrito",
    birthDate: (student && student.birthDate) || maxDate,
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
  const spacerFor1 = { xs: 12 };

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
              {/* Name */}
              <Grid item {...spacerFor3}>
                <FormikSimpleTextField
                  required
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

              {/* Second name */}
              <Grid item {...spacerFor3}>
                <FormikSimpleTextField
                  required
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
                <Box component={FormControl} fullWidth>
                  <InputLabel
                    shrink
                    required
                    disabled={isSubmitting}
                    sx={{ backgroundColor: "white", px: 1 }}
                    error={hasError("birthDate", touched, errors, submitCount)}
                  >
                    Fecha de nacimiento
                  </InputLabel>
                  <DatePicker
                    required
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
                </Box>
              </Grid>

              {/* Career */}
              <Grid item {...spacerFor2} mt={3}>
                <FormControl fullWidth required>
                  <InputLabel id="career-select">Carrera</InputLabel>
                  <Select
                    label="Carrera"
                    value={values.career}
                    disabled={isSubmitting}
                    labelId="career-select"
                    onChange={(e) => handleChange({ target: { id: "career", value: e.target.value } })}
                  >
                    {careers.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Status */}
              <Grid item {...spacerFor2} mt={3}>
                <FormControl fullWidth required>
                  <InputLabel id="status-select">Status</InputLabel>
                  <Select
                    label="Estado"
                    value={values.status}
                    disabled={isSubmitting}
                    labelId="status-select"
                    onChange={(e) => handleChange({ target: { id: "status", value: e.target.value } })}
                  >
                    {statuses.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s.slice(0, 1).toUpperCase() + s.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item mt={3} {...spacerFor1}>
                <CenteredHorizontalBox>
                  <Typography variant="h5">Datos opcionales</Typography>
                </CenteredHorizontalBox>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              {/* Email */}
              <Grid item {...spacerFor2}>
                <FormikSimpleTextField
                  id="email"
                  onBlur={handleBlur}
                  value={values.email}
                  disabled={isSubmitting}
                  onChange={handleChange}
                  errorName={errors.email}
                  label="Correo electrónico"
                  hasError={hasError("email", touched, errors, submitCount)}
                />
              </Grid>

              {/* Phone */}
              <Grid item {...spacerFor2}>
                <FormikSimpleTextField
                  id="phone"
                  label="Teléfono"
                  onBlur={handleBlur}
                  value={values.phone}
                  disabled={isSubmitting}
                  onChange={handleChange}
                  errorName={errors.phone}
                  hasError={hasError("phone", touched, errors, submitCount)}
                />
              </Grid>

              {/* Direction */}
              <Grid item {...spacerFor1}>
                <FormikSimpleTextField
                  id="direction"
                  label="Dirección"
                  onBlur={handleBlur}
                  value={values.direction}
                  disabled={isSubmitting}
                  onChange={handleChange}
                  errorName={errors.direction}
                  hasError={hasError("direction", touched, errors, submitCount)}
                />
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
