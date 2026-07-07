// toast.js

// Fungsi untuk menyuntikkan CSS ke dalam halaman
function injectToastCss() {
    if (document.getElementById('custom-toast-style')) return;

    const style = document.createElement('style');
    style.id = 'custom-toast-style';
    style.innerHTML = `
        /* Toast Styles */
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .custom-toast {
            min-width: 250px;
            padding: 16px 20px;
            background: #ffffff;
            color: #333333;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-family: inherit;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            opacity: 0;
            transform: translateX(100%);
            transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            border-left: 4px solid #3b82f6;
        }

        .custom-toast.show {
            opacity: 1;
            transform: translateX(0);
        }

        .custom-toast.success { border-left-color: #10b981; }
        .custom-toast.error { border-left-color: #ef4444; }
        .custom-toast.info { border-left-color: #3b82f6; }
        
        .toast-icon { margin-right: 12px; font-size: 18px; }
        .toast-content { flex: 1; }
        .toast-close {
            background: none;
            border: none;
            cursor: pointer;
            color: #999;
            font-size: 16px;
            padding: 0;
            margin-left: 15px;
        }
        .toast-close:hover { color: #333; }

        /* Modal Styles */
        .confirm-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(2px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s;
        }

        .confirm-modal-overlay.show {
            opacity: 1;
            visibility: visible;
        }

        .confirm-modal {
            background: white;
            border-radius: 12px;
            padding: 24px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            transform: scale(0.9);
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            text-align: center;
        }

        .confirm-modal-overlay.show .confirm-modal {
            transform: scale(1);
        }

        .confirm-icon {
            font-size: 40px;
            color: #f59e0b;
            margin-bottom: 16px;
        }

        .confirm-message {
            font-size: 16px;
            color: #374151;
            margin-bottom: 24px;
            line-height: 1.5;
        }

        .confirm-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
        }

        .confirm-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
        }

        .confirm-btn:active { transform: scale(0.96); }

        .confirm-btn-cancel {
            background: #e5e7eb;
            color: #374151;
        }

        .confirm-btn-cancel:hover { background: #d1d5db; }

        .confirm-btn-ok {
            background: #3b82f6;
            color: white;
        }

        .confirm-btn-ok:hover { background: #2563eb; }
    `;
    document.head.appendChild(style);

    // Setup container
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
}

// Menjalankan injeksi saat file dimuat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectToastCss);
} else {
    injectToastCss();
}

/**
 * Menampilkan Toast Notification
 * @param {string} message - Pesan yang ditampilkan
 * @param {string} type - 'success', 'error', atau 'info'
 */
window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-content">${message}</span>
        <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Setup remove functionality
    const closeBtn = toast.querySelector('.toast-close');
    let timeout;

    const removeToast = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
        clearTimeout(timeout);
    };

    closeBtn.addEventListener('click', removeToast);

    // Auto remove after 3.5s
    timeout = setTimeout(removeToast, 3500);
};

/**
 * Menampilkan Modal Konfirmasi
 * @param {string} message - Pesan konfirmasi
 * @returns {Promise<boolean>} - True jika Ya, False jika Batal
 */
window.showConfirm = function(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-modal-overlay';
        
        overlay.innerHTML = `
            <div class="confirm-modal">
                <div class="confirm-icon">⚠️</div>
                <div class="confirm-message">${message}</div>
                <div class="confirm-actions">
                    <button class="confirm-btn confirm-btn-cancel" id="confirm-btn-cancel">Batal</button>
                    <button class="confirm-btn confirm-btn-ok" id="confirm-btn-ok">Ya, Lanjutkan</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Animate in
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });

        const cleanUp = () => {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 200);
        };

        const btnCancel = overlay.querySelector('#confirm-btn-cancel');
        const btnOk = overlay.querySelector('#confirm-btn-ok');

        btnCancel.addEventListener('click', () => {
            cleanUp();
            resolve(false);
        });

        btnOk.addEventListener('click', () => {
            cleanUp();
            resolve(true);
        });
    });
};
