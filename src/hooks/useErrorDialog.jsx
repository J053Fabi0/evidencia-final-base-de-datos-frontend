import Box from "@mui/material/Box";
import useDialog from "./useDialog";
import styled from "@emotion/styled";
import Button from "@mui/material/Button";
import stringifyAll from "../utils/stringifyError";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useMemo, useState } from "react";

const Code = styled(({ children, className }) => (
  <pre className={className}>
    <code>{children}</code>
  </pre>
))({ margin: 0 });

export default function useErrorDialog({
  okBtnText = "Ok",
  onClose = () => {},
  openDefault = false,
  title = "Hubo un error :(",
} = {}) {
  const [error, setError] = useState({});
  const [copied, setCopied] = useState(false);

  const errorString = useMemo(() => stringifyAll(error), [error]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(errorString);
    setCopied(true);
  }, [errorString]);

  const createContentElement = (content) => <Typography component={Code}>{content}</Typography>;
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
  }, [createActionsElement, error, errorString, setActions, setContent]);

  useEffect(() => {
    if (open) console.error(error);
  }, [open, error]);

  return {
    title: stateTitle,
    setTitle,
    open,
    setOpen: (open) => {
      setOpen(open);
      setCopied(false);
    },
    setError,
    showError: (error, open = true) => {
      setOpen(open);
      setError(error);
      setCopied(false);
    },
    Dialog,
  };
}
