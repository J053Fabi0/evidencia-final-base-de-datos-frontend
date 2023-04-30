import "../../css/DatePicker.css";
import Box from "@mui/material/Box";
import http from "../../http-common";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import "react-calendar/dist/Calendar.css";
import Select from "@mui/material/Select";
import DatePicker from "react-date-picker";
import hasError from "../../utils/hasError";
import GoBack from "../../components/GoBack";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { statuses } from "../../types/status.type";
import { Formik, Form as FormikForm } from "formik";
import FormControl from "@mui/material/FormControl";
import useTextDialog from "../../hooks/useTextDialog";
import { useAdmin } from "../../context/admin.context";
import useErrorDialog from "../../hooks/useErrorDialog";
import { useNavigate, useParams } from "react-router-dom";
import FormHelperText from "@mui/material/FormHelperText";
import { useLayoutEffect, useRef, useState } from "react";
import { useCareers } from "../../context/careers.context";
import { setAdminParams } from "../../utils/setAdminParams";
import { isServerError } from "../../types/serverError.type";
import { useReloadStudents, useStudents } from "../../context/students.context";
import { CenteredHorizontalBox, FormikSimpleTextField, CenteredCircularProgress } from "../../components/Mixins";
import { getValuesToPatch, Schema, useDefaultValues, maxDate, minDate, schema, spacerFor } from "./studentUtils";

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

  const handleOnSubmit = async (values: Schema) => {
    setError(null);
    try {
      // editiing student
      if (student) {
        await http.patch(`/student`, { ...getValuesToPatch(values, defaultValues), id });
        await reloadStudents();
        dialog.setTitle("Guardado exitosamente");
        dialog.setOpen(true);
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

      return false;
    }

    return true;
  };

  if (loading) return <CenteredCircularProgress />;
  if (!student && id) return <Typography variant="h2">Estudiante no encontrado</Typography>;
  return (
    <Paper sx={{ p: 3, mt: 3, position: "relative" }} elevation={3}>
      <GoBack />

      <Typography variant="h2" align="center" mb={2}>
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
          isValid,
          setValues,
          submitForm,
          handleBlur,
          submitCount,
          isSubmitting,
          handleSubmit,
          handleChange,
        }) => {
          setValuesRef.current = setValues;
          return (
            <FormikForm onSubmit={handleSubmit}>
              {/* Error message */}
              {error && (
                <CenteredHorizontalBox sx={{ mt: 3 }}>
                  <Alert sx={{ mt: 2 }} severity="error">
                    {error}
                  </Alert>
                </CenteredHorizontalBox>
              )}

              <Grid container spacing={2}>
                {/* Name */}
                <Grid item {...spacerFor[3]}>
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
                <Grid item {...spacerFor[3]}>
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
                <Grid mt={2} item {...spacerFor[3]}>
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
                <Grid item {...spacerFor[2]} mt={2}>
                  <FormControl fullWidth required error={hasError("career", touched, errors, submitCount)}>
                    <InputLabel id="career-select">Carrera</InputLabel>
                    <Select
                      label="Carrera"
                      value={values.career}
                      disabled={isSubmitting}
                      labelId="career-select"
                      onBlur={() => handleBlur({ target: { id: "career" } })}
                      error={hasError("career", touched, errors, submitCount)}
                      onChange={(e) => handleChange({ target: { id: "career", value: e.target.value } })}
                    >
                      {careers.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {(hasError("career", touched, errors, submitCount) && errors.career) || ""}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                {/* Status */}
                <Grid item {...spacerFor[2]} mt={2}>
                  <FormControl fullWidth required error={hasError("status", touched, errors, submitCount)}>
                    <InputLabel id="status-select">Status</InputLabel>
                    <Select
                      label="Estado"
                      value={values.status}
                      disabled={isSubmitting}
                      labelId="status-select"
                      onBlur={() => handleBlur({ target: { id: "status" } })}
                      error={hasError("status", touched, errors, submitCount)}
                      onChange={(e) => handleChange({ target: { id: "status", value: e.target.value } })}
                    >
                      {statuses.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s.slice(0, 1).toUpperCase() + s.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {(hasError("status", touched, errors, submitCount) && errors.status) || ""}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item mt={3} {...spacerFor[1]}>
                  <CenteredHorizontalBox>
                    <Typography variant="h5">Datos opcionales</Typography>
                  </CenteredHorizontalBox>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                {/* Email */}
                <Grid item {...spacerFor[2]}>
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
                <Grid item {...spacerFor[2]}>
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
                <Grid item {...spacerFor[1]}>
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

              <CenteredHorizontalBox sx={{ mt: 3 }}>
                <LoadingButton
                  variant="contained"
                  onClick={submitForm}
                  loading={isSubmitting}
                  disabled={
                    student
                      ? Object.keys(getValuesToPatch(values, defaultValues)).length === 0
                      : isSubmitting || !isValid
                  }
                >
                  Guardar
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
