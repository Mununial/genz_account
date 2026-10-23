/**
 * Gen-Z University (GIET Campus) - 360° Virtual Campus Tour Engine
 * Powered by Pannellum WebGL Panorama Viewer and Custom Panoee-inspired UX HUD.
 */

(function () {
  'use strict';

  // Application State
  const state = {
    viewer: null,
    currentSceneId: null,
    isAutoRotating: false,
    isMuted: true,
    isDrawerOpen: false,
    activeCategory: 'all',
    searchQuery: '',
    audioContext: null,
    ambientGain: null,
    soundInterval: null,
    yawUpdateInterval: null,
    scenesMap: new Map(),
    history: []
  };

  // Landmark Mini-map coordinates (percentage x, y on aerial view)
  const MINIMAP_LANDMARKS = [
    { id: '6815d2cf6c2f130a9a4f06e3', name: 'Main Gate', x: 58, y: 72 },
    { id: '6815d2cf6c2f1358ad4f06e1', name: 'Campus Road', x: 55, y: 62 },
    { id: '6815d2d0b19103039ff66aa2', name: 'College Main Building', x: 51, y: 48 },
    { id: '6822ae72dc81c2b2925b339d', name: 'Reception & Atrium', x: 50, y: 45 },
    { id: '6815d2cf6c2f136ade4f06e2', name: 'Boys Hostel 1', x: 31, y: 46 },
    { id: '6815d2cfb191037f4df66a98', name: 'Boys Hostel 2 & 3', x: 38, y: 41 },
    { id: '6815d2d0b191034b27f66aa0', name: 'Girls Hostel', x: 62, y: 45 },
    { id: '6821ad7525527749cf35fe75', name: 'Basketball & Sports', x: 76, y: 72 },
    { id: '6815d2d0b1910329d1f66a9f', name: 'Campus Canteen', x: 44, y: 46 },
    { id: '68234980cbad8abf928dc846', name: 'Central Library', x: 53, y: 44 }
  ];

  // DOM Elements
  const el = {
    container: document.getElementById('panoramaContainer'),
    curtain: document.getElementById('transitionCurtain'),
    curtainText: document.getElementById('curtainText'),
    sceneTitle: document.getElementById('currentSceneTitle'),
    sceneCategory: document.getElementById('currentSceneCategory'),
    journeyContainer: document.getElementById('journeyBarContainer'),
    sceneDrawer: document.getElementById('sceneDrawer'),
    sceneCardsTrack: document.getElementById('sceneCardsTrack'),
    categoryFilterTrack: document.getElementById('categoryFilterTrack'),
    drawerSearchInput: document.getElementById('drawerSearchInput'),
    floorNavigator: document.getElementById('floorNavigator'),
    floorButtons: document.getElementById('floorButtons'),
    floorNavTitle: document.getElementById('floorNavTitle'),
    btnAutoRotate: document.getElementById('btnAutoRotate'),
    btnSound: document.getElementById('btnSound'),
    btnFullscreen: document.getElementById('btnFullscreen'),
    btnPrev: document.getElementById('btnPrevScene'),
    btnNext: document.getElementById('btnNextScene'),
    btnHome: document.getElementById('btnHomeScene'),
    btnInfo: document.getElementById('btnSceneInfo'),
    btnShare: document.getElementById('btnShareScene'),
    compassNeedle: document.getElementById('compassNeedle'),
    minimapDot: document.getElementById('minimapDot'),
    minimapCone: document.getElementById('minimapCone'),
    minimapWidget: document.getElementById('minimapWidget'),
    infoModal: document.getElementById('infoModal'),
    infoModalTitle: document.getElementById('infoModalTitle'),
    infoModalDesc: document.getElementById('infoModalDesc'),
    infoModalCategory: document.getElementById('infoModalCategory'),
    infoModalViewType: document.getElementById('infoModalViewType'),
    infoModalHotspots: document.getElementById('infoModalHotspots')
  };

  /**
   * Initialize Virtual Tour Engine
   */
  function init() {
    if (!window.CAMPUS_TOUR_DATA) {
      console.error('Campus tour data not loaded.');
      return;
    }

    // Index all scenes into map
    window.CAMPUS_TOUR_DATA.scenes.forEach(s => {
      state.scenesMap.set(s.id, s);
    });

    renderJourneyBar();
    renderCategories();
    renderSceneCards();
    setupMiniMap();
    setupEventListeners();

    // Determine initial scene from URL hash or default
    const hashMatch = window.location.hash.match(/scene=([a-zA-Z0-9_-]+)/);
    const initialId = (hashMatch && state.scenesMap.has(hashMatch[1]))
      ? hashMatch[1]
      : window.CAMPUS_TOUR_DATA.initialSceneId;

    loadScene(initialId, true);
    startTrackingYaw();
  }

  /**
   * Load Scene into Pannellum viewer
   */
  function loadScene(sceneId, isInitial = false, customPitch, customYaw) {
    const scene = state.scenesMap.get(sceneId);
    if (!scene) {
      console.warn('Scene not found:', sceneId);
      return;
    }

    state.currentSceneId = sceneId;
    window.location.hash = `scene=${sceneId}`;

    // Update curtain text
    if (el.curtainText) el.curtainText.textContent = `Entering ${scene.title}...`;
    if (el.curtain && !isInitial) el.curtain.classList.add('loading');

    // Update UI headers
    if (el.sceneTitle) el.sceneTitle.textContent = scene.title;
    if (el.sceneCategory) {
      const catObj = window.CAMPUS_TOUR_DATA.categories.find(c => c.id === scene.category);
      el.sceneCategory.textContent = catObj ? catObj.name : 'Campus Location';
    }

    updateActiveJourneyStep(sceneId);
    updateActiveDrawerCard(sceneId);
    updateFloorNavigator(scene);
    updateMiniMapPosition(sceneId);

    // Build pannellum hotspots
    const pannellumHotspots = (scene.hotspots || []).map(h => {
      return {
        pitch: h.pitch,
        yaw: h.yaw,
        type: 'custom',
        createTooltipFunc: createHotspotElement,
        createTooltipArgs: h
      };
    });

    const targetPitch = customPitch !== undefined ? customPitch : scene.defaultPitch;
    const targetYaw = customYaw !== undefined ? customYaw : scene.defaultYaw;
    const targetHfov = scene.defaultHfov || 100;

    if (!state.viewer) {
      // First-time initialization
      state.viewer = pannellum.viewer('panoramaContainer', {
        type: 'equirectangular',
        panorama: scene.panorama,
        autoLoad: true,
        pitch: targetPitch,
        yaw: targetYaw,
        hfov: targetHfov,
        minHfov: 50,
        maxHfov: 120,
        compass: true,
        showZoomCtrl: false,
        showFullscreenCtrl: false,
        mouseZoom: true,
        hotSpotDebug: false,
        hotSpots: pannellumHotspots,
        crossOrigin: 'anonymous'
      });

      state.viewer.on('load', onSceneLoaded);
      state.viewer.on('error', onSceneError);
    } else {
      // Switch panorama
      try {
        state.viewer.loadScene = undefined; // Ensure clean state
        // Re-initialize panorama for smooth equirectangular switch
        state.viewer.destroy();
        state.viewer = pannellum.viewer('panoramaContainer', {
          type: 'equirectangular',
          panorama: scene.panorama,
          autoLoad: true,
          pitch: targetPitch,
          yaw: targetYaw,
          hfov: targetHfov,
          minHfov: 50,
          maxHfov: 120,
          compass: true,
          showZoomCtrl: false,
          showFullscreenCtrl: false,
          mouseZoom: true,
          hotSpotDebug: false,
          hotSpots: pannellumHotspots,
          crossOrigin: 'anonymous'
        });

        state.viewer.on('load', onSceneLoaded);
        state.viewer.on('error', onSceneError);

        if (state.isAutoRotating) {
          state.viewer.startAutoRotate(-2);
        }
      } catch (err) {
        console.error('Error switching scene:', err);
        onSceneLoaded();
      }
    }
  }

  function onSceneLoaded() {
    setTimeout(() => {
      if (el.curtain) el.curtain.classList.remove('loading');
    }, 250);
  }

  function onSceneError(err) {
    console.warn('Pannellum scene load error:', err);
    if (el.curtain) el.curtain.classList.remove('loading');
    // If high-res or webp failed, retry with fallback if available
    const sc = state.scenesMap.get(state.currentSceneId);
    if (sc && sc.panoramaHighRes && sc.panorama !== sc.panoramaHighRes) {
      console.log('Retrying with alternative source...');
      sc.panorama = sc.panoramaHighRes;
      loadScene(sc.id);
    }
  }

  /**
   * Custom Hotspot Element Generator (Radar Beacon)
   */
  function createHotspotElement(wrapper, args) {
    wrapper.classList.add('custom-hotspot');

    const beacon = document.createElement('div');
    beacon.className = 'custom-hotspot-beacon';

    const pulse = document.createElement('div');
    pulse.className = 'custom-hotspot-pulse';

    const ring = document.createElement('div');
    ring.className = 'custom-hotspot-ring';

    // SVG Walking/Navigation Arrow or Information Icon
    if (args.type === 'scene') {
      ring.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      `;
    } else {
      ring.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'custom-hotspot-tooltip';
    tooltip.textContent = args.text || (args.type === 'scene' ? 'Step forward' : 'Point of Interest');

    beacon.appendChild(pulse);
    beacon.appendChild(ring);
    beacon.appendChild(tooltip);
    wrapper.appendChild(beacon);

    wrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      if (args.type === 'scene' && args.sceneId) {
        loadScene(args.sceneId);
      } else if (args.infoText || args.text) {
        showInfoModal(args.text, args.infoText || `Location hotspot information at this viewpoint.`);
      }
    });
  }

  /**
   * Render Guided Visitor Journey Bar
   */
  function renderJourneyBar() {
    if (!el.journeyContainer || !window.CAMPUS_TOUR_DATA.journey) return;
    el.journeyContainer.innerHTML = '';

    const label = document.createElement('div');
    label.className = 'journey-label';
    label.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
      </svg>
      <span>Visitor Journey:</span>
    `;
    el.journeyContainer.appendChild(label);

    window.CAMPUS_TOUR_DATA.journey.forEach(step => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'journey-step-chip';
      chip.dataset.sceneId = step.id;
      chip.innerHTML = `
        <span class="journey-step-number">${step.step}</span>
        <span>${step.title}</span>
      `;
      chip.addEventListener('click', () => {
        loadScene(step.id);
      });
      el.journeyContainer.appendChild(chip);
    });
  }

  function updateActiveJourneyStep(sceneId) {
    if (!el.journeyContainer) return;
    const chips = el.journeyContainer.querySelectorAll('.journey-step-chip');
    chips.forEach(c => {
      if (c.dataset.sceneId === sceneId) {
        c.classList.add('active');
        c.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        c.classList.remove('active');
      }
    });
  }

  /**
   * Render Drawer Categories
   */
  function renderCategories() {
    if (!el.categoryFilterTrack || !window.CAMPUS_TOUR_DATA.categories) return;
    el.categoryFilterTrack.innerHTML = '';

    window.CAMPUS_TOUR_DATA.categories.forEach(cat => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `category-chip ${cat.id === state.activeCategory ? 'active' : ''}`;
      chip.textContent = cat.name;
      chip.addEventListener('click', () => {
        state.activeCategory = cat.id;
        document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderSceneCards();
      });
      el.categoryFilterTrack.appendChild(chip);
    });
  }

  /**
   * Render Scene Cards in Drawer
   */
  function renderSceneCards() {
    if (!el.sceneCardsTrack || !window.CAMPUS_TOUR_DATA.scenes) return;
    el.sceneCardsTrack.innerHTML = '';

    const query = state.searchQuery.toLowerCase().trim();
    const filtered = window.CAMPUS_TOUR_DATA.scenes.filter(s => {
      const matchCat = state.activeCategory === 'all' || s.category === state.activeCategory;
      const matchQuery = !query || s.title.toLowerCase().includes(query) || (s.description && s.description.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      el.sceneCardsTrack.innerHTML = `<div style="padding: 1.5rem; color: #94A3B8; font-size: 0.85rem;">No campus scenes found matching your query.</div>`;
      return;
    }

    filtered.forEach(sc => {
      const card = document.createElement('div');
      card.className = `scene-card ${sc.id === state.currentSceneId ? 'active' : ''}`;
      card.dataset.sceneId = sc.id;

      card.innerHTML = `
        <div class="scene-card-thumb-wrap">
          <img src="${sc.thumbnail}" alt="${sc.title}" loading="lazy" onerror="this.src='/assets/college-campus.jpg'">
          <div class="scene-card-badge">360°</div>
        </div>
        <div class="scene-card-content">
          <div class="scene-card-title">${sc.title}</div>
          <div class="scene-card-sub">${sc.journeyName || getCategoryLabel(sc.category)}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        loadScene(sc.id);
        toggleDrawer(false);
      });

      el.sceneCardsTrack.appendChild(card);
    });
  }

  function getCategoryLabel(catId) {
    const c = window.CAMPUS_TOUR_DATA.categories.find(item => item.id === catId);
    return c ? c.name : 'Campus Area';
  }

  function updateActiveDrawerCard(sceneId) {
    if (!el.sceneCardsTrack) return;
    const cards = el.sceneCardsTrack.querySelectorAll('.scene-card');
    cards.forEach(c => {
      if (c.dataset.sceneId === sceneId) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });
  }

  /**
   * Floor & Zone Navigator (for Hostels & Academic Complex)
   */
  function updateFloorNavigator(scene) {
    if (!el.floorNavigator || !el.floorButtons) return;

    // Check if current scene is in Hostels
    const isBoysHostel = scene.title.includes("Boy's Hostel") || scene.title.includes("Boys' Hostel") || scene.title.includes("Hostel Room") || scene.title.includes("Inside Hostel");
    const isGirlsHostel = scene.title.includes("Girl's Hostel") || scene.title.includes("Girls' Hostel") || scene.title.includes("Girls Room");
    const isAcademic = scene.category === 'academic' || scene.category === 'admin';

    if (isBoysHostel) {
      el.floorNavigator.style.display = 'flex';
      el.floorNavTitle.textContent = "Boys' Hostel Navigation";
      el.floorButtons.innerHTML = `
        <button type="button" class="floor-btn ${scene.id === '6815d2cf6c2f136ade4f06e2' ? 'active' : ''}" data-target="6815d2cf6c2f136ade4f06e2">
          <span>Hostel Exterior</span>
          <span>🏢</span>
        </button>
        <button type="button" class="floor-btn ${scene.id === '6821b0352ef77c0fb1b39e6f' ? 'active' : ''}" data-target="6821b0352ef77c0fb1b39e6f">
          <span>Hostel Corridor</span>
          <span>🚪</span>
        </button>
        <button type="button" class="floor-btn ${scene.id === '6821b035255277091735febf' ? 'active' : ''}" data-target="6821b035255277091735febf">
          <span>Student Room</span>
          <span>🛏️</span>
        </button>
      `;
      bindFloorButtons();
    } else if (isGirlsHostel) {
      el.floorNavigator.style.display = 'flex';
      el.floorNavTitle.textContent = "Girls' Hostel Navigation";
      el.floorButtons.innerHTML = `
        <button type="button" class="floor-btn ${scene.id === '6815d2d0b191034b27f66aa0' ? 'active' : ''}" data-target="6815d2d0b191034b27f66aa0">
          <span>Hostel Exterior</span>
          <span>🏢</span>
        </button>
        <button type="button" class="floor-btn ${scene.id === '6821b2092ef77c5892b39ed1' ? 'active' : ''}" data-target="6821b2092ef77c5892b39ed1">
          <span>Girls' Room</span>
          <span>🛏️</span>
        </button>
      `;
      bindFloorButtons();
    } else if (isAcademic && (scene.title.includes('Reception') || scene.title.includes('Atrium') || scene.title.includes('Corridor') || scene.title.includes('Principal') || scene.title.includes('Library'))) {
      el.floorNavigator.style.display = 'flex';
      el.floorNavTitle.textContent = "Academic Hub Areas";
      el.floorButtons.innerHTML = `
        <button type="button" class="floor-btn ${scene.id === '6822ae72dc81c2b2925b339d' ? 'active' : ''}" data-target="6822ae72dc81c2b2925b339d">
          <span>Reception Foyer</span>
          <span>🏛️</span>
        </button>
        <button type="button" class="floor-btn ${scene.id === '6822ae72dc81c2a4175b338a' ? 'active' : ''}" data-target="6822ae72dc81c2a4175b338a">
          <span>Central Atrium</span>
          <span>📍</span>
        </button>
        <button type="button" class="floor-btn ${scene.id === '68234980cbad8abf928dc846' ? 'active' : ''}" data-target="68234980cbad8abf928dc846">
          <span>Central Library</span>
          <span>📚</span>
        </button>
        <button type="button" class="floor-btn ${scene.id === '6822ae722552770374360c9e' ? 'active' : ''}" data-target="6822ae722552770374360c9e">
          <span>Principal Office</span>
          <span>🎓</span>
        </button>
      `;
      bindFloorButtons();
    } else {
      el.floorNavigator.style.display = 'none';
    }
  }

  function bindFloorButtons() {
    el.floorButtons.querySelectorAll('.floor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        if (targetId) loadScene(targetId);
      });
    });
  }

  /**
   * Campus Mini-Map Setup
   */
  function setupMiniMap() {
    const mapBody = document.querySelector('.minimap-body');
    if (!mapBody) return;

    // Render clickable landmark pins
    MINIMAP_LANDMARKS.forEach(lm => {
      const pin = document.createElement('div');
      pin.className = 'minimap-pin';
      pin.style.left = `${lm.x}%`;
      pin.style.top = `${lm.y}%`;
      pin.title = lm.name;
      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        loadScene(lm.id);
      });
      mapBody.appendChild(pin);
    });
  }

  function updateMiniMapPosition(sceneId) {
    if (!el.minimapDot) return;
    const landmark = MINIMAP_LANDMARKS.find(lm => lm.id === sceneId);
    if (landmark) {
      el.minimapDot.style.left = `${landmark.x}%`;
      el.minimapDot.style.top = `${landmark.y}%`;
      el.minimapDot.style.display = 'block';
    } else {
      // Default to approximate center of campus
      el.minimapDot.style.left = '50%';
      el.minimapDot.style.top = '50%';
    }
  }

  function startTrackingYaw() {
    state.yawUpdateInterval = setInterval(() => {
      if (!state.viewer) return;
      try {
        const yaw = state.viewer.getYaw();
        // Update compass
        if (el.compassNeedle) {
          el.compassNeedle.style.transform = `rotate(${-yaw}deg)`;
        }
        // Update minimap radar cone
        if (el.minimapCone) {
          el.minimapCone.style.transform = `translate(-50%, -50%) rotate(${yaw}deg)`;
        }
      } catch (e) {
        // Viewer might be loading
      }
    }, 60);
  }

  /**
   * Sound Ambiance Generator (Web Audio API - 100% Offline Reliable)
   */
  function toggleSound() {
    state.isMuted = !state.isMuted;
    if (el.btnSound) {
      el.btnSound.classList.toggle('active', !state.isMuted);
      el.btnSound.title = state.isMuted ? 'Enable Sound' : 'Mute Sound';
      el.btnSound.innerHTML = state.isMuted
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
    }

    if (!state.isMuted) {
      startAmbientAudio();
    } else {
      stopAmbientAudio();
    }
  }

  function startAmbientAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!state.audioContext) state.audioContext = new AudioCtx();
      if (state.audioContext.state === 'suspended') state.audioContext.resume();

      // Soft harmonic campus drone
      const osc1 = state.audioContext.createOscillator();
      const osc2 = state.audioContext.createOscillator();
      const gain = state.audioContext.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(220, state.audioContext.currentTime); // A3

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(329.63, state.audioContext.currentTime); // E4

      gain.gain.setValueAtTime(0.04, state.audioContext.currentTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(state.audioContext.destination);

      osc1.start();
      osc2.start();
      state.ambientGain = gain;
      state.activeOscs = [osc1, osc2];
    } catch (e) {
      console.warn('Audio synthesis notice:', e);
    }
  }

  function stopAmbientAudio() {
    if (state.activeOscs) {
      state.activeOscs.forEach(o => {
        try { o.stop(); o.disconnect(); } catch (err) {}
      });
      state.activeOscs = null;
    }
  }

  /**
   * Auto-rotate toggle
   */
  function toggleAutoRotate() {
    state.isAutoRotating = !state.isAutoRotating;
    if (el.btnAutoRotate) {
      el.btnAutoRotate.classList.toggle('active', state.isAutoRotating);
    }
    if (state.viewer) {
      if (state.isAutoRotating) {
        state.viewer.startAutoRotate(-2);
      } else {
        state.viewer.stopAutoRotate();
      }
    }
  }

  /**
   * Fullscreen toggle
   */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      if (el.btnFullscreen) el.btnFullscreen.classList.add('active');
    } else {
      document.exitFullscreen().catch(() => {});
      if (el.btnFullscreen) el.btnFullscreen.classList.remove('active');
    }
  }

  /**
   * Scene Drawer Toggle
   */
  function toggleDrawer(forceState) {
    state.isDrawerOpen = typeof forceState === 'boolean' ? forceState : !state.isDrawerOpen;
    if (el.sceneDrawer) {
      el.sceneDrawer.classList.toggle('open', state.isDrawerOpen);
    }
    const btnDrawer = document.getElementById('btnToggleDrawer');
    if (btnDrawer) {
      btnDrawer.classList.toggle('active', state.isDrawerOpen);
    }
  }

  /**
   * Information Modal
   */
  function showInfoModal(title, desc) {
    const scene = state.scenesMap.get(state.currentSceneId);
    if (!el.infoModal) return;

    if (el.infoModalTitle) el.infoModalTitle.textContent = title || (scene ? scene.title : 'Campus Scene');
    if (el.infoModalDesc) el.infoModalDesc.textContent = desc || (scene ? scene.description : '');
    if (el.infoModalCategory) el.infoModalCategory.textContent = scene ? getCategoryLabel(scene.category) : 'General';
    if (el.infoModalViewType) el.infoModalViewType.textContent = '360° Equirectangular Sphere';
    if (el.infoModalHotspots) el.infoModalHotspots.textContent = scene ? `${(scene.hotspots || []).length} Connected Paths` : '0';

    el.infoModal.classList.add('open');
  }

  function closeInfoModal() {
    if (el.infoModal) el.infoModal.classList.remove('open');
  }

  /**
   * Next / Prev Navigation
   */
  function navigateNext() {
    const scenes = window.CAMPUS_TOUR_DATA.scenes;
    const currentIdx = scenes.findIndex(s => s.id === state.currentSceneId);
    const nextIdx = (currentIdx + 1) % scenes.length;
    loadScene(scenes[nextIdx].id);
  }

  function navigatePrev() {
    const scenes = window.CAMPUS_TOUR_DATA.scenes;
    const currentIdx = scenes.findIndex(s => s.id === state.currentSceneId);
    const prevIdx = (currentIdx - 1 + scenes.length) % scenes.length;
    loadScene(scenes[prevIdx].id);
  }

  function resetView() {
    loadScene(window.CAMPUS_TOUR_DATA.initialSceneId);
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Zoom controls
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        if (state.viewer) state.viewer.setHfov(state.viewer.getHfov() - 10);
      });
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        if (state.viewer) state.viewer.setHfov(state.viewer.getHfov() + 10);
      });
    }

    if (el.btnAutoRotate) el.btnAutoRotate.addEventListener('click', toggleAutoRotate);
    if (el.btnSound) el.btnSound.addEventListener('click', toggleSound);
    if (el.btnFullscreen) el.btnFullscreen.addEventListener('click', toggleFullscreen);
    if (el.btnNext) el.btnNext.addEventListener('click', navigateNext);
    if (el.btnPrev) el.btnPrev.addEventListener('click', navigatePrev);
    if (el.btnHome) el.btnHome.addEventListener('click', resetView);
    if (el.btnInfo) el.btnInfo.addEventListener('click', () => showInfoModal());

    if (el.btnShare) {
      el.btnShare.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert('Link to this 360° campus scene copied to clipboard!');
        }).catch(() => {
          prompt('Copy link to this scene:', window.location.href);
        });
      });
    }

    const btnToggleDrawer = document.getElementById('btnToggleDrawer');
    if (btnToggleDrawer) {
      btnToggleDrawer.addEventListener('click', () => toggleDrawer());
    }

    const btnCloseDrawer = document.getElementById('btnCloseDrawer');
    if (btnCloseDrawer) {
      btnCloseDrawer.addEventListener('click', () => toggleDrawer(false));
    }

    if (el.drawerSearchInput) {
      el.drawerSearchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderSceneCards();
      });
    }

    // Mini-map collapse toggle
    const minimapHeader = document.querySelector('.minimap-header');
    if (minimapHeader && el.minimapWidget) {
      minimapHeader.addEventListener('click', () => {
        el.minimapWidget.classList.toggle('collapsed');
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') navigateNext();
      if (e.key === 'ArrowLeft') navigatePrev();
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggleAutoRotate();
      }
      if (e.key === 'Escape') {
        toggleDrawer(false);
        closeInfoModal();
      }
    });

    // Close modal on click outside
    if (el.infoModal) {
      el.infoModal.addEventListener('click', (e) => {
        if (e.target === el.infoModal) closeInfoModal();
      });
    }

    const btnCloseModal = document.getElementById('btnCloseModal');
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeInfoModal);

    // Compass click resets north (yaw 0)
    const compassWidget = document.getElementById('compassWidget');
    if (compassWidget) {
      compassWidget.addEventListener('click', () => {
        if (state.viewer) state.viewer.setYaw(0);
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging & testing
  window.VirtualTour = {
    loadScene,
    getState: () => state
  };
})();
