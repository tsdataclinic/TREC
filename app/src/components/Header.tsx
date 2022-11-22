import React from 'react';


function Header() {
  return (
    <header className="
      top-0
      bg-opacity-0
      bg-transparent
      pointer-events-none
      z-10
    ">
      <div className='p-5 flex justify-between'>
        <img width="153px" alt="two-sigma-data-clinic-logo" src="https://www.twosigma.com/wp-content/themes/tsmb/assets/public/svg/logo-ts-data-clinic.png" />
        <h3 className='text-lg'>Census TOP</h3>
      </div>
    </header>
  );
}

export default Header;
