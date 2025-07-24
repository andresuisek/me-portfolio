/* ===============================================
   WebGazer.js Eye Tracking Controller
   =============================================== */

// WebGazer Eye Tracking System
class EyeTrackingSystem {
  constructor() {
    this.isTracking = false;
    this.isCalibrating = false;
    this.showPrediction = false;
    this.calibrationPoints = [];
    this.currentCalibrationPoint = 0;
    this.calibrationData = {};
    this.accuracyData = [];
    this.minClicksPerPoint = 5;
    this.calibrationAccuracy = 0;

    // Heatmap data collection
    this.gazeData = [];
    this.trackingStartTime = null;
    this.trackingEndTime = null;
    this.heatmapInstance = null;
    this.pageScreenshot = null;

    // Calibration state
    this.isCalibrated = false;

    // Store original alert functions
    this.originalAlert = window.alert;
    this.originalConfirm = window.confirm;

    this.init();
  }

  suppressAlerts() {
    window.alert = () => {};
    window.confirm = () => true;
  }

  restoreAlerts() {
    window.alert = this.originalAlert;
    window.confirm = this.originalConfirm;
  }

  init() {
    // Wait for page to load
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.setupEventListeners()
      );
    } else {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // Initialize button states
    this.initializeButtonStates();
    // Main toggle button
    const toggleBtn = document.getElementById("webgazer-toggle");
    const menu = document.getElementById("webgazer-menu");

    toggleBtn?.addEventListener("click", () => {
      menu.classList.toggle("show");
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".webgazer-controls")) {
        menu?.classList.remove("show");
      }
    });

    // Menu buttons
    document
      .getElementById("calibrate-btn")
      ?.addEventListener("click", async () => {
        await this.startCalibration();
        menu.classList.remove("show");
      });

    document
      .getElementById("toggle-tracking-btn")
      ?.addEventListener("click", () => {
        if (this.isCalibrated) {
          this.toggleTracking();
        } else {
          this.showNotification(
            "Por favor, realiza la calibración antes de activar el seguimiento",
            "warning"
          );
        }
      });

    document
      .getElementById("toggle-prediction-btn")
      ?.addEventListener("click", () => {
        if (this.isCalibrated && this.isTracking) {
          this.togglePrediction();
        } else if (!this.isCalibrated) {
          this.showNotification(
            "Por favor, realiza la calibración antes de mostrar predicciones",
            "warning"
          );
        } else if (!this.isTracking) {
          this.showNotification(
            "Activa el seguimiento antes de mostrar predicciones",
            "warning"
          );
        }
      });

    // Calibration controls
    document
      .getElementById("skip-calibration")
      ?.addEventListener("click", async (e) => {
        e.preventDefault();
        await this.skipCalibration();
      });

    document
      .getElementById("restart-calibration")
      ?.addEventListener("click", async (e) => {
        e.preventDefault();
        await this.restartCalibration();
      });

    document
      .getElementById("finish-calibration")
      ?.addEventListener("click", async (e) => {
        e.preventDefault();
        await this.finishCalibration();
      });

    // Heatmap controls
    document.getElementById("close-heatmap")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.closeHeatmapOverlay();
    });

    document
      .getElementById("download-heatmap")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        this.downloadHeatmap();
      });

    document
      .getElementById("clear-heatmap-data")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        this.clearHeatmapData();
      });

    document
      .getElementById("toggle-heatmap-view")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleHeatmapView();
      });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "e") {
        e.preventDefault();
        this.toggleTracking();
      }
      if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        this.startCalibration();
      }
      if (e.key === "Escape") {
        this.closeAllOverlays();
      }
    });
  }

  async initializeWebGazer() {
    try {
      console.log("Inicializando WebGazer...");

      // Suppress WebGazer's built-in alerts
      this.suppressAlerts();

      // Pre-hide video element with CSS to prevent any visual flicker
      const style = document.createElement("style");
      style.id = "webgazer-init-hide";
      style.textContent = "#webgazerVideoFeed { display: none !important; }";
      document.head.appendChild(style);

      // Pre-configure WebGazer settings before initialization
      webgazer.showVideoPreview(false);
      webgazer.showPredictionPoints(false);
      webgazer.showFaceOverlay(false);
      webgazer.showFaceFeedbackBox(false);

      // Configure WebGazer
      await webgazer
        .setRegression("ridge")
        .setTracker("TFFacemesh")
        .setGazeListener((data, timestamp) => {
          if (data && this.showPrediction) {
            // The built-in dot will be shown automatically
          }

          // Collect gaze data for heatmap generation
          if (data && this.isTracking && !this.isCalibrating) {
            this.collectGazeData(data.x, data.y, timestamp);
          }
        })
        .begin();

      // Restore original alert and confirm functions
      this.restoreAlerts();

      // Ensure video preview remains hidden after initialization
      webgazer.showVideoPreview(false);
      webgazer.showPredictionPoints(false);
      webgazer.showFaceOverlay(false);
      webgazer.showFaceFeedbackBox(false);

      // Remove the temporary CSS hide style
      const hideStyle = document.getElementById("webgazer-init-hide");
      if (hideStyle) {
        hideStyle.remove();
      }

      console.log("WebGazer inicializado correctamente");
      return true;
    } catch (error) {
      console.error("Error inicializando WebGazer:", error);

      // Handle specific error types
      let errorMessage = "Error al inicializar el seguimiento ocular";
      if (
        error.name === "NotAllowedError" ||
        error.message.includes("Permission denied")
      ) {
        errorMessage =
          "Permisos de cámara denegados. Por favor permite el acceso a la cámara para usar el seguimiento ocular.";
      } else if (error.name === "NotFoundError") {
        errorMessage =
          "No se encontró ninguna cámara. Asegúrate de tener una cámara conectada.";
      } else if (error.name === "NotReadableError") {
        errorMessage =
          "Error al acceder a la cámara. La cámara podría estar siendo usada por otra aplicación.";
      }

      this.showNotification(errorMessage, "error");

      // Remove the temporary CSS hide style even on error
      const hideStyle = document.getElementById("webgazer-init-hide");
      if (hideStyle) {
        hideStyle.remove();
      }

      return false;
    }
  }

  async toggleTracking() {
    const trackingBtn = document.getElementById("toggle-tracking-btn");
    const statusText = document.getElementById("status-text");
    const statusIndicator = document.querySelector(
      ".tracking-status-indicator"
    );
    const mainBtn = document.getElementById("webgazer-toggle");

    if (!this.isTracking) {
      // Start tracking
      const initialized = await this.initializeWebGazer();
      if (initialized) {
        this.isTracking = true;
        this.trackingStartTime = Date.now();
        this.gazeData = []; // Reset gaze data

        // Capture screenshot of current page state
        await this.capturePageScreenshot();

        trackingBtn.querySelector("span").textContent =
          "Desactivar Seguimiento";
        statusText.textContent = "Seguimiento: Activado";
        statusIndicator.classList.add("active");
        mainBtn.classList.add("active");
        trackingBtn.classList.add("active");

        this.showNotification(
          this.isCalibrated
            ? "Seguimiento ocular activado - Recolectando datos para mapa de calor"
            : "Seguimiento activado sin calibración - Se recomienda calibrar primero para mejor precisión"
        );

        // Update button states
        this.updateButtonStates();
      }
    } else {
      // Stop tracking
      this.trackingEndTime = Date.now();
      this.isCalibrating = false;

      // Hide face overlay and feedback box
      webgazer.showFaceOverlay(false);
      webgazer.showFaceFeedbackBox(false);

      await webgazer.end();
      this.isTracking = false;
      trackingBtn.querySelector("span").textContent = "Activar Seguimiento";
      statusText.textContent = "Seguimiento: Desactivado";
      statusIndicator.classList.remove("active");
      mainBtn.classList.remove("active");
      trackingBtn.classList.remove("active");

      // Clean up video feed and close overlays
      this.moveVideoToDefaultPosition();
      this.hideVideoFeed();
      this.closeAllOverlays();

      // Show heatmap if we have collected data
      if (this.gazeData.length > 0) {
        setTimeout(() => {
          this.showHeatmapOverlay();
        }, 500);
        this.showNotification(
          `Seguimiento desactivado - Generando mapa de calor con ${this.gazeData.length} puntos`
        );
      } else {
        this.showNotification(
          "Seguimiento ocular desactivado - No se recolectaron datos"
        );
      }

      // Update button states
      this.updateButtonStates();
    }
  }

  togglePrediction() {
    this.showPrediction = !this.showPrediction;
    const predictionBtn = document.getElementById("toggle-prediction-btn");
    const predictionStatus = document.getElementById("prediction-status");

    if (this.showPrediction) {
      predictionStatus.textContent = "Ocultar Predicción";
      predictionBtn.classList.add("active");
      webgazer.showPredictionPoints(true);

      // Only show face overlay and feedback box, NOT the video feed
      webgazer.showFaceOverlay(true);
      webgazer.showFaceFeedbackBox(true);

      // Explicitly ensure video preview remains hidden
      webgazer.showVideoPreview(false);
    } else {
      predictionStatus.textContent = "Mostrar Predicción";
      predictionBtn.classList.remove("active");
      webgazer.showPredictionPoints(false);

      // Hide face overlay if not calibrating
      if (!this.isCalibrating) {
        webgazer.showFaceOverlay(false);
        webgazer.showFaceFeedbackBox(false);
      }

      // Ensure video preview is hidden when prediction is off
      webgazer.showVideoPreview(false);
    }
  }

  showVideoFeed() {
    // Show the webgazer video feed using WebGazer's built-in functionality
    webgazer.showVideoPreview(true);

    // Apply default position class when not in calibration
    setTimeout(() => {
      const videoFeed = document.getElementById("webgazerVideoFeed");
      if (videoFeed && !this.isCalibrating) {
        videoFeed.className = "default-position";
      }
    }, 500);
  }

  hideVideoFeed() {
    // Hide the webgazer video feed using WebGazer's built-in functionality
    webgazer.showVideoPreview(false);
  }

  moveVideoToCalibrationModal() {
    // Show video feed and face overlay for calibration
    webgazer.showVideoPreview(true);
    webgazer.showFaceOverlay(true);
    webgazer.showFaceFeedbackBox(true);

    setTimeout(() => {
      const videoFeed = document.getElementById("webgazerVideoFeed");
      const cameraContainer = document.getElementById(
        "calibration-camera-container"
      );
      const placeholder = cameraContainer?.querySelector(".camera-placeholder");

      if (videoFeed && cameraContainer) {
        // Hide placeholder and show video has been added
        if (placeholder) placeholder.style.display = "none";
        cameraContainer.classList.add("has-video");

        // Apply in-calibration styles and move to container
        videoFeed.className = "in-calibration";
        cameraContainer.appendChild(videoFeed);

        // Move face overlay to calibration container as well
        const faceOverlay = document.getElementById("webgazerFaceOverlay");
        const faceFeedbackBox = document.getElementById(
          "webgazerFaceFeedbackBox"
        );

        if (faceOverlay) {
          faceOverlay.style.position = "absolute";
          cameraContainer.appendChild(faceOverlay);
        }

        if (faceFeedbackBox) {
          faceFeedbackBox.style.position = "absolute";
          cameraContainer.appendChild(faceFeedbackBox);
        }
      }
    }, 500);
  }

  moveVideoToDefaultPosition() {
    // Hide face overlay and feedback box when leaving calibration
    if (!this.showPrediction) {
      webgazer.showFaceOverlay(false);
      webgazer.showFaceFeedbackBox(false);
    }

    setTimeout(() => {
      const videoFeed = document.getElementById("webgazerVideoFeed");
      const cameraContainer = document.getElementById(
        "calibration-camera-container"
      );
      const placeholder = cameraContainer?.querySelector(".camera-placeholder");
      const faceOverlay = document.getElementById("webgazerFaceOverlay");
      const faceFeedbackBox = document.getElementById(
        "webgazerFaceFeedbackBox"
      );

      if (videoFeed && cameraContainer) {
        // Show placeholder again and remove video indicator
        if (placeholder) placeholder.style.display = "flex";
        cameraContainer.classList.remove("has-video");

        // Move video back to body with appropriate styling
        if (videoFeed.parentElement === cameraContainer) {
          document.body.appendChild(videoFeed);
        }

        // Move face overlay and feedback box back to body
        if (faceOverlay && faceOverlay.parentElement === cameraContainer) {
          faceOverlay.style.position = "fixed";
          document.body.appendChild(faceOverlay);
        }

        if (
          faceFeedbackBox &&
          faceFeedbackBox.parentElement === cameraContainer
        ) {
          faceFeedbackBox.style.position = "fixed";
          document.body.appendChild(faceFeedbackBox);
        }

        // Apply default position if predictions are shown, otherwise hide completely
        if (this.showPrediction) {
          videoFeed.className = "default-position";
        } else {
          videoFeed.className = "";
          // Ensure video is completely hidden when prediction is not active
          webgazer.showVideoPreview(false);
        }
      }
    }, 100);
  }

  async startCalibration() {
    // Initialize WebGazer for calibration only (not for tracking)
    if (!this.isTracking) {
      const initialized = await this.initializeWebGazer();
      if (!initialized) return;
      // Don't set tracking to true - we only need WebGazer for calibration
    }

    // Suppress any potential WebGazer alerts during calibration
    this.suppressAlerts();

    this.isCalibrating = true;
    this.currentCalibrationPoint = 0;
    this.calibrationData = {};
    this.calibrationAccuracy = 0;

    // Show calibration overlay
    const overlay = document.getElementById("calibration-overlay");
    overlay.classList.add("show");

    // Move video feed to calibration modal
    this.moveVideoToCalibrationModal();

    // Generate calibration points (3x3 grid)
    this.generateCalibrationPoints();
    this.showNextCalibrationPoint();

    // Update calibration accuracy display
    this.updateCalibrationAccuracy(0);

    this.showNotification(
      "Calibración iniciada - Mira y haz clic en cada punto azul"
    );
  }

  generateCalibrationPoints() {
    const pointsContainer = document.getElementById("calibration-points");
    pointsContainer.innerHTML = "";

    this.calibrationPoints = [];

    // Create 3x3 grid of points with margins
    const margins = { x: 10, y: 10 }; // 10% margins
    const positions = [
      // Top row
      { x: margins.x, y: margins.y },
      { x: 50, y: margins.y },
      { x: 100 - margins.x, y: margins.y },
      // Middle row
      { x: margins.x, y: 50 },
      { x: 50, y: 50 },
      { x: 100 - margins.x, y: 50 },
      // Bottom row
      { x: margins.x, y: 100 - margins.y },
      { x: 50, y: 100 - margins.y },
      { x: 100 - margins.x, y: 100 - margins.y },
    ];

    positions.forEach((pos, index) => {
      const point = document.createElement("div");
      point.className = "calibration-point";
      point.style.left = `${pos.x}%`;
      point.style.top = `${pos.y}%`;
      point.style.display = "none";

      point.addEventListener("click", () => {
        this.handleCalibrationClick(index, pos.x, pos.y);
      });

      this.calibrationPoints.push({
        element: point,
        x: pos.x,
        y: pos.y,
        clicks: 0,
        completed: false,
      });

      pointsContainer.appendChild(point);
    });
  }

  showNextCalibrationPoint() {
    // Hide all points
    this.calibrationPoints.forEach((point) => {
      point.element.style.display = "none";
      point.element.classList.remove("current");
    });

    if (this.currentCalibrationPoint < this.calibrationPoints.length) {
      const currentPoint = this.calibrationPoints[this.currentCalibrationPoint];
      currentPoint.element.style.display = "block";
      currentPoint.element.classList.add("current");

      // Calculate pixel coordinates for WebGazer
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const pixelX = (currentPoint.x / 100) * windowWidth;
      const pixelY = (currentPoint.y / 100) * windowHeight;

      // Store for calibration
      if (!this.calibrationData[this.currentCalibrationPoint]) {
        this.calibrationData[this.currentCalibrationPoint] = {
          x: pixelX,
          y: pixelY,
          clicks: 0,
        };
      }
    }
  }

  handleCalibrationClick(pointIndex, percentX, percentY) {
    const point = this.calibrationPoints[pointIndex];
    point.clicks++;

    // Calculate pixel coordinates
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const pixelX = (percentX / 100) * windowWidth;
    const pixelY = (percentY / 100) * windowHeight;

    // Add calibration data to WebGazer
    webgazer.recordScreenPosition(pixelX, pixelY, "click");

    // Update calibration data
    this.calibrationData[pointIndex] = {
      x: pixelX,
      y: pixelY,
      clicks: point.clicks,
    };

    // Visual feedback
    point.element.style.transform = "translate(-50%, -50%) scale(1.2)";
    setTimeout(() => {
      point.element.style.transform = "translate(-50%, -50%) scale(1)";
    }, 200);

    // Check if point is completed
    if (point.clicks >= this.minClicksPerPoint) {
      point.completed = true;
      point.element.classList.add("completed");
      point.element.classList.remove("current");

      // Move to next point after delay
      setTimeout(() => {
        this.currentCalibrationPoint++;
        this.updateCalibrationProgress();

        if (this.currentCalibrationPoint < this.calibrationPoints.length) {
          this.showNextCalibrationPoint();
        } else {
          this.completeCalibration();
        }
      }, 500);
    }

    this.updateCalibrationProgress();
  }

  updateCalibrationProgress() {
    const completedPoints = this.calibrationPoints.filter(
      (p) => p.completed
    ).length;
    const totalPoints = this.calibrationPoints.length;
    const progress = (completedPoints / totalPoints) * 100;

    const progressFill = document.getElementById("calibration-progress-fill");
    const progressText = document.getElementById("calibration-progress-text");
    const finishBtn = document.getElementById("finish-calibration");

    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressText)
      progressText.textContent = `${completedPoints}/${totalPoints} puntos completados`;

    // Enable finish button if at least 5 points are completed
    if (finishBtn) {
      finishBtn.disabled = completedPoints < 5;
    }

    // Update calibration accuracy estimate
    this.updateCalibrationAccuracy(progress);
  }

  updateCalibrationAccuracy(progress) {
    // Estimate accuracy based on progress and click consistency
    const completedPoints = this.calibrationPoints.filter(
      (p) => p.completed
    ).length;
    let accuracyScore = 0;

    if (completedPoints > 0) {
      // Base accuracy on number of completed points
      const baseAccuracy =
        (completedPoints / this.calibrationPoints.length) * 70; // Max 70% from completion

      // Add bonus for consistent clicking (all points have minimum clicks)
      const consistencyBonus = completedPoints * 3; // 3% per completed point

      // Add bonus for having more than minimum clicks per point
      const extraClicksBonus =
        this.calibrationPoints.filter(
          (p) => p.completed && p.clicks > this.minClicksPerPoint
        ).length * 2; // 2% per point with extra clicks

      accuracyScore = Math.min(
        95,
        baseAccuracy + consistencyBonus + extraClicksBonus
      );
    }

    this.calibrationAccuracy = accuracyScore;

    // Update accuracy display
    const accuracyDisplay = document.getElementById("calibration-accuracy");
    if (accuracyDisplay) {
      accuracyDisplay.textContent = `${accuracyScore.toFixed(1)}%`;

      // Color code the accuracy
      if (accuracyScore >= 80) {
        accuracyDisplay.style.color = "#4caf50"; // Green
      } else if (accuracyScore >= 60) {
        accuracyDisplay.style.color = "#ff9800"; // Orange
      } else {
        accuracyDisplay.style.color = "#f44336"; // Red
      }
    }
  }

  completeCalibration() {
    // Hide all calibration points
    this.calibrationPoints.forEach((point) => {
      point.element.style.display = "none";
    });

    // Calculate final accuracy
    this.updateCalibrationAccuracy(100);

    this.showNotification(
      `¡Calibración completada! Precisión estimada: ${this.calibrationAccuracy.toFixed(
        1
      )}%`,
      "success"
    );

    // Enable finish button
    const finishBtn = document.getElementById("finish-calibration");
    if (finishBtn) {
      finishBtn.disabled = false;
      finishBtn.textContent = `Calibración Completada (${this.calibrationAccuracy.toFixed(
        1
      )}%) - Finalizar`;
    }
  }

  async finishCalibration() {
    // Save current scroll position
    const currentScrollX = window.scrollX;
    const currentScrollY = window.scrollY;

    this.isCalibrating = false;
    this.isCalibrated = true; // Mark as calibrated
    this.closeAllOverlays();

    // Move video back to default position or hide it
    this.moveVideoToDefaultPosition();

    // Always ensure video is hidden after calibration
    setTimeout(() => {
      this.hideVideoFeed();
    }, 150);

    // Stop WebGazer after calibration - user will restart it when ready to track
    if (!this.isTracking) {
      try {
        await webgazer.end();
      } catch (error) {
        console.log("WebGazer already ended or not initialized");
      }
    }

    // Enable tracking and prediction buttons
    this.updateButtonStates();

    // Restore alert functions
    this.restoreAlerts();

    // Restore scroll position to prevent unwanted scrolling
    setTimeout(() => {
      window.scrollTo(currentScrollX, currentScrollY);
    }, 10);

    this.showNotification(
      "¡Calibración completada! Ahora puedes activar el seguimiento cuando quieras empezar a recolectar datos",
      "success"
    );
  }

  async restartCalibration() {
    // If WebGazer was ended after previous calibration, reinitialize it
    if (!this.isTracking) {
      const initialized = await this.initializeWebGazer();
      if (!initialized) return;
    }

    this.currentCalibrationPoint = 0;
    this.calibrationData = {};
    this.calibrationAccuracy = 0;
    this.calibrationPoints.forEach((point) => {
      point.clicks = 0;
      point.completed = false;
      point.element.classList.remove("completed", "current");
    });

    this.updateCalibrationProgress();
    this.updateCalibrationAccuracy(0);
    this.showNextCalibrationPoint();
  }

  async skipCalibration() {
    // Save current scroll position
    const currentScrollX = window.scrollX;
    const currentScrollY = window.scrollY;

    this.isCalibrating = false;
    this.isCalibrated = true; // Mark as calibrated even if skipped
    this.closeAllOverlays();

    // Move video back to default position or hide it
    this.moveVideoToDefaultPosition();

    // Always ensure video is hidden after calibration
    setTimeout(() => {
      this.hideVideoFeed();
    }, 150);

    // Stop WebGazer after calibration - user will restart it when ready to track
    if (!this.isTracking) {
      try {
        await webgazer.end();
      } catch (error) {
        console.log("WebGazer already ended or not initialized");
      }
    }

    // Enable tracking and prediction buttons
    this.updateButtonStates();

    // Restore alert functions
    this.restoreAlerts();

    // Restore scroll position to prevent unwanted scrolling
    setTimeout(() => {
      window.scrollTo(currentScrollX, currentScrollY);
    }, 10);

    this.showNotification(
      "Calibración omitida - Puedes activar el seguimiento cuando quieras pero la precisión puede ser menor",
      "warning"
    );
  }

  startAccuracyTest() {
    const overlay = document.getElementById("accuracy-overlay");
    overlay.classList.add("show");

    this.accuracyData = [];
    this.generateAccuracyPoints();

    this.showNotification("Prueba de precisión iniciada");
  }

  generateAccuracyPoints() {
    const pointsContainer = document.getElementById("accuracy-points");
    pointsContainer.innerHTML = "";

    // Same positions as calibration but different styling
    const margins = { x: 15, y: 15 };
    const positions = [
      { x: margins.x, y: margins.y },
      { x: 50, y: margins.y },
      { x: 100 - margins.x, y: margins.y },
      { x: margins.x, y: 50 },
      { x: 50, y: 50 },
      { x: 100 - margins.x, y: 50 },
      { x: margins.x, y: 100 - margins.y },
      { x: 50, y: 100 - margins.y },
      { x: 100 - margins.x, y: 100 - margins.y },
    ];

    positions.forEach((pos, index) => {
      const point = document.createElement("div");
      point.className = "accuracy-point";
      point.style.left = `${pos.x}%`;
      point.style.top = `${pos.y}%`;

      point.addEventListener("click", () => {
        this.handleAccuracyClick(index, pos.x, pos.y, point);
      });

      pointsContainer.appendChild(point);
    });
  }

  handleAccuracyClick(pointIndex, percentX, percentY, element) {
    // Get current gaze prediction
    const gazeData = webgazer.getCurrentPrediction();

    if (gazeData) {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const actualX = (percentX / 100) * windowWidth;
      const actualY = (percentY / 100) * windowHeight;

      // Calculate distance between predicted and actual
      const distance = Math.sqrt(
        Math.pow(gazeData.x - actualX, 2) + Math.pow(gazeData.y - actualY, 2)
      );

      this.accuracyData.push({
        pointIndex,
        actualX,
        actualY,
        predictedX: gazeData.x,
        predictedY: gazeData.y,
        distance,
      });

      // Visual feedback
      element.classList.add("tested");

      this.updateAccuracyStats();
    } else {
      this.showNotification(
        "No se pudo obtener predicción de mirada",
        "warning"
      );
    }
  }

  updateAccuracyStats() {
    const testedPoints = this.accuracyData.length;
    const averageDistance =
      this.accuracyData.reduce((sum, data) => sum + data.distance, 0) /
      testedPoints;

    // Convert distance to percentage of screen
    const screenDiagonal = Math.sqrt(
      Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)
    );
    const accuracyPercentage = Math.max(
      0,
      100 - (averageDistance / screenDiagonal) * 100
    );

    document.getElementById(
      "average-accuracy"
    ).textContent = `${accuracyPercentage.toFixed(1)}%`;
    document.getElementById("points-tested").textContent = `${testedPoints}/9`;
  }

  closeAccuracyTest() {
    const overlay = document.getElementById("accuracy-overlay");
    overlay.classList.remove("show");
  }

  closeAllOverlays() {
    // Save current scroll position
    const currentScrollX = window.scrollX;
    const currentScrollY = window.scrollY;

    document.getElementById("calibration-overlay")?.classList.remove("show");
    document.getElementById("heatmap-overlay")?.classList.remove("show");
    this.isCalibrating = false;

    // Restore alert functions when closing overlays
    this.restoreAlerts();

    // Restore scroll position to prevent unwanted scrolling
    setTimeout(() => {
      window.scrollTo(currentScrollX, currentScrollY);
    }, 10);
  }

  updateTrackingUI() {
    const trackingBtn = document.getElementById("toggle-tracking-btn");
    const statusText = document.getElementById("status-text");
    const statusIndicator = document.querySelector(
      ".tracking-status-indicator"
    );
    const mainBtn = document.getElementById("webgazer-toggle");

    if (this.isTracking) {
      trackingBtn.querySelector("span").textContent = "Desactivar Seguimiento";
      statusText.textContent = "Seguimiento: Activado";
      statusIndicator.classList.add("active");
      mainBtn.classList.add("active");
      trackingBtn.classList.add("active");
    } else {
      trackingBtn.querySelector("span").textContent = "Activar Seguimiento";
      statusText.textContent = "Seguimiento: Desactivado";
      statusIndicator.classList.remove("active");
      mainBtn.classList.remove("active");
      trackingBtn.classList.remove("active");
    }
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `webgazer-notification ${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${
        type === "error"
          ? "#f44336"
          : type === "success"
          ? "#4caf50"
          : type === "warning"
          ? "#ff9800"
          : "#2196f3"
      };
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 25000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.style.opacity = "1";
    }, 100);

    // Hide and remove notification
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  initializeButtonStates() {
    const trackingBtn = document.getElementById("toggle-tracking-btn");
    const predictionBtn = document.getElementById("toggle-prediction-btn");

    // Disable buttons initially
    if (trackingBtn) {
      trackingBtn.classList.add("disabled");
      trackingBtn.title =
        "Realiza la calibración antes de activar el seguimiento";
      const span = trackingBtn.querySelector("span");
      if (span && !span.textContent.includes("🔒")) {
        span.textContent = "🔒 " + span.textContent;
      }
    }

    if (predictionBtn) {
      predictionBtn.classList.add("disabled");
      predictionBtn.title =
        "Realiza la calibración antes de mostrar predicciones";
      const span = predictionBtn.querySelector("span");
      if (span && !span.textContent.includes("🔒")) {
        span.textContent = "🔒 " + span.textContent;
      }
    }
  }

  updateButtonStates() {
    const trackingBtn = document.getElementById("toggle-tracking-btn");
    const predictionBtn = document.getElementById("toggle-prediction-btn");

    if (this.isCalibrated) {
      // Enable tracking button
      if (trackingBtn) {
        trackingBtn.classList.remove("disabled");
        trackingBtn.title = "Activar o desactivar el seguimiento ocular";
        const span = trackingBtn.querySelector("span");
        if (span && span.textContent.includes("🔒 ")) {
          span.textContent = span.textContent.replace("🔒 ", "");
        }
      }

      // Enable prediction button if tracking is active
      if (predictionBtn) {
        if (this.isTracking) {
          predictionBtn.classList.remove("disabled");
          predictionBtn.title = "Mostrar u ocultar el punto de predicción";
          const span = predictionBtn.querySelector("span");
          if (span && span.textContent.includes("🔒 ")) {
            span.textContent = span.textContent.replace("🔒 ", "");
          }
        } else {
          predictionBtn.classList.add("disabled");
          predictionBtn.title =
            "Activa el seguimiento antes de mostrar predicciones";
          const span = predictionBtn.querySelector("span");
          if (span && !span.textContent.includes("🔒")) {
            span.textContent = "🔒 " + span.textContent;
          }
        }
      }
    }
  }

  // Heatmap functionality
  collectGazeData(x, y, timestamp) {
    // Only collect data if coordinates are valid and within viewport
    if (x > 0 && y > 0 && x < window.innerWidth && y < window.innerHeight) {
      this.gazeData.push({
        x: Math.round(x),
        y: Math.round(y),
        value: 1,
        timestamp: timestamp,
      });
    }
  }

  showHeatmapOverlay() {
    const overlay = document.getElementById("heatmap-overlay");
    overlay.classList.add("show");

    this.generateHeatmap();
    this.updateHeatmapStats();
  }

  closeHeatmapOverlay() {
    // Save current scroll position
    const currentScrollX = window.scrollX;
    const currentScrollY = window.scrollY;

    const overlay = document.getElementById("heatmap-overlay");
    overlay.classList.remove("show");

    // Restore scroll position to prevent unwanted scrolling
    setTimeout(() => {
      window.scrollTo(currentScrollX, currentScrollY);
    }, 10);
  }

  generateHeatmap() {
    const container = document.getElementById("heatmap-canvas-container");

    // Clear previous heatmap
    container.innerHTML = "";

    if (this.gazeData.length === 0) {
      container.innerHTML = `
        <div class="heatmap-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V3H13V9H21Z"/>
          </svg>
          <p>No hay datos de seguimiento para mostrar</p>
        </div>
      `;
      return;
    }

    // Set container dimensions
    const containerWidth = container.offsetWidth;
    const containerHeight = Math.max(400, container.offsetHeight);

    // Add background image if available
    if (this.pageScreenshot) {
      const backgroundImg = document.createElement("img");
      backgroundImg.src = this.pageScreenshot;
      backgroundImg.className = "heatmap-background";
      backgroundImg.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        opacity: 0.7;
        z-index: 1;
      `;
      container.appendChild(backgroundImg);

      // Start with background visible
      container.classList.add("with-background");

      // Update toggle button text
      const toggleBtn = document.getElementById("toggle-heatmap-view");
      if (toggleBtn) {
        toggleBtn.textContent = "🎯 Solo Mapa de Calor";
      }
    }

    // Scale gaze data to container dimensions
    const scaledData = this.scaleGazeDataToContainer(
      this.gazeData,
      containerWidth,
      containerHeight
    );

    // Configure heatmap with higher opacity for better visibility over background
    const config = {
      container: container,
      radius: 40,
      maxOpacity: this.pageScreenshot ? 0.9 : 0.8, // Higher opacity if there's a background
      minOpacity: this.pageScreenshot ? 0.2 : 0.1,
      blur: 0.75,
      gradient: {
        0.25: "rgba(0, 0, 255, 1)",
        0.55: "rgba(0, 255, 0, 1)",
        0.85: "rgba(255, 255, 0, 1)",
        1.0: "rgba(255, 0, 0, 1)",
      },
    };

    // Create heatmap instance
    this.heatmapInstance = h337.create(config);

    // Set z-index for heatmap canvas to be above background
    setTimeout(() => {
      const heatmapCanvas = container.querySelector("canvas");
      if (heatmapCanvas) {
        heatmapCanvas.style.position = "relative";
        heatmapCanvas.style.zIndex = "2";
      }
    }, 100);

    // Process data to get proper heat values
    const processedData = this.processGazeData(scaledData);

    // Set heatmap data
    this.heatmapInstance.setData({
      max: processedData.max,
      min: 1,
      data: processedData.data,
    });
  }

  scaleGazeDataToContainer(gazeData, containerWidth, containerHeight) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    return gazeData.map((point) => ({
      x: Math.round((point.x / viewportWidth) * containerWidth),
      y: Math.round((point.y / viewportHeight) * containerHeight),
      value: point.value,
      timestamp: point.timestamp,
    }));
  }

  processGazeData(gazeData) {
    // Create a density map to count overlapping points
    const densityMap = new Map();
    let maxValue = 1;

    gazeData.forEach((point) => {
      // Create a key for nearby points (within 20px radius)
      const gridSize = 20;
      const gridX = Math.floor(point.x / gridSize) * gridSize;
      const gridY = Math.floor(point.y / gridSize) * gridSize;
      const key = `${gridX},${gridY}`;

      if (densityMap.has(key)) {
        const existingPoint = densityMap.get(key);
        existingPoint.value += 1;
        maxValue = Math.max(maxValue, existingPoint.value);
      } else {
        densityMap.set(key, {
          x: gridX + gridSize / 2,
          y: gridY + gridSize / 2,
          value: 1,
        });
      }
    });

    return {
      max: maxValue,
      data: Array.from(densityMap.values()),
    };
  }

  updateHeatmapStats() {
    const pointsCount = document.getElementById("heatmap-points-count");
    const duration = document.getElementById("heatmap-duration");
    const hotspot = document.getElementById("heatmap-hotspot");

    // Update points count
    pointsCount.textContent = this.gazeData.length.toLocaleString();

    // Update duration
    if (this.trackingStartTime && this.trackingEndTime) {
      const durationSeconds = Math.round(
        (this.trackingEndTime - this.trackingStartTime) / 1000
      );
      const minutes = Math.floor(durationSeconds / 60);
      const seconds = durationSeconds % 60;
      duration.textContent =
        minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    }

    // Find hotspot (area with most concentration)
    const hotspotArea = this.findHotspotArea();
    hotspot.textContent = hotspotArea;
  }

  findHotspotArea() {
    if (this.gazeData.length === 0) return "-";

    // Divide screen into sections and find the one with most points
    const sections = {
      "Superior Izquierda": { minX: 0, maxX: 0.33, minY: 0, maxY: 0.33 },
      "Superior Centro": { minX: 0.33, maxX: 0.67, minY: 0, maxY: 0.33 },
      "Superior Derecha": { minX: 0.67, maxX: 1, minY: 0, maxY: 0.33 },
      "Centro Izquierda": { minX: 0, maxX: 0.33, minY: 0.33, maxY: 0.67 },
      Centro: { minX: 0.33, maxX: 0.67, minY: 0.33, maxY: 0.67 },
      "Centro Derecha": { minX: 0.67, maxX: 1, minY: 0.33, maxY: 0.67 },
      "Inferior Izquierda": { minX: 0, maxX: 0.33, minY: 0.67, maxY: 1 },
      "Inferior Centro": { minX: 0.33, maxX: 0.67, minY: 0.67, maxY: 1 },
      "Inferior Derecha": { minX: 0.67, maxX: 1, minY: 0.67, maxY: 1 },
    };

    const sectionCounts = {};
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Initialize counts
    Object.keys(sections).forEach((section) => {
      sectionCounts[section] = 0;
    });

    // Count points in each section
    this.gazeData.forEach((point) => {
      const relativeX = point.x / viewportWidth;
      const relativeY = point.y / viewportHeight;

      Object.entries(sections).forEach(([sectionName, bounds]) => {
        if (
          relativeX >= bounds.minX &&
          relativeX < bounds.maxX &&
          relativeY >= bounds.minY &&
          relativeY < bounds.maxY
        ) {
          sectionCounts[sectionName]++;
        }
      });
    });

    // Find section with most points
    let maxSection = "Centro";
    let maxCount = 0;
    Object.entries(sectionCounts).forEach(([section, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxSection = section;
      }
    });

    return `${maxSection} (${maxCount} puntos)`;
  }

  downloadHeatmap() {
    if (!this.heatmapInstance) {
      this.showNotification("No hay mapa de calor para descargar", "error");
      return;
    }

    try {
      const container = document.getElementById("heatmap-canvas-container");
      const hasBackground = container.classList.contains("with-background");

      if (hasBackground && this.pageScreenshot) {
        // Create a composite image with background + heatmap
        this.downloadCompositeHeatmap();
      } else {
        // Download just the heatmap
        const dataURL = this.heatmapInstance.getDataURL();
        const link = document.createElement("a");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        link.download = `mapa-calor-${timestamp}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      this.showNotification("Mapa de calor descargado exitosamente", "success");
    } catch (error) {
      console.error("Error downloading heatmap:", error);
      this.showNotification("Error al descargar el mapa de calor", "error");
    }
  }

  downloadCompositeHeatmap() {
    const container = document.getElementById("heatmap-canvas-container");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // Draw background image
    const backgroundImg = new Image();
    backgroundImg.onload = () => {
      ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

      // Draw heatmap on top
      const heatmapImg = new Image();
      heatmapImg.onload = () => {
        ctx.drawImage(heatmapImg, 0, 0);

        // Download the composite
        const link = document.createElement("a");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        link.download = `mapa-calor-contexto-${timestamp}.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      heatmapImg.src = this.heatmapInstance.getDataURL();
    };
    backgroundImg.src = this.pageScreenshot;
  }

  clearHeatmapData() {
    this.gazeData = [];
    this.trackingStartTime = null;
    this.trackingEndTime = null;
    this.pageScreenshot = null;

    // Reset toggle button
    const toggleBtn = document.getElementById("toggle-heatmap-view");
    if (toggleBtn) {
      toggleBtn.textContent = "🖼️ Mostrar Contexto";
    }

    // Reset calibration state if user wants to start fresh
    // this.isCalibrated = false;
    // this.updateButtonStates();

    // Regenerate empty heatmap
    this.generateHeatmap();
    this.updateHeatmapStats();

    this.showNotification("Datos del mapa de calor eliminados", "success");
  }

  async capturePageScreenshot() {
    try {
      // Use html2canvas to capture the current page state
      if (typeof html2canvas !== "undefined") {
        const canvas = await html2canvas(document.body, {
          height: window.innerHeight,
          width: window.innerWidth,
          scrollX: 0,
          scrollY: 0,
          useCORS: true,
          scale: 0.5, // Reduce scale for better performance
        });
        this.pageScreenshot = canvas.toDataURL("image/png");
      } else {
        console.warn("html2canvas not available, using fallback");
        this.pageScreenshot = null;
      }
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      this.pageScreenshot = null;
    }
  }

  toggleHeatmapView() {
    const container = document.getElementById("heatmap-canvas-container");
    const toggleBtn = document.getElementById("toggle-heatmap-view");

    if (container.classList.contains("with-background")) {
      // Hide background
      container.classList.remove("with-background");
      toggleBtn.textContent = "🖼️ Mostrar Contexto";
    } else {
      // Show background
      container.classList.add("with-background");
      toggleBtn.textContent = "🎯 Solo Mapa de Calor";
    }
  }
}

// Initialize the eye tracking system
document.addEventListener("DOMContentLoaded", () => {
  // Small delay to ensure WebGazer script is loaded
  setTimeout(() => {
    if (typeof webgazer !== "undefined") {
      window.eyeTrackingSystem = new EyeTrackingSystem();
      console.log("Sistema de seguimiento ocular inicializado");
    } else {
      console.error("WebGazer no está disponible");
    }
  }, 1000);
});
