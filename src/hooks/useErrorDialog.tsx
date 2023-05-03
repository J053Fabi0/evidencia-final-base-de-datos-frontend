import Box from "@mui/material/Box";
import useDialog from "./useDialog";
import styled from "@emotion/styled";
import isError from "../utils/isError";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import stringifyError from "../utils/stringifyError";
import { useCallback, useEffect, useMemo, useState } from "react";

const Code = styled(
  ({ children, className }: { children: React.ReactNode | React.ReactNode[]; className?: string }) => (
    <pre className={className}>
      <code>{children}</code>
    </pre>
  )
)({ margin: 0 });

export default function useErrorDialog({
  okBtnText = "Ok",
  onClose = () => {},
  openDefault = false,
  title = "Hubo un error desconocido :(",
} = {}) {
  const [error, setError] = useState<Error | string | Record<string, any>>(() => new Error());
  const [copied, setCopied] = useState(false);

  const errorString = useMemo(() => (typeof error === "string" ? error : stringifyError(error)), [error]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(errorString);
    setCopied(true);
  }, [errorString]);

  const createContentElement = useCallback(
    (content: React.ReactNode) =>
      isError(error) ? <Typography component={Code}>{content}</Typography> : <Typography>{content}</Typography>,
    [error]
  );

  const createActionsElement = useCallback(
    () => (
      <>
        <Button variant="outlined" onClick={handleCopy}>
          {copied ? "Copiado" : "Copiar"}
        </Button>
        <Box sx={{ width: "100%" }} />
      </>
    ),
    [copied, handleCopy]
  );

  const { Dialog, ...dialog } = useDialog({
    title,
    onClose,
    okBtnText,
    openDefault,
    actions: createActionsElement(),
    content: createContentElement(errorString),
  });
  const { title: stateTitle, setTitle } = dialog;
  const { setContent, setActions, open, setOpen } = dialog;

  useEffect(() => {
    setContent(createContentElement(errorString));
    setActions(createActionsElement());
  }, [createActionsElement, createContentElement, error, errorString, setActions, setContent]);

  useEffect(() => {
    if (open) console.error(error);
  }, [open, error]);

  const showError = useCallback(
    (error: Parameters<typeof setError>[0], open = true) => {
      setError(error);
      setOpen(open);
      setCopied(false);
    },
    [setOpen]
  );

  const setOpenDefault = useCallback(
    (open: Parameters<typeof setOpen>[0]) => {
      setOpen(open);
      setCopied(false);
    },
    [setOpen]
  );

  return {
    open,
    error,
    Dialog,
    setTitle,
    setError,
    showError,
    errorString,
    title: stateTitle,
    setOpen: setOpenDefault,
  };
}
