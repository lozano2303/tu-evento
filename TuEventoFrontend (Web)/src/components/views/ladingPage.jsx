import { Calendar, Users, Gift, Smartphone, Globe, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserById } from '../../services/Login.js';

export default function LadingPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');
    const oauthUserID = urlParams.get('userID');
    const oauthRole = urlParams.get('role');
    const isOAuth = urlParams.get('oauth');

    if (isOAuth && oauthToken && oauthUserID && oauthRole) {
      window.history.replaceState({}, document.title, window.location.pathname);

      localStorage.setItem('token', oauthToken);
      localStorage.setItem('userID', oauthUserID);
      localStorage.setItem('role', oauthRole);

      getUserById(oauthUserID).then(result => {
        if (result.success) {
          setUserData(result.data);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('userID');
          localStorage.removeItem('role');
        }
      }).catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userID');
        localStorage.removeItem('role');
      });
    } else {
      const token = localStorage.getItem('token');
      const storedUserID = localStorage.getItem('userID');
      if (token && storedUserID) {
        getUserById(storedUserID).then(result => {
          if (result.success) {
            setUserData(result.data);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('userID');
            localStorage.removeItem('role');
          }
        }).catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userID');
          localStorage.removeItem('role');
        });
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
  
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ paddingBlock: 'calc(var(--spacing) * 33)' }}>
        {/* Fondo degradado */}
        <div className="absolute inset-0 bg-purple-700"></div>

        {/* Contenido principal */}
        <div className="relative max-w-6xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Texto */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {userData ? `¡Hola, ${userData.fullName}!` : 'Visualiza el evento'}
                <span className="block text-yellow-300">{userData ? 'Bienvenido de vuelta.' : 'ideal.'}</span>
              </h1>
              <p className="text-lg text-purple-100">
                Diseña, planifica y vive experiencias únicas que marquen la diferencia. 
                Cada detalle cuenta y nuestro kit de asistencia lo hace realidad.
              </p>
              <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Comenzar ahora
              </button>
            </div>

            {/* Imagen */}
            <div className="relative">
              <div className="w-60 h-60 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 absolute -top-10 -right-10"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <img
                  src="/src/assets/images/bosquejo_1-removebg-preview.png"
                  alt="Bosquejo"
                  className="w-full h-58 rounded-xl mb-4 object-contain"
                />
                <div className="space-y-2">
                  <div className="h-4 bg-white/30 rounded w-3/4"></div>
                  <div className="h-4 bg-white/30 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Solo la curva inferior */}
      <svg
        viewBox="0 0 1200 120"
        className="absolute bottom-0 left-0 w-full h-24 fill-gray-900"  
        preserveAspectRatio="none"
      >
      <path d="M0,60 Q150,0 300,60 T600,60 Q750,120 900,60 T1200,60 L1200,120 L0,120 Z" />
    </svg>

      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-r from-blue-600 to-transparent rounded-full opacity-20 translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          {/* Primera sección */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Organiza, diseña y vive eventos
                <span className="block">sin límites.</span>
              </h2>
              <p className="text-gray-300 text-lg">
                Construye eventos memorables con nuestro creador de planos interactivos en línea. Diseña espacios personalizados, gestiona asistentes y visualiza cada detalle de tu evento en tiempo real, todo en una sola plataforma.
              </p>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl">
                <div className="rounded-xl mb-4 overflow-hidden">
                  <img
                    src="/src/assets/images/imagen1.png"
                    alt="Interfaz de planos interactivos"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Línea decorativa con check */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            <div className="mx-4 flex items-center space-x-2 bg-purple-900 px-4 py-2 rounded-full border border-purple-500">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold text-sm">Verificado</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>

          {/* Segunda sección */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 md:order-1">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl">
                <div className="rounded-xl mb-4 overflow-hidden">
                  <img
                    src="/src/assets/images/imagen2.png"
                    alt="Búsqueda de eventos"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>

            <div className="space-y-6 order-1 md:order-2">
              <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Solicitud de
                <span className="block">organizador.</span>
              </h3>
              <p className="text-gray-300 text-lg">
                Si eres organizador de eventos, solicita la creación de tu evento personalizado. Completa el formulario con toda la información necesaria y nuestro equipo se pondrá en contacto contigo.
              </p>
              <button
                onClick={() => navigate('/event-request')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Solicitud de organizador
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              ¿Por qué deberías elegirnos?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Ahorra tiempo en colas */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Ahorra tiempo en colas</h3>
              <p className="text-gray-400 text-sm">
                Dale a tus clientes un proceso de planificación de eventos, reduciendo el procesamiento con ayudantes expertos y elimina las filas.
              </p>
            </div>

            {/* Encuentra eventos fácilmente */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Encuentra eventos fácilmente</h3>
              <p className="text-gray-400 text-sm">
                Nuestro sistema te permite encontrar el asistente desde una interfaz accesible, útil que te permitirá confirmar detalles de su evento tan rápido como lo desees en complicaciones.
              </p>
            </div>

            {/* Totalmente gratuito */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Gift className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Totalmente gratuito.</h3>
              <p className="text-gray-400 text-sm">
                Acceso a las funciones básicas de nuestro plano gratis que te convierte en un agente accesible tanto para pequeños negocios como para grandes compañías.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compatibility Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Dispositivos con compatibilidad.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold">WEB</h3>
            </div>

            <div className="space-y-4">
              <div className="w-20 h-20 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold">ANDROID</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      
    </div>
  );
}