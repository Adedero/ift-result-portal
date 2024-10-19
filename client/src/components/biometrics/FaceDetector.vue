<script setup>
import { inject, onMounted, onUnmounted, ref } from 'vue';
import * as faceapi from 'face-api.js';
import FaceId from '../../composables/use-faceid';
import useFetch from '../../composables/fetch/use-fetch';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

const props = defineProps({ action: { type: String, default: "verify" } });
const userLoggingIn = inject("userIdAndPassword");
const router = useRouter();
const toast = useToast();
const loading = ref(false);
const error = ref(null);
const video = ref(null);
const faceId = ref(null);
const storedFaceDescriptor = ref(null);
const currentFaceDescriptor = ref(null);

const checkExistingFaceDescriptor = async () => {
  loading.value = true;
  error.value = null;
  const { error: err } = await useFetch(
    `auth/user-face-descriptor/${userLoggingIn.value.id}`,
    { router, toast, useBaseUrl: true, sendToken: false},
    (payload) => {
      storedFaceDescriptor.value = payload.faceDescriptor;
    }
  )
  loading.value = false;
  error.value = err.value;
}

onMounted(async () => {
  faceId.value = new FaceId(video);
  await checkExistingFaceDescriptor();
  if (storedFaceDescriptor.value.descriptor) {
    faceId.value.startVideoStream();
    currentFaceDescriptor.value = faceId.value.getFaceDescriptor();
    if (currentFaceDescriptor.value) {
      faceId.value.verifyFace()
    }
  }
});

onUnmounted(() => {
  faceId.value.stopVideoStream();
})

/* 
const startVideoStream = () => {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((mediaStream) => {
      stream.value = mediaStream;
      video.value.srcObject = mediaStream
    })
    .catch((err) => console.error("Error starting video stream:", err));
};

const stopVideoStream = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    if (video.value) video.value.srcObject = null;
    console.log("Video stream stopped.");
  }
};

const loadModels = async () => {
  const MODEL_URL = '/models'; 
  Promise.all([
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
  ]);  
};

const createCanvasElement = () => {
  const canvas = faceapi.createCanvasFromMedia(video.value);
  canvas.style.position = "absolute";
  canvas.style.zIndex = 1;
  canvas.style.top = 0;
  canvas.style.left = 0;
  const displaySize = { width: video.value.width, height: video.value.height };
  faceapi.matchDimensions(canvas, displaySize);
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  video.value.insertAdjacentElement('afterend', canvas);
  return canvas;
}

const captureFace = async () => {
  const canvas = createCanvasElement();
  const displaySize = { width: video.value.width, height: video.value.height };
  const detections = await faceapi.detectSingleFace(video.value, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

  console.log(detections);

  if (detections) {
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    userFaceDescriptor.value = detections.descriptor;

  } else {
    console.error("No face detected!");
  }
};

const verifyFace = async () => {
  const detections = await faceapi.detectSingleFace(video.value, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

  if (detections) {
    console.log(detections)
    return;
    const currentFaceDescriptor = detections.descriptor;

    // Fetch stored descriptor from the backend
    const response = await fetch('/api/get-stored-face-descriptor');
    const { storedDescriptor } = await response.json();

    const distance = faceapi.euclideanDistance(currentFaceDescriptor, storedDescriptor);

    if (distance < 0.6) {  // 0.6 is the typical threshold for face matching
      alert("Login successful!");
    } else {
      alert("Face not recognized, login failed!");
    }
  } else {
    console.error("No face detected!");
  }
};

onMounted(async () => {
  console.log(userLoggingIn)
  await loadModels();
  startVideoStream();

  video.value.addEventListener("play", () => {
    captureFace();
  });
});

onUnmounted(() => {
  stopVideoStream();
}) */
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="w-80 h-60 max-w-[400px] max-h-[400px] relative">
      <div v-if="error" class="w-full h-full gap-4 flex flex-col items-center justify-center">
        <Message>
          <p>{{ error.message }}</p>
        </Message>
        <Button label="retry" icon="pi pi-refresh" @click="checkExistingFaceDescriptor" />
      </div>

      <div v-if="loading" class="w-full h-full gap-2 flex flex-col items-center justify-center">
        <div class="loader"></div>
      </div>

      <video v-show="storedFaceDescriptor" id="faceid-video" ref="video" autoplay playsinline muted width="400" height="400"></video>
    </div>
    <!-- <div class="flex items-center justify-end">
      <Button label="Verify" icon="pi pi-check-circle" icon-pos="right" />
    </div> -->
  </div>
</template>


<style scoped>
.loader {
  width: 17px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--p-primary-500);
  display: grid;
  animation: l22-0 2s infinite linear;
}

.loader:before,
.loader:after {
  content: "";
  grid-area: 1/1;
  margin: 15%;
  border-radius: 50%;
  background: inherit;
  transform: rotate(0deg) translate(150%);
  animation: l22 1s infinite;
}

.loader:after {
  animation-delay: -.5s
}

@keyframes l22-0 {
  100% {
    transform: rotate(1turn)
  }
}

@keyframes l22 {
  100% {
    transform: rotate(1turn) translate(150%)
  }
}
</style>