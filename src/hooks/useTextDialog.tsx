import useDialog from "./useDialog";
import { useCallback } from "react";
import { DialogContentText } from "@mui/material";

interface Params {
  title?: string;
  content?: React.ReactNode | React.ReactNode[];
  actions?: React.ReactNode | React.ReactNode[];
  onClose?: () => void;
  okBtnText?: string;
  openDefault?: boolean;
}

export default function useTextDialog({
  title = "",
  content = "",
  actions = null,
  onClose = () => {},
  okBtnText = "Bien",
  openDefault = false,
}: Params = {}) {
  const createContentElement = (content: React.ReactNode | React.ReactNode[]) => (
    <DialogContentText>{content}</DialogContentText>
  );

  const dialog = useDialog({
    title,
    onClose,
    actions,
    okBtnText,
    openDefault,
    content: createContentElement(content),
  });
  const { Dialog } = dialog;
  const { open: stateOpen, setOpen } = dialog;
  const { title: stateTitle, setTitle } = dialog;
  const { setDialog: setOriginalDialog } = dialog;
  const { content: stateContent, setContent } = dialog;
  const { onClose: stateOnClose, setOnClose } = dialog;
  const { actions: stateActions, setActions } = dialog;
  const { okBtnText: stateOkBtnText, setOkBtnText } = dialog;

  const setDialog = useCallback(
    ({
      open = true,
      title = undefined,
      content = undefined,
      onClose = undefined,
      actions = undefined,
      okBtnText = undefined,
    } = {}) =>
      setOriginalDialog({
        open,
        title,
        actions,
        onClose,
        okBtnText,
        content: content === undefined ? undefined : createContentElement(content),
      }),
    [setOriginalDialog]
  );

  return {
    Dialog,
    setDialog,
    open: stateOpen,
    setOpen,
    title: stateTitle,
    setTitle,
    actions: stateActions,
    setActions,
    content: stateContent,
    setContent: (content: Parameters<typeof createContentElement>[0]) => setContent(createContentElement(content)),
    onClose: stateOnClose,
    setOnClose,
    okBtnText: stateOkBtnText,
    setOkBtnText,
  };
}
