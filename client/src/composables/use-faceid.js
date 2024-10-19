import * as faceapi from 'face-api.js';
import useFetch from "./fetch/use-fetch";

const options = {
  modelUrl: "/models",
  drawDetections: true,
};

export default class FaceId {
  constructor(videoRef, config = options) {
    this.video = typeof videoRef === "string" ? document.querySelector(videoRef) : videoRef.value;
    if (!this.video) {
      console.log("No video object found.");
    }
    this.config = config;
    this.stream = null;
    this.errors = [];
    this.faceDescriptor = null;

    this.displaySize = {
      width: this.video.width || 300,
      height: this.video.height || 300
    };

    // Event listener to start detection when video plays
    this.video.addEventListener("play", () => {
      this.getFaceDescriptor();
    });
  }

  // Start the video stream
  startVideoStream() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((mediaStream) => {
        this.stream = mediaStream;
        this.video.srcObject = this.stream;
        return this.stream;
      })
      .catch((err) => {
        this.errors.push({
          type: 'VideoStreamError',
          message: "Failed to start video stream",
          error: err
        });
        console.error("Error starting video stream:", err);
        return null;
      });
  }

  // Stop the video stream
  stopVideoStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      if (this.video) this.video.srcObject = null;
    }
  }

  // Load the face-api.js models
  async loadModels() {
    const MODEL_URL = this.config.modelUrl || '/models';
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      this.startVideoStream();
    } catch (error) {
      this.errors.push({
        type: 'ModelLoadError',
        message: "Failed to load face-api models",
        error: error
      });
      console.error("Error loading models:", error);
    }
  }

  // Create a canvas element to overlay the video feed
  createCanvasElement() {
    const canvas = faceapi.createCanvasFromMedia(this.video);
    canvas.style.position = "absolute";
    canvas.style.zIndex = 1;
    canvas.style.top = 0;
    canvas.style.left = 0;
    faceapi.matchDimensions(canvas, this.displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    this.video.insertAdjacentElement('afterend', canvas);
    return canvas;
  }

  // Get the face descriptor from the video feed
  async getFaceDescriptor() {
    try {
      const detections = await faceapi.detectSingleFace(this.video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        const resizedDetections = faceapi.resizeResults(detections, this.displaySize);

        if (this.config.drawDetections) {
          const canvas = this.createCanvasElement();
          faceapi.draw.drawDetections(canvas, resizedDetections);
        }

        this.faceDescriptor = resizedDetections[0].descriptor;
        return resizedDetections[0];
      } else {
        this.errors.push({
          type: 'NoFaceDetected',
          message: "No face detected in the current frame"
        });
        console.error("No face detected!");
        return null;
      }
    } catch (error) {
      this.errors.push({
        type: 'DetectionError',
        message: "Error during face detection",
        error: error
      });
      console.error("Error during face detection:", error);
    }
  }

  // Helper method for common fetch logic (both capture and verify)
  async handleFaceData(url, id, router, toast, method = 'POST', faceDescriptor = this.faceDescriptor) {
    if (!router || !toast) {
      this.errors.push({
        type: 'MissingDependency',
        message: "Missing router or toast instance"
      });
      console.error("Missing router or toast instance");
      return;
    }

    if (!faceDescriptor) {
      toast.add({
        severity: 'error', summary: 'Error', message: 'No face detected in the current frame', life: 5000
      });
      return;
    }

    return await useFetch(url, {
      router,
      toast,
      method,
      useBaseUrl: true,
      toastOnFailure: true,
      toastOnSuccess: method === 'POST',  // Only show success for POST (capture)
      toastLife: 5000,
      sendToken: false,
      body: method === 'POST' ? JSON.stringify({ faceDescriptor }) : undefined,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Capture the face descriptor and send it to the server
  async captureFace(id, router, toast) {
    const url = `/auth/user-face-descriptor/${id}`;
    const response = await this.handleFaceData(url, id, router, toast, 'POST');
    return response;
  }

  // Verify the current face descriptor against the stored one
  async verifyFace(id, router, toast) {
    const url = `/auth/user-face-descriptor/${id}`;
    const { data } = await this.handleFaceData(url, id, router, toast, 'GET');

    if (data.value) {
      const currentFaceDescriptor = this.faceDescriptor;
      const storedFaceDescriptor = data.value.faceDescriptor || data.value;
      const distance = faceapi.euclideanDistance(currentFaceDescriptor, storedFaceDescriptor);

      if (distance < 0.6) {
        return true;
      }
    }
    return false;
  }
}
