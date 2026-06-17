import { inputClassName } from "@/lib/constants";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  id: string;
  label: string;
  name: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
};

export function FormField({
  id,
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  multiline,
  rows = 6,
  className,
}: FormFieldProps) {
  const shared = cn(inputClassName, className);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={cn(shared, "mt-2 resize-y")}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={cn(shared, "mt-2")}
        />
      )}
    </div>
  );
}
