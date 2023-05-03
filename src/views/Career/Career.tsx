import http from "../../http-common";
import { LoadingButton } from "@mui/lab";
import hasError from "../../utils/hasError";
import { School } from "@mui/icons-material";
import GoBack from "../../components/GoBack";
import Grid from "@mui/material/Unstable_Grid2";
import useTextDialog from "../../hooks/useTextDialog";
import { useAdmin } from "../../context/admin.context";
import { Alert, Paper, Typography } from "@mui/material";
import { useLayoutEffect, useRef, useState } from "react";
import { useShowError } from "../../context/error.context";
import { setAdminParams } from "../../utils/setAdminParams";
import { defaultValues, schema, Schema } from "./careerUtils";
import capitalizeFirstLetter from "../../utils/capitalizeFirstLetter";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCareers, useReloadCareers } from "../../context/careers.context";
import { Formik, Form as FormikForm, FormikHelpers, FormikProps } from "formik";
import deleteExtraSpacesInBetween from "../../utils/deleteExtraSpacesInBetween";
import { CenteredCircularProgress, CenteredHorizontalBox, FormikSimpleTextField } from "../../components/Mixins";

export default function Career() {
  const admin = useAdmin();
  const { id } = useParams();
  const careers = useCareers();
  const navigate = useNavigate();
  const location = useLocation();
  const showError = useShowError();
  const reloadCareers = useReloadCareers();
  const dialog = useTextDialog({ content: null });
  const career = careers?.find((c) => c.id === id);
  const creating = location.pathname.includes("new");
  const [error, setError] = useState<string | null>(null);
  const setValuesRef = useRef<FormikHelpers<Schema>["setValues"]>();

  // Set the default values every time the career changes
  useLayoutEffect(() => {
    if (setValuesRef.current) setValuesRef.current(defaultValues(career));
  }, [career]);

  function handleChangeName<T extends HTMLInputElement | HTMLTextAreaElement>(
    event: React.ChangeEvent<T>,
    handleChange: FormikProps<Schema>["handleChange"]
  ) {
    event.target.value = deleteExtraSpacesInBetween(capitalizeFirstLetter(event.target.value));
    if (/^ .*/.test(event.target.value)) event.target.value = event.target.value.trim();
    handleChange(event);
  }

  const handleOnSubmit = async (
    values: Schema,
    deleting: FormikHelpers<Schema>["setSubmitting"] | false = false
  ) => {
    setError(null);
    try {
      // Creating a new career
      if (creating) {
        const { data } = await http.post<{ message: string }>("/career", values);
        await reloadCareers();
        dialog.setTitle("Registrado exitosamente");
        dialog.setOpen(true);
        navigate(setAdminParams(`/career/${data.message}`, admin));
      }
      // Deleting an existing career
      else if (deleting) {
        await http.delete(`/career/${id}`);
        dialog.setTitle("Eliminada exitosamente");
        dialog.setOpen(true);
        dialog.setOnClose(() => () => {
          reloadCareers();
          navigate(setAdminParams("/careers", admin));
          deleting(false);
        });
      }
      // Upating an existing career
      else {
        await http.patch("/career", { ...values, id });
        await reloadCareers();
        dialog.setTitle("Guardado exitosamente");
        dialog.setOpen(true);
      }
    } catch (e: unknown) {
      showError(e as Error);
      return true;
    }
    return false;
  };

  if (!creating && !careers) return <CenteredCircularProgress />;
  if (!creating && !career) return <Typography variant="h2">Carrera no encontrada</Typography>;
  return (
    <Paper sx={{ p: 3, mt: 3, position: "relative" }} elevation={3}>
      <GoBack homePath="/careers" />

      <Typography variant="h3" align="center" mb={{ xs: 3, lg: 3 }} mt={{ xs: 1, lg: 0 }}>
        {creating ? "Crear una carrera" : career!.name} <School fontSize="large" />
      </Typography>

      <Formik
        onSubmit={async (values, { setSubmitting }) => {
          await handleOnSubmit(values);
          setSubmitting(false);
        }}
        validationSchema={schema}
        initialValues={defaultValues(career)}
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

              <Grid container spacing={{ xs: 2, lg: 3 }} mt={0}>
                {/* Name */}
                <Grid xs={12} md={8} mdOffset={2} lg={6} lgOffset={3}>
                  <FormikSimpleTextField
                    required
                    id="name"
                    onBlur={a.handleBlur}
                    value={a.values.name}
                    disabled={a.isSubmitting}
                    label="Nombre de la carrera"
                    onKeyDown={(e) => {
                      // on ctrl+enter submit
                      if (e.key === "Enter" && e.ctrlKey) a.submitForm();
                    }}
                    errorName={a.errors.name}
                    onChange={(e) => handleChangeName(e, a.handleChange)}
                    hasError={hasError("name", a)}
                  />
                </Grid>
              </Grid>

              <CenteredHorizontalBox sx={{ mt: 4 }}>
                {/* Save button */}
                <LoadingButton
                  variant="contained"
                  onClick={a.submitForm}
                  loading={a.isSubmitting}
                  disabled={(!creating && a.values.name === career!.name) || a.isSubmitting || !a.isValid}
                >
                  Guardar
                </LoadingButton>

                {/* Delete button */}
                <LoadingButton
                  sx={{
                    mb: { sm: 3 },
                    mr: { sm: 3 },
                    right: { sm: 0 },
                    bottom: { sm: 0 },
                    ml: { xs: 3, sm: 0 },
                    position: { sm: "absolute" },
                    display: career ? "block" : "none",
                  }}
                  color="error"
                  variant="outlined"
                  loading={a.isSubmitting}
                  disabled={a.isSubmitting}
                  onClick={async () => {
                    a.setSubmitting(true);
                    const error = await handleOnSubmit(a.values, a.setSubmitting);
                    if (error) a.setSubmitting(false);
                  }}
                >
                  Eliminar
                </LoadingButton>
              </CenteredHorizontalBox>
            </FormikForm>
          );
        }}
      </Formik>

      {dialog.Dialog}
    </Paper>
  );
}
