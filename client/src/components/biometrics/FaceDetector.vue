<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue';
import * as faceapi from 'face-api.js';

const props = defineProps({
  action: { 
    type: String,
    default: "verify"
  },
  storedFaceDescriptor: { type: Object, default: () => ({}) }
});

const emit = defineEmits(["capture", "verify"]);

const loading = ref(false);
const error = ref(null);

const video = ref(null);
const canvas = ref(null);

const stream = ref(null);
const currentFaceDescriptor = ref(null);
let modelsLoaded = false;

const intervalId = ref(null); 

const displaySize = computed(() => {
  if (video.value) {
    return { width: video.value.width, height: video.value.height };
  }
  return { width: 400, height: 400 };
});

async function captureFace() {
  loading.value = true;
  error.value = null;
  try {
    currentFaceDescriptor.value = await getFaceDescriptor();
    console.log(currentFaceDescriptor.value);
    emit('capture', currentFaceDescriptor.value);
  } catch (err) {
    error.value = err;
    console.log('Error capturing face descriptor: ', err);
  } finally {
    loading.value = false;
  }
}

async function verifyFace() {
  loading.value = true;
  error.value = null;
  try {
    const faceMatcher = new faceapi.FaceMatcher(props.storedFaceDescriptor, 0.6);
    const descriptor = await getFaceDescriptor();
    const match = faceMatcher.findBestMatch(descriptor);
    const verified = match.distance <= 0.6;
    emit('verify', verified);
  } catch (err) {
    error.value = err;
    console.log('Error verifying face: ', err);
  } finally {
    loading.value = false;
  }
}

// Load models if they are not already loaded
async function loadModels() {
  if (!modelsLoaded) {
    const MODEL_URL = '/models';
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      modelsLoaded = true;
    } catch (err) {
      console.log('Error loading models: ', err);
      throw err;
    }
  }
}

// Start video stream
async function startVideoStream() {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ video: true });
    video.value.srcObject = stream.value;
    await video.value.play();
  } catch (err) {
    console.log('Error starting video stream: ', err);
    throw err;
  }
}

// Stop video stream
function stopVideoStream() {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    if (video.value) {
      video.value.removeEventListener("play", handleVideoPlay);
      video.value.srcObject = null;
    }
    console.log("Video stream stopped.");
  }
}

// Get face descriptor
async function getFaceDescriptor() {
  try {
    const detections = await faceapi.detectSingleFace(video.value, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    console.log(detections)

    if (!detections) throw new Error('No face detected in the video.');

    alert("face detected")

    const resizedDetections = faceapi.resizeResults(detections, displaySize.value);

    canvas.value = createCanvasElement();
    faceapi.draw.drawDetections(canvas.value, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas.value, resizedDetections)

    const { descriptor } = detections;
    return descriptor;
    
  } catch (err) {
    console.error('Error getting face descriptor: ', err);
    throw err;
  }
}

// Create canvas element for drawing
function createCanvasElement() {
  const canvas = faceapi.createCanvasFromMedia(video.value);
  faceapi.matchDimensions(canvas, displaySize.value);
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.position = "absolute";
  canvas.style.zIndex = 1;
  canvas.style.top = 0;
  canvas.style.left = 0;
  video.value.insertAdjacentElement('afterend', canvas);
  console.log(canvas)
  return canvas;
}

// Handle video play event
async function handleVideoPlay() {
  if (props.action === "verify") {
    if (!props.storedFaceDescriptor || Object.keys(props.storedFaceDescriptor).length === 0) {
      error.value = { message: "No face descriptor found. Please capture a face first." };
      return;
    }
    await verifyFace();
  }

  if (props.action === "capture") {
    await captureFace();
  }
}

async function retry() {
  if (video.value) {
    stopVideoStream();
  }
  error.value = null;
  await loadModels();
  await startVideoStream();
  await handleVideoPlay()
}

onMounted(async () => {
  video.value.addEventListener("playing", handleVideoPlay);
  try {
    await loadModels();
    await startVideoStream();
  } catch (err) {
    console.error('Error starting video on mount:', err);
  }
});

onUnmounted(() => {
  stopVideoStream();
});
</script>


<template>
  <div class="grid gap-4">
    <div v-if="error" class="mt-2 gap-4 flex items-center justify-center">
      <Message>
        <div class="flex flex-col items-center justify-center gap-1">
          <p>{{ error.message }}</p>
          <Button label="Try again" icon="pi pi-refresh" size="small" @click="retry" />
        </div>
      </Message>
    </div>

    <div class="relative">
      <video id="faceid-video" ref="video" playsinline muted width="400" height="400"></video>
    </div>
  </div>
</template>

<style scoped>
.canvas {
  position: absolute;
  z-index: 20;
  left: 0;
  top: 0;
}
</style>

