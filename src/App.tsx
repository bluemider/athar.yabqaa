import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TimelineSection } from './components/TimelineSection';
import { CertificatesSection } from './components/CertificatesSection';
import { BooksSection } from './components/BooksSection';
import { VideoSection } from './components/VideoSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { PhotoGallerySection } from './components/PhotoGallerySection';
import { CommunitySubmissionSection } from './components/CommunitySubmissionSection';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { LightboxModal } from './components/LightboxModal';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { SiteContentProvider } from './context/SiteContentContext';
import { FirebaseProvider } from './context/FirebaseContext';

export default function App() {
  return (
    <FirebaseProvider>
      <SiteContentProvider>
        <MainApp />
      </SiteContentProvider>
    </FirebaseProvider>
  );
}

function MainApp() {
  const [currentView, setCurrentView] = useState<'home' | 'admin'>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('sheikh_archive_admin_auth') === 'true';
  });

  // Global Lightbox state
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    caption?: string;
    dateOrYear?: string;
    tags?: string[];
    code?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: '',
  });

  // Global Video Modal state
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Check URL pathname or hash for admin routing
  useEffect(() => {
    const checkRoute = () => {
      if (
        window.location.pathname.includes('/admin') ||
        window.location.hash.includes('#admin')
      ) {
        setCurrentView('admin');
      }
    };
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  const handleOpenLightbox = (
    imageUrl: string,
    title: string,
    caption?: string,
    dateOrYear?: string,
    tags?: string[],
    code?: string
  ) => {
    setLightboxState({
      isOpen: true,
      imageUrl,
      title,
      caption,
      dateOrYear,
      tags,
      code,
    });
  };

  const handleCloseLightbox = () => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('sheikh_archive_admin_auth', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('sheikh_archive_admin_auth');
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1E293B] font-cairo selection:bg-[#D4AF37]/30 selection:text-[#0F382C]">
      {/* Universal Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          if (view === 'admin') {
            window.location.hash = '#admin';
          } else {
            if (window.location.hash === '#admin') {
              window.location.hash = '';
            }
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => {
          setCurrentView('admin');
          window.location.hash = '#admin';
        }}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {currentView === 'admin' ? (
          <AdminDashboard
            isAdminLoggedIn={isAdminLoggedIn}
            onLoginSuccess={handleAdminLoginSuccess}
            onLogout={handleAdminLogout}
            onOpenLightbox={handleOpenLightbox}
          />
        ) : (
          <>
            {/* 1. Dynamic Hero Section */}
            <HeroSection
              onOpenVideoModal={(videoId) => setActiveVideoId(videoId)}
              onOpenLightbox={handleOpenLightbox}
            />

            {/* 2. Interactive Timeline Biography (with mandatory photos on every node) */}
            <TimelineSection onOpenLightbox={handleOpenLightbox} />

            {/* 3. Academic & Scientific Certificates Showcase (doc2 folder) */}
            <CertificatesSection onOpenLightbox={handleOpenLightbox} />

            {/* 4. Books and Publications Gallery */}
            <BooksSection onOpenLightbox={handleOpenLightbox} />

            {/* 5. Video & Media Archive with direct YouTube integration */}
            <VideoSection
              activeVideoId={activeVideoId}
              setActiveVideoId={setActiveVideoId}
            />

            {/* 6. Testimonials Section: "What They Said About Him" */}
            <TestimonialsSection />

            {/* 7. Archival Photo Gallery with Captions */}
            <PhotoGallerySection onOpenLightbox={handleOpenLightbox} />

            {/* 8. Community Submission Portal with Direct File Uploads & Wall of Memories */}
            <CommunitySubmissionSection onOpenLightbox={handleOpenLightbox} />
          </>
        )}
      </main>

      {/* Dignified Footer */}
      <Footer
        onOpenAdmin={() => {
          setCurrentView('admin');
          window.location.hash = '#admin';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Image/Certificate Lightbox Modal */}
      <LightboxModal
        isOpen={lightboxState.isOpen}
        onClose={handleCloseLightbox}
        imageUrl={lightboxState.imageUrl}
        title={lightboxState.title}
        caption={lightboxState.caption}
        dateOrYear={lightboxState.dateOrYear}
        tags={lightboxState.tags}
        code={lightboxState.code}
      />

      {/* Floating Integrated Back-to-Top Button */}
      <ScrollToTopButton />
    </div>
  );
}
