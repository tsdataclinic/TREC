import * as React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';

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
        className="hover:bg-slate-600 m-4"
        onClick={() => setIsModalOpen(true)}
      >
        {children}
      </Button>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onDismiss={() => setIsModalOpen(false)}
          title={children}
          onDissmissText='Close'
          isCentered={true}
        >
          {modalContents}
        </Modal>
      )}
    </>
  );
}

function ButtonLink(props: {
   children: string;
   url: string;
}) {
   const { children, url } = props;

   return (
      <Button
          unstyled
          className="hover:bg-slate-600 m-4"
          onClick={(e) => {
	    e.preventDefault();
	    window.location.href=url;
	   }}>
         {children}
      </Button>
   )
}

function LegalContents() {
  return (
    <>
      <p className="mb-2">
        TREC is hosted by Two Sigma Investments, LP, and is subject to Two
        Sigma's{' '}
        <a
          href="https://www.twosigma.com/legal-disclosure/"
          target="_blank"
          rel="noreferrer"
        >
          Legal Disclosure
        </a>{' '}
        and{' '}
        <a
          href="https://www.twosigma.com/legal-disclosure/privacy-policy/"
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </a>
        , with the following amendments:
      </p>
      <p className="mb-2">
        The limited nonexclusive license for this website is for noncommercial
        purposes, and is provided for informational purposes.
      </p>
      <p className="mb-2">
        Note that the dashboard relies upon publicly available data from
        multiple sources that do not always agree. As set forth in the above
        referenced Legal Disclosure, Two Sigma disclaims any and all
        representations and warranties with respect to the website, including
        accuracy, fitness for use, reliability, and non-infringement.
      </p>
      <p className="mb-2">
        This tool is shared pursuant to the{' '}
        <a
          href="https://www.apache.org/licenses/LICENSE-2.0.html"
          target="_blank"
          rel="noreferrer"
        >
          Apache 2.0 License
        </a>
        . Licenses for the data contained herein can be found in the{' '}
        <a
          href="https://github.com/tsdataclinic/trec"
          target="_blank"
          rel="noreferrer"
        >
          TREC Github repo
        </a>
      </p>
    </>
  );
}

function Header(props: { isMobile: boolean; }) {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = React.useState(false);
  function handleToggleMenu() {
    setIsDropdownMenuOpen(!isDropdownMenuOpen);
  }

  React.useEffect(() => {
    if (!props.isMobile) {
      setIsDropdownMenuOpen(false)
    }
  }, [props.isMobile])
  return (
    <header className="h-16 px-4 flex justify-between items-center top-0 z-10 bg-app-slate text-white">
      {
        isDropdownMenuOpen ?
        <div>
          <ButtonLink url="/about">About</ButtonLink>
          <ButtonLink url="/methods">Methods</ButtonLink>
          <ModalLink modalContents={<LegalContents />}>Legal</ModalLink>
        </div>
        :
        <div className="flex space-x-4 items-center">
          <button onClick={() => window.location.href = "/"} className="flex">
            <img width="240px" alt="two-sigma-data-clinic-logo" src="/dataclinic.svg" />
          </button>
        </div>
      }
      <div className="flex">
        <div className='hidden sm:block'>
          <ButtonLink url="/about">About</ButtonLink>
          <ButtonLink url="/methods">Methods</ButtonLink>
          <ModalLink modalContents={<LegalContents />}>Legal</ModalLink>
        </div>
        <div className='block sm:hidden'>
          <button onClick={handleToggleMenu}>
            {isDropdownMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
