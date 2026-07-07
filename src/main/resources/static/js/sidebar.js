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
