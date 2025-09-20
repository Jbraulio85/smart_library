import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export const Input = ({
  field,
  value,
  onChangeHandler,
  type,
  showErrorMessage,
  validationMessage,
  onBlurHandler,
  placeholder,
  Icon,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";

  const inputType = isPasswordField ? (showPassword ? "text" : "password") : type;

  const handleValueChange = useCallback(
    (e) => onChangeHandler(e.target.value, field),
    [onChangeHandler, field]
  );
  const handleInputBlur = useCallback(
    (e) => onBlurHandler(e.target.value, field),
    [onBlurHandler, field]
  );

  const baseInputClasses = `
    w-full
    text-sm sm:text-base
    bg-gray-100
    border border-gray-300
    rounded-lg
    placeholder-gray-500
    text-gray-700
    focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500
    transition
  `;

  return (
    <div className="w-full flex flex-col">
      <div className="relative w-full">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}

        <input
          id={field}
          name={field}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={handleValueChange}
          onBlur={handleInputBlur}
          className={`
            ${baseInputClasses}
            ${Icon   ? "pl-10" : "px-4"}
            ${isPasswordField ? "pr-10" : "pr-4"}
            py-2
          `}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {showErrorMessage && (
        <p className="text-red-500 text-sm mt-1 ml-1">{validationMessage}</p>
      )}
    </div>
  );
};

Input.propTypes = {
  field: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChangeHandler: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  showErrorMessage: PropTypes.bool.isRequired,
  validationMessage: PropTypes.string.isRequired,
  onBlurHandler: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  Icon: PropTypes.elementType,
  isRequired: PropTypes.bool,
};

Input.defaultProps = {
  placeholder: "",
  Icon: null
};
