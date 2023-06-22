"use client";

import {
  FloatingFocusManager,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useMergeRefs,
  useRole,
} from "@floating-ui/react";
import {
  ComponentProps,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type Dispatch,
  type HTMLProps,
  type ReactNode,
  type SetStateAction,
} from "react";
import { RemoveScroll } from "react-remove-scroll";

import useIsomorphicLayoutEffect from "@/app/utils/use-isomorphic-layout-effect";

/**
 * @link https://floating-ui.com/docs/getting-started
 * @link https://github.com/theKashey/react-remove-scroll
 * @link https://github.com/streamich/react-use
 */

interface DialogOptions {
  initialOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useDialog({
  initialOpen = false,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DialogOptions = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
  const [labelId, setLabelId] = useState<string>();
  const [descriptionId, setDescriptionId] = useState<string>();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    open,
    onOpenChange: setOpen,
  });

  const context = data.context;

  const click = useClick(context, {
    enabled: controlledOpen == null,
  });
  const dismiss = useDismiss(context, { outsidePressEvent: "mousedown" });
  const role = useRole(context);

  const interactions = useInteractions([click, dismiss, role]);

  return useMemo(
    () => ({
      open,
      setOpen,
      labelId,
      descriptionId,
      setLabelId,
      setDescriptionId,
      ...data,
      ...interactions,
    }),
    [open, setOpen, interactions, data, labelId, descriptionId]
  );
}

type ContextType =
  | (ReturnType<typeof useDialog> & {
      setLabelId: Dispatch<SetStateAction<string | undefined>>;
      setDescriptionId: Dispatch<SetStateAction<string | undefined>>;
    })
  | null;

const DialogContext = createContext<ContextType>(null);

export const useDialogContext = () => {
  const context = useContext(DialogContext);

  if (context == null) {
    throw new Error("Dialog components must be wrapped in <Dialog />");
  }

  return context;
};

export function Dialog({
  children,
  ...options
}: {
  children: ReactNode;
} & DialogOptions) {
  const dialog = useDialog(options);
  return (
    <DialogContext.Provider value={dialog}>{children}</DialogContext.Provider>
  );
}

interface DialogTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

export const DialogTrigger = forwardRef<
  HTMLButtonElement,
  HTMLProps<HTMLButtonElement> & DialogTriggerProps
>(function DialogTrigger({ children, asChild = false, ...props }, propRef) {
  const context = useDialogContext();
  const childrenRef = (children as any).ref;
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);
  const dataState = context.open ? "open" : "closed";

  if (asChild && isValidElement(children)) {
    return cloneElement(
      children,
      context.getReferenceProps({
        ref,
        ...props,
        ...children.props,
        "data-state": dataState,
      })
    );
  }

  return (
    <button
      ref={ref}
      data-state={dataState}
      {...context.getReferenceProps(props)}
    >
      {children}
    </button>
  );
});

interface DialogContentProps extends HTMLProps<HTMLDivElement> {
  /** 컨테이너로 사용할 노드. 없을시 body */
  root?: ComponentProps<typeof FloatingPortal>["root"];
  backdropClassName?: string;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ backdropClassName, root, ...props }, propRef) {
    const { context: floatingContext, ...context } = useDialogContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);

    if (!floatingContext.open) return null;

    return (
      <FloatingPortal root={root}>
        <div className={backdropClassName}>
          <RemoveScroll>
            <FloatingFocusManager context={floatingContext}>
              <div
                ref={ref}
                aria-labelledby={context.labelId}
                aria-describedby={context.descriptionId}
                {...context.getFloatingProps(props)}
              >
                {props.children}
              </div>
            </FloatingFocusManager>
          </RemoveScroll>
        </div>
      </FloatingPortal>
    );
  }
);

export const DialogHeading = forwardRef<
  HTMLHeadingElement,
  HTMLProps<HTMLHeadingElement>
>(function DialogHeading(props, ref) {
  const { setLabelId } = useDialogContext();
  const id = useId();

  useIsomorphicLayoutEffect(() => {
    setLabelId(id);
    return () => setLabelId(undefined);
  }, [id, setLabelId]);

  return <h2 {...props} ref={ref} id={id} />;
});

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  HTMLProps<HTMLParagraphElement>
>(function DialogDescription(props, ref) {
  const { setDescriptionId } = useDialogContext();
  const id = useId();

  useIsomorphicLayoutEffect(() => {
    setDescriptionId(id);
    return () => setDescriptionId(undefined);
  }, [id, setDescriptionId]);

  return <p {...props} ref={ref} id={id} />;
});

export const DialogClose = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(function DialogClose(props, ref) {
  const { setOpen } = useDialogContext();
  return (
    <button type='button' {...props} ref={ref} onClick={() => setOpen(false)} />
  );
});
