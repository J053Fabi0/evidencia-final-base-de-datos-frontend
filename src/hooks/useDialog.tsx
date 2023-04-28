import CloseIcon from "@mui/icons-material/Close";
import { useCallback, useState } from "react";
import { Button, DialogTitle, DialogActions, Dialog, IconButton, DialogContent } from "@mui/material";

// dialogTitle props using it's typeof
type DialogTitleProps = Omit<Parameters<typeof DialogTitle>[0], "sx">;
type DialogProps = Parameters<typeof Dialog>[0];

const BootstrapDialogTitle = ({
  children,
  onClose,
  ...other
}: { children: React.ReactNode | React.ReactNode[]; onClose: () => void } & DialogTitleProps) => (
  <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
    {children}
    {onClose ? (
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          ...{ position: "absolute", right: 8, top: 8 },
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
    ) : null}
  </DialogTitle>
);

export const isCallback = (
  maybeFunction: true | ((...args: any[]) => void)
): maybeFunction is (...args: any[]) => void => typeof maybeFunction === "function";

export default function useDialog({
  title = "",
  content = "",
  actions = null,
  scroll = "paper",
  closeButton = true,
  onClose = () => {},
  okBtnText = "Bien",
  openDefault = false,
}: {
  title?: string;
  content?: React.ReactNode | React.ReactNode[];
  actions?: React.ReactNode | React.ReactNode[];
  scroll?: DialogProps["scroll"];
  closeButton?: boolean;
  onClose?: true | ((...args: any[]) => void);
  okBtnText?: string;
  openDefault?: boolean;
} = {}) {
  const [stateTitle, setTitle] = useState(title);
  const [stateScroll, setScroll] = useState(scroll);
  const [stateOpen, setOpen] = useState(openDefault);
  const [stateActions, setActions] = useState(actions);
  const [stateContent, setContent] = useState(content);
  const [stateOkBtnText, setOkBtnText] = useState(okBtnText);
  const [stateOnClose, setOnClose] = useState<() => typeof onClose>(() => onClose);

  const handleOnClose: () => void = () => void (setOpen(false), stateOnClose());

  const setDialog = useCallback(
    ({
      open = undefined,
      title = undefined,
      scroll = undefined,
      content = undefined,
      onClose = undefined,
      actions = undefined,
      okBtnText = undefined,
    }: {
      open?: typeof stateOpen;
      title?: typeof stateTitle;
      scroll?: typeof stateScroll;
      content?: typeof stateContent;
      onClose?: typeof stateOnClose;
      actions?: typeof stateActions;
      okBtnText?: typeof stateOkBtnText;
    } = {}) => {
      const props = [
        [open, stateOpen, setOpen] as const,
        [title, stateTitle, setTitle] as const,
        [scroll, stateScroll, setScroll] as const,
        [content, stateContent, setContent] as const,
        [actions, stateActions, setActions] as const,
        [onClose, stateOnClose, setOnClose] as const,
        [okBtnText, stateOkBtnText, setOkBtnText] as const,
      ].filter(([v, actual]) => v !== undefined && v !== actual); // filter the unchanged props out
      for (const [prop, , setter] of props) setter(prop as any); // set the new values
    },
    [stateTitle, stateOpen, stateContent, stateOnClose, stateOkBtnText, stateActions, stateScroll]
  );

  return {
    setDialog,
    handleOnClose,
    open: stateOpen,
    setOpen,
    title: stateTitle,
    setTitle,
    scroll: stateScroll,
    setScroll,
    content: stateContent,
    setContent,
    onClose: stateOnClose,
    setOnClose,
    actions: stateActions,
    setActions,
    okBtnText: stateOkBtnText,
    setOkBtnText,

    Dialog: (
      <Dialog fullWidth open={stateOpen} scroll={stateScroll} onClose={handleOnClose}>
        {stateTitle &&
          (closeButton ? (
            <BootstrapDialogTitle onClose={handleOnClose}>{stateTitle}</BootstrapDialogTitle>
          ) : (
            <DialogTitle>{title}</DialogTitle>
          ))}

        {stateContent && <DialogContent>{stateContent}</DialogContent>}

        {(stateActions || stateOkBtnText) && (
          <DialogActions>
            {stateActions}
            {stateOkBtnText && (
              <Button variant="contained" onClick={handleOnClose} autoFocus>
                {stateOkBtnText}
              </Button>
            )}
          </DialogActions>
        )}
      </Dialog>
    ),
  };
}
