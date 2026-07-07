document.addEventListener("DOMContentLoaded", () => {
    updateNewCount();
});

function updateNewCount() {
    fetch('/api/orders/seller/count/new')
        .then(res => {
            if (res.ok) return res.json();
            throw new Error("Unauthorized");
        })
        .then(data => {
            const badges = document.querySelectorAll('.badge-baru');
            badges.forEach(b => {
                b.textContent = data.count;
                b.style.display = data.count > 0 ? 'inline-block' : 'none';
            });
        })
        .catch(err => {
            console.error("Error fetching order count:", err);
        });
}
