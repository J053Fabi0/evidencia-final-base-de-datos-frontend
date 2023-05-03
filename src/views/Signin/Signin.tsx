import * as Yup from "yup";
import { useMemo, useState } from "react";
import http from "../../http-common";
import { LoadingButton } from "@mui/lab";
import hasError from "../../utils/hasError";
import { Formik, Form as FormikForm } from "formik";
import { useShowError } from "../../context/error.context";
import { isServerError } from "../../types/serverError.type";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAdmin, useSignIn } from "../../context/admin.context";
import { Box, Container, InputLabel, Typography, FormControl } from "@mui/material";
import { OutlinedInput, FormHelperText, Alert, InputAdornment, IconButton } from "@mui/material";

export default function Signin() {
  const admin = useAdmin();

  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const signIn = useSignIn();
  const showError = useShowError();

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
      if (isServerError(e)) {
        const error = e.response?.data.error;
        if (e.response?.status === 401 || error === "Unauthorized") setError("Usuario o contraseña equivocada");
        else if (error) setError(error.description);
        else showError(e);
      } else showError(e as Error);
      return false;
    }

    return true;
  };

  const defaultValues = useMemo(
    () => ({
      username: (admin && admin.username) || "",
      password: (admin && admin.password) || "",
    }),
    [admin]
  );

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
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
        {(a) => (
          <FormikForm onSubmit={a.handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Box sx={{ maxWidth: "500px" }}>
                {/* Error message */}
                {error && (
                  <Alert sx={{ mt: 2 }} severity="error">
                    {error}
                  </Alert>
                )}

                {/* Username */}
                <FormControl fullWidth sx={{ mt: 3 }} variant="outlined" error={hasError("username", a)}>
                  <InputLabel htmlFor="username">Usuario</InputLabel>
                  <OutlinedInput
                    id="username"
                    type="username"
                    label="Usuario"
                    onBlur={a.handleBlur}
                    value={a.values.username}
                    disabled={a.isSubmitting}
                    onChange={a.handleChange}
                    autoFocus={!defaultValues.username}
                  />
                  <FormHelperText>{(hasError("username", a) && a.errors.username) || ""}</FormHelperText>
                </FormControl>

                {/* Contraseña */}
                <FormControl
                  fullWidth
                  id="password"
                  sx={{ mt: 3 }}
                  variant="outlined"
                  disabled={a.isSubmitting}
                  error={hasError("password", a)}
                >
                  <InputLabel htmlFor="outlined-adornment-password">Contraseña</InputLabel>
                  <OutlinedInput
                    label="Contraseña"
                    value={a.values.password}
                    id="outlined-adornment-password"
                    type={showPassword ? "text" : "password"}
                    onChange={(e) => a.handleChange({ target: { id: "password", value: e.target.value } })}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={handleClickShowPassword}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  <FormHelperText>{(hasError("password", a) && a.errors.password) || ""}</FormHelperText>
                </FormControl>

                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <LoadingButton
                    variant="contained"
                    onClick={a.submitForm}
                    loading={a.isSubmitting}
                    disabled={a.isSubmitting || !a.isValid}
                  >
                    Iniciar Sesión
                  </LoadingButton>
                </Box>
              </Box>
            </Box>
          </FormikForm>
        )}
      </Formik>
    </Container>
  );
}
