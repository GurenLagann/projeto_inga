"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MembersArea } from '@/components/MembersArea';

export default function MembersPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('members');

  const handleSectionChange = (section: string) => {
    if (section === 'home' || section === 'history') {
      router.push('/');
      return;
    }
    if (section === 'members') {
      setActiveSection('members');
      return;
    }
    // Para outras seções, navegar para home e fazer scroll
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header activeSection={activeSection} onSectionChange={handleSectionChange} />
      <MembersArea />
      <Footer />
    </div>
  );
}
