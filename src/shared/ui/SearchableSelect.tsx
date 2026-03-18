import Select, { type SingleValue, type StylesConfig } from "react-select";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
}

const customStyles: StylesConfig<SearchableSelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: "42px",
    borderRadius: "0.5rem",
    borderColor: state.isFocused ? "#10b981" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #10b981" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#10b981" : "#9ca3af",
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.5rem",
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: "240px",
    padding: "4px",
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: "0.375rem",
    backgroundColor: state.isFocused ? "#ecfdf5" : "transparent",
    color: state.isFocused ? "#047857" : "#374151",
    cursor: "pointer",
  }),
  input: (base) => ({
    ...base,
    color: "#111827",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#6b7280",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#111827",
  }),
};

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Buscar o seleccionar...",
  disabled = false,
  allowClear = true,
  className = "",
}: SearchableSelectProps) {
  const selectedOption = options.find((o) => o.value === value) ?? null;

  const handleChange = (opt: SingleValue<SearchableSelectOption>) => {
    onChange(opt?.value ?? "");
  };

  return (
    <div className={className}>
      <Select<SearchableSelectOption, false>
        value={selectedOption}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        isDisabled={disabled}
        isClearable={allowClear}
        isSearchable
        noOptionsMessage={({ inputValue }) =>
          inputValue ? `Sin resultados para "${inputValue}"` : "Sin opciones"
        }
        styles={customStyles}
        classNamePrefix="searchable-select"
      />
    </div>
  );
}
