document.addEventListener('DOMContentLoaded', function() {
    // Definisi urutan iklan dengan tipe dan durasi
    const adSequence = [
        { 
            element: document.getElementById('adImage1'), 
            type: 'image', 
            duration: 10000 
        },
        { 
            element: document.getElementById('adImage2'), 
            type: 'image', 
            duration: 10000 
        },
        { 
            element: document.getElementById('adImage3'), 
            type: 'image', 
            duration: 10000 
        }
    ];

    let currentAdIndex = 0;
    let adTimer;

    function showNextAd() {
        // Sembunyikan semua konten iklan
        adSequence.forEach(ad => {
            ad.element.style.display = 'none';
        });

        // Tampilkan iklan berikutnya
        currentAdIndex = (currentAdIndex + 1) % adSequence.length;
        const nextAd = adSequence[currentAdIndex];
        
        nextAd.element.style.display = 'block';

        // Set timer untuk pergantian iklan berikutnya
        clearTimeout(adTimer);
        adTimer = setTimeout(showNextAd, nextAd.duration);
    }

    // Tampilkan iklan pertama
    const initialAd = adSequence[currentAdIndex];
    initialAd.element.style.display = 'block';

    // Set timer awal
    adTimer = setTimeout(showNextAd, initialAd.duration);
});