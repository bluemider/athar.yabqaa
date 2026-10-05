import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CommunitySubmission, SiteContent } from '../types';

interface FirebaseContextType {
  currentUser: any | null;
  isAdmin: boolean;
  isAuthLoading: boolean;
  isFirestoreConnected: boolean;
  signInWithGoogle: () => Promise<any | null>;
  signOutUser: () => Promise<void>;
  saveSiteContentToFirestore: (content: SiteContent) => Promise<boolean>;
  fetchSiteContentFromFirestore: () => Promise<SiteContent | null>;
  submitMemoryToFirestore: (
    data: {
      authorName: string;
      relationship?: string;
      message: string;
      mediaUrl?: string;
      mediaType?: 'image' | 'video';
    }
  ) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateSubmissionInFirestore: (id: string, updates: Partial<CommunitySubmission>) => Promise<boolean>;
  deleteSubmissionFromFirestore: (id: string) => Promise<boolean>;
  subscribeToApprovedSubmissions: (callback: (submissions: CommunitySubmission[]) => void) => () => void;
  subscribeToAllSubmissions: (callback: (submissions: CommunitySubmission[]) => void) => () => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);

  const isAdmin = true;

  // Sign In stub (admin uses direct admin password login)
  const signInWithGoogle = async (): Promise<any | null> => {
    return null;
  };

  // Sign out
  const signOutUser = async (): Promise<void> => {
    setCurrentUser(null);
  };

  // Save full site content via API
  const saveSiteContentToFirestore = async (content: SiteContent): Promise<boolean> => {
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  // Fetch site content via API
  const fetchSiteContentFromFirestore = async (): Promise<SiteContent | null> => {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        return data?.content || null;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Submit visitor condolence/memory via API
  const submitMemoryToFirestore = async (data: {
    authorName: string;
    relationship?: string;
    message: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
  }): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        return { success: true, id: resData.submission?.id };
      }
      return { success: false, error: resData.message || 'تعذر إرسال المشاركة' };
    } catch (err: any) {
      return { success: false, error: err.message || 'تعذر الاتصال بالخادم' };
    }
  };

  // Update submission status via API
  const updateSubmissionInFirestore = async (
    id: string,
    updates: Partial<CommunitySubmission>
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  // Delete submission via API
  const deleteSubmissionFromFirestore = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  // Fetch approved submissions for the public wall
  const subscribeToApprovedSubmissions = (
    callback: (submissions: CommunitySubmission[]) => void
  ): (() => void) => {
    let isCancelled = false;

    const fetchItems = async () => {
      try {
        const res = await fetch('/api/published-archive');
        if (res.ok && !isCancelled) {
          const data = await res.json();
          if (Array.isArray(data.submissions)) {
            callback(data.submissions);
          }
        }
      } catch {}
    };

    fetchItems();
    const interval = setInterval(fetchItems, 30000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  };

  // Fetch all submissions for the admin dashboard
  const subscribeToAllSubmissions = (
    callback: (submissions: CommunitySubmission[]) => void
  ): (() => void) => {
    let isCancelled = false;

    const fetchItems = async () => {
      try {
        const res = await fetch('/api/submissions');
        if (res.ok && !isCancelled) {
          const data = await res.json();
          if (Array.isArray(data.submissions)) {
            callback(data.submissions);
          }
        }
      } catch {}
    };

    fetchItems();
    const interval = setInterval(fetchItems, 20000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  };

  const value = {
    currentUser,
    isAdmin,
    isAuthLoading,
    isFirestoreConnected,
    signInWithGoogle,
    signOutUser,
    saveSiteContentToFirestore,
    fetchSiteContentFromFirestore,
    submitMemoryToFirestore,
    updateSubmissionInFirestore,
    deleteSubmissionFromFirestore,
    subscribeToApprovedSubmissions,
    subscribeToAllSubmissions,
  };

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
