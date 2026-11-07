'use client';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icons';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect if already installed or launched as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // Register Service Worker
    const registerSw = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            reg.onupdatefound = () => {
              const worker = reg.installing;
              if (worker) {
                worker.onstatechange = () => {
                  if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker version is waiting
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn('[PWA] ServiceWorker registration notice:', err);
          });
      }
    };

    if (document.readyState === 'complete') {
      registerSw();
    } else {
      window.addEventListener('load', registerSw);
    }

    // Capture install prompt
    let timer: NodeJS.Timeout | null = null;
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      const pEvent = e as BeforeInstallPromptEvent;
      promptRef.current = pEvent;
      setDeferredPrompt(pEvent);

      try {
        const dismissedAt = localStorage.getItem('mudra-pwa-dismissed');
        if (!dismissedAt || Date.now() - Number(dismissedAt) > 7 * 86400000) {
          timer = setTimeout(() => {
            setShowBanner(true);
          }, 2000);
        }
      } catch {
        setShowBanner(true);
      }
    };

    const onAppInstalled = () => {
      setInstalled(true);
      promptRef.current = null;
      setDeferredPrompt(null);
      setShowBanner(false);
    };

    // Custom trigger from any "Install App" button in menus
    const onCustomTrigger = () => {
      const p = promptRef.current;
      if (p) {
        p.prompt();
        p.userChoice.then(({ outcome }) => {
          if (outcome === 'accepted') setInstalled(true);
          promptRef.current = null;
          setDeferredPrompt(null);
          setShowBanner(false);
        });
      } else {
        alert(
          'To install Mudra as a Web App:\n\n' +
            '• On Chrome / Edge (Desktop & Android): Look for the "Install" icon in your address bar or browser menu.\n' +
            '• On iPhone / iPad (Safari): Tap the Share button at the bottom and select "Add to Home Screen".\n' +
            '• On macOS (Safari): File → Add to Dock.'
        );
      }
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);
    window.addEventListener('mudra-prompt-install', onCustomTrigger);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('load', registerSw);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
      window.removeEventListener('mudra-prompt-install', onCustomTrigger);
    };
  }, []);

  const handleInstallClick = async () => {
    const p = promptRef.current || deferredPrompt;
    if (!p) return;
    p.prompt();
    const { outcome } = await p.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    promptRef.current = null;
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try {
      localStorage.setItem('mudra-pwa-dismissed', String(Date.now()));
    } catch {}
  };

  if (installed || !showBanner || !deferredPrompt || typeof document === 'undefined') return null;

  return createPortal(
    <aside className="pwa-install-banner" aria-label="Install Mudra as an app" role="dialog">
      <div className="pwa-banner-main">
        <img
          src="/icons/icon-192.png"
          alt=""
          width={44}
          height={44}
          className="pwa-banner-icon"
          aria-hidden="true"
        />
        <div className="pwa-banner-text">
          <strong className="pwa-banner-title">Install Mudra App</strong>
          <span className="pwa-banner-desc">Fast access to Kerala’s Heritage Registry, even offline</span>
        </div>
      </div>
      <div className="pwa-banner-actions">
        <button type="button" className="btn gold pwa-install-btn" onClick={handleInstallClick}>
          <Icon name="download" size={16} />
          <span>Install</span>
        </button>
        <button
          type="button"
          className="pwa-dismiss-btn"
          onClick={handleDismiss}
          aria-label="Dismiss installation prompt"
        >
          <Icon name="close" size={18} />
        </button>
      </div>
    </aside>,
    document.body
  );
}

/** Helper button for menus and footers */
export function InstallAppButton({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      className={`pwa-trigger-btn ${className}`}
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mudra-prompt-install'));
        }
      }}
      aria-label="Install Mudra as a Web App"
    >
      <Icon name="download" size={18} />
      <span>Install App</span>
    </button>
  );
}
