(() => {
  const CARD_STORAGE_KEY = 'produktorProductShareCardsV1';
  const DETECTION_COLORS = ['#ff4d4f', '#40a9ff', '#73d13d', '#ffa940', '#b37feb', '#13c2c2'];
  const detectorState = {
    detector: null,
    loader: null
  };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed loading ${src}`));
      document.head.appendChild(script);
    });
  }

  async function getDetector() {
    if (detectorState.detector) return detectorState.detector;
    if (!detectorState.loader) {
      detectorState.loader = (async () => {
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');
        await window.tf.ready();
        detectorState.detector = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
        return detectorState.detector;
      })();
    }
    return detectorState.loader;
  }

  function wait(ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
  }

  Vue.component('product-serve', {
    props: {
      app: { twoWay: true },
      countries: { twoWay: true },
      country: { twoWay: true },
      stage: {}
    },
    data: () => ({
      mode: 'camera',
      permissionError: '',
      detectorError: '',
      detectorReady: false,
      isCameraReady: false,
      isLoadingModel: false,
      isLoadingCamera: false,
      stream: null,
      videoDevices: [],
      activeDeviceId: '',
      detections: [],
      rafId: 0,
      lastPredictAt: 0,
      selectedCapture: null,
      candidates: [],
      isSearchingCandidates: false,
      selectedCandidate: null,
      draftCard: null,
      storedCards: [],
      swipeStartX: null,
      swipeStartY: null
    }),
    template: `
      <div class="product-share-shell" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
        <div class="product-share-stage">
          <video ref="video" class="product-share-video" autoplay muted playsinline></video>
          <canvas ref="overlay" class="product-share-overlay" @click="onOverlayTap"></canvas>
          <canvas ref="capture" class="product-share-capture-canvas"></canvas>

          <div class="product-share-topbar">
            <v-btn icon class="product-share-top-btn" @click="exitToMenu" aria-label="Back">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <div class="product-share-title-wrap">
              <div class="product-share-title">Share Product</div>
              <div class="product-share-subtitle">Tap a colored rectangle to capture item</div>
            </div>
            <v-btn
              icon
              class="product-share-top-btn"
              @click="switchCamera"
              :disabled="videoDevices.length < 2 || isLoadingCamera"
              aria-label="Switch camera"
            >
              <v-icon>mdi-camera-switch</v-icon>
            </v-btn>
          </div>

          <div class="product-share-status">
            <v-chip small label color="black" text-color="white">{{ isCameraReady ? 'Camera on' : 'Camera off' }}</v-chip>
            <v-chip small label color="black" text-color="white">{{ detectorReady ? 'Detection active' : 'Detection loading' }}</v-chip>
            <v-chip small label color="black" text-color="white">{{ detections.length }} objects</v-chip>
          </div>

          <div class="product-share-error" v-if="permissionError || detectorError">
            {{ permissionError || detectorError }}
          </div>
        </div>

        <div class="product-share-sheet">
          <div v-if="mode === 'camera'" class="product-share-sheet-block">
            <div class="product-share-sheet-title">Live Detection</div>
            <div class="product-share-sheet-text">
              Swipe left or tap back to return to menu. Tap any highlighted object to generate a product card.
            </div>
          </div>

          <div v-if="mode === 'results'" class="product-share-sheet-block">
            <div class="product-share-sheet-title">Pick Matching Result</div>
            <div class="product-share-picked-preview" v-if="selectedCapture">
              <img :src="selectedCapture.image" alt="Selected capture">
              <div>
                <div class="product-share-meta-line">{{ selectedCapture.label }}</div>
                <div class="product-share-meta-line">{{ Math.round(selectedCapture.confidence * 100) }}% confidence</div>
              </div>
            </div>
            <div class="product-share-sheet-text" v-if="isSearchingCandidates">Searching product matches...</div>
            <div class="product-share-results" v-else>
              <v-card
                v-for="item in candidates"
                :key="item.id"
                class="product-share-result-card"
                outlined
                @click="selectCandidate(item)"
              >
                <img class="product-share-result-image" :src="item.image" :alt="item.title">
                <div class="product-share-result-content">
                  <div class="product-share-result-title">{{ item.title }}</div>
                  <div class="product-share-result-description">{{ item.description }}</div>
                  <div class="product-share-result-price">{{ item.estimatedPrice }}</div>
                </div>
              </v-card>
            </div>
          </div>

          <div v-if="mode === 'card' && draftCard" class="product-share-sheet-block">
            <div class="product-share-sheet-title">Product Card</div>
            <div class="product-share-card-grid">
              <div>
                <div class="product-share-card-label">Original image</div>
                <img class="product-share-card-image" :src="draftCard.originalImage" alt="Original">
              </div>
              <div>
                <div class="product-share-card-label">Picked result image</div>
                <img class="product-share-card-image" :src="draftCard.resultImage" alt="Result">
              </div>
            </div>
            <div class="product-share-card-description">{{ draftCard.description }}</div>
            <div class="product-share-card-price">Estimated price: {{ draftCard.estimatedPrice }}</div>
            <div class="product-share-actions">
              <v-btn small outlined color="amber darken-2" @click="saveCard('postponed')">Postpone</v-btn>
              <v-btn small color="amber darken-2" dark @click="saveCard('stored')">Store</v-btn>
              <v-btn small text @click="cancelDraft">Cancel</v-btn>
            </div>
          </div>

          <div class="product-share-history" v-if="storedCards.length">
            <div class="product-share-history-title">Saved Cards</div>
            <div class="product-share-history-list">
              <div class="product-share-history-item" v-for="item in storedCards" :key="item.id">
                <img :src="item.originalImage" alt="Saved capture">
                <div>
                  <div>{{ item.description }}</div>
                  <div class="product-share-history-meta">{{ item.estimatedPrice }} - {{ item.status }}</div>
                </div>
                <v-btn icon small @click="restoreCard(item)" aria-label="Restore card">
                  <v-icon small>mdi-history</v-icon>
                </v-btn>
                <v-btn icon small @click="removeStoredCard(item.id)" aria-label="Delete card">
                  <v-icon small>mdi-close</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    methods: {
      async startExperience() {
        this.mode = 'camera';
        this.app.vue.drawer = false;
        this.app.vue.isShareCameraMode = true;
        await this.startCamera();
        await this.loadDetector();
        this.startDetectionLoop();
      },

      async startCamera(deviceId) {
        this.permissionError = '';
        this.isLoadingCamera = true;
        this.stopCamera();
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Media devices API is not available');
          }
          const constraints = {
            audio: false,
            video: deviceId
              ? { deviceId: { exact: deviceId } }
              : {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          this.stream = stream;
          const video = this.$refs.video;
          video.srcObject = stream;
          await video.play();
          await this.loadVideoDevices();
          this.activeDeviceId = stream.getVideoTracks()[0] ? stream.getVideoTracks()[0].getSettings().deviceId || '' : '';
          this.isCameraReady = true;
          this.syncCanvasSize();
        } catch (err) {
          this.permissionError = 'Unable to access camera. Please grant permissions and reopen Share.';
          this.isCameraReady = false;
        } finally {
          this.isLoadingCamera = false;
        }
      },

      async loadVideoDevices() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          this.videoDevices = [];
          return;
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.videoDevices = devices.filter(device => device.kind === 'videoinput');
      },

      async switchCamera() {
        if (this.videoDevices.length < 2 || this.isLoadingCamera) return;
        const currentIndex = this.videoDevices.findIndex(device => device.deviceId === this.activeDeviceId);
        const nextIndex = currentIndex >= 0
          ? (currentIndex + 1) % this.videoDevices.length
          : 0;
        const nextDevice = this.videoDevices[nextIndex];
        await this.startCamera(nextDevice.deviceId);
      },

      async loadDetector() {
        this.detectorError = '';
        this.isLoadingModel = true;
        try {
          await getDetector();
          this.detectorReady = true;
        } catch (err) {
          this.detectorError = 'Object detection model failed to load. Check network and try again.';
          this.detectorReady = false;
        } finally {
          this.isLoadingModel = false;
        }
      },

      startDetectionLoop() {
        this.stopDetectionLoop();
        const loop = async (time) => {
          this.rafId = requestAnimationFrame(loop);
          if (!this.isCameraReady || !this.detectorReady || this.mode !== 'camera') return;
          if (time - this.lastPredictAt < 320) return;
          this.lastPredictAt = time;
          await this.detectObjects();
        };
        this.rafId = requestAnimationFrame(loop);
      },

      async detectObjects() {
        const video = this.$refs.video;
        const captureCanvas = this.$refs.capture;
        const overlay = this.$refs.overlay;
        if (!video || !captureCanvas || !overlay || video.readyState < 2) return;

        this.syncCanvasSize();

        const captureCtx = captureCanvas.getContext('2d');
        captureCtx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

        const detector = await getDetector();
        const predictions = await detector.detect(captureCanvas, 12, 0.35);
        const scaleX = overlay.width / captureCanvas.width;
        const scaleY = overlay.height / captureCanvas.height;

        this.detections = predictions
          .filter(item => item.score >= 0.35)
          .map((item, index) => ({
            id: `${Date.now()}-${index}`,
            label: item.class,
            confidence: item.score,
            color: DETECTION_COLORS[index % DETECTION_COLORS.length],
            sourceBox: {
              x: item.bbox[0],
              y: item.bbox[1],
              width: item.bbox[2],
              height: item.bbox[3]
            },
            box: {
              x: item.bbox[0] * scaleX,
              y: item.bbox[1] * scaleY,
              width: item.bbox[2] * scaleX,
              height: item.bbox[3] * scaleY
            }
          }));

        this.drawDetections();
      },

      drawDetections() {
        const overlay = this.$refs.overlay;
        if (!overlay) return;
        const ctx = overlay.getContext('2d');
        ctx.clearRect(0, 0, overlay.width, overlay.height);

        this.detections.forEach(detection => {
          ctx.strokeStyle = detection.color;
          ctx.fillStyle = detection.color;
          ctx.lineWidth = 3;
          ctx.strokeRect(detection.box.x, detection.box.y, detection.box.width, detection.box.height);

          const caption = `${detection.label} ${Math.round(detection.confidence * 100)}%`;
          ctx.font = '12px sans-serif';
          const textWidth = ctx.measureText(caption).width + 12;
          const textX = Math.max(0, detection.box.x);
          const textY = Math.max(16, detection.box.y - 6);
          ctx.fillRect(textX, textY - 16, textWidth, 16);
          ctx.fillStyle = '#fff';
          ctx.fillText(caption, textX + 6, textY - 4);
        });
      },

      onOverlayTap(event) {
        if (this.mode !== 'camera') return;
        const overlay = this.$refs.overlay;
        const rect = overlay.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * overlay.width;
        const y = ((event.clientY - rect.top) / rect.height) * overlay.height;
        const hit = this.detections.find(item =>
          x >= item.box.x &&
          x <= item.box.x + item.box.width &&
          y >= item.box.y &&
          y <= item.box.y + item.box.height
        );
        if (!hit) return;
        this.captureDetection(hit);
      },

      captureDetection(detection) {
        const captureCanvas = this.$refs.capture;
        const cropCanvas = document.createElement('canvas');
        const box = detection.sourceBox;
        cropCanvas.width = Math.max(1, Math.floor(box.width));
        cropCanvas.height = Math.max(1, Math.floor(box.height));
        const cropCtx = cropCanvas.getContext('2d');
        cropCtx.drawImage(
          captureCanvas,
          Math.max(0, Math.floor(box.x)),
          Math.max(0, Math.floor(box.y)),
          Math.floor(box.width),
          Math.floor(box.height),
          0,
          0,
          cropCanvas.width,
          cropCanvas.height
        );
        this.selectedCapture = {
          image: cropCanvas.toDataURL('image/jpeg', 0.92),
          label: detection.label,
          confidence: detection.confidence
        };
        this.mode = 'results';
        this.fetchCandidates();
      },

      async fetchCandidates() {
        this.isSearchingCandidates = true;
        this.candidates = [];
        await wait(450);
        const category = this.selectedCapture ? this.selectedCapture.label : 'object';
        this.candidates = [
          {
            id: `cand-${Date.now()}-1`,
            title: `${category} set - premium`,
            description: `Popular ${category} style with durable material and family-safe design.`,
            estimatedPrice: '$18 - $25',
            image: 'https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9f?auto=format&fit=crop&w=800&q=80'
          },
          {
            id: `cand-${Date.now()}-2`,
            title: `${category} bundle - classic`,
            description: `Classic ${category} option frequently found in online listings.`,
            estimatedPrice: '$12 - $19',
            image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80'
          },
          {
            id: `cand-${Date.now()}-3`,
            title: `${category} model - collector`,
            description: `Collector style ${category} with richer colors and detailed finish.`,
            estimatedPrice: '$24 - $34',
            image: 'https://images.unsplash.com/photo-1608889175638-9322300c46f0?auto=format&fit=crop&w=800&q=80'
          }
        ];
        this.isSearchingCandidates = false;
      },

      selectCandidate(candidate) {
        this.selectedCandidate = candidate;
        this.draftCard = {
          id: `draft-${Date.now()}`,
          originalImage: this.selectedCapture.image,
          resultImage: candidate.image,
          description: candidate.description,
          estimatedPrice: candidate.estimatedPrice,
          sourceLabel: this.selectedCapture.label
        };
        this.mode = 'card';
      },

      saveCard(status) {
        if (!this.draftCard) return;
        const record = {
          ...this.draftCard,
          id: `card-${Date.now()}`,
          status,
          createdAt: new Date().toISOString()
        };
        this.storedCards = [record].concat(this.storedCards).slice(0, 50);
        localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(this.storedCards));
        this.resetDraft();
        this.mode = 'camera';
      },

      restoreCard(item) {
        this.draftCard = {
          originalImage: item.originalImage,
          resultImage: item.resultImage,
          description: item.description,
          estimatedPrice: item.estimatedPrice,
          sourceLabel: item.sourceLabel
        };
        this.mode = 'card';
      },

      removeStoredCard(id) {
        this.storedCards = this.storedCards.filter(item => item.id !== id);
        localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(this.storedCards));
      },

      cancelDraft() {
        this.resetDraft();
        this.mode = 'camera';
      },

      resetDraft() {
        this.selectedCapture = null;
        this.selectedCandidate = null;
        this.candidates = [];
        this.draftCard = null;
      },

      loadStoredCards() {
        const raw = localStorage.getItem(CARD_STORAGE_KEY);
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          this.storedCards = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          this.storedCards = [];
        }
      },

      syncCanvasSize() {
        const video = this.$refs.video;
        const overlay = this.$refs.overlay;
        const capture = this.$refs.capture;
        if (!video || !overlay || !capture) return;
        const viewportWidth = Math.max(1, Math.floor(video.clientWidth));
        const viewportHeight = Math.max(1, Math.floor(video.clientHeight));
        if (overlay.width !== viewportWidth || overlay.height !== viewportHeight) {
          overlay.width = viewportWidth;
          overlay.height = viewportHeight;
        }
        const streamWidth = Math.max(1, Math.floor(video.videoWidth || 1280));
        const streamHeight = Math.max(1, Math.floor(video.videoHeight || 720));
        if (capture.width !== streamWidth || capture.height !== streamHeight) {
          capture.width = streamWidth;
          capture.height = streamHeight;
        }
      },

      stopDetectionLoop() {
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = 0;
        }
      },

      stopCamera() {
        if (!this.stream) return;
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
        this.isCameraReady = false;
      },

      onTouchStart(event) {
        if (!event.changedTouches || !event.changedTouches[0]) return;
        this.swipeStartX = event.changedTouches[0].clientX;
        this.swipeStartY = event.changedTouches[0].clientY;
      },

      onTouchEnd(event) {
        if (this.swipeStartX === null || this.swipeStartY === null) return;
        if (!event.changedTouches || !event.changedTouches[0]) return;
        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;
        const deltaX = endX - this.swipeStartX;
        const deltaY = endY - this.swipeStartY;
        this.swipeStartX = null;
        this.swipeStartY = null;
        if (deltaX < -100 && Math.abs(deltaY) < 80) {
          this.exitToMenu();
        }
      },

      exitToMenu() {
        this.stopDetectionLoop();
        this.stopCamera();
        this.app.vue.isShareCameraMode = false;
        this.app.vue.currentFrame = null;
        this.app.vue.drawer = true;
      }
    },
    async mounted() {
      this.loadStoredCards();
      window.addEventListener('resize', this.syncCanvasSize);
      await this.startExperience();
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.syncCanvasSize);
      this.stopDetectionLoop();
      this.stopCamera();
      this.app.vue.isShareCameraMode = false;
    }
  });
})();
