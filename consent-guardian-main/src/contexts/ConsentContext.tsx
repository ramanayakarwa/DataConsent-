import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Consent {
  id: string;
  dataType: string;
  organization: string;
  purpose: string;
  startTime: Date;
  expiryTime: Date;
  status: 'active' | 'expiring' | 'expired' | 'revoked';
  proxyEmail?: string;
  proxyPhone?: string;
  blockchainHash: string;
}

interface ConsentContextType {
  consents: Consent[];
  addConsent: (consent: Omit<Consent, 'id' | 'blockchainHash' | 'status'>) => void;
  revokeConsent: (id: string) => void;
  getActiveConsents: () => Consent[];
  getExpiredConsents: () => Consent[];
}

const generateHash = () => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

const getStatus = (expiryTime: Date): Consent['status'] => {
  const now = new Date();
  const hourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  
  if (expiryTime < now) return 'expired';
  if (expiryTime < hourFromNow) return 'expiring';
  return 'active';
};

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

const initialConsents: Consent[] = [
  {
    id: '1',
    dataType: 'Email',
    organization: 'TechFest 2025',
    purpose: 'Event Registration',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiryTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'active',
    proxyEmail: 'tf2025_a7x9@proxy.dataconsent.app',
    blockchainHash: '0x8f4e2d1a9b3c5f7e6d8a2b4c1e3f5a7b9d2e4f6a8c1d3e5f7a9b2c4d6e8f1a3b',
  },
  {
    id: '2',
    dataType: 'Phone',
    organization: 'Cafe Wi-Fi',
    purpose: 'Wi-Fi Access',
    startTime: new Date(Date.now() - 30 * 60 * 1000),
    expiryTime: new Date(Date.now() + 30 * 60 * 1000),
    status: 'expiring',
    proxyPhone: '+1-555-PROXY-42',
    blockchainHash: '0x2a4b6c8d1e3f5a7b9c2d4e6f8a1b3c5d7e9f2a4b6c8d1e3f5a7b9c2d4e6f8a1b',
  },
  {
    id: '3',
    dataType: 'Email, Name',
    organization: 'Newsletter Pro',
    purpose: 'App Signup',
    startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    expiryTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'expired',
    proxyEmail: 'nlpro_k9m2@proxy.dataconsent.app',
    blockchainHash: '0x5f7a9b2c4d6e8f1a3b5d7e9f2a4b6c8d1e3f5a7b9c2d4e6f8a1b3c5d7e9f2a4b',
  },
  {
    id: '4',
    dataType: 'Email',
    organization: 'Survey Corp',
    purpose: 'Survey',
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    expiryTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'revoked',
    proxyEmail: 'survey_x3p7@proxy.dataconsent.app',
    blockchainHash: '0x1b3c5d7e9f2a4b6c8d1e3f5a7b9c2d4e6f8a1b3c5d7e9f2a4b6c8d1e3f5a7b9c',
  },
];

export const ConsentProvider = ({ children }: { children: ReactNode }) => {
  const [consents, setConsents] = useState<Consent[]>(initialConsents);

  const addConsent = (consent: Omit<Consent, 'id' | 'blockchainHash' | 'status'>) => {
    const newConsent: Consent = {
      ...consent,
      id: Date.now().toString(),
      blockchainHash: generateHash(),
      status: getStatus(consent.expiryTime),
    };
    setConsents(prev => [newConsent, ...prev]);
  };

  const revokeConsent = (id: string) => {
    setConsents(prev =>
      prev.map(consent =>
        consent.id === id ? { ...consent, status: 'revoked' as const } : consent
      )
    );
  };

  const getActiveConsents = () => consents.filter(c => c.status === 'active' || c.status === 'expiring');
  const getExpiredConsents = () => consents.filter(c => c.status === 'expired' || c.status === 'revoked');

  return (
    <ConsentContext.Provider value={{ consents, addConsent, revokeConsent, getActiveConsents, getExpiredConsents }}>
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
};
