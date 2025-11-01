interface SecurityAlertProps {
  level: "success" | "warning" | "error";
  message: string;
}

export default function SecurityAlert({ level, message }: SecurityAlertProps) {
  const colors = {
    success: "text-emerald-400",
    warning: "text-amber-400",
    error: "text-red-400",
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
