import * as React from "react";
import { NavLink } from "react-router-dom";

function HeaderLink(props: { to: string; children: React.ReactNode }) {
  return (
    <NavLink to={props.to} className="hover:bg-slate-600 py-4 px-2">
      {props.children}
    </NavLink>
  );
}

function Header() {
  return (
    <header className="px-4 flex justify-between items-center top-0 z-10 bg-app-header text-white">
      <div className="flex space-x-4 items-center">
        <img width="40px" alt="two-sigma-data-clinic-logo" src="/logo.png" />
        <h1>Census TOP</h1>
      </div>
      <div className="flex space-x-4">
        <HeaderLink to="/">Methodology</HeaderLink>
        <HeaderLink to="/">About</HeaderLink>
        <HeaderLink to="/">Feedback</HeaderLink>
      </div>
    </header>
  );
}

export default Header;
