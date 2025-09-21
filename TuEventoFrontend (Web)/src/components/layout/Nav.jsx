import "../../styles/index.css";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom"; // Import Link for proper navigation

export default function Navbar() {
  return (
    <header className="bg-gray-800 p-4">
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 -translate-x-4">
          <Calendar className="w-8 h-8 text-purple-500" />
          <span className="text-xl font-bold text-white">Tu Evento</span> {/* Added text-white here for clarity */}
        </div>

        <div className="hidden md:flex space-x-6 text-white"> {/* Added text-white here for all links */}
          <Link to="" className="hover:text-purple-400 transition-colors">Inicio</Link>
          <Link to="" className="hover:text-purple-400 transition-colors">Nosotros</Link>
          <Link to="/FloorPlanDesigner" className="hover:text-purple-400 transition-colors">Crear</Link>
          <Link to="/Events" className="hover:text-purple-400 transition-colors">Eventos</Link>
        </div>

        <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors text-white">
        <Link to="/login">Iniciar sesión</Link>

        </button>
      </nav>
    </header>
  );
}