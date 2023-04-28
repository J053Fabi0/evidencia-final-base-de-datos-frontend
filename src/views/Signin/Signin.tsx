import * as Yup from "yup";
import { useState } from "react";
import http from "../../http-common";
import { LoadingButton } from "@mui/lab";
import isError from "../../utils/isError";
import hasError from "../../utils/hasError";
import { useLocation } from "react-router-dom";
import { Formik, Form as FormikForm } from "formik";
import useErrorDialog from "../../hooks/useErrorDialog";
import useRedirectIfTrue from "../../hooks/useRedirectIfTrue";
import { useAdmin, useSignIn } from "../../context/admin.context";
import { OutlinedInput, FormHelperText, Alert } from "@mui/material";
import { Box, TextField, Container, InputLabel, Typography, FormControl } from "@mui/material";

export default function Signin() {
  const admin = useAdmin();
  useRedirectIfTrue(admin !== null, "/");

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);

  const [error, setError] = useState<string | null>(null);

  const signIn = useSignIn();
  const { Dialog: ErrorDialog, showError } = useErrorDialog();

  const schema = Yup.object().shape({
    username: Yup.string().required("Requerido."),
    password: Yup.string().required("Requerido."),
  });

  const handleOnSubmit = async ({ username, password }: { username: string; password: string }) => {
    setError(null);
    try {
      const { status } = await http.get("/", { params: { username, password } });
      if (status === 200) signIn({ password, username });
      else throw new Error("Usuario o contraseña equivocada");
    } catch (e: unknown) {
      if (isError(e) && e.message === "Request failed with status code 401")
        setError("Usuario o contraseña equivocada");
      else showError(e as Error);
      return false;
    }

    return true;
  };

  const defaultValues = {
    username: queryParams.get("username") ?? "",
    password: queryParams.get("password") ?? "",
  };

  return admin ? null : (
    <Container sx={{ mt: 3, mb: 5 }}>
      {/* Logotipo y título */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box sx={{ width: "100%" }}>
          <Typography variant="h1" align="center">
            Estudiantes
          </Typography>
        </Box>

        <Typography variant="h4" align="center" mt={3}>
          Iniciar sesión
        </Typography>
      </Box>

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
          submitCount,
          isSubmitting,
          handleBlur,
          handleSubmit,
          handleChange,
        }) => (
          <FormikForm onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Box sx={{ maxWidth: "500px" }}>
                {/* Error message */}
                {error && (
                  <Alert sx={{ mt: 2 }} severity="error">
                    {error}
                  </Alert>
                )}

                {/* Username */}
                <FormControl
                  fullWidth
                  sx={{ mt: 3 }}
                  variant="outlined"
                  error={hasError("username", touched, errors, submitCount)}
                >
                  <InputLabel htmlFor="username">Usuario</InputLabel>
                  <OutlinedInput
                    id="username"
                    type="username"
                    label="Usuario"
                    onBlur={handleBlur}
                    value={values.username}
                    disabled={isSubmitting}
                    onChange={handleChange}
                    autoFocus={!defaultValues.username}
                  />
                  <FormHelperText>
                    {(hasError("username", touched, errors, submitCount) && errors.username) || ""}
                  </FormHelperText>
                </FormControl>

                {/* Contraseña */}
                <TextField
                  fullWidth
                  id="password"
                  sx={{ mt: 3 }}
                  type="password"
                  label="Contraseña"
                  variant="outlined"
                  onBlur={handleBlur}
                  value={values.password}
                  disabled={isSubmitting}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitForm();
                  }}
                  onChange={handleChange}
                  error={hasError("password", touched, errors, submitCount)}
                  helperText={hasError("password", touched, errors, submitCount) ? errors.password : ""}
                />

                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <LoadingButton variant="contained" onClick={submitForm} loading={isSubmitting}>
                    Iniciar Sesión
                  </LoadingButton>
                </Box>
              </Box>
            </Box>
          </FormikForm>
        )}
      </Formik>

      {ErrorDialog}
    </Container>
  );
}
