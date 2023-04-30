import { useState } from "react";
import http from "../../http-common";
import { LoadingButton } from "@mui/lab";
import hasError from "../../utils/hasError";
import { School } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2";
import useTextDialog from "../../hooks/useTextDialog";
import { useAdmin } from "../../context/admin.context";
import useErrorDialog from "../../hooks/useErrorDialog";
import { Alert, Paper, Typography } from "@mui/material";
import { setAdminParams } from "../../utils/setAdminParams";
import { isServerError } from "../../types/serverError.type";
import { defaultValues, schema, Schema } from "./careerUtils";
import { Formik, Form as FormikForm, FormikProps } from "formik";
import { useReloadCareers } from "../../context/careers.context";
import capitalizeFirstLetter from "../../utils/capitalizeFirstLetter";
import deleteExtraSpacesInBetween from "../../utils/deleteExtraSpacesInBetween";
import { CenteredHorizontalBox, FormikSimpleTextField } from "../../components/Mixins";

export default function Career() {
  const admin = useAdmin();
  const navigate = useNavigate();
  const reloadCareers = useReloadCareers();
  const dialog = useTextDialog({ content: null });
  const [error, setError] = useState<string | null>(null);
  const { Dialog: ErrorDialog, showError } = useErrorDialog();

  function handleChangeName<T extends HTMLInputElement | HTMLTextAreaElement>(
    event: React.ChangeEvent<T>,
    handleChange: FormikProps<Schema>["handleChange"]
  ) {
    event.target.value = deleteExtraSpacesInBetween(capitalizeFirstLetter(event.target.value));
    if (/^ .*/.test(event.target.value)) event.target.value = event.target.value.trim();
    handleChange(event);
  }

  const handleOnSubmit = async (values: Schema) => {
    setError(null);
    try {
      const { data } = await http.post<{ message: string }>("/career", values);
      await reloadCareers();
      dialog.setTitle("Registrado exitosamente");
      dialog.setOpen(true);
      navigate(setAdminParams(`/career/${data.message}`, admin));
    } catch (e: unknown) {
      if (isServerError(e)) {
        const error = e.response?.data.error;
        if (e.response?.status === 401 || error === "Unauthorized") navigate("/signin");
        else if (error) setError(error.description);
        else setError("Error desconocido");
      } else showError(e as Error);
      return true;
    }
    return false;
  };

  return (
    <Paper sx={{ p: 3, mt: 3, position: "relative" }} elevation={3}>
      <Typography variant="h3" align="center" mb={{ xs: 3, lg: 3 }} mt={{ xs: 1, lg: 0 }}>
        Crear una carrera <School fontSize="large" />
      </Typography>

      <Formik
        onSubmit={async (values, { setSubmitting }) => {
          await handleOnSubmit(values);
          setSubmitting(false);
        }}
        validationSchema={schema}
        initialValues={defaultValues}
      >
        {(a) => (
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
                disabled={a.isSubmitting || !a.isValid}
              >
                Guardar
              </LoadingButton>
            </CenteredHorizontalBox>
          </FormikForm>
        )}
      </Formik>

      {dialog.Dialog}
      {ErrorDialog}
    </Paper>
  );
}
