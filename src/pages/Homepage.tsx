import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  Users,
  Building,
  Truck,
  FileText,
  Shield,
  X
  
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  category: string;
}

const Homepage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentInfoSlide, setCurrentInfoSlide] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Carrusel principal
  const heroSlides = [
    {
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      title: 'Bienvenidos a la municipalidad de Santa Cruz',
      subtitle: 'Trabajando juntos por el desarrollo de nuestra comunidad'
    },
    {
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      title: 'Servicios de calidad para nuestros ciudadanos',
      subtitle: 'Comprometidos con la excelencia en cada servicio que brindamos'
    },
    {
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      title: 'Infraestructura vial de primera',
      subtitle: 'Manteniendo y mejorando nuestras carreteras para el progreso'
    }
  ];

  // Servicios municipales
  const services = [
    {
      icon: FileText,
      title: 'Trámites Municipales',
      description: 'Permisos de construcción, patentes comerciales y documentación oficial'
    },
    {
      icon: Truck,
      title: 'Gestión Vial',
      description: 'Mantenimiento y mejora de carreteras y caminos rurales'
    },
    {
      icon: Building,
      title: 'Desarrollo Urbano',
      description: 'Planificación y desarrollo de proyectos urbanos sostenibles'
    },
    {
      icon: Shield,
      title: 'Seguridad Ciudadana',
      description: 'Programas de seguridad y prevención para la comunidad'
    },
    {
      icon: Heart,
      title: 'Servicios Sociales',
      description: 'Programas de apoyo social y desarrollo comunitario'
    },
    {
      icon: Users,
      title: 'Participación Ciudadana',
      description: 'Espacios de diálogo y participación para todos los ciudadanos'
    }
  ];

  // Información institucional (Misión, Visión, Historia)
  const institutionalInfo = [
    {
      title: 'MISIÓN',
      content: '"Somos una Municipalidad comprometida con el uso racional, transparente y eficaz de los recursos municipales, con el progreso continuo de los servicios, preocupada por la mejora de la calidad de vida de las y los santacruceños, orientada por un enfoque estratégico del desarrollo humano local, en armonía con el medio ambiente que permita la participación ciudadana en la atención de los asuntos locales” '
    },
    {
      title: 'VISIÓN',
      content: '“Ser una corporación municipal líder en el desarrollo cantonal, orientada al mejoramiento continuo de los servicios que presta a sus contribuyentes, así como un Gobierno Local responsable de la promoción del desarrollo humano local sostenible con directrices y políticas claras, perspectiva de género, protección de los recursos naturales y manifestaciones histórico culturales” '
    },
    {
      title: 'RESEÑA HISTÓRICA',
      content: 'La Municipalidad de Santa Cruz, en Guanacaste, Costa Rica, es una entidad autónoma encargada de administrar el cantón, brindar servicios públicos y promover el desarrollo integral. Ha liderado proyectos en infraestructura vial, planificación urbana y gestión ambiental. El Departamento de Inspecciones juega un rol clave al supervisar construcciones y asegurar el cumplimiento de normativas.'
    }
  ];

  // Artículos/noticias
  const articles: Article[] = [
    {
      id: '1',
      title: 'Inauguración del Nuevo Centro de Salud',
      excerpt: 'Se inauguró el moderno centro de salud que beneficiará a más de 5,000 habitantes de la región...',
      content: 'El pasado viernes se llevó a cabo la inauguración del nuevo Centro de Salud de Santa Cruz, una obra que representa una inversión de más de 800 millones de colones y que beneficiará directamente a más de 5,000 habitantes de la región. El centro cuenta con consultorios especializados, sala de emergencias, laboratorio clínico y farmacia. La alcaldía trabajó de la mano con el Ministerio de Salud para hacer realidad este proyecto que mejorará significativamente la atención médica en nuestra comunidad. El centro operará las 24 horas del día y contará con personal médico altamente calificado.',
      date: '15 de enero, 2024',
      image: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'SALUD'
    },
    {
      id: '2',
      title: 'Mejoras en la Red Vial Rural',
      excerpt: 'Iniciamos el proyecto de mejoramiento de 25 kilómetros de caminos rurales que conectan las comunidades...',
      content: 'La Municipalidad de Santa Cruz ha iniciado un ambicioso proyecto de mejoramiento de la red vial rural que contempla la reparación y asfaltado de 25 kilómetros de caminos que conectan las principales comunidades del cantón. Este proyecto, con una inversión de 1,200 millones de colones, beneficiará a más de 3,000 familias que dependen de estos caminos para transportar sus productos agrícolas y acceder a servicios básicos. Los trabajos incluyen la construcción de alcantarillas, mejoramiento del drenaje y la aplicación de carpeta asfáltica en los tramos más transitados.',
      date: '8 de enero, 2024',
      image: 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'INFRAESTRUCTURA'
    },
    {
      id: '3',
      title: 'Festival Cultural Santa Cruz 2024',
      excerpt: 'Se aproxima nuestro tradicional festival cultural con actividades para toda la familia...',
      content: 'Del 15 al 18 de febrero se realizará el Festival Cultural Santa Cruz 2024, una celebración que rescata nuestras tradiciones guanacastecas y promueve el talento local. El evento contará con presentaciones de grupos folclóricos, exposiciones de artesanías, competencias de comida típica y actividades recreativas para niños y adultos. Se espera la participación de más de 50 artistas locales y la visita de miles de turistas nacionales e internacionales. El festival se realizará en el Parque Central y la entrada será completamente gratuita para toda la familia.',
      date: '3 de enero, 2024',
      image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'CULTURA'
    }
  ];

  // Efectos para carruseles automáticos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInfoSlide((prev) => (prev + 1) % institutionalInfo.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [institutionalInfo.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextInfoSlide = () => {
    setCurrentInfoSlide((prev) => (prev + 1) % institutionalInfo.length);
  };

  const prevInfoSlide = () => {
    setCurrentInfoSlide((prev) => (prev - 1 + institutionalInfo.length) % institutionalInfo.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Municipalidad de Santa Cruz</h1>
                <p className="text-xs text-gray-600">Guanacaste, Costa Rica</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Carousel */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">{slide.title}</h2>
                  <p className="text-lg md:text-xl max-w-2xl mx-auto">{slide.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Servicios del departamento de gestión vial
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Ofrecemos una amplia gama de servicios para satisfacer las necesidades de nuestra comunidad,
              siempre con el compromiso de brindar atención de calidad y eficiencia.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <service.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Info Carousel */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {institutionalInfo.map((info, index) => (
              <div
                key={index}
                className={`text-center transition-opacity duration-1000 ${
                  index === currentInfoSlide ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-teal-600 mb-8">
                  {info.title}
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                  {info.content}
                </p>
              </div>
            ))}
            
            {/* Navigation arrows */}
            <button
              onClick={prevInfoSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-teal-100 hover:bg-teal-200 text-teal-600 p-2 rounded-full transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextInfoSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-teal-100 hover:bg-teal-200 text-teal-600 p-2 rounded-full transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {institutionalInfo.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentInfoSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentInfoSlide ? 'bg-teal-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Artículos y Noticias
            </h2>
            <p className="text-lg text-gray-600">
              Mantente informado sobre los últimos acontecimientos y proyectos de nuestra municipalidad
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mb-3">
                    {article.category}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{article.date}</span>
                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Leer más »
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-blue-600">{selectedArticle.title}</h3>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {selectedArticle.category}
                </span>
                <span className="text-sm text-gray-500">{selectedArticle.date}</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {selectedArticle.content}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Contact Section */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo and Social */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                <div className="w-15 h-14 rounded-full overflow-hidden flex items-center justify-center">
            <img src="/image/logo.png" alt="Logo Gestión Vial" className="w-full h-full object-cover" />
           </div>
                <div>
                  <h3 className="text-lg font-bold">Municipalidad de</h3>
                  <p className="text-sm">Santa Cruz</p>
                </div>
              </div>
              <div className="flex justify-center md:justify-start space-x-4 mb-4">
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-green-400 hover:text-green-300 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </a>
              </div>
              <span className="text-sm">
                  Departamento de gestión vial,<br />
                   Santa Cruz, Guanacaste.
                </span>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">+506 2680 5801</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">utgvm@santacruz.go.cr</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Ubicación</h4>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-1" />
                <span className="text-sm">
                  Contiguo a Hotel Wilson sobre Ruta 21,<br />
                   Santa Cruz, Guanacaste.
                </span>
              </div>
            </div>

            {/* Hours */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Horario de Atención</h4>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-400 mt-1" />
                <div className="text-sm">
                  <p>Lunes a Viernes</p>
                  <p>7:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Municipalidad de Santa Cruz. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;