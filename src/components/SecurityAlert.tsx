interface SecurityAlertProps {
  level: "success" | "warning" | "error";
  message: string;
}

export default function SecurityAlert({ level, message }: SecurityAlertProps) {
  const colors = {
    success: "text-[var(--accent-emerald)]",
    warning: "text-[var(--accent-warning)]",
    error: "text-[var(--accent-alert)]",
  };

  return (
    <div className={`flex items-center gap-2 p-3 border-l-4 ${colors[level]} border-opacity-80`}>
      <span className="text-lg">
        {level === "success" && "🟢"}
        {level === "warning" && "🟠"}
        {level === "error" && "🔴"}
      </span>
      <span className={`text-sm ${colors[level]}`}>{message}</span>
    </div>
  );
}
