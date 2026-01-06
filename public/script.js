document.addEventListener('DOMContentLoaded', () => {
    console.log('App Initialized');

    // Check which page we are on
    const path = window.location.pathname;

    if (path === '/admin') {
        loadAdminStats();
    } else if (path === '/surveillance') {
        initSurveillance();
    }
});

async function loadAdminStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();

        if (document.getElementById('registered-faces')) {
            document.getElementById('registered-faces').textContent = data.registeredFaces;
        }
        if (document.getElementById('active-cameras')) {
            document.getElementById('active-cameras').textContent = data.activeCameras;
        }
        if (document.getElementById('recent-detections')) {
            document.getElementById('recent-detections').textContent = data.recentDetections;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function initSurveillance() {
    const videoContainer = document.getElementById('camera-feeds');
    
    // Create a video element
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.style.width = '100%';
    video.style.maxWidth = '640px';
    video.style.borderRadius = '8px';
    video.style.backgroundColor = '#000';

    videoContainer.appendChild(video);

    // Access Webcam
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                // Here we could add logic to capture frames and send to server
                // startFaceRecognition(video);
            })
            .catch(err => {
                console.error('Camera access denied:', err);
                videoContainer.innerHTML = '<p style="color:red">Camera access denied or not available.</p>';
            });
    } else {
        videoContainer.innerHTML = '<p style="color:red">Webcam not supported in this browser.</p>';
    }
}
