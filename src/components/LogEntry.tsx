interface LogEntryProps {
  message: string;
  type?: "info" | "success" | "error";
}

export default function LogEntry({ message, type = "info" }: LogEntryProps) {
  const colors = {
    info: "text-[var(--accent-sky)]",
    success: "text-[var(--accent-emerald)]",
    error: "text-[var(--accent-alert)]",
  };

  return (
    <div className={`text-sm mb-1 ${colors[type]}`}>
      • {message}
    </div>
  );
}
