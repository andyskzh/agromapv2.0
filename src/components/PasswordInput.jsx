import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Contraseña",
  className = "",
  required = false,
  label = "Contraseña",
  showLabel = true,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      {showLabel && (
        <label className="block font-semibold text-green-900 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full border border-gray-300 rounded p-2 pr-10 text-gray-800 ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? (
            <FaEyeSlash className="w-5 h-5" />
          ) : (
            <FaEye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
