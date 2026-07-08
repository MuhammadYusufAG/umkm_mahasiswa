document.addEventListener("DOMContentLoaded", () => {
    updateNewCount();
});

function updateNewCount() {
    fetch('/api/orders/seller/count/summary')
        .then(res => {
            if (res.ok) return res.json();
            throw new Error("Unauthorized");
        })
        .then(data => {
            // Update total active orders count in the sidebar (baru + diproses)
            const totalActive = (data.baru || 0) + (data.diproses || 0);
            const sidebarBadges = document.querySelectorAll('.sidebar-badge');
            sidebarBadges.forEach(b => {
                b.textContent = totalActive;
                b.style.display = totalActive > 0 ? 'inline-block' : 'none';
            });

            // Update tab Baru count if the element exists
            const tabBaruBadges = document.querySelectorAll('.tab-badge-baru');
            tabBaruBadges.forEach(b => {
                b.textContent = data.baru || 0;
                b.style.display = (data.baru || 0) > 0 ? 'inline-block' : 'none';
            });

            // Update tab Diproses count if the element exists
            const tabDiprosesBadges = document.querySelectorAll('.tab-badge-diproses');
            tabDiprosesBadges.forEach(b => {
                b.textContent = data.diproses || 0;
                b.style.display = (data.diproses || 0) > 0 ? 'inline-block' : 'none';
            });
        })
        .catch(err => {
            console.error("Error fetching order count summary:", err);
        });
}

// ==========================================
// REAL-TIME ORDER NOTIFICATION (STOMP)
// ==========================================
let stompClientOrders = null;

function loadScript(url) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`) || 
            (url.includes('stomp') && typeof Stomp !== 'undefined') || 
            (url.includes('sockjs') && typeof SockJS !== 'undefined')) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function connectOrdersNotification() {
    Promise.all([
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.6.1/sockjs.min.js"),
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/stomp-websocket/2.3.3/stomp.min.js")
    ]).then(() => {
        fetch('/api/auth/me')
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Gagal memuat profil");
            })
            .then(user => {
                if (user.role !== 'SELLER') return;
                const socket = new SockJS('/ws');
                stompClientOrders = Stomp.over(socket);
                stompClientOrders.debug = null;
                stompClientOrders.connect({}, function (frame) {
                    stompClientOrders.subscribe('/topic/orders/' + user.id, function (messageOutput) {
                        if (messageOutput.body === 'new-order') {
                            updateNewCount();
                            
                            if (typeof fetchOrders === 'function') {
                                fetchOrders();
                            }
                            
                            if (typeof showToast === 'function') {
                                showToast('Ada pesanan baru masuk!', 'success');
                            }
                        }
                    });
                }, function(err) {
                    console.error("Orders STOMP Error, reconnecting in 5s...", err);
                    setTimeout(connectOrdersNotification, 5000);
                });
            })
            .catch(err => console.error(err));
    }).catch(err => console.error("Gagal memuat dependensi STOMP", err));
}

// Inisialisasi koneksi setelah DOM terload
document.addEventListener("DOMContentLoaded", () => {
    connectOrdersNotification();
});
