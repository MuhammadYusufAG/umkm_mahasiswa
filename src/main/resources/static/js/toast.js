// Beautiful Toast Notification System
(function() {
    // 1. Inject Styles
    const css = `
        #toast-container {
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-width: 350px;
            width: calc(100% - 48px);
            pointer-events: none;
        }

        .toast-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            border-radius: 16px;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            font-size: 14px;
            font-weight: 500;
            color: #1e293b;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
            border-left: 5px solid #cbd5e1;
            transform: translateX(120%);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: auto;
        }

        .toast-item.show {
            transform: translateX(0);
            opacity: 1;
        }

        .toast-item.hide {
            transform: translateY(-20px) scale(0.9);
            opacity: 0;
        }

        .toast-item.success {
            border-left-color: #10b981;
        }
        .toast-item.error {
            border-left-color: #ef4444;
        }
        .toast-item.info {
            border-left-color: #3b82f6;
        }

        .toast-icon {
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .toast-item.success .toast-icon { color: #10b981; }
        .toast-item.error .toast-icon { color: #ef4444; }
        .toast-item.info .toast-icon { color: #3b82f6; }

        .toast-message {
            flex-grow: 1;
            line-height: 1.4;
        }

        .toast-close {
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: background 0.2s;
        }
        
        .toast-close:hover {
            background: rgba(0,0,0,0.05);
            color: #64748b;
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.innerHTML = css;
    document.head.appendChild(styleEl);

    // 2. Create Container
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);

    // 3. Define Global Function
    window.showToast = function(message, type = 'info') {
        const item = document.createElement('div');
        item.className = `toast-item ${type}`;

        let iconHtml = '';
        if (type === 'success') {
            iconHtml = '<i class="fa-solid fa-circle-check"></i>';
        } else if (type === 'error') {
            iconHtml = '<i class="fa-solid fa-circle-xmark"></i>';
        } else {
            iconHtml = '<i class="fa-solid fa-circle-info"></i>';
        }

        item.innerHTML = `
            <div class="toast-icon">${iconHtml}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
        `;

        container.appendChild(item);

        // Slide in
        setTimeout(() => item.classList.add('show'), 50);

        // Click close
        item.querySelector('.toast-close').addEventListener('click', () => {
            removeToast(item);
        });

        // Auto remove
        const duration = type === 'error' ? 5000 : 3000;
        setTimeout(() => {
            removeToast(item);
        }, duration);
    };

    function removeToast(item) {
        item.classList.add('hide');
        item.addEventListener('transitionend', () => {
            item.remove();
        });
    }
})();
