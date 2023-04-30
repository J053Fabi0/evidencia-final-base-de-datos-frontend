import {
  CenteredBox,
  CenteredHorizontalBox,
  FormikSimpleTextField,
  CenteredCircularProgress,
} from "../../components/Mixins";
import * as Yup from "yup";
import "../../css/DatePicker.css";
import http from "../../http-common";
import { LoadingButton } from "@mui/lab";
import "react-calendar/dist/Calendar.css";
import DatePicker from "react-date-picker";
import hasError from "../../utils/hasError";
import { statuses } from "../../types/status.type";
import { Formik, Form as FormikForm } from "formik";
import { useAdmin } from "../../context/admin.context";
import useErrorDialog from "../../hooks/useErrorDialog";
import { useNavigate, useParams } from "react-router-dom";
import { useCareers } from "../../context/careers.context";
import { setAdminParams } from "../../utils/setAdminParams";
import { isServerError } from "../../types/serverError.type";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useReloadStudents, useStudents } from "../../context/students.context";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import {
  Box,
  Grid,
  Alert,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  FormControl,
  FormHelperText,
  Button,
} from "@mui/material";
import useTextDialog from "../../hooks/useTextDialog";

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

const getValuesToPatch = (values: Schema, defaultValues: Schema) => {
  return Object.fromEntries(
    (Object.entries(values) as [keyof Schema, string | Date][])
      // filter out values that are the same as the student's
      .filter(([key, value]) => `${value}` !== `${defaultValues[key]}`)
  ) as Partial<Schema>;
};

export default function Student() {
  const admin = useAdmin();
  const { id } = useParams();
  const careers = useCareers();
  const navigate = useNavigate();
  const students = useStudents();
  const reloadStudents = useReloadStudents();
  const student = students?.find((s) => s.id === id);
  const loading = students === null || careers === null;
  const setValuesRef =
    useRef<(values: React.SetStateAction<Schema>, shouldValidate?: boolean | undefined) => void>();

  const [error, setError] = useState<string | null>(null);
  const {
    Dialog: TextDialog,
    setOpen: setTextDialogOpen,
    setTitle: setTextDialogTitle,
  } = useTextDialog({
    title: "",
    content: null,
  });
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
    phone: Yup.string().max(20, "Máximo 20 caracteres."),
  });

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

  useLayoutEffect(() => {
    if (setValuesRef.current) setValuesRef.current(defaultValues);
  }, [student, defaultValues]);

  const handleOnSubmit = async (values: Schema) => {
    setError(null);
    try {
      // editiing student
      if (student) {
        const { status } = await http.patch(`/student`, { ...getValuesToPatch(values, defaultValues), id });
        if (status === 200) {
          await reloadStudents();
          setTextDialogTitle("Guardado exitosamente");
          setTextDialogOpen(true);
        } else if (status === 401) navigate("/signin");
      }
      // registering student
      else {
        const { status, data } = await http.post<{ message: string }>("/student", values);
        if (status === 200) {
          await reloadStudents();
          setTextDialogTitle("Registrado exitosamente");
          setTextDialogOpen(true);
          navigate(setAdminParams(`/student/${data.message}`, admin));
        } else if (status === 401) navigate("/signin");
      }
    } catch (e: unknown) {
      if (isServerError(e)) {
        const error = e.response?.data.error;
        if (error === "Unauthorized") setError("Usuario o contraseña equivocada");
        else if (error) setError(error.description);
        else setError("Error desconocido");
      } else showError(e as Error);
      return false;
    }

    return true;
  };

  const spacerFor1 = { xs: 12 };
  const spacerFor2 = { xs: 12, md: 6 };
  const spacerFor3 = { xs: 12, md: 4 };

  if (loading) return <CenteredCircularProgress />;
  if (!student && id) return <Typography variant="h2">Estudiante no encontrado</Typography>;
  return (
    <Paper sx={{ p: 3, mt: 3, position: "relative" }} elevation={3}>
      <Button
        sx={{ position: "absolute", top: 0, left: 0, mt: 2, ml: 2 }}
        onClick={() => {
          // go back in the history if possible
          if (window.history.length > 2) window.history.back();
          // go to home if not
          else navigate(setAdminParams("/", admin));
        }}
        variant="outlined"
        startIcon={<KeyboardArrowLeftIcon />}
      >
        Regresar
      </Button>

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
          setValues,
          submitForm,
          handleBlur,
          submitCount,
          isValid,
          isSubmitting,
          handleSubmit,
          handleChange,
        }) => {
          setValuesRef.current = setValues;
          return (
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
                <Grid item {...spacerFor2} mt={3}>
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
              </CenteredBox>
            </FormikForm>
          );
        }}
      </Formik>

      {ErrorDialog}
      {TextDialog}
    </Paper>
  );
}
