import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDownIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

export const DegreeSelect = ({
  degrees,
  value,
  onChange,
  onBlur,
  disabled,
  showError,
}) => {
  const selected = degrees.find((d) => d._id === value);

  return (
    <div className="w-full flex flex-col">
      <Listbox
        value={value}
        onChange={(val) => {
          onChange(val, "degree");
          onBlur(val, "degree");
        }}
        disabled={disabled}
      >
        <div className="relative mt-1">
          <Listbox.Button
            onBlur={() => onBlur(value, "degree")}
            className={`
              relative w-full cursor-pointer bg-gray-100 border border-gray-300 rounded-lg 
              pl-10 pr-10 py-2 text-left 
              ${disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"}
            `}
          >
            <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <span
              className={`block truncate ${
                selected ? "text-gray-700" : "text-gray-500"
              }`}
            >
              {selected ? selected.name : "Selecciona tu grado"}
            </span>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="
                absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white 
                py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none
              "
            >
              {degrees.map((d) => (
                <Listbox.Option
                  key={d._id}
                  value={d._id}
                  className={({ active, selected }) =>
                    `relative cursor-pointer select-none py-2 pl-12 pr-4 ${
                      active ? "bg-emerald-100 text-emerald-900" : "text-gray-900"
                    } ${selected ? "font-semibold" : ""}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-semibold" : "font-normal"
                        }`}
                      >
                        {d.name}
                      </span>
                      {selected && (
                        <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-600" />
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      {showError && (
        <p className="text-red-500 text-sm mt-1 ml-1">
          Debes seleccionar un grado
        </p>
      )}
    </div>
  );
};

DegreeSelect.propTypes = {
  degrees: PropTypes.array.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  showError: PropTypes.bool,
};
