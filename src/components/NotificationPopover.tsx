'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon, type IconName } from './Icons';

export interface NotificationItem {
  id: string;
  recordId: string;
  title: string;
  message: string;
  time: string;
  type: 'verified' | 'published' | 'governance' | 'grant';
  href: string;
}

function timeAgo(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (!mounted || !data.success) return;

        const list: NotificationItem[] = data.notifications || [];
        setNotifications(list);

        // Compute unread count based on last read timestamp
        const readAt = localStorage.getItem('mudra-notifications-read-at');
        if (!readAt) {
          // If first visit, show the newest 3 as unread
          setUnreadCount(Math.min(3, list.length));
        } else {
          const readTime = new Date(readAt).getTime();
          const unread = list.filter((n) => new Date(n.time).getTime() > readTime).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.warn('Failed to load notifications:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchNotifications();
    return () => {
      mounted = false;
    };
  }, []);

  const markAllAsRead = () => {
    try {
      localStorage.setItem('mudra-notifications-read-at', new Date().toISOString());
    } catch {}
    setUnreadCount(0);
  };

  return { notifications, unreadCount, loading, markAllAsRead };
}

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export function NotificationPopover({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAllAsRead,
}: NotificationPopoverProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const iconForType = (type: NotificationItem['type']): IconName => {
    switch (type) {
      case 'verified':
        return 'shield';
      case 'grant':
        return 'checkCircle';
      case 'governance':
        return 'tools';
      default:
        return 'book';
    }
  };

  return createPortal(
    <>
      <div className="notif-backdrop" onClick={onClose} aria-hidden="true" />
      <aside
        className="notif-popover"
        role="dialog"
        aria-label="Registry Notifications"
        aria-modal="true"
      >
        <div className="notif-head">
          <div className="notif-title-group">
            <h3>Registry Updates</h3>
            {unreadCount > 0 && (
              <span className="notif-count-pill">{unreadCount} new</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              className="notif-mark-read"
              onClick={onMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        <ul className="notif-list" role="feed">
          {notifications.length === 0 ? (
            <li className="notif-empty">No recent registry notifications.</li>
          ) : (
            notifications.map((item, idx) => {
              const isUnread = idx < unreadCount;
              return (
                <li
                  key={item.id}
                  className={`notif-item${isUnread ? ' is-unread' : ''}`}
                >
                  <a
                    href={item.href}
                    className="notif-link"
                    onClick={() => {
                      onClose();
                    }}
                  >
                    <div className={`notif-icon-wrap type-${item.type}`}>
                      <Icon name={iconForType(item.type)} size={16} />
                    </div>
                    <div className="notif-content">
                      <div className="notif-item-title">
                        <span>{item.title}</span>
                        <time className="notif-time">{timeAgo(item.time)}</time>
                      </div>
                      <p className="notif-item-msg">{item.message}</p>
                    </div>
                  </a>
                </li>
              );
            })
          )}
        </ul>

        <div className="notif-foot">
          <span>Kerala Cultural Heritage Registry</span>
          <a href="/catalogue" onClick={onClose}>
            <span>View Catalogue</span>
            <Icon name="arrow" size={14} />
          </a>
        </div>
      </aside>
    </>,
    document.body
  );
}
