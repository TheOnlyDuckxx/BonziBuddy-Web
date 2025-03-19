document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const screenshot = document.getElementById('screenshot');
    const captureBtn = document.getElementById('capture-btn');
    const screenshotData = document.getElementById('screenshot-data');

    // Taille du format 3:4
    const canvasWidth = 300;  // Largeur
    const canvasHeight = 400; // Hauteur

    // Demande d'accès à la webcam
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          video.srcObject = stream;
        })
        .catch(err => {
          alert("Impossible d'accéder à la webcam intégrée. Vérifiez les permissions.");
          console.error("Erreur webcam : ", err);
        });
    } else {
      alert("Webcam non supportée par votre navigateur.");
    }

    captureBtn.addEventListener('click', function (event) {
      event.preventDefault(); // Empêche un comportement par défaut du bouton

      const context = canvas.getContext('2d');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Détermination du recadrage en 3:4
      const videoRatio = video.videoWidth / video.videoHeight;
      const targetRatio = canvasWidth / canvasHeight;

      let sx, sy, sWidth, sHeight;
      if (videoRatio > targetRatio) {
        sHeight = video.videoHeight;
        sWidth = sHeight * targetRatio;
        sx = (video.videoWidth - sWidth) / 2;
        sy = 0;
      } else {
        sWidth = video.videoWidth;
        sHeight = sWidth / targetRatio;
        sx = 0;
        sy = (video.videoHeight - sHeight) / 2;
      }

      // Capture de l'image et dessin sur le canvas
      context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);

      // Appliquer le filtre noir et blanc
      let imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
      let pixels = imageData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i];     // Rouge
        let g = pixels[i + 1]; // Vert
        let b = pixels[i + 2]; // Bleu

        // Moyenne des trois canaux pour un effet noir et blanc
        let gray = (r + g + b) / 3;

        pixels[i] = pixels[i + 1] = pixels[i + 2] = gray; // Appliquer la valeur de gris
      }

      context.putImageData(imageData, 0, 0); // Redessine l’image modifiée

      // Conversion en base64
      const imageDataURL = canvas.toDataURL('image/png');
      screenshot.src = imageDataURL; // Affichage de l’image capturée en noir et blanc
      screenshot.style.display = "block";
      screenshotData.value = imageDataURL; // Stockage de l’image dans le champ caché
    });
  });