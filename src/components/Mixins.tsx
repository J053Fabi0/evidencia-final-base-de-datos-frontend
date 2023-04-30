import styled from "@emotion/styled";
import { Box, CircularProgress, TextField } from "@mui/material";

export const CenteredCircularProgress = styled(CircularProgress)`
  top: 50%;
  left: 50%;
  position: absolute;
  transform: translate(-50%, -50%);
`;

export const CenteredHorizontalBox = styled(Box)`
  display: flex;
  justify-content: center;
`;

type TextFieldProps = React.ComponentProps<typeof TextField>;

export function FormikSimpleTextField({
  hasError,
  errorName,
  ...other
}: { hasError: boolean; errorName?: string } & TextFieldProps) {
  return (
    <TextField
      fullWidth
      sx={{ mt: 2 }}
      error={hasError}
      variant="outlined"
      helperText={hasError ? errorName : ""}
      {...other}
    />
  );
}
