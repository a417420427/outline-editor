import "./index.scss";

type InputProps = {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
};

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled,
}) => {
  return (
    <div className="input-wrapper">
      {label && <label>{label}</label>}
      <input
        className={`input-field ${error ? "error" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default Input;
