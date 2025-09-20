import React from "react";
import PropTypes from "prop-types";
import logo from "../assets/img/LogoMicrosoft2.png";

export const Logo = ({ text }) => {
  return (
    <div className="flex flex-col items-center">
      <img
        src={logo}
        alt="logo Microsoft"
        className="
          w-[180px]        /* ancho en móvil */
          sm:w-[250px]     /* ancho en pantallas ≥640px */
          mt-[10px]        /* margin‑top: 10px */
          mb-[10px]       /* margin‑bottom: -10px */
          h-auto
        "
      />
      <span className="text-[#737373] font-bold text-lg sm:text-2xl">
        {text}
      </span>
    </div>
  );
};

Logo.propTypes = {
  text: PropTypes.string.isRequired,
};
