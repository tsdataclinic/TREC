import * as React from "react";
import { NavLink } from "react-router-dom";
import Modal from "./ui/Modal";
import Button from "./ui/Button";

function HeaderLink(props: { to: string; children: React.ReactNode }) {
  const { to, children } = props;
  return (
    <NavLink to={to} className="hover:bg-slate-600 py-4 px-4">
      {children}
    </NavLink>
  );
}

function ModalLink(props: {
  children: string;
  modalContents: React.ReactNode;
}) {
  const { children, modalContents } = props;
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <Button
        unstyled
        className="hover:bg-slate-600 px-4"
        onClick={() => setIsModalOpen(true)}
      >
        {children}
      </Button>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onDismiss={() => setIsModalOpen(false)}
          title={children}
        >
          {modalContents}
        </Modal>
      )}
    </>
  );
}

function AboutModalContents() {
  return (
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
    </p>
  );
}

function MethodologyModalContents() {
  return (
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
    </p>
  );
}

function Header() {
  return (
    <header className="px-4 flex justify-between items-center top-0 z-10 bg-app-slate text-white">
      <div className="flex space-x-4 items-center">
        <img width="40px" alt="two-sigma-data-clinic-logo" src="/logo.png" />
        <h1>Census TOP</h1>
      </div>
      <div className="flex">
        <ModalLink modalContents={<MethodologyModalContents />}>
          Methodology
        </ModalLink>
        <ModalLink modalContents={<AboutModalContents />}>About</ModalLink>
        <HeaderLink to="/">Feedback</HeaderLink>
      </div>
    </header>
  );
}

export default Header;
