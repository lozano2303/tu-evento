import React, { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import DrawingCanvas from '../DrawingCanvas.jsx';

const ReservaEvento = () => {
  const [rating, setRating] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);

  // Empty elements for the event map
  const sampleElements = [];

  const handleStarClick = (starNumber) => {
    setRating(starNumber);
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#1a1a1a' }}>
      
      {/* Hero Section con las imágenes del tour */}
      <section className="relative">
        <div className="px-4 py-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Título principal */}
            <h1 className="text-white text-3xl font-bold mb-8 text-center">
              Las Mujeres Ya No Lloran World Tour
            </h1>

            {/* Grid de imágenes */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop" 
                  alt="Shakira 1" 
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop" 
                  alt="Concierto" 
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop" 
                  alt="Shakira 2" 
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop" 
                  alt="Shakira 3" 
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <div className="px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Grid principal: Información del evento + Horarios */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            
            {/* Información del evento */}
            <div 
              className="p-6 rounded-lg"
              style={{ backgroundColor: '#8b5cf6' }}
            >
              <h2 className="text-white text-xl font-bold mb-4">
                ¡Prepárate para una noche inolvidable con Shakira!
              </h2>
              <p className="text-white text-sm leading-relaxed mb-4">
                La sensación mundial Shakira regresa a los escenarios con su esperado "Las Mujeres Ya No Lloran World Tour". Una experiencia única que combina sus éxitos más grandes con nuevas canciones de su último álbum. 
              </p>
              <p className="text-white text-sm leading-relaxed mb-4">
                Con su inconfundible voz, sus movimientos hipnóticos y su energía contagiosa, Shakira promete una noche llena de emociones, baile y música que quedará grabada para siempre en tu memoria.
              </p>
              <p className="text-white text-sm leading-relaxed mb-6">
                Desde "Hips Don't Lie" hasta "Monotonía", pasando por "Waka Waka" y "Whenever, Wherever", revive los momentos más icónicos de una de las artistas más importantes de la música latina y mundial. Una celebración de la música y la cultura que no te puedes perder.
              </p>
              <button className="bg-purple-800 hover:bg-purple-900 text-white px-6 py-2 rounded-lg transition-colors">
                Ver más
              </button>
            </div>

            {/* Horarios disponibles */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Horarios</h3>
              <div className="space-y-3">
                
                <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white">30,000</span>
                  </div>
                  <span className="text-white">2:00 PM</span>
                </div>

                <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white">30,000</span>
                  </div>
                  <span className="text-white">5:00 PM</span>
                </div>

                <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white">30,000</span>
                  </div>
                  <span className="text-white">6:00 PM</span>
                </div>

                <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white">30,000</span>
                  </div>
                  <span className="text-white">7:00 PM</span>
                </div>
 
                {/* Botón para ver mapa del evento */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowMapModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Ver mapa de evento
                  </button>
                </div>
 
            </div>
            </div>

          </div>

          {/* Sección de comentarios */}
          <div className="mb-12">
            
            {/* Formulario para escribir comentario */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">U</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm mb-2">Título del mensaje:</p>
                  <p className="text-white text-sm mb-3">Puntuación:</p>
                  
                  {/* Sistema de estrellas */}
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 cursor-pointer transition-colors ${
                          star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                        }`}
                        onClick={() => handleStarClick(star)}
                      />
                    ))}
                  </div>
                  
                  <p className="text-white text-sm mb-3">Escribe tu mensaje:</p>
                  
                  {/* Área de texto */}
                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none"
                    rows="4"
                    placeholder="Escribe tu comentario aquí..."
                  />
                  
                  {/* Botón de enviar */}
                  <div className="flex justify-center mt-4">
                    <button 
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      Enviar
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comentarios existentes */}
            <div className="space-y-6">
              
              {/* Comentario 1 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">A</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">Anónimo</p>
                  <p className="text-white text-sm mb-2 leading-relaxed">
                    Bien y sin la mesa de los licores hubiese sido excelente
                  </p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Muy buena organización del evento, solo en el tema de licores me habré un embargo, parece que nadie se 
                    dio cuenta en la revisión, ya que las mesas tenían botellas vacías por todas partes algo extraño, La 
                    mesa de los licores especial que busqué parte de las personas que estábamos sentados en la parte 
                    de abajo no podían llamar a la atención que vendan los aperitivos. De los demás me encantó todo
                  </p>
                </div>
              </div>

              {/* Comentario 2 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">A</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">Anónimo</p>
                  <p className="text-white text-sm mb-2 leading-relaxed">
                    PÉSIMA DISTRIBUCIÓN ESCENARIO.
                  </p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Totalmente hacia el momento, no hay entretenimiento en cuanto a escenario, pague primera fila como 
                    se puede ver en foto de mi entrada, pero al llegar el artista a escenario estaba de espalda completamente 
                    hasta finalizar show. Los boletos estaban por el valor que la función debía de cumplir expectativas 
                    para con esa cantidad. Una frustración. En definitiva no voy más, el show fue muy bueno pero esta 
                    idea de colocar a las personas en la cara del artista pero metía ultra, cuando el momento era en la mesa del 
                    centro total desaprovechamiento.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Footer de la página */}
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">DESCUBRIR MAS</p>
            <p className="text-gray-500 text-xs mt-2">Tu Evento</p>
          </div>

        </div>
      </div>

      {/* Modal para el mapa del evento */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Mapa del Evento</h2>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="p-6 flex justify-center items-center min-h-[600px]">
              <DrawingCanvas
                elements={sampleElements}
                selectedElementId={null}
                onSelect={() => {}}
                onCreate={() => {}}
                onUpdate={() => {}}
                onDelete={() => {}}
                activeTool="select"
                setActiveTool={() => {}}
                units="cm"
                showMeasurements={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservaEvento;