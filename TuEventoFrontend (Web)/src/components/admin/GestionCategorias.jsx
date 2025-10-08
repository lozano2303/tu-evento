import React from 'react';
import { Tag } from 'lucide-react';

const GestionCategorias = ({ categories }) => {
  if (categories.loadingCategorias) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-gray-400">Cargando categorías...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-8">Gestión de Categorías</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.categorias.map((categoria, index) => (
          <div key={`categoria-${categoria.categoryID}-${index}`} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{categoria.name || categoria.categoryName || 'Sin nombre'}</h3>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-300">
              <p className="mb-2">
                <span className="text-gray-400">Tipo:</span>
                <span className="ml-2">{categoria.parentID ? 'Subcategoría' : 'Categoría principal'}</span>
              </p>
              <p>
                <span className="text-gray-400">Descripción:</span>
                <span className="ml-2">{categoria.description || 'Sin descripción'}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {categories.categorias.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <div className="text-gray-400 text-lg mb-2">No hay categorías registradas</div>
          <div className="text-gray-500 text-sm">Las categorías aparecerán aquí</div>
        </div>
      )}
    </div>
  );
};

export default GestionCategorias;