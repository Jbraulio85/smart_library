import React from "react";
import PropTypes from "prop-types";
import logo from "../assets/img/LogoKinal2.png";

export const Logo = ({ text }) => {
  return (
    <div className="flex flex-col items-center">
      <img
        src={logo}
        alt="logo"
        className="
          w-[200px]      /* ancho en móvil */
          sm:w-[250px]   /* ancho en pantallas ≥640px */
          mt-[10px]      /* margin‑top: 10px */
          mb-[10px]     /* margin‑bottom: 10px */
        "
      />
      <span className="text-[#1e3169] font-bold text-lg sm:text-2xl">{text}</span>
    </div>
  );
};

Logo.propTypes = {
  text: PropTypes.string.isRequired,
};
