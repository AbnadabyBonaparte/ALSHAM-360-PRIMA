interface LogEntryProps {
  message: string;
  type?: "info" | "success" | "error";
}

export default function LogEntry({ message, type = "info" }: LogEntryProps) {
  const colors = {
    info: "text-blue-400",
    success: "text-emerald-400",
    error: "text-red-400",
  };

  return (
    <div className={`text-sm mb-1 ${colors[type]}`}>
      • {message}
    </div>
  );
}
