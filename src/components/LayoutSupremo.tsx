import { Outlet, NavLink } from "react-router-dom";

export default function LayoutSupremo() {
  const linkClasses = ({ isActive }: any) =>
    `px-4 py-2 rounded-lg font-medium transition ${
      isActive ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="flex justify-between items-center border-b border-neutral-800 px-8 py-4">
        <h1 className="text-xl font-bold">⚜️ ALSHAM 360° PRIMA</h1>
        <nav className="flex gap-2">
          <NavLink to="/app/home" className={linkClasses}>
            Home
          </NavLink>
          <NavLink to="/app/analytics" className={linkClasses}>
            Analytics
          </NavLink>
          <NavLink to="/app/financeiro" className={linkClasses}>
            Financeiro
          </NavLink>
        </nav>
      </header>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
