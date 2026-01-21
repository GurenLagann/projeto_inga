import { MapPin, Phone, Mail, Instagram, Facebook, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl mb-4 text-blue-700">Grupo Inga Capoeira</h3>
            <p className="text-gray-300 mb-4">
              pequena frase sobre o grupo
            </p>
            <div className="flex space-x-4">
              <Instagram className="w-5 h-5 text-gray-400 hover:text-blue-700 cursor-pointer transition-colors" />
              <Facebook className="w-5 h-5 text-gray-400 hover:text-blue-700 cursor-pointer transition-colors" />
              <Youtube className="w-5 h-5 text-gray-400 hover:text-blue-700 cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="mb-4">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Phone className="w-4 h-4 mr-3" />
                (11) 99999-0000
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 mr-3" />
                contato@capoeira-axe.com.br
              </div>
              <div className="flex items-start text-gray-300">
                <MapPin className="w-4 h-4 mr-3 mt-1" />
                <div>
                  <p>CT FIRE GYM (Grupo São Paulo)</p>
                  <p className="text-sm">Av. Direitos Humanos, 2125 - Lauzane Paulista, São Paulo - SP, 02475-001</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4">Links Rápidos</h4>
            <div className="space-y-2">
              <a href="#about" className="block text-gray-300 hover:text-blue-700 transition-colors">
                Nossa História
              </a>
              <a href="#events" className="block text-gray-300 hover:text-blue-700 transition-colors">
                Eventos
              </a>
              <a href="#members" className="block text-gray-300 hover:text-blue-700 transition-colors">
                Área dos Membros
              </a>
              <a href="#contact" className="block text-gray-300 hover:text-blue-700 transition-colors">
                Aulas
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; 2025 Grupo Inga Capoeira. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}