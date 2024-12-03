const video = document.getElementById('video');
const emotionLabel = document.getElementById('emotionLabel');

var socket = io.connect('http://127.0.0.1:5000');
socket.on('connect', function() {
  console.log("Socket connected!");
});

socket.on('disconnect', function() {
  console.log("Socket disconnected");
});

// Gunakan metode modern untuk mengakses kamera
async function startVideo() {
  try {
    console.log("Memulai akses kamera");
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
    
    // Tunggu video siap dimuat
    video.onloadedmetadata = async () => {
      video.play();
      console.log("Video mulai diputar");
      await detectFaces();
    };
  } catch (err) {
    console.error("Error mengakses kamera:", err);
    emotionLabel.textContent = "Gagal mengakses kamera";
  }
}

// Fungsi deteksi wajah yang disempurnakan
async function detectFaces() {
  try {
    // Pastikan model sudah dimuat
    await Promise.all([
      faceapi.loadTinyFaceDetectorModel("http://127.0.0.1:5000/static/models/"),
      faceapi.loadFaceLandmarkModel("http://127.0.0.1:5000/static/models/"),
      faceapi.loadFaceExpressionModel("http://127.0.0.1:5000/static/models/")
    ]);

    console.log("Model wajah berhasil dimuat");

    // Buat canvas
    const canvas = faceapi.createCanvasFromMedia(video);
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = 10;
    document.querySelector('.video-container').appendChild(canvas);

    const displaySize = { 
      width: video.offsetWidth, 
      height: video.offsetHeight 
    };
    faceapi.matchDimensions(canvas, displaySize);

    // Deteksi wajah secara berkala
    setInterval(async () => {
      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        // Bersihkan canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Resize deteksi
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // Gambar deteksi
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        // Proses ekspresi
        if (detections.length > 0) {
          detections.forEach(detection => {
            const expressions = detection.expressions;
            const dominantExpression = getDominantExpression(expressions);
            const dominantEmoji = getEmojiForExpression(dominantExpression.name);

            emotionLabel.textContent = `${dominantExpression.name} ${dominantEmoji}`;
            
            // Kirim event socket jika perlu
            socket.emit('my event', { data: dominantExpression });
          });
        } else {
          emotionLabel.textContent = "Tidak ada wajah terdeteksi";
        }
      } catch (detectionError) {
        console.error("Gagal mendeteksi wajah:", detectionError);
      }
    }, 500);

  } catch (modelError) {
    console.error("Gagal memuat model wajah:", modelError);
    emotionLabel.textContent = "Gagal memuat model deteksi";
  }
}

// Fungsi pendukung tetap sama
function getDominantExpression(expressions) {
  let maxExpression = { name: '', score: -Infinity };
  for (const [expression, score] of Object.entries(expressions)) {
    if (score > maxExpression.score) {
      maxExpression = { name: expression, score: score };
    }
  }
  return maxExpression;
}

function getEmojiForExpression(expression) {
  const emojiMap = {
    'neutral': '😐',
    'happy': '😁',
    'sad': '😢',
    'angry': '😡',
    'fearful': '😨',
    'disgusted': '🤢',
    'surprised': '😲'
  };
  return emojiMap[expression] || '😐';
}

document.addEventListener('DOMContentLoaded', () => {
  startVideo();
});