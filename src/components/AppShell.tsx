"use client";

import React, { useState } from 'react';
import { Header } from './Header';
import { Hero } from './Hero';
import { About } from './About';
import { Events } from './Events';
import { MembersArea } from './MembersArea';
import { Footer } from './Footer';
import { HistoryPage } from './HistoryPage';

export function AppShell() {
  const [activeSection, setActiveSection] = useState('home');
  const [currentPage, setCurrentPage] = useState('home');

  const handleSectionChange = (section: string) => {
    if (section === 'history') {
      setCurrentPage('history');
      setActiveSection(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (section === 'home') {
      setCurrentPage('home');
      setActiveSection(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentPage('home');
    setActiveSection(section);

    if (section !== 'home') {
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (currentPage === 'history') {
    return (
      <div className="min-h-screen bg-white">
        <Header activeSection={activeSection} onSectionChange={handleSectionChange} />
        <HistoryPage onSectionChange={handleSectionChange} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header activeSection={activeSection} onSectionChange={handleSectionChange} />
      <main>
        <Hero onSectionChange={handleSectionChange} />
        <About onSectionChange={handleSectionChange} />
        <Events />
        <MembersArea />
      </main>
      <Footer />
    </div>
  );
}
