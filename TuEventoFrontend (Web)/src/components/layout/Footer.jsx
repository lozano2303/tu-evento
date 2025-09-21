import "../../styles/index.css";

import { Calendar } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-700 py-8">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Calendar className="w-6 h-6 text-purple-500" />
          <span className="text-lg font-semibold text-white">Tu Evento</span>
        </div>
        <p className="text-gray-400 text-sm">
          © 2024 Tu Evento. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
