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
  onDissmissText: string;
  isCentered: boolean;
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
  background: white;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  min-height: 15vh;
  max-height: 75vh;
  border-radius: 25px;
  position: fixed;
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
  onDissmissText,
  isCentered
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
        <StyledModalContent className={`w-3/4 md:w-4/12 top-1/2 left-1/2 ${isCentered ? `md:top-1/2 md:left-1/2` : `md:top-3/4 md:left-1/4`}`}>
          <div className={`p-6 space-y-4 h-full block`}>
            <StyledModalTitle className="text-xl text-slate-800">
              {title}
            </StyledModalTitle>
            <div className="overflow-y-auto max-h-[50vh]">{children}</div>
          </div>
          <div >
            <Dialog.Close asChild>
              <Button className="w-full p-4 text-white rounded-b-3xl" intent="primary">{onDissmissText}</Button>
            </Dialog.Close>
          </div>
        </StyledModalContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
