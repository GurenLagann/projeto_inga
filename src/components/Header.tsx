"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Header({ activeSection, onSectionChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { id: 'home', label: 'Início' },
    { id: 'history', label: 'Nossa História' },
    { id: 'events', label: 'Eventos' }, 
    { id: 'members', label: 'Área dos Membros' },
  ];

  // Determinar seção ativa baseada no pathname
  const getActiveSection = () => {
    if (pathname === '/members') return 'members';
    return activeSection;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-xl text-blue-700">Grupo Inga Capoeira</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const isActive = getActiveSection() === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`transition-colors ${
                    isActive
                      ? ' text-blue-700'
                      : 'text-gray-600 hover:text-blue-700'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const isActive = getActiveSection() === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSectionChange(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`text-left px-2 py-2 transition-colors ${
                      isActive
                        ? 'text-orange-600'
                        : 'text-gray-600 hover:text-orange-600'
                    }`}
                  > 
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}