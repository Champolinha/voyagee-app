import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer, size = 'medium' }) {
    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        small: { maxWidth: '380px' },
        medium: { maxWidth: '480px' },
        large: { maxWidth: '600px' }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
            <div
                className="modal-content glass-modal"
                onClick={(e) => e.stopPropagation()}
                style={{ ...sizeClasses[size], minHeight: 'auto' }}
            >
                <div className="modal-header-actions">
                    <div className="modal-handle" />
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {title && (
                    <h2 className="modal-title">
                        {title}
                    </h2>
                )}

                <div className="modal-body">
                    {children}
                </div>

                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
