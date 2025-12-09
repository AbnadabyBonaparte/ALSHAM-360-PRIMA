import { ReactNode } from "react";

interface LayoutSupremoProps {
  title?: string;
  children: ReactNode;
}

export default function LayoutSupremo({ title, children }: LayoutSupremoProps) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {title && (
        <header className="border-b border-neutral-800 px-8 py-4">
          <h1 className="text-xl font-bold">⚜️ {title}</h1>
        </header>
      )}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
