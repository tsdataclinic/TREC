import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import Button from "../Button";

type Props = {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onDismiss: () => void;
  title: string;
};

const overlayShow = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const contentShow = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }

  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const StyledOverlay = styled(Dialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.33);
  position: fixed;
  inset: 0;
  @media (prefers-reduced-motion: no-preference) {
    animation: ${overlayShow} 400ms cubic-bezier(0.16, 1, 0.3, 1);
  }
`;

const StyledModalContent = styled(Dialog.Content)`
  overflow-y:  scroll;
  background: white;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  left: 50%;
  max-height: 85vh;
  max-width: 90vw;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);

  &:focus {
    outline: none;
  }

  a {
    color: purple
  }

  ul {
    list-style: outside;
    margin: 20px;
  }

  @media (prefers-reduced-motion: no-preference) {
    animation: ${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1);
  }
`;

const StyledModalTitle = styled(Dialog.Title)`
  margin: 0;
  font-weight: 700;
`;

export default function Modal({
  children,
  isOpen,
  onDismiss,
  title,
  className,
}: Props): JSX.Element {
  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        onDismiss();
      }
    },
    [onDismiss]
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledModalContent className="p-4 space-y-4">
          <StyledModalTitle className="text-xl text-slate-800">
            {title}
          </StyledModalTitle>
          <div className={className}>{children}</div>
          <Dialog.Close asChild>
            <Button>Close</Button>
          </Dialog.Close>
        </StyledModalContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
