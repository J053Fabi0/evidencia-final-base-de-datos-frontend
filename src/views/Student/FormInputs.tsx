import { FormikProps } from "formik";
import DatePicker from "react-date-picker";
import hasError from "../../utils/hasError";
import { statuses } from "../../types/status.type";
import { useCareers } from "../../context/careers.context";
import { Schema, maxDate, minDate, spacerFor } from "./studentUtils";
import { CenteredHorizontalBox, FormikSimpleTextField } from "../../components/Mixins";
import { Box, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Typography } from "@mui/material";

export default function FormInputs({ a }: { a: FormikProps<Schema> }) {
  const careers = useCareers();

  if (!careers) return null;
  return (
    <>
      <Grid container spacing={2}>
        {/* Name */}
        <Grid item {...spacerFor[3]}>
          <FormikSimpleTextField
            required
            id="name"
            label="Nombre"
            onBlur={a.handleBlur}
            value={a.values.name}
            disabled={a.isSubmitting}
            onChange={a.handleChange}
            errorName={a.errors.name}
            hasError={hasError("name", a)}
          />
        </Grid>

        {/* Second name */}
        <Grid item {...spacerFor[3]}>
          <FormikSimpleTextField
            required
            id="secondName"
            label="Apellidos"
            onBlur={a.handleBlur}
            disabled={a.isSubmitting}
            onChange={a.handleChange}
            value={a.values.secondName}
            errorName={a.errors.secondName}
            hasError={hasError("secondName", a)}
          />
        </Grid>

        {/* Birthday */}
        <Grid mt={2} item {...spacerFor[3]}>
          <Box component={FormControl} fullWidth>
            <InputLabel
              shrink
              required
              disabled={a.isSubmitting}
              sx={{ backgroundColor: "white", px: 1 }}
              error={hasError("birthDate", a)}
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
              disabled={a.isSubmitting}
              value={a.values.birthDate}
              onCalendarClose={() => a.handleBlur({ target: { id: "birthDate" } })}
              onChange={(v) => a.handleChange({ target: { id: "birthDate", value: v } })}
            />
          </Box>
        </Grid>

        {/* Career */}
        <Grid item {...spacerFor[2]} mt={2}>
          <FormControl fullWidth required error={hasError("career", a)}>
            <InputLabel id="career-select">Carrera</InputLabel>
            <Select
              label="Carrera"
              value={a.values.career}
              disabled={a.isSubmitting}
              labelId="career-select"
              onBlur={() => a.handleBlur({ target: { id: "career" } })}
              error={hasError("career", a)}
              onChange={(e) => a.handleChange({ target: { id: "career", value: e.target.value } })}
            >
              {careers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{(hasError("career", a) && a.errors.career) || ""}</FormHelperText>
          </FormControl>
        </Grid>

        {/* Status */}
        <Grid item {...spacerFor[2]} mt={2}>
          <FormControl fullWidth required error={hasError("status", a)}>
            <InputLabel id="status-select">Status</InputLabel>
            <Select
              label="Estado"
              value={a.values.status}
              disabled={a.isSubmitting}
              labelId="status-select"
              onBlur={() => a.handleBlur({ target: { id: "status" } })}
              error={hasError("status", a)}
              onChange={(e) => a.handleChange({ target: { id: "status", value: e.target.value } })}
            >
              {statuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {s.slice(0, 1).toUpperCase() + s.slice(1)}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{(hasError("status", a) && a.errors.status) || ""}</FormHelperText>
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
            onBlur={a.handleBlur}
            value={a.values.email}
            disabled={a.isSubmitting}
            onChange={a.handleChange}
            errorName={a.errors.email}
            label="Correo electrónico"
            hasError={hasError("email", a)}
          />
        </Grid>

        {/* Phone */}
        <Grid item {...spacerFor[2]}>
          <FormikSimpleTextField
            id="phone"
            label="Teléfono"
            onBlur={a.handleBlur}
            value={a.values.phone}
            disabled={a.isSubmitting}
            onChange={a.handleChange}
            errorName={a.errors.phone}
            hasError={hasError("phone", a)}
          />
        </Grid>

        {/* Direction */}
        <Grid item {...spacerFor[1]}>
          <FormikSimpleTextField
            id="direction"
            label="Dirección"
            onBlur={a.handleBlur}
            value={a.values.direction}
            disabled={a.isSubmitting}
            onChange={a.handleChange}
            errorName={a.errors.direction}
            hasError={hasError("direction", a)}
          />
        </Grid>
      </Grid>
    </>
  );
}
