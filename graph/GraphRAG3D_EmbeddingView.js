/**
 * GraphRAG 3D Embedding View
 *
 * Dual-mode visualization:
 * 1. Fixed Embedding View - Shows global semantic structure using UMAP positions
 * 2. Force-Directed View - Local graph exploration with physics simulation
 *
 * Features:
 * - Graph-enriched UMAP 3D positioning
 * - Fresnel shader cluster membranes (cellular aesthetic)
 * - Context lens hover preview (non-destructive)
 * - Betweenness centrality coloring
 * - GPU-accelerated rendering with instancing
 */

class GraphRAG3DEmbeddingView {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);

        // Visualization state - store hash mode for deferred application after init
        this.initialModeFromHash = this.getInitialModeFromHash();
        this.mode = 'semantic'; // Always start with semantic, will switch after init if hash specifies different

        // EARLY CONTAINER HIDING: If a 2D mode is in the URL hash, hide the 3D container immediately
        // to prevent a flash of 3D dots before the 2D view loads
        const twoDModes = ['circle-pack', 'voronoi', 'voronoi-2', 'voronoi-3', 'voronoi4', 'voronoi5', 'stricttreemap', 'hierarchical'];
        if (this.initialModeFromHash && twoDModes.includes(this.initialModeFromHash)) {
            console.log(`2D mode detected in URL hash (${this.initialModeFromHash}), hiding 3D container early`);
            const graphContainer = document.getElementById('graph-container');
            const svgContainer = document.getElementById('svg-container-2d');
            if (graphContainer) graphContainer.classList.add('hidden');
            if (svgContainer) svgContainer.classList.add('active');
        }
        this.data = null;
        this.graph = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentLayout = 'semantic';
        this.transitionDuration = 1500;
        this.activeTransitions = [];

        // Data structures
        this.entities = new Map();
        this.relationships = [];
        this.clusters = {
            level_0: [], // Individual entities
            level_1: [], // Fine clusters (300)
            level_2: [], // Medium clusters (30)
            level_3: []  // Coarse clusters (7)
        };

        // Visual elements
        this.entityMeshes = [];
        this.clusterMeshes = [];
        this.connectionLines = [];
        this.entityMeshMap = new Map();
        this.displayedEntityIds = new Set();

        // Color modes
        this.colorMode = 'type'; // 'type', 'centrality', or 'l3cluster'

        // L3 cluster coloring
        this.entityToL3Cluster = new Map(); // entity name -> L3 cluster ID
        this.l3ClusterColors = new Map();   // L3 cluster ID -> color hex
        this.centralityColors = {
            low: 0x00FF88,    // Bright green (low centrality)
            mid: 0x00DDFF,    // Cyan (medium centrality)
            high: 0x0088FF    // Blue (high centrality)
        };
        this.sizeMode = 'betweenness'; // default to betweenness; other option: 'connectivity'
        this.edgeStyles = {
            defaultColor: 0x00DDFF, // Bright cyan - visible on dark background
            attributionColor: 0xFF6B9D,
            minWidth: 0.25,
            maxWidth: 2.0
        };

        // Scene bounds
        this.boundingRadius = 150;

        // Connectivity stats
        this.connectivityStats = {
            minDegree: 0,
            maxDegree: 0,
            minWeighted: 0,
            maxWeighted: 0,
            minBetweenness: 0,
            maxBetweenness: 0
        };

        // Selection state
        this.selectedEntity = null;
        this.hoveredEntity = null;
        this.visibleEntities = new Set();
        this.labelSprites = [];
        this.clusterMeshes = [];
        this.connectionLines = [];
        this.clusterLabelSprites = [];

        // Layout datasets
        this.graphsageLayout = {};
        this.forceLayout = {};
        this.hasContextualLayout = false;
        this.hasForceLayout = false;

        // Community ID mapping (robust labels from community_summaries.json)
        this.communityIdMapping = {};

        // Force simulation state
        this.forceSimulation = null;
        this.forceLinkForce = null;
        this.forceNodes = [];
        this.forceLinks = [];
        this.d3Force = null;

        // Cluster maintenance
        this.clusterLookup = {
            level_1: new Map(),
            level_2: new Map(),
            level_3: new Map()
        };
        this.pendingMembraneUpdate = false;
        this.membraneRefreshTimeout = null;

        // Performance monitoring
        this.frameCount = 0;
        this.lastFPSUpdate = Date.now();
        this.animationFrameId = null;

        // Entity type colors
        this.typeColors = {
            'PERSON': 0x4CAF50,
            'ORGANIZATION': 0x2196F3,
            'CONCEPT': 0x9C27B0,
            'PRACTICE': 0xFF9800,
            'PRODUCT': 0xF44336,
            'PLACE': 0x00BCD4,
            'EVENT': 0xFFEB3B,
            'WORK': 0x795548,
            'CLAIM': 0xE91E63
        };

        // Track which hierarchy key names were detected (Leiden vs. legacy)
        this.hierarchyKeyMap = {
            L0: null,
            L1: null,
            L2: null,
            L3: null
        };

        // Entity type visibility
        this.typeVisibility = {};
        Object.keys(this.typeColors).forEach(type => {
            this.typeVisibility[type] = true;
        });

        // Node size mode options
        this.sizeModes = ['connectivity', 'betweenness'];

        // Mobile safety flags
        this.isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        this.mobileNodeLimit = 2000;

        // Determine base path for static assets (supports /YonEarth/graph deployment)
        this.assetBasePath = '';
        if (typeof window !== 'undefined' && window.location && window.location.pathname) {
            const pathName = window.location.pathname;
            const marker = '/graph/';
            const idx = pathName.indexOf(marker);
            if (idx !== -1) {
                this.assetBasePath = pathName.substring(0, idx + marker.length - 1);
            }
        }

        // Hierarchy + summaries for 2D organic modes
        this.leidenCommunities = null;
        this.communitySummariesRaw = null;
        this.communitySummaryLookup = {};
        this.hierarchyByLevel = { 0: [], 1: [], 2: [], 3: [] };
        this.hierarchicalData = null;
        this.entityLeafLimit = 20;
        this.circlePackState = {
            svg: null,
            group: null,
            zoom: null,
            width: typeof window !== 'undefined' ? window.innerWidth : 1920,
            height: typeof window !== 'undefined' ? window.innerHeight : 1080
        };
        this.current2DMode = null;
        this.organicTooltip = (typeof d3 !== 'undefined') ? d3.select('#organic-tooltip') : null;
        this.infoPanelMode = 'entity';
        this.webglWarningShown = false;
    }

    resolveAssetPath(subpath = '') {
        const normalized = subpath.startsWith('/') ? subpath : `/${subpath}`;
        return `${this.assetBasePath || ''}${normalized}`;
    }

    async fetchJsonWithFallback(paths, label = 'resource') {
        const urls = Array.isArray(paths) ? paths : [paths];
        let lastError = null;
        // Cache-bust version - increment when deploying new data
        const cacheBuster = 'v=20251129c';

        for (const url of urls) {
            try {
                const bustUrl = url + (url.includes('?') ? '&' : '?') + cacheBuster;
                const response = await fetch(bustUrl);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const text = await response.text();
                try {
                    return JSON.parse(text);
                } catch (parseErr) {
                    const snippet = text.trim().slice(0, 120);
                    const hint = snippet.startsWith('<') ? 'Received HTML instead of JSON' : parseErr.message;
                    throw new Error(hint);
                }
            } catch (err) {
                lastError = err;
                console.warn(`Failed to load ${label} from ${url}: ${err.message}`);
            }
        }

        throw new Error(`${label} load failed (${lastError?.message || 'unknown error'})`);
    }

    /**
     * Initialize the viewer
     */
    async init() {
        this.updateLoadingStatus('Loading knowledge graph data...');

        try {
            // Load data
            await this.loadData();

            // Setup Three.js scene
            this.updateLoadingStatus('Setting up 3D scene...');
            this.setupScene();

            // Create visualizations
            this.updateLoadingStatus('Creating entity nodes...');
            this.createEntityNodes();

        this.updateLoadingStatus('Drawing relationships...');
        this.createRelationshipLines();

        this.updateLoadingStatus('Creating cluster membranes...');
        this.createClusterMembranes();
        this.updateTopLabels();
        this.createClusterLabels();

        // Setup controls and interactions
        this.setupControls();
        this.setupKeyboardShortcuts();
        this.setupSearch();
        this.setupClusterSearch();
        this.hideEntityInfo();
        this.centerOnEntityName('Y on Earth Community');

        // Start rendering
        this.hideLoadingScreen();
        this.hideWebGLError();
        this.animate();

        // Check URL hash for initial view mode
        this.applyUrlHashView();

            console.log('✅ GraphRAG 3D Embedding View initialized');
        } catch (error) {
            console.error('❌ Failed to initialize viewer:', error);
            this.updateLoadingStatus(`Error: ${error.message}`);
            this.handleInitializationError(error);
        }
    }

    /**
     * Load graphrag_hierarchy.json data
     */
    async loadData() {
        try {
            const [
                hierarchy,
                sageLayout,
                forceLayoutData,
                idMapping,
                leidenData,
                summaryData
            ] = await Promise.all([
                this.fetchHierarchyData(),
                this.fetchGraphSageLayout(),
                this.fetchForceLayout(),
                this.fetchCommunityIdMapping(),
                this.fetchLeidenCommunities(),
                this.fetchCommunitySummaries()
            ]);

            this.data = hierarchy;
            this.graphsageLayout = sageLayout || {};
            this.forceLayout = forceLayoutData || {};
            this.communityIdMapping = idMapping || {};
            this.leidenCommunities = leidenData || null;
            this.communitySummariesRaw = summaryData || {};
            this.communitySummaryLookup = this.normalizeCommunitySummaries(summaryData);

            // Process data
            this.processData();

            console.log(`Loaded ${this.entities.size} entities, ${this.relationships.length} relationships`);
            console.log(`Community ID mapping loaded: ${Object.keys(this.communityIdMapping).length} titles`);
            if (this.leidenCommunities?.communities) {
                console.log(`Leiden communities loaded: ${this.leidenCommunities.communities.length} entries`);
            }
            if (Object.keys(this.communitySummaryLookup).length) {
                console.log(`Community summaries available: ${Object.keys(this.communitySummaryLookup).length}`);
            } else {
                console.warn('Community summaries not found; cluster descriptions will fall back to titles.');
            }
            if (Object.keys(this.graphsageLayout).length) {
                console.log(`GraphSAGE layout loaded for ${Object.keys(this.graphsageLayout).length} nodes`);
                this.hasContextualLayout = true;

                // DIAGNOSTIC: Log sample values and distribution statistics
                const sageKeys = Object.keys(this.graphsageLayout);
                const sampleKeys = sageKeys.slice(0, 3);
                console.log('%c=== GraphSAGE Layout Diagnostics ===', 'color: cyan; font-weight: bold');
                console.log('Sample values (first 3 nodes):');
                sampleKeys.forEach(k => {
                    const v = this.graphsageLayout[k];
                    console.log(`  "${k}": [${v.map(x => x.toFixed(2)).join(', ')}]`);
                });

                // Calculate distribution stats
                const allX = [], allY = [], allZ = [], allDist = [];
                sageKeys.forEach(k => {
                    const v = this.graphsageLayout[k];
                    if (Array.isArray(v) && v.length === 3) {
                        allX.push(v[0]);
                        allY.push(v[1]);
                        allZ.push(v[2]);
                        allDist.push(Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]));
                    }
                });

                const stats = (arr, name) => {
                    const min = Math.min(...arr);
                    const max = Math.max(...arr);
                    const mean = arr.reduce((a,b) => a+b, 0) / arr.length;
                    const variance = arr.reduce((sum, x) => sum + (x - mean) ** 2, 0) / arr.length;
                    const std = Math.sqrt(variance);
                    console.log(`  ${name}: min=${min.toFixed(2)}, max=${max.toFixed(2)}, mean=${mean.toFixed(2)}, std=${std.toFixed(2)}`);
                };

                console.log('RAW GraphSAGE coordinate distribution:');
                stats(allX, 'X');
                stats(allY, 'Y');
                stats(allZ, 'Z');
                stats(allDist, 'Distance from origin');

                // Check for spherical shell pattern
                const distMean = allDist.reduce((a,b) => a+b, 0) / allDist.length;
                const distStd = Math.sqrt(allDist.reduce((sum, x) => sum + (x - distMean) ** 2, 0) / allDist.length);
                const shellRatio = distStd / distMean;
                console.log(`  Shell indicator (std/mean): ${shellRatio.toFixed(4)} ${shellRatio < 0.15 ? '⚠️ SPHERICAL SHELL DETECTED' : '✅ Good volumetric spread'}`);
                console.log('%c=== End GraphSAGE Diagnostics ===', 'color: cyan; font-weight: bold');
            } else {
                console.warn('GraphSAGE layout not available; contextual mode disabled until data is deployed.');
                this.hasContextualLayout = false;
            }
            if (Object.keys(this.forceLayout).length) {
                console.log(`Force-directed layout loaded for ${Object.keys(this.forceLayout).length} nodes`);
                this.hasForceLayout = true;
            } else {
                console.warn('Force layout not available; structural mode will use real-time simulation.');
                this.hasForceLayout = false;
            }
            this.updateModeAvailability();
        } catch (error) {
            throw new Error(`Data loading failed: ${error.message}`);
        }
    }

    async fetchHierarchyData() {
        return this.fetchJsonWithFallback([
            this.resolveAssetPath('data/graphrag_hierarchy/graphrag_hierarchy_v7.json'),  // FIX-019: Fresh export from entity_registry with BCT/NCT
            this.resolveAssetPath('data/graphrag_hierarchy/graphrag_hierarchy_v6_fixed.json'),
            this.resolveAssetPath('data/graphrag_hierarchy/graphrag_hierarchy_v2.json'),
            this.resolveAssetPath('data/graphrag_hierarchy/graphrag_hierarchy.json'),
            this.resolveAssetPath('data/graphrag_hierarchy/graphrag_hierarchy_test_sample.json')
        ], 'hierarchy');
    }

    async fetchGraphSageLayout() {
        try {
            return await this.fetchJsonWithFallback([
                this.resolveAssetPath('data/graphrag_hierarchy/graphsage_layout.json')
            ], 'GraphSAGE layout');
        } catch (err) {
            console.warn('GraphSAGE layout unavailable, contextual mode will reuse semantic coordinates.', err);
            return {};
        }
    }

    async fetchForceLayout() {
        try {
            return await this.fetchJsonWithFallback([
                this.resolveAssetPath('data/graphrag_hierarchy/force_layout.json')
            ], 'Force-directed layout');
        } catch (err) {
            console.warn('Force layout unavailable, structural mode will use real-time simulation.', err);
            return {};
        }
    }

    async fetchCommunityIdMapping() {
        return this.fetchJsonWithFallback([
            this.resolveAssetPath('data/community_id_mapping.json'),
            this.resolveAssetPath('data/graphrag_hierarchy/community_id_mapping.json')
        ], 'community ID mapping').catch(err => {
            console.warn('Community ID mapping unavailable, will use fallback labels.', err);
            return {};
        });
    }

    async fetchLeidenCommunities() {
        return this.fetchJsonWithFallback([
            this.resolveAssetPath('data/leiden_communities.json'),
            this.resolveAssetPath('data/graphrag_hierarchy/checkpoints_microsoft/leiden_communities.json')
        ], 'Leiden communities').catch(err => {
            console.warn('Leiden communities unavailable, organic views disabled until data is deployed.', err);
            return null;
        });
    }

    async fetchCommunitySummaries() {
        return this.fetchJsonWithFallback([
            this.resolveAssetPath('data/summaries_progress.json'),
            this.resolveAssetPath('data/graphrag_hierarchy/checkpoints/summaries_progress.json')
        ], 'community summaries').catch(err => {
            console.warn('Community summaries unavailable; clusters will show titles only.', err);
            return {};
        });
    }

    normalizeCommunitySummaries(raw) {
        const lookup = {};
        if (!raw) return lookup;
        Object.entries(raw).forEach(([levelKey, entries]) => {
            Object.entries(entries || {}).forEach(([key, value]) => {
                lookup[key] = value;
            });
        });
        return lookup;
    }

    /**
     * Get community title from robust ID mapping
     * Extracts numeric ID from cluster ID (e.g., "c66" → 66 → "Brigitte Mars Natural Healing")
     */
    getCommunityTitle(clusterId) {
        if (!this.communityIdMapping || Object.keys(this.communityIdMapping).length === 0) {
            return null;
        }

        // Extract numeric ID from cluster ID
        // Handles: "c66", "66", "l1_66", "l1_061" (with leading zeros), etc.
        // Use LAST numeric sequence (after underscore for l1_061 format)
        const match = clusterId.match(/_(\d+)$/) || clusterId.match(/(\d+)/);
        if (!match) return null;

        // Strip leading zeros for mapping lookup (061 → 61)
        const numericId = String(parseInt(match[1], 10));

        // Direct lookup in mapping
        return this.communityIdMapping[numericId] || null;
    }

    /**
     * Process loaded data into usable structures
     */
    processData() {
        // Handle test data format (but still support full position data for view switching)
        if (this.data.test_mode) {
            console.log('Using test data format with full position support');
            for (const [entityId, entityData] of Object.entries(this.data.entities)) {
                const basePosition = Array.isArray(entityData.umap_position)
                    ? [...entityData.umap_position]
                    : [0, 0, 0];
                const forceCoords = this.forceLayout[entityId];
                const sageCoords = this.graphsageLayout[entityId];
                const forcePosition = Array.isArray(forceCoords) ? [...forceCoords] : null;
                const contextualPosition = Array.isArray(sageCoords) ? [...sageCoords] : null;

                this.entities.set(entityId, {
                    id: entityId,
                    type: entityData.type,
                    description: entityData.description || '',
                    sources: entityData.sources || [],
                    position: [...basePosition],
                    rawUmapPosition: [...basePosition],
                    rawSagePosition: contextualPosition ? [...contextualPosition] : null,
                    rawForcePosition: forcePosition ? [...forcePosition] : null,
                    umapPosition: null,  // Will be computed by normalizePositions()
                    sagePosition: contextualPosition ? [...contextualPosition] : null,
                    forcePosition: forcePosition ? [...forcePosition] : null,
                    betweenness: entityData.betweenness || 0,
                    relationshipStrengths: entityData.relationship_strengths || {}
                });
            }
            this.relationships = this.data.relationships || [];
            this.computeConnectivityStats();

            // Build L3 cluster mapping and normalize positions (same as full data path)
            this.buildL3ClusterMapping();
            this.normalizePositions();

            document.getElementById('total-count').textContent = this.entities.size;
            this.updateHierarchyLabels();
            return;
        }

        // Full data format
        const clusters = this.data.clusters || {};
        const level0 = clusters.level_0 || clusters.L0 || {};

        this.hierarchyKeyMap = {
            L0: clusters.L0 ? 'L0' : (clusters.level_0 ? 'level_0' : null),
            L1: clusters.L1 ? 'L1' : (clusters.level_1 ? 'level_1' : null),
            L2: clusters.L2 ? 'L2' : (clusters.level_2 ? 'level_2' : null),
            L3: clusters.L3 ? 'L3' : (clusters.level_3 ? 'level_3' : null)
        };

        for (const [clusterId, cluster] of Object.entries(level0)) {
            let entityId = cluster.entity_id || cluster.entity || cluster.id || clusterId;
            let entityData = null;

            if (typeof entityId === 'object') {
                entityData = entityId;
                entityId = cluster.id || clusterId;
            }

            if (!entityData && typeof cluster.entity === 'object') {
                entityData = cluster.entity;
            }

            if (!entityData && this.data.entities) {
                entityData = this.data.entities[entityId];
            }

            if (!entityData) continue;

            // Use UMAP position if available, fallback to PCA
            const position = cluster.umap_position || cluster.position || entityData.umap_position || [0, 0, 0];
            const betweenness = cluster.betweenness ?? entityData.betweenness ?? 0;
            const relationshipStrengths =
                cluster.relationship_strengths ||
                cluster.relationshipStrengths ||
                entityData.relationship_strengths ||
                {};
            const sageCoords = this.graphsageLayout[entityId];
            const forceCoords = this.forceLayout[entityId];
            const basePosition = Array.isArray(position) ? [...position] : [0, 0, 0];
            const contextualPosition = Array.isArray(sageCoords) ? [...sageCoords] : null;
            const forcePosition = Array.isArray(forceCoords) ? [...forceCoords] : null;

            this.entities.set(entityId, {
                id: entityId,
                type: entityData.type,
                description: entityData.description || '',
                sources: entityData.sources || [],
                position: [...basePosition],
                rawUmapPosition: [...basePosition],
                rawSagePosition: contextualPosition ? [...contextualPosition] : null,
                rawForcePosition: forcePosition ? [...forcePosition] : null,
                umapPosition: null,
                sagePosition: contextualPosition ? [...contextualPosition] : null,
                forcePosition: forcePosition ? [...forcePosition] : null,
                betweenness: betweenness,
                relationshipStrengths: relationshipStrengths,
                clusterId: clusterId
            });
        }

        // Load relationships
        this.relationships = this.data.relationships || [];
        this.computeConnectivityStats();

        // Process cluster hierarchies
        const hierarchyLevels = [
            { key: 'level_1', alt: 'L1' },
            { key: 'level_2', alt: 'L2' },
            { key: 'level_3', alt: 'L3' }
        ];

        for (const { key, alt } of hierarchyLevels) {
            const levelClusters = clusters[key] || clusters[alt];

            if (!levelClusters) continue;

            for (const [clusterId, cluster] of Object.entries(levelClusters)) {
                // Use 3D position fields, not 1536-dim 'center' embedding
                const center = cluster.position || cluster.umap_position || [0, 0, 0];

                // Use robust ID mapping (community_id_mapping.json) for accurate titles
                const robustTitle = this.getCommunityTitle(clusterId);

                const entry = {
                    id: clusterId,
                    name: robustTitle || cluster.name || cluster.title || clusterId,
                    title: robustTitle || cluster.title || cluster.name || clusterId,
                    center: [...center],
                    rawCenter: [...center],
                    children: cluster.children || [],
                    entities: cluster.entities || [],
                    node_count: (cluster.entities || []).length
                };
                this.clusters[key].push(entry);
                if (this.clusterLookup[key]) {
                    this.clusterLookup[key].set(clusterId, entry);
                }
            }
        }

        // Build entity-to-L3 cluster mapping for L3 cluster coloring
        this.buildL3ClusterMapping();

        // Normalize positions to a consistent scale centered at origin
        this.hasContextualLayout = Array.from(this.entities.values()).some(e => Array.isArray(e.rawSagePosition));
        this.normalizePositions();

        document.getElementById('total-count').textContent = this.entities.size;
        this.updateHierarchyLabels();
    }

    /**
     * Setup Three.js scene, camera, renderer
     */
    setupScene() {
        if (!this.isWebGLAvailable()) {
            throw new Error('WebGL not available in this browser');
        }

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e1a);
        this.scene.fog = new THREE.Fog(0x0a0e1a, this.boundingRadius * 0.05, this.boundingRadius * 10);

        // Camera - far plane set high to ensure all nodes visible in all layouts
        this.camera = new THREE.PerspectiveCamera(
            60,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            10000
        );
        const camDist = this.boundingRadius * 0.5;
        this.camera.position.set(camDist, camDist, camDist);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.0 : 2));
        this.container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new window.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = Math.max(10, this.boundingRadius * 0.05);
        this.controls.maxDistance = this.boundingRadius * 8;
        this.controls.target.set(0, 0, 0);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight.position.set(50, 50, 50);
        this.scene.add(directionalLight);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    isWebGLAvailable() {
        try {
            if (typeof window === 'undefined' || !window.WebGLRenderingContext) {
                return false;
            }
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (err) {
            return false;
        }
    }

    showWebGLError(details = '') {
        const warning = document.getElementById('webgl-warning');
        if (!warning) return;
        const info = document.getElementById('webgl-warning-details');
        if (info && details) {
            info.textContent = `Browser message: ${details}`;
        }
        warning.classList.add('visible');
        this.webglWarningShown = true;
    }

    hideWebGLError() {
        const warning = document.getElementById('webgl-warning');
        if (warning) {
            warning.classList.remove('visible');
        }
        this.webglWarningShown = false;
    }

    async handleInitializationError(error) {
        const message = error?.message || '';
        if (message.toLowerCase().includes('webgl')) {
            this.showWebGLError(message);
            this.hideLoadingScreen();
            this.current2DMode = 'circle-pack';
            const selector = document.getElementById('multi-lens-selector');
            if (selector) {
                selector.value = 'circle-pack';
            }

            // Show SVG container, hide 3D container
            const graphContainer = document.getElementById('graph-container');
            const svgContainer = document.getElementById('svg-container-2d');
            if (graphContainer) graphContainer.classList.add('hidden');
            if (svgContainer) svgContainer.classList.add('active');

            try {
                await this.render2DVisualization('circle-pack');
            } catch (renderErr) {
                console.error('Fallback 2D rendering failed:', renderErr);
            }
        }
    }

    /**
     * Create entity node visualizations
     */
    createEntityNodes() {
        const geoSegments = this.isMobile ? 6 : 16;
        const geometry = new THREE.SphereGeometry(1.0, geoSegments, geoSegments);

        let processed = 0;
        const cap = this.isMobile ? this.mobileNodeLimit : Infinity;

        for (const [entityId, entity] of this.entities) {
            if (processed >= cap) break;
            // Determine color based on type
            const color = this.getEntityColor(entity);
            const scale = this.getNodeScale(entity);

            // Create material
            const material = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.4,
                metalness: 0.2,
                roughness: 0.6,
                transparent: true,
                opacity: 0.9
            });

            // Create mesh
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...entity.position);
            mesh.scale.set(scale, scale, scale);
            mesh.userData = {
                entityId: entityId,
                entity: entity,
                baseScale: scale
            };

            this.scene.add(mesh);
            this.entityMeshes.push(mesh);
            this.visibleEntities.add(entityId);
            this.entityMeshMap.set(entityId, mesh);
            this.displayedEntityIds.add(entityId);
            processed++;
        }

        this.updateVisibleCount();
    }

    /**
     * Create relationship line visualizations
     */
    createRelationshipLines() {
        if (!this.relationships || this.relationships.length === 0) {
            return;
        }

        if (this.isMobile) {
            return; // skip edges on mobile to reduce memory/GPU load
        }

        for (const relationship of this.relationships) {
            const sourceEntity = this.entities.get(relationship.source);
            const targetEntity = this.entities.get(relationship.target);
            const sourceMesh = this.entityMeshMap.get(relationship.source);
            const targetMesh = this.entityMeshMap.get(relationship.target);

            if (!sourceEntity || !targetEntity || !sourceMesh || !targetMesh) continue;

            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(...sourceEntity.position),
                new THREE.Vector3(...targetEntity.position)
            ]);

            const strength = this.getRelationshipStrength(relationship);
            const effectiveStrength = strength > 0 ? strength : 0.1; // show edges even when data lacks strengths
            const lineWidth = this.mapStrengthToLineWidth(effectiveStrength);
            const opacity = Math.min(0.7, 0.08 + (effectiveStrength * 0.35));
            const isAttribution = relationship.type === 'MAKES_CLAIM';

            const materialBase = {
                color: isAttribution ? this.edgeStyles.attributionColor : this.edgeStyles.defaultColor,
                transparent: true,
                opacity: opacity,
                depthWrite: false,
                linewidth: lineWidth
            };

            let material;
            if (isAttribution) {
                material = new THREE.LineDashedMaterial({
                    ...materialBase,
                    dashSize: 1.2,
                    gapSize: 0.8,
                    scale: 1
                });
            } else {
                material = new THREE.LineBasicMaterial(materialBase);
            }

            const line = new THREE.Line(geometry, material);

            if (isAttribution && line.computeLineDistances) {
                line.computeLineDistances();
            }

            line.userData = {
                sourceId: relationship.source,
                targetId: relationship.target,
                type: relationship.type,
                strength: strength,
                baseOpacity: opacity,
                sourceMesh,
                targetMesh
            };

            this.scene.add(line);
            this.connectionLines.push(line);
        }

        this.updateRelationshipVisibility();
    }

    /**
     * Update node scales when size mode changes
     */
    updateNodeScales() {
        this.entityMeshes.forEach(mesh => {
            const entity = mesh.userData.entity;
            const scale = this.getNodeScale(entity);
            mesh.userData.baseScale = scale;
            mesh.scale.set(scale, scale, scale);
        });

        // Re-apply selection highlight if any
        this.updateSelectionHighlight();
    }

    /**
     * Create Fresnel shader cluster membranes
     */
    createClusterMembranes() {
        if (this.isMobile) {
            // Mobile: only show Global (L0 Red), very light
            this.createMembranesForLevel(0, 0.0, 0xFF4444);
            return;
        }
        // Desktop: Create membranes for each hierarchy level
        // CORRECTED HIERARCHY (inverted): L0=ROOT (66), L1=MID (762), L2=FINE (583), L3=LEAF (14)
        this.createMembranesForLevel(0, 0.0, 0xFF4444); // L0 Global/Root (Red) - 66 clusters
        this.createMembranesForLevel(1, 0.0, 0xFFCC00); // L1 Community (Gold) - 762 clusters
        this.createMembranesForLevel(2, 0.0, 0x00CCFF); // L2 Fine (Cyan) - 583 clusters
        // L3 (14 leaf clusters) - optional, can be added if needed
        // this.createMembranesForLevel(3, 0.0, 0x00CCFF);
    }

    /**
     * Create membranes for a specific hierarchy level
     */
    createMembranesForLevel(level, baseOpacity, colorHex) {
        const levelKey = `level_${level}`;
        const clusters = this.clusters[levelKey];

        for (const cluster of clusters) {
            // Get member entity positions
            const memberPositions = this.getMemberPositions(cluster);

            if (memberPositions.length < 3) continue;

            // Fit ellipsoid to cluster
            const ellipsoid = this.fitEllipsoid(memberPositions);

            // Create Fresnel shader membrane
            const membrane = this.createFresnelMembrane(ellipsoid, baseOpacity, level, colorHex);
            membrane.userData = {
                clusterId: cluster.id,
                level: level,
                baseOpacity: baseOpacity,
                baseEdgeOpacity: Math.max(baseOpacity * 12.0, 0.05)
            };

            this.scene.add(membrane);
            this.clusterMeshes.push(membrane);
        }
    }

    scheduleMembraneRefresh(delay = 400) {
        if (this.membraneRefreshTimeout) return;
        this.membraneRefreshTimeout = setTimeout(() => {
            this.refreshClusterMembranes();
            this.membraneRefreshTimeout = null;
        }, delay);
    }

    refreshClusterMembranes() {
        if (!this.clusterMeshes.length) return;
        this.clusterMeshes.forEach(mesh => {
            const levelKey = `level_${mesh.userData.level}`;
            const lookup = this.clusterLookup[levelKey];
            const cluster = lookup ? lookup.get(mesh.userData.clusterId) : null;
            if (!cluster) return;
            const positions = this.getMemberPositions(cluster);
            if (positions.length < 3) return;
            const ellipsoid = this.fitEllipsoid(positions);
            cluster.center = ellipsoid.center;
            this.updateMembraneMesh(mesh, ellipsoid);
        });
        this.updateClusterLabelPositions();
    }

    updateClusterLabelPositions() {
        if (!this.clusterLabelSprites || !this.clusterLabelSprites.length) return;
        this.clusterLabelSprites.forEach(sprite => {
            if (!sprite.userData || !sprite.userData.isClusterLabel) return;
            const levelKey = `level_${sprite.userData.level}`;
            const cluster = this.clusterLookup[levelKey]?.get(sprite.userData.clusterId);
            if (cluster && cluster.center) {
                sprite.position.set(...cluster.center);
            }
        });
    }

    /**
     * Get positions of all entities in a cluster
     */
    getMemberPositions(cluster) {
        const positions = [];

        // Get entity IDs from cluster
        const entityIds = cluster.entities || [];

        for (const entityId of entityIds) {
            const entity = this.entities.get(entityId);
            if (entity && entity.position) {
                positions.push(entity.position);
            }
        }

        return positions;
    }

    /**
     * Fit ellipsoid to point cloud using PCA
     */
    fitEllipsoid(positions) {
        const EPSILON = 5.0; // Minimum radius

        // Compute centroid
        const centroid = [0, 0, 0];
        for (const pos of positions) {
            centroid[0] += pos[0];
            centroid[1] += pos[1];
            centroid[2] += pos[2];
        }
        centroid[0] /= positions.length;
        centroid[1] /= positions.length;
        centroid[2] /= positions.length;

        // Handle degenerate cases
        if (positions.length < 3) {
            return {
                center: centroid,
                radii: [EPSILON, EPSILON, EPSILON],
                rotation: new THREE.Matrix4()
            };
        }

        // Compute covariance matrix (simplified)
        let varX = 0, varY = 0, varZ = 0;
        for (const pos of positions) {
            const dx = pos[0] - centroid[0];
            const dy = pos[1] - centroid[1];
            const dz = pos[2] - centroid[2];
            varX += dx * dx;
            varY += dy * dy;
            varZ += dz * dz;
        }

        // Compute radii using 2 * standard deviation (sigma)
        const radii = [
            Math.max(Math.sqrt(varX / positions.length) * 1.0, EPSILON),
            Math.max(Math.sqrt(varY / positions.length) * 1.0, EPSILON),
            Math.max(Math.sqrt(varZ / positions.length) * 1.0, EPSILON)
        ];

        return {
            center: centroid,
            radii: radii,
            rotation: new THREE.Matrix4() // Simplified - no rotation for now
        };
    }

    /**
     * Create Fresnel shader membrane for ellipsoid
     */
    createFresnelMembrane(ellipsoid, baseOpacity, level, colorHex) {
        // Create ellipsoid geometry
        const segments = this.isMobile ? 8 : 32;
        const geometry = new THREE.SphereGeometry(1, segments, segments);

        // Fresnel shader material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                ellipsoidCenter: { value: new THREE.Vector3(...ellipsoid.center) },
                ellipsoidRadius: { value: Math.max(...ellipsoid.radii) },
                baseOpacity: { value: 0.0 },
                edgeOpacity: { value: Math.max(baseOpacity * 12.0, 0.05) },
                color: { value: new THREE.Color(colorHex || 0x667eea) }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vWorldPosition;

                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 ellipsoidCenter;
                uniform float ellipsoidRadius;
                uniform float baseOpacity;
                uniform float edgeOpacity;
                uniform vec3 color;

                varying vec3 vNormal;
                varying vec3 vWorldPosition;

                void main() {
                    // Fresnel effect (edge glow)
                    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
                    float fresnel = pow(1.0 - dot(vNormal, viewDirection), 4.0);

                    // Fade when camera is inside ellipsoid
                    float distanceToCamera = length(cameraPosition - ellipsoidCenter);
                    float insideFade = smoothstep(0.0, ellipsoidRadius * 0.5, distanceToCamera);

                    // Combine effects: edge glow only, center near-transparent
                    float edgeOnly = fresnel;
                    float opacity = mix(baseOpacity, edgeOpacity, edgeOnly) * insideFade;

                    gl_FragColor = vec4(color, opacity);
                }
            `,
            transparent: true,
            side: THREE.FrontSide,
            depthWrite: false,
            depthTest: true,
            blending: THREE.NormalBlending
        });

        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        this.updateMembraneMesh(mesh, ellipsoid);

        return mesh;
    }

    updateMembraneMesh(mesh, ellipsoid) {
        mesh.position.set(...ellipsoid.center);
        mesh.scale.set(ellipsoid.radii[0], ellipsoid.radii[1], ellipsoid.radii[2]);
        if (mesh.material && mesh.material.uniforms) {
            mesh.material.uniforms.ellipsoidCenter.value.set(...ellipsoid.center);
            mesh.material.uniforms.ellipsoidRadius.value = Math.max(...ellipsoid.radii);
        }
    }

    /**
     * Setup UI controls and interactions
     */
    setupControls() {
        // Multi-Lens Dropdown
        const multiLensSelector = document.getElementById('multi-lens-selector');
        if (multiLensSelector) {
            // Set initial dropdown value from URL hash if present
            if (this.mode) {
                multiLensSelector.value = this.mode;
            }
            multiLensSelector.addEventListener('change', (e) => {
                const mode = e.target.value;
                if (mode) {
                    this.setMode(mode).catch(err => console.error('Failed to change mode', err));
                }
            });
        }

        // Color mode buttons
        const colorBtns = document.querySelectorAll('.mode-btn[data-color-mode]');
        console.log('[setupUI] Found color mode buttons:', colorBtns.length);
        colorBtns.forEach(btn => {
            console.log('[setupUI] Adding click handler for:', btn.dataset.colorMode);
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.colorMode;
                console.log('[Click Handler] Button clicked, mode:', mode);
                this.setColorMode(mode);
            });
        });

        // Size mode selector
        const sizeModeSelect = document.getElementById('size-mode');
        if (sizeModeSelect) {
            sizeModeSelect.addEventListener('change', (e) => {
                this.setSizeMode(e.target.value);
            });
        }

        // Entity type filters
        const filterContainer = document.getElementById('entity-type-filters');
        for (const [type, color] of Object.entries(this.typeColors)) {
            const count = Array.from(this.entities.values()).filter(e => e.type === type).length;

            const filterItem = document.createElement('div');
            filterItem.className = 'filter-item';
            filterItem.innerHTML = `
                <input type="checkbox" id="filter-${type}" class="filter-checkbox" checked>
                <label for="filter-${type}" class="filter-label">${type}</label>
                <span class="filter-count">${count}</span>
            `;

            filterContainer.appendChild(filterItem);

            const checkbox = filterItem.querySelector('input');
            checkbox.addEventListener('change', (e) => {
                this.typeVisibility[type] = e.target.checked;
                this.updateEntityVisibility();
            });
        }

        // Cluster membrane toggles
        ['l3', 'l2', 'l1'].forEach(level => {
            const checkbox = document.getElementById(`show-clusters-${level}`);
            if (checkbox) {
                checkbox.addEventListener('change', () => this.updateMembraneVisibility());
            }
        });
        this.updateMembraneVisibility();

        // Labels toggle
        const showLabelsCheckbox = document.getElementById('show-labels');
        if (showLabelsCheckbox) {
            showLabelsCheckbox.addEventListener('change', () => {
                this.updateTopLabels();
            });
        }

        // Panel toggle
        document.getElementById('panel-toggle').addEventListener('click', () => {
            const panel = document.getElementById('info-panel');
            panel.classList.toggle('collapsed');
        });

        // Raycaster for hover/click
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.renderer.domElement.addEventListener('click', (e) => this.onMouseClick(e));
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in input fields
            const isInputFocused = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';

            // Don't intercept keyboard shortcuts with modifier keys (Ctrl/Cmd)
            const hasModifier = e.ctrlKey || e.metaKey || e.altKey;

            switch(e.key.toLowerCase()) {
                case 'e':
                    if (!isInputFocused && !hasModifier) this.setMode('semantic').catch(console.error);
                    break;
                case 'c':
                    if (!isInputFocused && !hasModifier) this.setMode('contextual').catch(console.error);
                    break;
                case 's':
                    if (!isInputFocused && !hasModifier) this.setMode('structural').catch(console.error);
                    break;
                case 'escape':
                    this.deselectEntity();
                    break;
                case 'k':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        document.getElementById('search-input').focus();
                    }
                    break;
            }
        });
    }

    /**
     * Setup search functionality with autocomplete
     */
    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const dropdown = document.getElementById('autocomplete-dropdown');
        if (!searchInput || !dropdown) return;

        let selectedIndex = -1;
        let currentResults = [];

        const selectEntity = (entityId) => {
            const entity = this.entities.get(entityId);
            if (entity) {
                this.centerOnEntity(entityId);
                this.selectEntity(entityId);
                searchInput.value = entityId;
                hideDropdown();
            }
        };

        const showDropdown = () => {
            dropdown.classList.add('show');
        };

        const hideDropdown = () => {
            dropdown.classList.remove('show');
            selectedIndex = -1;
        };

        const updateDropdown = (results) => {
            currentResults = results;
            dropdown.innerHTML = '';

            if (results.length === 0) {
                dropdown.innerHTML = '<div class="autocomplete-no-results">No entities found</div>';
                showDropdown();
                return;
            }

            results.forEach((result, index) => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.innerHTML = `
                    <div class="autocomplete-item-name">${result.id}</div>
                    <div class="autocomplete-item-type">${result.entity.type || 'UNKNOWN'}</div>
                `;

                item.addEventListener('click', () => selectEntity(result.id));
                item.addEventListener('mouseenter', () => {
                    selectedIndex = index;
                    updateSelection();
                });

                dropdown.appendChild(item);
            });

            showDropdown();
        };

        const updateSelection = () => {
            const items = dropdown.querySelectorAll('.autocomplete-item');
            items.forEach((item, index) => {
                item.classList.toggle('selected', index === selectedIndex);
            });
        };

        // FIX-018: Debounce timer for canonical resolution API calls
        let resolveDebounceTimer = null;
        let lastResolvedQuery = '';

        // FIX-018: Resolve canonical entity via KOI API
        const resolveCanonicalEntity = async (query) => {
            try {
                // Determine API base URL (production vs development)
                const apiBase = window.location.hostname === 'localhost'
                    ? 'http://localhost:8301'
                    : '';
                const url = `${apiBase}/api/koi/entity/resolve?label=${encodeURIComponent(query)}&limit=3`;
                const response = await fetch(url);
                if (!response.ok) return null;
                const data = await response.json();
                return data;
            } catch (err) {
                console.warn('[Search] Canonical resolve failed:', err);
                return null;
            }
        };

        const searchEntities = async (query) => {
            if (!query || query.length < 2) {
                hideDropdown();
                return;
            }

            const q = query.toLowerCase();
            const matches = [];
            const seenIds = new Set();

            // FIX-018: First, try to resolve canonical entity via API (debounced)
            // Clear previous debounce timer
            if (resolveDebounceTimer) {
                clearTimeout(resolveDebounceTimer);
            }

            // FIX-018: Call canonical resolution API with debouncing (300ms)
            resolveDebounceTimer = setTimeout(async () => {
                if (query === lastResolvedQuery) return;
                lastResolvedQuery = query;

                const resolved = await resolveCanonicalEntity(query);
                if (resolved && resolved.winner) {
                    const canonicalName = resolved.winner.entity_text;
                    const canonicalType = resolved.winner.entity_type;

                    // Check if this canonical entity exists in our graph
                    // Try multiple matching strategies:
                    // 1. Exact match
                    // 2. Case-insensitive match
                    // 3. Match by canonical name
                    let foundEntity = this.entities.get(canonicalName);
                    if (!foundEntity) {
                        // Try case-insensitive search
                        for (const [id, entity] of this.entities.entries()) {
                            if (id.toLowerCase() === canonicalName.toLowerCase()) {
                                foundEntity = entity;
                                break;
                            }
                        }
                    }

                    if (foundEntity && !seenIds.has(canonicalName)) {
                        // Prepend canonical match with special styling
                        const canonicalResult = {
                            id: canonicalName,
                            entity: { ...foundEntity, type: canonicalType },
                            isCanonical: true,
                            resolvedFrom: query.toUpperCase()
                        };

                        // Re-render dropdown with canonical result first
                        const currentMatches = [...currentResults];
                        const filteredMatches = currentMatches.filter(m =>
                            m.id.toLowerCase() !== canonicalName.toLowerCase()
                        );
                        updateDropdownWithCanonical([canonicalResult, ...filteredMatches]);
                    }
                }
            }, 300);

            // Local search (immediate, synchronous)
            // Find matching entities (limit to 10 results)
            for (const [id, entity] of this.entities.entries()) {
                if (id.toLowerCase().includes(q)) {
                    if (!seenIds.has(id)) {
                        matches.push({ id, entity });
                        seenIds.add(id);
                    }
                    if (matches.length >= 10) break;
                }
            }

            // Sort by relevance (exact matches first, then alphabetical)
            matches.sort((a, b) => {
                const aExact = a.id.toLowerCase() === q;
                const bExact = b.id.toLowerCase() === q;
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;
                return a.id.localeCompare(b.id);
            });

            updateDropdown(matches);
        };

        // FIX-018: Update dropdown with canonical result highlighted
        const updateDropdownWithCanonical = (results) => {
            currentResults = results;
            dropdown.innerHTML = '';

            if (results.length === 0) {
                dropdown.innerHTML = '<div class="autocomplete-no-results">No entities found</div>';
                showDropdown();
                return;
            }

            results.forEach((result, index) => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item' + (result.isCanonical ? ' canonical-match' : '');

                // FIX-018: Show canonical indicator for resolved entities
                const canonicalBadge = result.isCanonical
                    ? `<span class="canonical-badge" title="Resolved from '${result.resolvedFrom}'">✓ Canonical</span>`
                    : '';

                item.innerHTML = `
                    <div class="autocomplete-item-name">${result.id} ${canonicalBadge}</div>
                    <div class="autocomplete-item-type">${result.entity.type || 'UNKNOWN'}</div>
                `;

                item.addEventListener('click', () => selectEntity(result.id));
                item.addEventListener('mouseenter', () => {
                    selectedIndex = index;
                    updateSelection();
                });

                dropdown.appendChild(item);
            });

            showDropdown();
        };

        // Input event for autocomplete
        searchInput.addEventListener('input', (e) => {
            searchEntities(e.target.value.trim());
        });

        // Keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            const items = dropdown.querySelectorAll('.autocomplete-item');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                updateSelection();
                items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection();
                if (selectedIndex >= 0) {
                    items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && currentResults[selectedIndex]) {
                    selectEntity(currentResults[selectedIndex].id);
                } else if (currentResults.length > 0) {
                    selectEntity(currentResults[0].id);
                }
            } else if (e.key === 'Escape') {
                hideDropdown();
                searchInput.blur();
            }
        });

        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                hideDropdown();
            }
        });

        // Show dropdown when focusing search input
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length >= 2) {
                searchEntities(searchInput.value.trim());
            }
        });
    }

    /**
     * Setup cluster search and focus mode
     */
    setupClusterSearch() {
        const clusterSearchInput = document.getElementById('cluster-search');
        const clusterDropdown = document.getElementById('cluster-autocomplete-dropdown');
        const clearFocusBtn = document.getElementById('clear-cluster-focus');
        const focusInfo = document.getElementById('cluster-focus-info');
        const focusedClusterName = document.getElementById('focused-cluster-name');

        if (!clusterSearchInput || !clusterDropdown) return;

        this.focusedCluster = null;
        let selectedIndex = -1;
        let currentResults = [];

        const focusEntity = (entity) => {
            if (!entity) return;

            // Update UI
            focusedClusterName.textContent = `Entity: ${entity.name || entity.title || entity.id}`;
            focusInfo.style.display = 'block';
            clearFocusBtn.style.display = 'block';
            clusterSearchInput.value = '';
            hideClusterDropdown();

            // Fly camera to entity
            const mesh = this.entityMeshMap.get(entity.id);
            if (mesh) {
                const targetPos = mesh.position;
                this.tweenCameraToPosition([targetPos.x, targetPos.y, targetPos.z], 150);
            }

            // Apply entity focus mode (100% target, 10% others)
            this.applyEntityFocus(entity.id);
        };

        const focusCluster = (clusterId, level) => {
            const cluster = this.clusters[`level_${level}`]?.find(c => c.id === clusterId);
            if (!cluster) return;

            this.focusedCluster = { id: clusterId, level };
            const clusterName = cluster.name || cluster.title || clusterId;

            // Update UI
            focusedClusterName.textContent = clusterName;
            focusInfo.style.display = 'block';
            clearFocusBtn.style.display = 'block';
            clusterSearchInput.value = '';
            hideClusterDropdown();

            // Fly camera to cluster
            this.tweenCameraToCluster(cluster.center || [0, 0, 0]);

            // Apply focus mode rendering
            this.applyClusterFocus(clusterId, level);
        };

        const clearFocus = () => {
            this.focusedCluster = null;
            focusInfo.style.display = 'none';
            clearFocusBtn.style.display = 'none';
            this.clearClusterFocus();
        };

        const showClusterDropdown = () => {
            clusterDropdown.classList.add('show');
        };

        const hideClusterDropdown = () => {
            clusterDropdown.classList.remove('show');
            selectedIndex = -1;
        };

        const updateClusterDropdown = (results) => {
            currentResults = results;
            clusterDropdown.innerHTML = '';

            if (results.length === 0) {
                clusterDropdown.innerHTML = '<div class="autocomplete-no-results">No results found</div>';
                showClusterDropdown();
                return;
            }

            // Group results by category
            const grouped = {
                'L0 Global Themes': { title: '🔴 L0 Global Themes', items: [], color: '#FF4444' },
                'L1 Communities': { title: '🟡 L1 Communities', items: [], color: '#FFCC00' },
                'Entities': { title: '🔵 Entities', items: [], color: '#00CCFF' }
            };

            results.forEach(r => {
                if (grouped[r.category]) {
                    grouped[r.category].items.push(r);
                }
            });

            // Render grouped results
            ['L0 Global Themes', 'L1 Communities', 'Entities'].forEach(category => {
                const group = grouped[category];
                if (group.items.length === 0) return;

                const groupDiv = document.createElement('div');
                groupDiv.className = 'cluster-group';

                const header = document.createElement('div');
                header.className = 'cluster-group-header';
                header.textContent = group.title;
                groupDiv.appendChild(header);

                group.items.forEach((result, idx) => {
                    const item = document.createElement('div');
                    item.className = 'cluster-autocomplete-item';
                    item.dataset.globalIndex = results.indexOf(result);

                    let statsText = '';
                    if (result.type === 'cluster') {
                        const entityCount = result.cluster.entities?.length || 0;
                        statsText = `${entityCount} entities`;
                    } else if (result.type === 'entity') {
                        statsText = result.entityType || 'Entity';
                    }

                    item.innerHTML = `
                        <div class="cluster-item-name">${result.name}</div>
                        <div class="cluster-item-stats">${statsText}</div>
                    `;

                    item.addEventListener('click', () => {
                        if (result.type === 'cluster') {
                            focusCluster(result.cluster.id, result.level);
                        } else if (result.type === 'entity') {
                            focusEntity(result.entity);
                        }
                    });

                    item.addEventListener('mouseenter', () => {
                        selectedIndex = results.indexOf(result);
                        updateSelection();
                    });

                    groupDiv.appendChild(item);
                });

                clusterDropdown.appendChild(groupDiv);
            });

            showClusterDropdown();
        };

        const updateSelection = () => {
            const items = clusterDropdown.querySelectorAll('.cluster-autocomplete-item');
            items.forEach((item, idx) => {
                const globalIdx = parseInt(item.dataset.globalIndex);
                item.classList.toggle('selected', globalIdx === selectedIndex);
            });
        };

        const searchClusters = (query) => {
            if (!query || query.length < 2) {
                hideClusterDropdown();
                return;
            }

            const q = query.toLowerCase();
            const matches = [];

            // Search L0 (Global Themes - Red)
            const level0Clusters = this.clusters['level_0'] || [];
            level0Clusters.forEach(cluster => {
                const name = cluster.name || cluster.title || cluster.id || '';
                if (name.toLowerCase().includes(q)) {
                    matches.push({
                        name,
                        cluster,
                        level: 0,
                        type: 'cluster',
                        category: 'L0 Global Themes'
                    });
                }
            });

            // Search L1 (Communities - Gold)
            const level1Clusters = this.clusters['level_1'] || [];
            level1Clusters.forEach(cluster => {
                const name = cluster.name || cluster.title || cluster.id || '';
                if (name.toLowerCase().includes(q)) {
                    matches.push({
                        name,
                        cluster,
                        level: 1,
                        type: 'cluster',
                        category: 'L1 Communities'
                    });
                }
            });

            // Search Entities (Cyan)
            Array.from(this.entities.values()).forEach(entity => {
                const name = entity.name || entity.title || '';
                if (name.toLowerCase().includes(q)) {
                    matches.push({
                        name,
                        entity,
                        type: 'entity',
                        entityType: entity.type,
                        category: 'Entities'
                    });
                }
            });

            // Limit to 30 results
            const limited = matches.slice(0, 30);

            updateClusterDropdown(limited);
        };

        // Input event for autocomplete
        clusterSearchInput.addEventListener('input', (e) => {
            searchClusters(e.target.value.trim());
        });

        // Keyboard navigation
        clusterSearchInput.addEventListener('keydown', (e) => {
            const items = clusterDropdown.querySelectorAll('.cluster-autocomplete-item');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, currentResults.length - 1);
                updateSelection();
                const selected = Array.from(items).find(item => parseInt(item.dataset.globalIndex) === selectedIndex);
                selected?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection();
                if (selectedIndex >= 0) {
                    const selected = Array.from(items).find(item => parseInt(item.dataset.globalIndex) === selectedIndex);
                    selected?.scrollIntoView({ block: 'nearest' });
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && currentResults[selectedIndex]) {
                    const result = currentResults[selectedIndex];
                    focusCluster(result.cluster.id, result.level);
                }
            } else if (e.key === 'Escape') {
                hideClusterDropdown();
                clusterSearchInput.blur();
            }
        });

        // Clear focus button
        clearFocusBtn.addEventListener('click', clearFocus);

        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!clusterSearchInput.contains(e.target) && !clusterDropdown.contains(e.target)) {
                hideClusterDropdown();
            }
        });

        // Show dropdown when focusing search input
        clusterSearchInput.addEventListener('focus', () => {
            if (clusterSearchInput.value.trim().length >= 2) {
                searchClusters(clusterSearchInput.value.trim());
            }
        });
    }

    /**
     * Apply cluster focus mode (brighten selected cluster, dim others)
     */
    applyClusterFocus(clusterId, level) {
        const levelKey = `level_${level}`;
        const focusedCluster = this.clusters[levelKey]?.find(c => c.id === clusterId);
        if (!focusedCluster) return;

        // Get entities in focused cluster
        const focusedEntityIds = new Set(focusedCluster.entities || []);

        // Update cluster membrane opacities
        this.clusterMeshes.forEach(mesh => {
            const isFocused = mesh.userData.level === level && mesh.userData.clusterId === clusterId;
            if (mesh.material && mesh.material.uniforms) {
                mesh.material.uniforms.edgeOpacity.value = isFocused ? 0.8 : 0.05;
            }
        });

        // Update entity opacities and sizes
        this.entityMeshes.forEach(mesh => {
            const entityId = mesh.userData.entityId;
            const isFocused = focusedEntityIds.has(entityId);

            mesh.material.opacity = isFocused ? 0.9 : 0.15;
            mesh.material.emissiveIntensity = isFocused ? 0.4 : 0.1;

            const baseScale = mesh.userData.baseScale || 1;
            const scaleFactor = isFocused ? 1.0 : 0.5;
            mesh.scale.set(baseScale * scaleFactor, baseScale * scaleFactor, baseScale * scaleFactor);
        });

        // Dim relationship lines
        this.connectionLines.forEach(line => {
            const sourceInFocus = focusedEntityIds.has(line.userData.sourceId);
            const targetInFocus = focusedEntityIds.has(line.userData.targetId);
            line.material.opacity = (sourceInFocus && targetInFocus) ? 0.4 : 0.02;
        });
    }

    /**
     * Apply entity focus mode (100% target, 10% others)
     */
    applyEntityFocus(targetEntityId) {
        // Dim cluster membranes
        this.clusterMeshes.forEach(mesh => {
            if (mesh.material && mesh.material.uniforms) {
                mesh.material.uniforms.edgeOpacity.value = 0.05;
            }
        });

        // Update entity opacities: 100% for target, 10% for others
        this.entityMeshes.forEach(mesh => {
            const entityId = mesh.userData.entityId;
            const isFocused = entityId === targetEntityId;

            mesh.material.opacity = isFocused ? 1.0 : 0.1;
            mesh.material.emissiveIntensity = isFocused ? 0.6 : 0.05;

            const baseScale = mesh.userData.baseScale || 1;
            const scaleFactor = isFocused ? 1.5 : 0.5;
            mesh.scale.set(baseScale * scaleFactor, baseScale * scaleFactor, baseScale * scaleFactor);
        });

        // Show only relationship lines connected to focused entity
        this.connectionLines.forEach(line => {
            const connectedToFocus = (line.userData.sourceId === targetEntityId ||
                                      line.userData.targetId === targetEntityId);
            line.material.opacity = connectedToFocus ? 0.6 : 0.01;
        });
    }

    /**
     * Clear cluster focus mode (restore normal rendering)
     */
    clearClusterFocus() {
        // Restore membrane visibility based on checkboxes
        this.updateMembraneVisibility();

        // Restore entity opacities
        this.entityMeshes.forEach(mesh => {
            mesh.material.opacity = 0.9;
            mesh.material.emissiveIntensity = 0.4;

            const baseScale = mesh.userData.baseScale || 1;
            mesh.scale.set(baseScale, baseScale, baseScale);
        });

        // Restore relationship lines
        this.connectionLines.forEach(line => {
            const baseOpacity = line.userData.baseOpacity || 0.4;
            line.material.opacity = this.isStructuralMode() ? baseOpacity : 0.0;
        });

        // Re-apply selection highlight if any entity is selected
        if (this.selectedEntity) {
            this.updateSelectionHighlight();
        }
    }

    /**
     * Handle mouse move for hover effects
     */
    onMouseMove(event) {
        if (this.mode === 'circle-pack' || this.mode === 'voronoi') {
            return;
        }

        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Raycast to find hovered entity
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.entityMeshes);

        if (intersects.length > 0) {
            const hoveredMesh = intersects[0].object;
            const entityId = hoveredMesh.userData.entityId;

            if (this.hoveredEntity !== entityId) {
                this.hoveredEntity = entityId;
                // Show tooltip on hover, don't update the info panel
                this.showHoverTooltip(entityId, event.clientX, event.clientY);
            }
        } else if (this.hoveredEntity) {
            this.hoveredEntity = null;
            this.hideHoverTooltip();
        }
    }

    /**
     * Handle mouse click for selection
     */
    onMouseClick(event) {
        if (this.mode === 'circle-pack' || this.mode === 'voronoi') {
            return;
        }

        // FIX 3: Check for cluster label clicks first (interactive drill-down)
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const labelIntersects = this.raycaster.intersectObjects(this.clusterLabelSprites);

        if (labelIntersects.length > 0) {
            const clickedLabel = labelIntersects[0].object;
            if (clickedLabel.userData.isClusterLabel && clickedLabel.userData.clusterPosition) {
                this.tweenCameraToCluster(clickedLabel.userData.clusterPosition);
                return;
            }
        }

        // Fall back to entity selection
        if (this.hoveredEntity) {
            this.selectEntity(this.hoveredEntity);
        }
    }

    /**
     * Show entity info panel
     */
    showEntityInfo(entityId, forceShow = false) {
        const entity = this.entities.get(entityId);
        if (!entity) return;

        // Hide voronoi cluster info, show entity info
        const voronoiInfo = document.getElementById('voronoi-cluster-info');
        const entityInfo = document.getElementById('entity-info');
        if (voronoiInfo) voronoiInfo.style.display = 'none';
        if (entityInfo) entityInfo.style.display = 'block';

        this.setInfoPanelMode('entity');
        document.getElementById('entity-name').textContent = entityId;
        document.getElementById('entity-type').textContent = entity.type;
        document.getElementById('entity-description').textContent =
            entity.description || 'No description available';

        // Count connections
        const connections = this.relationships.filter(
            r => r.source === entityId || r.target === entityId
        ).length;
        document.getElementById('entity-connections').textContent = connections;

        // Show betweenness centrality
        const betweenness = typeof entity.betweenness === 'number' ? entity.betweenness : 0;
        document.getElementById('entity-centrality').textContent =
            betweenness.toFixed(4);

        // Connectivity stats
        const degree = entity.degree || 0;
        const weighted = entity.weightedDegree || 0;
        const statDegree = document.getElementById('entity-degree');
        const statWeighted = document.getElementById('entity-weighted-degree');
        if (statDegree) statDegree.textContent = degree.toString();
        if (statWeighted) statWeighted.textContent = weighted.toFixed(2);

        // Neighbor preview (top 5 by strength)
        const neighborList = document.getElementById('entity-neighbors');
        if (neighborList) {
            neighborList.innerHTML = '';
            const neighbors = this.getTopNeighbors(entityId, 5);
            neighbors.forEach(n => {
                const li = document.createElement('li');

                // Create clickable link for neighbor
                const neighborLink = document.createElement('span');
                neighborLink.textContent = n.id;
                neighborLink.style.color = '#00ddff';
                neighborLink.style.cursor = 'pointer';
                neighborLink.style.textDecoration = 'underline';
                neighborLink.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.centerOnEntity(n.id);
                    this.selectEntity(n.id);
                });

                li.appendChild(neighborLink);
                if (n.type) {
                    li.appendChild(document.createTextNode(` (${n.type})`));
                }
                neighborList.appendChild(li);
            });
            if (neighbors.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'No neighbors found';
                neighborList.appendChild(li);
            }
        }

        // Incoming/outgoing edges
        const incomingList = document.getElementById('entity-incoming');
        const outgoingList = document.getElementById('entity-outgoing');
        const { incoming, outgoing } = this.getEdgeDetails(entityId, 8);
        if (incomingList) {
            incomingList.innerHTML = '';
            if (incoming.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'None';
                incomingList.appendChild(li);
            } else {
                incoming.forEach(edge => {
                    const li = document.createElement('li');

                    // Create clickable link for source entity
                    const sourceLink = document.createElement('span');
                    sourceLink.textContent = edge.source;
                    sourceLink.style.color = '#00ddff';
                    sourceLink.style.cursor = 'pointer';
                    sourceLink.style.textDecoration = 'underline';
                    sourceLink.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.centerOnEntity(edge.source);
                        this.selectEntity(edge.source);
                    });

                    li.appendChild(sourceLink);
                    li.appendChild(document.createTextNode(` —${edge.type}→ ${edge.target}`));
                    incomingList.appendChild(li);
                });
            }
        }
        if (outgoingList) {
            outgoingList.innerHTML = '';
            if (outgoing.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'None';
                outgoingList.appendChild(li);
            } else {
                outgoing.forEach(edge => {
                    const li = document.createElement('li');

                    li.appendChild(document.createTextNode(`${edge.source} —${edge.type}→ `));

                    // Create clickable link for target entity
                    const targetLink = document.createElement('span');
                    targetLink.textContent = edge.target;
                    targetLink.style.color = '#00ddff';
                    targetLink.style.cursor = 'pointer';
                    targetLink.style.textDecoration = 'underline';
                    targetLink.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.centerOnEntity(edge.target);
                        this.selectEntity(edge.target);
                    });

                    li.appendChild(targetLink);
                    outgoingList.appendChild(li);
                });
            }
        }

        if (forceShow) {
            document.getElementById('entity-info').style.display = 'block';
        } else {
            document.getElementById('entity-info').style.display = 'block';
        }
    }

    /**
     * Show cluster info in side panel (used by 2D organic views)
     */
    showClusterInfo(clusterNode) {
        if (!clusterNode) return;

        this.setInfoPanelMode('cluster');

        const name = clusterNode.title || clusterNode.name || clusterNode.id;
        const metaParts = [];
        if (clusterNode.level !== undefined && clusterNode.level !== null) {
            metaParts.push(`Level ${clusterNode.level}`);
        }
        if (typeof clusterNode.community_id !== 'undefined') {
            metaParts.push(`ID ${clusterNode.community_id}`);
        }

        document.getElementById('entity-name').textContent = name;
        document.getElementById('entity-type').textContent = `Cluster · ${metaParts.join(' • ') || 'Community'}`;
        document.getElementById('entity-description').textContent =
            clusterNode.summary || 'No summary available for this community.';

        const formatNumber = (value) => {
            if (typeof value === 'number') {
                return value.toLocaleString();
            }
            return value ?? '0';
        };

        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        setText('entity-connections', formatNumber(clusterNode.entity_count || 0));
        setText('entity-centrality', formatNumber(clusterNode.descendant_count || 0));
        setText('entity-degree', formatNumber(clusterNode.child_cluster_count || 0));
        const sampleCount = clusterNode.entitySamples?.length
            || Math.min(clusterNode.entityIds?.length || 0, this.entityLeafLimit);
        setText('entity-weighted-degree', formatNumber(sampleCount));

        const renderList = (elementId, values, emptyText = 'None') => {
            const list = document.getElementById(elementId);
            if (!list) return;
            list.innerHTML = '';
            if (!values || !values.length) {
                const li = document.createElement('li');
                li.textContent = emptyText;
                list.appendChild(li);
                return;
            }
            values.forEach(value => {
                const li = document.createElement('li');
                li.textContent = value;
                list.appendChild(li);
            });
        };

        const childClusters = (clusterNode.children || []).filter(child => child.level !== 'entity');
        const neighborItems = childClusters.slice(0, 6).map(child => child.title || child.name || child.id);
        if (!neighborItems.length && clusterNode.entitySamples?.length) {
            neighborItems.push(
                ...clusterNode.entitySamples.slice(0, 6).map(sample => sample.name || sample.id)
            );
        }
        renderList('entity-neighbors', neighborItems, 'No child communities');

        const parentItems = [];
        let parentRef = clusterNode.parentRef;
        while (parentRef) {
            parentItems.push(parentRef.title || parentRef.name || parentRef.id);
            parentRef = parentRef.parentRef;
        }
        parentItems.reverse();
        renderList('entity-incoming', parentItems, 'Root community');

        const entitySampleDetails = clusterNode.entitySamples && clusterNode.entitySamples.length
            ? clusterNode.entitySamples
            : (clusterNode.entityIds || [])
                .slice(0, this.entityLeafLimit)
                .map(id => this.buildEntityLeaf(id))
                .filter(Boolean);
        const entitySamples = entitySampleDetails.map(sample => {
            if (!sample) return '';
            return sample.type ? `${sample.name || sample.id} (${sample.type})` : (sample.name || sample.id);
        }).filter(Boolean);
        renderList('entity-outgoing', entitySamples, 'No entity samples available');

        document.getElementById('entity-info').style.display = 'block';
    }

    setInfoPanelMode(mode) {
        if (this.infoPanelMode === mode) return;
        this.infoPanelMode = mode;

        const entityLabels = {
            'stat-label-connections': 'Connections',
            'stat-label-centrality': 'Centrality',
            'stat-label-degree': 'Degree',
            'stat-label-weighted': 'Weighted',
            'neighbors-title': 'Top neighbors',
            'incoming-title': 'Incoming',
            'outgoing-title': 'Outgoing'
        };

        const clusterLabels = {
            'stat-label-connections': 'Entities',
            'stat-label-centrality': 'Total Descendants',
            'stat-label-degree': 'Child Communities',
            'stat-label-weighted': 'Sample Entities',
            'neighbors-title': 'Child Communities',
            'incoming-title': 'Parent Path',
            'outgoing-title': 'Entity Samples'
        };

        const labelMap = mode === 'cluster' ? clusterLabels : entityLabels;
        Object.entries(labelMap).forEach(([id, text]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        });
    }

    /**
     * Hide entity info panel
     */
    hideEntityInfo() {
        const info = document.getElementById('entity-info');
        if (!info) return;

        this.setInfoPanelMode('entity');
        document.getElementById('entity-name').textContent = 'Select a node';
        document.getElementById('entity-type').textContent = '';
        document.getElementById('entity-description').textContent = 'Click a node to view details here.';
        const fields = ['entity-connections', 'entity-centrality', 'entity-degree', 'entity-weighted-degree'];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '0';
        });
        ['entity-neighbors', 'entity-incoming', 'entity-outgoing'].forEach(id => {
            const list = document.getElementById(id);
            if (list) {
                list.innerHTML = '';
                const li = document.createElement('li');
                li.textContent = 'None';
                list.appendChild(li);
            }
        });
        info.style.display = 'block';
    }

    /**
     * Show hover tooltip with entity name (doesn't update info panel)
     */
    showHoverTooltip(entityId, x, y) {
        const entity = this.entities.get(entityId);
        if (!entity) return;

        const tooltip = document.getElementById('organic-tooltip');
        const title = document.getElementById('organic-tooltip-title');
        const content = document.getElementById('organic-tooltip-content');

        if (!tooltip || !title || !content) return;

        title.textContent = entityId;
        content.textContent = entity.type || '';

        tooltip.style.left = (x + 15) + 'px';
        tooltip.style.top = (y + 15) + 'px';
        tooltip.classList.add('visible');
    }

    /**
     * Hide hover tooltip
     */
    hideHoverTooltip() {
        const tooltip = document.getElementById('organic-tooltip');
        if (tooltip) {
            tooltip.classList.remove('visible');
        }
    }

    /**
     * Center camera/controls on a specific entity by id
     */
    centerOnEntity(entityId) {
        const entity = this.entities.get(entityId);
        if (!entity || !entity.position) return;

        const target = new THREE.Vector3(...entity.position);
        const dir = new THREE.Vector3(1, 1, 1).normalize();
        const distance = this.boundingRadius * 0.4;
        const camPos = target.clone().add(dir.multiplyScalar(distance));

        this.controls.target.copy(target);
        this.camera.position.copy(camPos);
        this.camera.lookAt(target);
    }

    /**
     * FIX 3: Tween camera to cluster position (smooth drill-down navigation)
     */
    tweenCameraToCluster(clusterPosition) {
        const target = new THREE.Vector3(...clusterPosition);
        const dir = new THREE.Vector3(1, 1, 1).normalize();
        const distance = this.boundingRadius * 0.3; // Zoom in closer for clusters
        const camPos = target.clone().add(dir.multiplyScalar(distance));

        // Animate camera position and target
        const duration = 1000; // 1 second animation
        const startPos = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-in-out function for smooth animation
            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            // Interpolate camera position
            this.camera.position.lerpVectors(startPos, camPos, eased);
            this.controls.target.lerpVectors(startTarget, target, eased);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    centerOnEntityName(name) {
        const match = this.findEntityByQuery(name);
        if (match) {
            this.centerOnEntity(match.id);
            this.selectEntity(match.id);
        }
    }

    /**
     * Select an entity
     */
    selectEntity(entityId) {
        this.selectedEntity = entityId;
        console.log('Selected entity:', entityId);

        this.showEntityInfo(entityId, true);
        this.updateSelectionHighlight();
        this.updateRelationshipVisibility(); // Show edges connected to selected entity
    }

    /**
     * Deselect current entity
     */
    deselectEntity() {
        this.selectedEntity = null;
        this.hoveredEntity = null;
        this.hideEntityInfo();

        this.updateSelectionHighlight();
        this.updateRelationshipVisibility(); // Hide edges when nothing is selected
    }

    /**
     * Get initial mode from URL hash (called from constructor before data loads)
     * @returns {string|null} The mode from URL hash, or null if not specified
     */
    getInitialModeFromHash() {
        const hash = window.location.hash;
        if (hash) {
            const match = hash.match(/view=([a-z0-9-]+)/);
            if (match) {
                const viewMode = match[1];
                const validModes = ['semantic', 'contextual', 'structural', 'circle-pack', 'voronoi', 'voronoi-2', 'voronoi-3', 'voronoi4', 'voronoi5', 'stricttreemap', 'hierarchical'];
                if (validModes.includes(viewMode)) {
                    console.log(`Initial mode from URL hash: ${viewMode}`);
                    return viewMode;
                }
            }
        }
        return null;
    }

    /**
     * Apply view mode from URL hash (for shareable links)
     * Uses the pre-stored initialModeFromHash if available, otherwise parses hash
     */
    applyUrlHashView() {
        // Use stored initial mode (captured in constructor before async operations)
        const viewMode = this.initialModeFromHash;

        if (viewMode && viewMode !== 'semantic') {
            console.log(`Applying initial view from URL hash: ${viewMode}`);
            // Use setTimeout to ensure DOM is ready and 3D scene is initialized
            setTimeout(async () => {
                try {
                    // Update dropdown to match
                    const selector = document.getElementById('multi-lens-selector');
                    if (selector) selector.value = viewMode;
                    await this.setMode(viewMode);
                    console.log(`Successfully applied view mode: ${viewMode}`);
                } catch (err) {
                    console.error('Failed to apply URL view mode:', err);
                }
            }, 100); // Reduced timeout since mode is already stored
        }
    }

    /**
     * Set visualization mode
     */
    async setMode(mode) {
        // Holographic is an alias for semantic (UMAP embedding view)
        if (mode === 'holographic') {
            mode = 'semantic';
        }

        const validModes = ['semantic', 'contextual', 'structural', 'circle-pack', 'voronoi', 'voronoi-2', 'voronoi-3', 'voronoi4', 'voronoi5', 'stricttreemap', 'hierarchical'];
        if (!validModes.includes(mode)) return;
        const is3DMode = mode === 'semantic' || mode === 'contextual' || mode === 'structural';
        if (is3DMode && this.webglWarningShown) {
            this.showWebGLError('WebGL is disabled, falling back to Circle Pack view.');
            const selector = document.getElementById('multi-lens-selector');
            if (selector) selector.value = 'circle-pack';
            await this.render2DVisualization('circle-pack');
            return;
        }
        if (mode === 'contextual' && !this.hasContextualLayoutAvailable()) {
            console.warn('Contextual mode requires GraphSAGE layout; defaulting to Semantic.');
            alert('Contextual mode is unavailable because GraphSAGE layout data is missing on the server.');
            mode = 'semantic';
        }
        if (mode === this.mode) return;

        this.mode = mode;
        this.currentLayout = mode;

        // Update URL hash for shareable links
        if (window.history && window.history.replaceState) {
            const newUrl = `${window.location.pathname}#view=${mode}`;
            window.history.replaceState(null, '', newUrl);
        }

        // Update dropdown selection
        const multiLensSelector = document.getElementById('multi-lens-selector');
        if (multiLensSelector && multiLensSelector.value !== mode) {
            multiLensSelector.value = mode;
        }

        // Handle 2D vs 3D mode switching
        const is2DMode = mode === 'circle-pack' || mode === 'voronoi' || mode === 'voronoi-2' || mode === 'voronoi-3' || mode === 'voronoi4' || mode === 'voronoi5' || mode === 'stricttreemap' || mode === 'hierarchical';
        const graphContainer = document.getElementById('graph-container');
        const svgContainer = document.getElementById('svg-container-2d');

        if (is2DMode) {
            // Switch to 2D Hierarchy View
            this.current2DMode = mode;
            graphContainer.classList.add('hidden');
            svgContainer.classList.add('active');

            // PERFORMANCE: Hide edges in hierarchy views (they focus on volume/territory, not connectivity)
            this.hideEdges();

            this.hideOrganicTooltip();
            await this.render2DVisualization(mode);
        } else {
            // Switch to 3D Network View
            this.current2DMode = null;
            this.hideOrganicTooltip();
            svgContainer.classList.remove('active');
            graphContainer.classList.remove('hidden');

            // Restore edges for network views
            this.showEdges();

            if (mode === 'structural') {
                // Use pre-computed force layout if available, otherwise fall back to real-time simulation
                if (this.hasForceLayout) {
                    this.stopStructuralMode();
                    this.transitionToLayout('forcePosition');
                } else {
                    await this.startStructuralMode();
                }
            } else {
                this.stopStructuralMode();
                const layoutKey = mode === 'contextual' ? 'sagePosition' : 'umapPosition';
                this.transitionToLayout(layoutKey);
            }

            // Disable fog in contextual mode to ensure all nodes remain visible
            // (GraphSAGE layout has different spatial distribution than semantic)
            if (mode === 'contextual') {
                this.scene.fog = null;
            } else {
                // Restore fog for semantic/structural modes
                this.scene.fog = new THREE.Fog(0x0a0e1a, this.boundingRadius * 0.05, this.boundingRadius * 10);
            }

            this.updateSelectionHighlight();
            this.updateRelationshipVisibility();
            this.updateTopLabels();
        }

        console.log('Mode:', mode);
    }

    isStructuralMode() {
        return this.mode === 'structural';
    }

    /**
     * Set node coloring mode
     */
    setColorMode(mode) {
        console.log('[setColorMode] Called with mode:', mode);
        if (!['type', 'centrality', 'l3cluster'].includes(mode)) {
            console.log('[setColorMode] Invalid mode, returning early');
            return;
        }

        this.colorMode = mode;
        console.log('[setColorMode] Color mode set to:', this.colorMode);

        document.querySelectorAll('.mode-btn[data-color-mode]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.colorMode === mode);
        });

        // Toggle legend visibility
        const typeLegend = document.getElementById('color-legend-type');
        const centralityLegend = document.getElementById('color-legend-centrality');
        if (typeLegend && centralityLegend) {
            if (mode === 'type') {
                typeLegend.style.display = 'grid';
                centralityLegend.style.display = 'none';
            } else if (mode === 'centrality') {
                typeLegend.style.display = 'none';
                centralityLegend.style.display = 'grid';
            } else {
                // l3cluster mode - hide both type/centrality legends
                typeLegend.style.display = 'none';
                centralityLegend.style.display = 'none';
            }
        }

        this.applyColorMode();
    }

    /**
     * Set node size mode
     */
    setSizeMode(mode) {
        if (!this.sizeModes.includes(mode)) return;
        this.sizeMode = mode;

        const select = document.getElementById('size-mode');
        if (select) {
            select.value = mode;
        }

        this.updateNodeScales();
        this.updateTopLabels();
    }

    hasContextualLayoutAvailable() {
        return this.hasContextualLayout;
    }

    updateModeAvailability() {
        const multiLensSelector = document.getElementById('multi-lens-selector');
        if (multiLensSelector) {
            const contextualOption = Array.from(multiLensSelector.options)
                .find(opt => opt.value === 'contextual');
            if (contextualOption) {
                const unavailable = !this.hasContextualLayoutAvailable();
                contextualOption.disabled = unavailable;
                if (unavailable) {
                    contextualOption.text = 'Contextual (GraphSAGE) - Unavailable';
                } else {
                    contextualOption.text = 'Contextual (GraphSAGE)';
                }
            }
        }
    }

    transitionToLayout(layoutKey) {
        // Determine which layout attribute to use
        let attribute, layoutName;
        if (layoutKey === 'sagePosition') {
            attribute = 'sagePosition';
            layoutName = 'Contextual (GraphSAGE)';
        } else if (layoutKey === 'forcePosition') {
            attribute = 'forcePosition';
            layoutName = 'Structural (Force-Directed)';
        } else {
            attribute = 'umapPosition';
            layoutName = 'Semantic (UMAP)';
        }

        if (attribute === 'sagePosition' && !this.hasContextualLayoutAvailable()) {
            console.warn('Contextual layout unavailable. Falling back to semantic layout.');
            if (layoutKey !== 'umapPosition') {
                this.transitionToLayout('umapPosition');
            }
            return;
        }

        console.log(`Transitioning to ${layoutName} layout...`);

        // DIAGNOSTIC: Log position distribution when transitioning
        if (attribute === 'sagePosition') {
            const sageDistances = [];
            const samplePositions = [];
            let count = 0;
            for (const entity of this.entities.values()) {
                if (entity.sagePosition) {
                    const d = Math.sqrt(entity.sagePosition[0]**2 + entity.sagePosition[1]**2 + entity.sagePosition[2]**2);
                    sageDistances.push(d);
                    if (count < 3) {
                        samplePositions.push({ id: entity.id, pos: entity.sagePosition });
                    }
                    count++;
                }
            }
            if (sageDistances.length > 0) {
                const minD = Math.min(...sageDistances);
                const maxD = Math.max(...sageDistances);
                const meanD = sageDistances.reduce((a,b) => a+b, 0) / sageDistances.length;
                const stdD = Math.sqrt(sageDistances.reduce((sum, x) => sum + (x - meanD) ** 2, 0) / sageDistances.length);
                console.log('%c=== NORMALIZED sagePosition Distribution ===', 'color: yellow; font-weight: bold');
                console.log(`  Distance from origin: min=${minD.toFixed(1)}, max=${maxD.toFixed(1)}, mean=${meanD.toFixed(1)}, std=${stdD.toFixed(1)}`);
                console.log(`  Shell indicator (std/mean): ${(stdD/meanD).toFixed(4)} ${(stdD/meanD) < 0.15 ? '⚠️ SPHERICAL SHELL' : '✅ Good spread'}`);
                console.log('  Sample normalized positions:');
                samplePositions.forEach(s => {
                    console.log(`    "${s.id}": [${s.pos.map(v => v.toFixed(1)).join(', ')}]`);
                });
                console.log('%c==========================================', 'color: yellow; font-weight: bold');
            }
        }

        const now = performance.now();
        this.activeTransitions = [];

        // Calculate anchor offset if a node is selected
        // This keeps the selected node visually in place while other nodes rearrange around it
        let anchorOffset = [0, 0, 0];
        if (this.selectedEntity) {
            const selectedMesh = this.entityMeshMap.get(this.selectedEntity);
            if (selectedMesh) {
                const entity = selectedMesh.userData.entity;

                // Get target position for selected entity
                let targetPos;
                if (attribute === 'sagePosition') {
                    targetPos = entity.sagePosition || entity.umapPosition;
                } else if (attribute === 'forcePosition') {
                    targetPos = entity.forcePosition || entity.umapPosition;
                } else {
                    targetPos = entity.umapPosition || entity[attribute];
                }

                if (targetPos && !isNaN(targetPos[0]) && !isNaN(targetPos[1]) && !isNaN(targetPos[2])) {
                    // Calculate offset: current position minus target position
                    anchorOffset = [
                        selectedMesh.position.x - targetPos[0],
                        selectedMesh.position.y - targetPos[1],
                        selectedMesh.position.z - targetPos[2]
                    ];
                    console.log(`Anchoring to selected entity "${entity.id}" with offset [${anchorOffset.map(v => v.toFixed(1)).join(', ')}]`);
                }
            }
        }

        this.entityMeshes.forEach(mesh => {
            const entity = mesh.userData.entity;

            // Get target position
            let target;
            if (attribute === 'sagePosition') {
                // Use normalized GraphSAGE position from entity (not raw graphsageLayout data)
                target = entity.sagePosition || entity.umapPosition;

                // Validate target for NaN/undefined values
                if (target && (isNaN(target[0]) || isNaN(target[1]) || isNaN(target[2]) ||
                               target[0] === undefined || target[1] === undefined || target[2] === undefined)) {
                    console.warn(`Invalid GraphSAGE position for entity ${entity.id}, using UMAP fallback`);
                    target = entity.umapPosition;
                }
            } else if (attribute === 'forcePosition') {
                // Use normalized force-directed position
                target = entity.forcePosition || entity.umapPosition;

                // Validate target for NaN/undefined values
                if (target && (isNaN(target[0]) || isNaN(target[1]) || isNaN(target[2]) ||
                               target[0] === undefined || target[1] === undefined || target[2] === undefined)) {
                    console.warn(`Invalid force position for entity ${entity.id}, using UMAP fallback`);
                    target = entity.umapPosition;
                }
            } else {
                // Use UMAP position
                target = entity.umapPosition || entity[attribute];
            }

            if (!target) return;

            // Final validation: ensure all coordinates are valid numbers
            if (isNaN(target[0]) || isNaN(target[1]) || isNaN(target[2])) {
                console.warn(`Invalid target position for entity ${entity.id}, skipping transition`);
                return;
            }

            const start = [mesh.position.x, mesh.position.y, mesh.position.z];
            // Apply anchor offset to keep selected node in place
            const end = [
                target[0] + anchorOffset[0],
                target[1] + anchorOffset[1],
                target[2] + anchorOffset[2]
            ];

            // Add smooth transition with 1.5s duration
            this.activeTransitions.push({
                mesh,
                entity,
                start,
                end,
                startTime: now,
                duration: 1500 // 1.5s tween
            });
        });

        console.log(`Started ${this.activeTransitions.length} position transitions (1.5s duration)`);

        // Mark that membranes need updating after transition completes
        this.pendingMembraneUpdate = true;
        if (!this.activeTransitions.length) {
            this.pendingMembraneUpdate = false;
            this.refreshClusterMembranes();
            this.updateConnectionLinesGeometry();
        }
    }

    updateActiveTransitions() {
        if (!this.activeTransitions.length) return;
        const now = performance.now();
        this.activeTransitions = this.activeTransitions.filter(transition => {
            const elapsed = now - transition.startTime;
            const progress = Math.min(1, elapsed / transition.duration);
            const eased = this.easeInOut(progress);
            const x = transition.start[0] + (transition.end[0] - transition.start[0]) * eased;
            const y = transition.start[1] + (transition.end[1] - transition.start[1]) * eased;
            const z = transition.start[2] + (transition.end[2] - transition.start[2]) * eased;

            transition.mesh.position.set(x, y, z);
            transition.entity.position = [x, y, z];
            transition.entity.x = x;
            transition.entity.y = y;
            transition.entity.z = z;

            return progress < 1;
        });

        if (!this.activeTransitions.length) {
            this.updateConnectionLinesGeometry();
            if (this.pendingMembraneUpdate) {
                this.refreshClusterMembranes();
                this.pendingMembraneUpdate = false;
            }
        }
    }

    easeInOut(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    async ensureForceModule() {
        if (this.d3Force) return;
        try {
            // Use import map defined in HTML
            this.d3Force = await import('d3-force-3d');
            console.log('Loaded d3-force-3d from import map');
        } catch (err) {
            console.error('Failed to load d3-force-3d:', err);
            throw new Error(`Unable to load d3-force-3d: ${err?.message || 'unknown error'}`);
        }
    }

    async prepareForceSimulation() {
        await this.ensureForceModule();

        this.forceNodes = this.entityMeshes.map(mesh => {
            const entity = mesh.userData.entity;
            entity.x = mesh.position.x;
            entity.y = mesh.position.y;
            entity.z = mesh.position.z;
            entity.vx = 0;
            entity.vy = 0;
            entity.vz = 0;
            entity.fx = null;
            entity.fy = null;
            entity.fz = null;
            return entity;
        });

        const visibleSet = new Set(this.forceNodes.map(node => node.id));
        this.forceLinks = (this.relationships || [])
            .filter(rel => visibleSet.has(rel.source) && visibleSet.has(rel.target))
            .map(rel => ({
                source: rel.source,
                target: rel.target,
                value: this.getRelationshipStrength(rel) || 0.1
            }));

        if (!this.forceSimulation) {
            this.forceLinkForce = this.d3Force.forceLink(this.forceLinks)
                .id(node => node.id)
                .distance(d => 80 + (1 - d.value) * 120)
                .strength(d => 0.05 + d.value * 0.4)
                .iterations(1); // Reduce iterations per tick for performance

            // Use Barnes-Hut approximation for better performance with many nodes
            const chargeForce = this.d3Force.forceManyBody()
                .strength(-8)
                .theta(0.9) // Higher theta = faster but less accurate (default 0.9)
                .distanceMax(300); // Limit charge calculation distance

            this.forceSimulation = this.d3Force.forceSimulation(this.forceNodes)
                .numDimensions(3)
                .force('link', this.forceLinkForce)
                .force('charge', chargeForce)
                .force('center', this.d3Force.forceCenter(0, 0, 0))
                .alphaDecay(0.02) // Slower decay for smoother settling
                .velocityDecay(0.4) // Higher velocity decay for stability
                .on('tick', () => this.applyForcePositions());
        } else {
            this.forceSimulation.nodes(this.forceNodes);
            if (this.forceLinkForce) {
                this.forceLinkForce.links(this.forceLinks);
            }
        }
    }

    async startStructuralMode() {
        await this.prepareForceSimulation();
        if (this.forceSimulation) {
            this.forceSimulation.alpha(1).alphaTarget(0.3).restart();
        }
        this.activeTransitions = [];
        this.scheduleMembraneRefresh(600);
    }

    stopStructuralMode() {
        if (this.forceSimulation) {
            this.forceSimulation.stop();
        }
    }

    applyForcePositions() {
        if (!this.isStructuralMode()) return;

        // Throttle updates - skip frames to maintain performance
        const now = performance.now();
        if (this.lastForceUpdate && (now - this.lastForceUpdate) < 16) {
            // Skip update if less than ~16ms (60fps) since last update
            return;
        }
        this.lastForceUpdate = now;

        // Update mesh positions
        this.entityMeshes.forEach(mesh => {
            const entity = mesh.userData.entity;
            if (typeof entity.x !== 'number') return;
            mesh.position.set(entity.x, entity.y, entity.z);
            entity.position = [entity.x, entity.y, entity.z];
        });

        // Only update connection lines every few frames during active simulation
        this.forceFrameCount = (this.forceFrameCount || 0) + 1;
        if (this.forceFrameCount % 3 === 0) {
            this.updateConnectionLinesGeometry();
        }

        // Less frequent membrane refresh during simulation
        this.scheduleMembraneRefresh(1000);
    }

    /**
     * Keep labels legible by scaling with camera distance
     */
    updateLabelScales() {
        if (!this.labelSprites || this.labelSprites.length === 0) return;

        const cam = this.camera;
        const fovRadians = (cam.fov * Math.PI) / 180;
        const scaleFactor = 2 * Math.tan(fovRadians / 2);

        this.labelSprites.forEach(sprite => {
            const entityId = sprite.userData?.entityId;
            if (entityId) {
                const entity = this.entities.get(entityId);
                if (entity && entity.position) {
                    sprite.position.set(...entity.position);
                }
            }
            const dist = cam.position.distanceTo(sprite.position);
            // Approximate world size needed for consistent screen size
            const desiredWorldSize = dist * scaleFactor * 0.12; // bigger factor for readability
            const minSize = 40;
            const maxSize = 420;
            const size = Math.max(minSize, Math.min(maxSize, desiredWorldSize));
            sprite.scale.set(size, size * 0.5, 1);
        });

        // Cluster label scaling
        if (this.clusterLabelSprites && this.clusterLabelSprites.length) {
            this.clusterLabelSprites.forEach(sprite => {
                if (sprite.userData?.isClusterLabel) {
                    const levelKey = `level_${sprite.userData.level}`;
                    const cluster = this.clusterLookup[levelKey]?.get(sprite.userData.clusterId);
                    if (cluster && cluster.center) {
                        sprite.position.set(...cluster.center);
                    }
                }
                const dist = cam.position.distanceTo(sprite.position);
                const desiredWorldSize = dist * scaleFactor * 0.1;
                const minSize = 30;
                const maxSize = 360;
                const size = Math.max(minSize, Math.min(maxSize, desiredWorldSize));
                sprite.scale.set(size, size * 0.5, 1);
            });
        }
    }

    /**
     * Update entity visibility based on type filters
     */
    updateEntityVisibility() {
        let visibleCount = 0;

        this.entityMeshes.forEach(mesh => {
            const entity = mesh.userData.entity;
            const visible = this.typeVisibility.hasOwnProperty(entity.type)
                ? this.typeVisibility[entity.type]
                : true;
            mesh.visible = visible;

            if (visible) {
                visibleCount++;
                this.visibleEntities.add(entity.id);
            } else {
                this.visibleEntities.delete(entity.id);
            }
        });

        this.updateRelationshipVisibility();
        this.updateVisibleCount();
    }

    /**
     * Update visible entity count in UI
     */
    updateVisibleCount() {
        document.getElementById('visible-count').textContent = this.visibleEntities.size;
    }

    /**
     * Create/update top labels based on current size mode
     */
    updateTopLabels() {
        // Remove old labels
        this.labelSprites.forEach(sprite => this.scene.remove(sprite));
        this.labelSprites = [];

        const labelLimit = this.isMobile ? 4 : 30; // Increased from 15 to 30 for more visible labels
        const showLabels = document.getElementById('show-labels')?.checked;
        if (!showLabels) {
            return;
        }

        const scores = [];
        for (const entity of this.entities.values()) {
            const score = this.sizeMode === 'betweenness'
                ? (typeof entity.betweenness === 'number' ? entity.betweenness : 0)
                : (entity.weightedDegree > 0 ? entity.weightedDegree : (entity.degree || 0));
            if (!isFinite(score)) continue;
            scores.push({ id: entity.id, score, entity });
        }

        scores.sort((a, b) => b.score - a.score);
        const top = scores.slice(0, labelLimit).filter(s => s.score > 0);

        // Ensure Y on Earth Community is always labeled if present
        const yoec = this.findEntityByQuery('Y on Earth Community');
        if (yoec && !top.find(t => t.id === yoec.id)) {
            top.push({ id: yoec.id, score: Number.MAX_VALUE, entity: yoec.entity });
        }

        top.forEach(item => {
            const sprite = this.createTextSprite(item.entity.id);
            sprite.position.set(...item.entity.position);
            sprite.scale.set(60, 30, 1);
            sprite.userData.entityId = item.entity.id;
            this.scene.add(sprite);
            this.labelSprites.push(sprite);
        });

        // Cluster labels
        this.createClusterLabels();
    }

    createClusterLabels() {
        if (this.isMobile) return;
        // Remove existing labels
        this.clusterLabelSprites.forEach(s => this.scene.remove(s));
        this.clusterLabelSprites = [];

        const addLabel = (level, text, position, clusterId) => {
            const sprite = this.createTextSprite(text || '');
            sprite.position.set(...position);
            sprite.scale.set(120, 60, 1);
            sprite.userData.level = level;
            sprite.userData.clusterId = clusterId;
            sprite.userData.clusterPosition = position;
            sprite.userData.isClusterLabel = true;
            this.scene.add(sprite);
            this.clusterLabelSprites.push(sprite);
        };

        // CORRECTED: L0 (Red) labels - Top 30 by node_count (Global/Root categories)
        const l0Clusters = this.clusters['level_0'] || [];
        const l0Sorted = l0Clusters
            .map(c => ({
                cluster: c,
                nodeCount: (c.entities || []).length
            }))
            .sort((a, b) => b.nodeCount - a.nodeCount)
            .slice(0, 30); // Top 30 largest L0 clusters (out of 66)

        l0Sorted.forEach(({ cluster }) => {
            const label = cluster.name || cluster.title || cluster.label || cluster.id || 'L0';
            const pos = cluster.center || [0, 0, 0];
            addLabel(0, label, pos, cluster.id);
        });

        // L1 and L2 labels (on-demand visibility based on camera distance)
        const levelDefs = [
            { level: 1, key: 'level_1', fallback: 'L1', maxLabels: 50 }, // Gold community clusters
            { level: 2, key: 'level_2', fallback: 'L2', maxLabels: 30 }  // Cyan fine clusters
        ];

        for (const def of levelDefs) {
            const clusters = this.clusters[def.key] || [];
            const sorted = clusters
                .map(c => ({
                    cluster: c,
                    nodeCount: (c.entities || []).length
                }))
                .sort((a, b) => b.nodeCount - a.nodeCount)
                .slice(0, def.maxLabels);

            sorted.forEach(({ cluster }) => {
                const label = cluster.name || cluster.title || cluster.label || cluster.id || def.fallback;
                const pos = cluster.center || [0, 0, 0];
                addLabel(def.level, label, pos, cluster.id);
            });
        }
    }

    updateClusterLabelVisibility(l0Weight = 1.0, l1Weight = 0, l2Weight = 0) {
        if (!this.clusterLabelSprites.length) return;
        this.clusterLabelSprites.forEach(sprite => {
            const lvl = sprite.userData.level;
            let weight = 0;
            if (lvl === 0) weight = l0Weight; // L0 (Red) - Global/Root
            if (lvl === 1) weight = l1Weight; // L1 (Gold) - Community
            if (lvl === 2) weight = l2Weight; // L2 (Cyan) - Fine
            sprite.visible = weight > 0.15;
        });
    }

    /**
     * Update LOD (Level of Detail) based on camera distance
     * L0 (Red): Visible when camera > 500
     * L1 (Gold): Visible when camera 200-500
     * L2 (Cyan): Visible when camera < 200
     */
    updateLOD() {
        if (!this.camera || !this.clusterMeshes.length) return;

        const cameraDistance = this.camera.position.length();

        // Update membrane visibility based on camera distance
        this.clusterMeshes.forEach(mesh => {
            const level = mesh.userData.level;
            let visible = false;

            if (level === 0) {
                // L0 (Red): Visible when far (>500)
                visible = cameraDistance > 500;
            } else if (level === 1) {
                // L1 (Gold): Visible when mid-range (200-500)
                visible = cameraDistance >= 200 && cameraDistance <= 500;
            } else if (level === 2) {
                // L2 (Cyan): Visible when close (<200)
                visible = cameraDistance < 200;
            }

            mesh.visible = visible;
        });

        // Update label visibility based on LOD
        const l0Weight = cameraDistance > 500 ? 1.0 : 0.0;
        const l1Weight = (cameraDistance >= 200 && cameraDistance <= 500) ? 1.0 : 0.0;
        const l2Weight = cameraDistance < 200 ? 1.0 : 0.0;

        this.updateClusterLabelVisibility(l0Weight, l1Weight, l2Weight);
    }

    createTextSprite(text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const fontSize = 120;
        canvas.width = 1024;
        canvas.height = 512;
        ctx.font = `bold ${fontSize}px sans-serif`;

        // FIX 2: White text (#FFFFFF), black outline (#000000), larger outline
        ctx.fillStyle = '#FFFFFF';  // White text
        ctx.strokeStyle = '#000000'; // Black outline
        ctx.lineWidth = 8;  // Thicker outline for better contrast
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Stroke first for outline, then fill for white text on top
        ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // FIX 2: depthTest: false forces text to render ON TOP of membranes
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
            depthTest: false  // Always render on top
        });
        const sprite = new THREE.Sprite(material);
        sprite.userData.baseLabelScale = 1;
        return sprite;
    }

    /**
     * Show Leiden hierarchy labels and counts in the UI
     */
    updateHierarchyLabels() {
        const setCount = (id, value) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = typeof value === 'number'
                    ? value.toLocaleString()
                    : (value || '–');
            }
        };

        setCount('hierarchy-count-l0', this.entities.size);
        setCount('hierarchy-count-l1', this.clusters.level_1.length);
        setCount('hierarchy-count-l2', this.clusters.level_2.length);

        const l3Count = this.clusters.level_3.length;
        const l3Pill = document.getElementById('hierarchy-pill-l3');
        if (l3Pill) {
            l3Pill.style.display = l3Count > 0 ? 'block' : 'none';
        }
        setCount('hierarchy-count-l3', l3Count);

        const keyNote = document.getElementById('hierarchy-key-note');
        if (keyNote) {
            const detected = [];
            if (this.hierarchyKeyMap.L2) detected.push(`L2->${this.hierarchyKeyMap.L2}`);
            if (this.hierarchyKeyMap.L1) detected.push(`L1->${this.hierarchyKeyMap.L1}`);
            if (this.hierarchyKeyMap.L0) detected.push(`L0->${this.hierarchyKeyMap.L0}`);
            if (this.hierarchyKeyMap.L3) detected.push(`L3->${this.hierarchyKeyMap.L3}`);

            keyNote.textContent = detected.length
                ? `Hierarchy keys detected: ${detected.join(', ')}`
                : 'No hierarchy keys detected in data.';
        }
    }

    /**
     * Update relationship visibility based on currently visible entities
     */
    updateRelationshipVisibility() {
        if (!this.connectionLines.length) return;
        const structural = this.isStructuralMode();
        const selected = this.selectedEntity;

        this.connectionLines.forEach(line => {
            const sourceVisible = this.visibleEntities.has(line.userData.sourceId);
            const targetVisible = this.visibleEntities.has(line.userData.targetId);

            // In structural mode: show edges between visible entities
            if (structural) {
                line.visible = sourceVisible && targetVisible;
            } else {
                // In non-structural modes: show edges connected to selected entity
                if (selected) {
                    const isConnected = line.userData.sourceId === selected || line.userData.targetId === selected;
                    line.visible = isConnected && sourceVisible && targetVisible;
                } else {
                    line.visible = false;
                }
            }
        });
    }

    updateConnectionLinesGeometry() {
        if (!this.connectionLines.length) return;
        this.connectionLines.forEach(line => {
            const sourceMesh = line.userData.sourceMesh || this.entityMeshMap.get(line.userData.sourceId);
            const targetMesh = line.userData.targetMesh || this.entityMeshMap.get(line.userData.targetId);
            if (!sourceMesh || !targetMesh) return;

            const positions = line.geometry.attributes.position.array;
            positions[0] = sourceMesh.position.x;
            positions[1] = sourceMesh.position.y;
            positions[2] = sourceMesh.position.z;
            positions[3] = targetMesh.position.x;
            positions[4] = targetMesh.position.y;
            positions[5] = targetMesh.position.z;
            line.geometry.attributes.position.needsUpdate = true;
            if (line.geometry.boundingSphere) {
                line.geometry.boundingSphere.center.copy(sourceMesh.position).lerp(targetMesh.position, 0.5);
            } else {
                line.geometry.computeBoundingSphere();
            }
        });
    }

    /**
     * Hide all edges (for hierarchy views)
     */
    hideEdges() {
        if (!this.connectionLines.length) return;
        this.connectionLines.forEach(line => {
            line.visible = false;
        });
        console.log('Edges hidden for hierarchy view');
    }

    /**
     * Show edges (for network views)
     */
    showEdges() {
        if (!this.connectionLines.length) return;
        // Restore visibility based on current mode
        this.updateRelationshipVisibility();
        console.log('Edges restored for network view');
    }

    /**
     * Update membrane visibility per hierarchy level
     */
    updateMembraneVisibility() {
        if (!this.clusterMeshes.length) return;
        const showL3Checkbox = document.getElementById('show-clusters-l3');
        const showL2Checkbox = document.getElementById('show-clusters-l2');
        const showL1Checkbox = document.getElementById('show-clusters-l1');

        const showL3Setting = showL3Checkbox ? showL3Checkbox.checked : true;
        const showL2Setting = showL2Checkbox ? showL2Checkbox.checked : true;
        const showL1Setting = showL1Checkbox ? showL1Checkbox.checked : false;

        const camDist = this.camera.position.distanceTo(this.controls.target);
        const fadeWidth = 100;

        const l3FadeStart = 450, l3FadeEnd = 550;
        const l2FadeStart = 150, l2FadeEnd = 250;

        // L3 weight (far)
        let l3Weight = camDist >= l3FadeEnd ? 1 : (camDist <= l3FadeStart ? 0 : (camDist - l3FadeStart) / (l3FadeEnd - l3FadeStart));
        // L2 weight (mid)
        let l2Weight = 0;
        if (camDist <= l3FadeStart && camDist >= l2FadeEnd) {
            l2Weight = 1;
        } else if (camDist > l3FadeStart && camDist < l3FadeEnd) {
            l2Weight = 1 - l3Weight; // crossfade with L3
        } else if (camDist > l2FadeStart && camDist < l2FadeEnd) {
            l2Weight = (camDist - l2FadeStart) / (l2FadeEnd - l2FadeStart); // crossfade with L1
        }

        // L1 weight (near)
        let l1Weight = camDist <= l2FadeStart ? 1 : 0;
        if (camDist > l2FadeStart && camDist < l2FadeEnd) {
            l1Weight = 1 - l2Weight; // crossfade with L2
        }

        this.clusterMeshes.forEach(mesh => {
            const level = mesh.userData.level;
            let weight = 0;
            if (level === 3) weight = l3Weight * (showL3Setting ? 1 : 0);
            if (level === 2) weight = l2Weight * (showL2Setting ? 1 : 0);
            if (level === 1) weight = l1Weight * (showL1Setting ? 1 : 0);

            // Ghost parent context: keep parent faint when child active
            if (level === 3 && (l2Weight > 0 || l1Weight > 0) && showL3Setting) {
                weight = Math.max(weight, 0.03);
            }
            if (level === 2 && l1Weight > 0 && showL2Setting) {
                weight = Math.max(weight, 0.03);
            }

            mesh.visible = weight > 0.001;

            if (mesh.material && mesh.material.uniforms) {
                const baseEdge = mesh.userData.baseEdgeOpacity || 0.05;
                mesh.material.uniforms.edgeOpacity.value = baseEdge * weight;
            }
        });

        // Update cluster label visibility based on weights
        this.updateClusterLabelVisibility(l3Weight, l2Weight, l1Weight);
    }

    /**
     * Emphasize selected node and its neighbors
     */
    updateSelectionHighlight() {
        const selected = this.selectedEntity;
        const neighborSet = new Set();

        if (selected) {
            for (const rel of this.relationships || []) {
                if (rel.source === selected) neighborSet.add(rel.target);
                if (rel.target === selected) neighborSet.add(rel.source);
            }
        }

        this.entityMeshes.forEach(mesh => {
            const entityId = mesh.userData.entityId;
            const baseScale = mesh.userData.baseScale || 1;

            let factor = 1.0;
            if (selected) {
                if (entityId === selected) {
                    factor = 2.6;
                    mesh.material.opacity = 1.0;
                    mesh.material.emissiveIntensity = 0.6;
                } else if (neighborSet.has(entityId)) {
                    factor = 1.7;
                    mesh.material.opacity = 0.95;
                    mesh.material.emissiveIntensity = 0.45;
                } else {
                    factor = 0.7;
                    mesh.material.opacity = 0.4;
                    mesh.material.emissiveIntensity = 0.2;
                }
            } else {
                mesh.material.opacity = 0.9;
                mesh.material.emissiveIntensity = 0.4;
            }

            mesh.scale.set(baseScale * factor, baseScale * factor, baseScale * factor);
        });

        const structural = this.isStructuralMode();
        this.connectionLines.forEach(line => {
            const baseOpacity = line.userData.baseOpacity || 0.4;

            // In non-structural modes, only show edges when a node is selected
            if (!structural) {
                if (!selected) {
                    line.material.opacity = 0.0;
                    return;
                }
                // Show edges connected to selected entity
                const isConnected = line.userData.sourceId === selected || line.userData.targetId === selected;
                if (isConnected) {
                    line.material.opacity = 0.6; // Visible but subtle in semantic/contextual modes
                } else {
                    line.material.opacity = 0.0;
                }
                return;
            }

            // Structural mode: show all edges with selection highlighting
            if (!selected) {
                line.material.opacity = baseOpacity;
                return;
            }
            const isConnected = line.userData.sourceId === selected || line.userData.targetId === selected;
            const isNeighbor = neighborSet.has(line.userData.sourceId) || neighborSet.has(line.userData.targetId);

            if (isConnected || isNeighbor) {
                line.material.opacity = Math.min(1.0, baseOpacity * 2.0);
            } else {
                line.material.opacity = Math.max(0.05, baseOpacity * 0.2);
            }
        });
    }

    /**
     * Update node materials based on selected color mode
     */
    applyColorMode() {
        console.log('[applyColorMode] Starting, meshes count:', this.entityMeshes.length);
        console.log('[applyColorMode] Current colorMode:', this.colorMode);
        console.log('[applyColorMode] L2 mapping size:', this.entityToL3Cluster.size);
        console.log('[applyColorMode] L2 colors size:', this.l3ClusterColors.size);

        let coloredCount = 0;
        let grayCount = 0;

        // Update 3D Three.js meshes (for 3D views)
        this.entityMeshes.forEach(mesh => {
            const entity = mesh.userData.entity;
            const colorHex = this.getEntityColor(entity);
            mesh.material.color.setHex(colorHex);
            mesh.material.emissive.setHex(colorHex);
            if (colorHex === 0x666666) grayCount++;
            else coloredCount++;
        });

        // Update 2D D3 SVG nodes (for Voronoi 2 view)
        const self = this;
        const voronoi2Nodes = d3.selectAll('.voronoi2-node');
        console.log('[applyColorMode] Voronoi2 SVG nodes found:', voronoi2Nodes.size());

        if (voronoi2Nodes.size() > 0) {
            let svgColored = 0;
            let svgGray = 0;
            voronoi2Nodes.each(function(d) {
                const entityName = d[0];
                const entity = self.entities.get(entityName) || { name: entityName };
                const colorHex = self.getEntityColor(entity);
                const colorStr = '#' + colorHex.toString(16).padStart(6, '0');
                d3.select(this).attr('fill', colorStr);
                if (colorHex === 0x666666) svgGray++;
                else svgColored++;
            });
            console.log('[applyColorMode] SVG nodes. Colored:', svgColored, 'Gray:', svgGray);
        }

        console.log('[applyColorMode] 3D meshes done. Colored:', coloredCount, 'Gray:', grayCount);
    }

    /**
     * Determine entity color based on current color mode
     */
    getEntityColor(entity) {
        if (this.colorMode === 'centrality') {
            return this.getCentralityColor(entity.betweenness || 0);
        }

        if (this.colorMode === 'l3cluster') {
            const entityName = entity.name || entity.id;
            const l3ClusterId = this.entityToL3Cluster.get(entityName);
            if (l3ClusterId && this.l3ClusterColors.has(l3ClusterId)) {
                return this.l3ClusterColors.get(l3ClusterId);
            }
            return 0x666666; // Gray for unassigned entities
        }

        return this.typeColors[entity.type] || 0xcccccc;
    }

    /**
     * Map betweenness centrality to a blue→yellow→red gradient
     */
    getCentralityColor(score) {
        const value = Math.max(0, Math.min(1, score || 0));
        const color = new THREE.Color();

        if (value <= 0.33) {
            color.lerpColors(
                new THREE.Color(this.centralityColors.low),
                new THREE.Color(this.centralityColors.mid),
                value / 0.33
            );
        } else if (value <= 0.67) {
            color.lerpColors(
                new THREE.Color(this.centralityColors.mid),
                new THREE.Color(this.centralityColors.high),
                (value - 0.33) / 0.34
            );
        } else {
            color.setHex(this.centralityColors.high);
        }

        return color.getHex();
    }

    /**
     * Build entity-to-L2 cluster mapping with colors grouped by L3 super-clusters
     * This enables coloring ALL nodes by their L2 cluster membership
     * L2 clusters have full entity coverage (all 17,280 entities)
     */
    buildL3ClusterMapping() {
        const l2Clusters = this.clusters['level_2'] || [];
        const l3Clusters = this.clusters['level_3'] || [];

        if (l2Clusters.length === 0) {
            console.log('No L2 clusters available for mapping');
            return;
        }

        // Generate colors - use 57 base colors (one per L3 cluster) with slight variations for L2 subclusters
        const numL3Colors = Math.max(l3Clusters.length, 57);
        const l3Colors = [];
        for (let i = 0; i < numL3Colors; i++) {
            const hue = (i * 137.5) % 360;
            const saturation = 70 + (i % 3) * 10; // 70-90%
            const lightness = 45 + (i % 4) * 5;   // 45-60%
            const color = new THREE.Color();
            color.setHSL(hue / 360, saturation / 100, lightness / 100);
            l3Colors.push(color.getHex());
        }

        // Assign colors to L2 clusters (cycle through L3 colors)
        l2Clusters.forEach((cluster, index) => {
            const colorIndex = index % numL3Colors;
            this.l3ClusterColors.set(cluster.id, l3Colors[colorIndex]);
        });

        // Map entities to their L2 cluster (using entityToL3Cluster map name for compatibility)
        for (const cluster of l2Clusters) {
            const clusterId = cluster.id;
            const entities = cluster.entities || [];

            for (const entityName of entities) {
                this.entityToL3Cluster.set(entityName, clusterId);
            }
        }

        console.log(`L2 Cluster Mapping: ${this.entityToL3Cluster.size} entities mapped to ${l2Clusters.length} L2 clusters (${numL3Colors} colors)`);
    }

    /**
     * Compute relationship strength (0-1) from weight or per-entity strengths
     */
    getRelationshipStrength(relationship) {
        if (!relationship) return 0;

        if (typeof relationship.weight === 'number') {
            return this.clampStrength(relationship.weight);
        }

        const sourceStrengths = (this.entities.get(relationship.source) || {}).relationshipStrengths || {};
        const targetStrengths = (this.entities.get(relationship.target) || {}).relationshipStrengths || {};

        const strengths = [];

        if (typeof sourceStrengths[relationship.target] === 'number') {
            strengths.push(sourceStrengths[relationship.target]);
        }

        if (typeof targetStrengths[relationship.source] === 'number') {
            strengths.push(targetStrengths[relationship.source]);
        }

        if (strengths.length === 0) return 0;

        const avg = strengths.reduce((a, b) => a + b, 0) / strengths.length;
        return this.clampStrength(avg);
    }

    /**
     * Precompute degree and weighted degree per entity for sizing
     */
    computeConnectivityStats() {
        const degreeMap = new Map();

        const ensure = (id) => {
            if (!degreeMap.has(id)) {
                degreeMap.set(id, { degree: 0, weighted: 0 });
            }
            return degreeMap.get(id);
        };

        // Seed all entities to track zeros as well
        for (const id of this.entities.keys()) {
            ensure(id);
        }

        for (const rel of this.relationships || []) {
            const s = rel.source;
            const t = rel.target;
            if (!this.entities.has(s) || !this.entities.has(t)) continue;

            const entryS = ensure(s);
            const entryT = ensure(t);

            entryS.degree += 1;
            entryT.degree += 1;

            const strength = this.getRelationshipStrength(rel);
            const effective = strength > 0 ? strength : 0.1;
            entryS.weighted += effective;
            entryT.weighted += effective;
        }

        let minDegree = Infinity, maxDegree = 0;
        let minWeighted = Infinity, maxWeighted = 0;
        let minBetweenness = Infinity, maxBetweenness = 0;

        for (const [id, stats] of degreeMap.entries()) {
            const entity = this.entities.get(id);
            if (!entity) continue;

            entity.degree = stats.degree;
            entity.weightedDegree = stats.weighted;
        }

        for (const entity of this.entities.values()) {
            const deg = entity.degree || 0;
            const wdeg = entity.weightedDegree || 0;
            const btw = typeof entity.betweenness === 'number' ? entity.betweenness : null;

            minDegree = Math.min(minDegree, deg);
            maxDegree = Math.max(maxDegree, deg);
            minWeighted = Math.min(minWeighted, wdeg);
            maxWeighted = Math.max(maxWeighted, wdeg);

            if (btw !== null) {
                minBetweenness = Math.min(minBetweenness, btw);
                maxBetweenness = Math.max(maxBetweenness, btw);
            }
        }

        if (!isFinite(minDegree)) minDegree = 0;
        if (!isFinite(minWeighted)) minWeighted = 0;
        if (!isFinite(minBetweenness)) minBetweenness = 0;

        this.connectivityStats = {
            minDegree,
            maxDegree,
            minWeighted,
            maxWeighted,
            minBetweenness,
            maxBetweenness
        };
    }

    /**
     * Convert relationship strength to line width
     */
    mapStrengthToLineWidth(strength) {
        const clamped = this.clampStrength(strength);
        return this.edgeStyles.minWidth +
            clamped * (this.edgeStyles.maxWidth - this.edgeStyles.minWidth);
    }

    clampStrength(value) {
        const numeric = typeof value === 'string' ? parseFloat(value) : value;
        if (typeof numeric !== 'number' || Number.isNaN(numeric)) return 0;
        return Math.max(0, Math.min(1, numeric));
    }

    /**
     * Get top neighbors by strength
     */
    getTopNeighbors(entityId, limit = 5) {
        const neighbors = [];
        for (const rel of this.relationships || []) {
            if (rel.source === entityId || rel.target === entityId) {
                const otherId = rel.source === entityId ? rel.target : rel.source;
                const other = this.entities.get(otherId);
                if (!other) continue;
                const strength = this.getRelationshipStrength(rel);
                neighbors.push({ id: otherId, type: other.type, strength });
            }
        }
        neighbors.sort((a, b) => (b.strength || 0) - (a.strength || 0));
        return neighbors.slice(0, limit);
    }

    /**
     * Collect incoming/outgoing edges for an entity
     */
    getEdgeDetails(entityId, limit = 10) {
        const incoming = [];
        const outgoing = [];
        for (const rel of this.relationships || []) {
            // Use predicate (from data) or type (legacy) or fallback to 'related'
            const edgeType = rel.predicate || rel.type || 'related';
            if (rel.target === entityId) {
                incoming.push({
                    source: rel.source,
                    target: rel.target,
                    type: edgeType,
                    strength: this.getRelationshipStrength(rel)
                });
            }
            if (rel.source === entityId) {
                outgoing.push({
                    source: rel.source,
                    target: rel.target,
                    type: edgeType,
                    strength: this.getRelationshipStrength(rel)
                });
            }
        }

        incoming.sort((a, b) => (b.strength || 0) - (a.strength || 0));
        outgoing.sort((a, b) => (b.strength || 0) - (a.strength || 0));

        return {
            incoming: incoming.slice(0, limit),
            outgoing: outgoing.slice(0, limit)
        };
    }

    /**
     * Find an entity by query (case-insensitive substring match on id)
     */
    findEntityByQuery(query) {
        if (!query) return null;
        const q = query.toLowerCase();
        // Exact id match
        for (const [id, entity] of this.entities.entries()) {
            if (id.toLowerCase() === q) {
                return { id, entity };
            }
        }
        // Substring match fallback
        for (const [id, entity] of this.entities.entries()) {
            if (id.toLowerCase().includes(q)) {
                return { id, entity };
            }
        }
        return null;
    }

    /**
     * Map connectivity to node scale
     */
    getNodeScale(entity) {
        const stats = this.connectivityStats || {};
        const baseMinScale = 0.25;
        const baseMaxScale = 10.0;

        const scaleFrom = (value, min, max, customMin = baseMinScale, customMax = baseMaxScale) => {
            if (!isFinite(value)) value = 0;
            if (!isFinite(min)) min = 0;
            if (!isFinite(max) || max <= min) max = min + 1;
            const norm = (value - min) / (max - min);
            const clamped = Math.max(0, Math.min(1, norm));
            return customMin + clamped * (customMax - customMin);
        };

        if (this.sizeMode === 'betweenness' && typeof entity.betweenness === 'number') {
            const span = (stats.maxBetweenness || 0) - (stats.minBetweenness || 0);
            if (span > 1e-6) {
                const customMin = 1.2;
                const customMax = 12.0;
                const min = stats.minBetweenness;
                const max = stats.maxBetweenness;
                const norm = (entity.betweenness - min) / (max - min);
                const eased = Math.pow(Math.max(0, Math.min(1, norm)), 0.2); // very strong spread
                return customMin + eased * (customMax - customMin);
            }
            // fall back if no variation
        }

        const value = (entity && entity.weightedDegree > 0)
            ? entity.weightedDegree
            : (entity && entity.degree > 0 ? entity.degree : 1);
        const min = (stats.minWeighted && stats.minWeighted > 0)
            ? stats.minWeighted
            : (stats.minDegree || 0);
        const max = (stats.maxWeighted && stats.maxWeighted > 0)
            ? stats.maxWeighted
            : (stats.maxDegree || value);
        const logMin = Math.log1p(min);
        const logMax = Math.log1p(max);
        const logVal = Math.log1p(value);
        let norm = (logMax > logMin) ? (logVal - logMin) / (logMax - logMin) : 0;
        norm = Math.pow(Math.max(0, Math.min(1, norm)), 0.25); // very strong spread
        const clamped = Math.max(0, Math.min(1, norm));
        return baseMinScale + clamped * (baseMaxScale - baseMinScale);
    }

    /**
     * Normalize entity and cluster positions to a consistent scale centered at origin
     */
    normalizePositions() {
        if (this.entities.size === 0) return;

        const umapPositions = [];
        const sagePositions = [];
        const forcePositions = [];

        for (const entity of this.entities.values()) {
            if (Array.isArray(entity.rawUmapPosition)) {
                umapPositions.push(entity.rawUmapPosition);
            }
            if (Array.isArray(entity.rawSagePosition)) {
                sagePositions.push(entity.rawSagePosition);
            }
            if (Array.isArray(entity.rawForcePosition)) {
                forcePositions.push(entity.rawForcePosition);
            }
        }

        const umapTransform = this.createNormalizationTransform(umapPositions);
        // Use linear transform for GraphSAGE to preserve volumetric distribution
        // (the radial exponent in standard transform creates shell effect)
        const sageTransform = this.createLinearNormalizationTransform(sagePositions);
        // Use linear transform for force layout to preserve the structural relationships
        const forceTransform = this.createLinearNormalizationTransform(forcePositions);

        let semanticRadius = 0;
        let contextualRadius = 0;
        let structuralRadius = 0;

        for (const entity of this.entities.values()) {
            if (entity.rawUmapPosition && umapTransform) {
                entity.umapPosition = umapTransform(entity.rawUmapPosition);
            } else if (entity.rawUmapPosition) {
                entity.umapPosition = [...entity.rawUmapPosition];
            }

            if (entity.rawSagePosition && sageTransform) {
                entity.sagePosition = sageTransform(entity.rawSagePosition);
            } else if (entity.rawSagePosition) {
                entity.sagePosition = [...entity.rawSagePosition];
            } else {
                entity.sagePosition = null;
            }

            if (entity.rawForcePosition && forceTransform) {
                entity.forcePosition = forceTransform(entity.rawForcePosition);
            } else if (entity.rawForcePosition) {
                entity.forcePosition = [...entity.rawForcePosition];
            } else {
                entity.forcePosition = null;
            }

            const initialPosition = entity.umapPosition
                ? [...entity.umapPosition]
                : (entity.sagePosition ? [...entity.sagePosition] : [0, 0, 0]);

            entity.position = initialPosition;
            entity.x = initialPosition[0];
            entity.y = initialPosition[1];
            entity.z = initialPosition[2];

            if (entity.umapPosition) {
                const r = Math.hypot(...entity.umapPosition);
                semanticRadius = Math.max(semanticRadius, r);
            }
            if (entity.sagePosition) {
                const r = Math.hypot(...entity.sagePosition);
                contextualRadius = Math.max(contextualRadius, r);
            }
            if (entity.forcePosition) {
                const r = Math.hypot(...entity.forcePosition);
                structuralRadius = Math.max(structuralRadius, r);
            }
        }

        if (umapTransform) {
            ['level_1', 'level_2', 'level_3'].forEach(level => {
                this.clusters[level].forEach(cluster => {
                    const rawCenter = cluster.rawCenter || cluster.center || [0, 0, 0];
                    cluster.center = umapTransform(rawCenter);
                });
            });
        }

        const maxRadius = Math.max(180, semanticRadius, contextualRadius, structuralRadius);
        this.boundingRadius = maxRadius * 1.1;
    }

    createNormalizationTransform(positions, targetExtent = 1800) {
        if (!positions || positions.length === 0) {
            return null;
        }

        const mins = [Infinity, Infinity, Infinity];
        const maxs = [-Infinity, -Infinity, -Infinity];

        positions.forEach(pos => {
            if (!Array.isArray(pos)) return;
            mins[0] = Math.min(mins[0], pos[0]);
            mins[1] = Math.min(mins[1], pos[1]);
            mins[2] = Math.min(mins[2], pos[2]);
            maxs[0] = Math.max(maxs[0], pos[0]);
            maxs[1] = Math.max(maxs[1], pos[1]);
            maxs[2] = Math.max(maxs[2], pos[2]);
        });

        const extents = [
            maxs[0] - mins[0],
            maxs[1] - mins[1],
            maxs[2] - mins[2]
        ];

        const maxExtent = Math.max(...extents);
        if (!isFinite(maxExtent) || maxExtent === 0) {
            return (pos) => Array.isArray(pos) ? [...pos] : [0, 0, 0];
        }

        const scale = targetExtent / maxExtent;
        const center = [
            (mins[0] + maxs[0]) / 2,
            (mins[1] + maxs[1]) / 2,
            (mins[2] + maxs[2]) / 2
        ];
        const halfExtent = targetExtent / 2;
        const radialExponent = 0.45;

        return (pos) => {
            if (!Array.isArray(pos)) return [0, 0, 0];
            const x = (pos[0] - center[0]) * scale;
            const y = (pos[1] - center[1]) * scale;
            const z = (pos[2] - center[2]) * scale;
            const r = Math.sqrt(x * x + y * y + z * z);
            if (r === 0) return [0, 0, 0];

            const normalizedR = Math.min(1, r / halfExtent);
            const scaledR = halfExtent * Math.pow(normalizedR, radialExponent);
            const factor = scaledR / r;
            return [x * factor, y * factor, z * factor];
        };
    }

    /**
     * Create a LINEAR normalization transform that preserves volumetric distribution.
     * Unlike createNormalizationTransform, this doesn't apply radial compression,
     * making it suitable for GraphSAGE/UMAP cosine layouts that already have good 3D spread.
     *
     * Uses 99th percentile for scaling to prevent outliers from shrinking the main cluster.
     * Outliers beyond the percentile bounds are clamped.
     */
    createLinearNormalizationTransform(positions, targetExtent = 1800) {
        if (!positions || positions.length === 0) {
            return null;
        }

        // Collect all coordinate values for percentile calculation
        const xVals = [], yVals = [], zVals = [];
        positions.forEach(pos => {
            if (!Array.isArray(pos)) return;
            xVals.push(pos[0]);
            yVals.push(pos[1]);
            zVals.push(pos[2]);
        });

        if (xVals.length === 0) return null;

        // Helper to get percentile value from sorted array
        const percentile = (sortedArr, p) => {
            const idx = Math.floor((p / 100) * (sortedArr.length - 1));
            return sortedArr[idx];
        };

        // Sort and get 1st and 99th percentile bounds (handles outliers)
        xVals.sort((a, b) => a - b);
        yVals.sort((a, b) => a - b);
        zVals.sort((a, b) => a - b);

        const bounds = {
            x: { min: percentile(xVals, 1), max: percentile(xVals, 99) },
            y: { min: percentile(yVals, 1), max: percentile(yVals, 99) },
            z: { min: percentile(zVals, 1), max: percentile(zVals, 99) }
        };

        const extents = [
            bounds.x.max - bounds.x.min,
            bounds.y.max - bounds.y.min,
            bounds.z.max - bounds.z.min
        ];

        const maxExtent = Math.max(...extents);
        if (!isFinite(maxExtent) || maxExtent === 0) {
            return (pos) => Array.isArray(pos) ? [...pos] : [0, 0, 0];
        }

        const scale = targetExtent / maxExtent;
        const center = [
            (bounds.x.min + bounds.x.max) / 2,
            (bounds.y.min + bounds.y.max) / 2,
            (bounds.z.min + bounds.z.max) / 2
        ];

        // Linear transform with outlier clamping
        const halfExtent = targetExtent / 2;
        return (pos) => {
            if (!Array.isArray(pos)) return [0, 0, 0];

            // Clamp to percentile bounds before scaling
            const clampedX = Math.max(bounds.x.min, Math.min(bounds.x.max, pos[0]));
            const clampedY = Math.max(bounds.y.min, Math.min(bounds.y.max, pos[1]));
            const clampedZ = Math.max(bounds.z.min, Math.min(bounds.z.max, pos[2]));

            return [
                (clampedX - center[0]) * scale,
                (clampedY - center[1]) * scale,
                (clampedZ - center[2]) * scale
            ];
        };
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    /**
     * Update loading screen status
     */
    updateLoadingStatus(message) {
        const statusEl = document.getElementById('loading-status');
        if (statusEl) {
            statusEl.textContent = message;
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    hideOrganicTooltip() {
        // Stub method - can be expanded if tooltips are added later
    }

    resetCirclePackZoom() {
        // Reset Circle Pack zoom to root view
        if (!this.circlePackState.zoom || !this.circlePackState.group) {
            return;
        }

        const { svg, group, width, height } = this.circlePackState;

        // Reset zoom transform to identity (no zoom/pan)
        svg.transition()
            .duration(750)
            .call(this.circlePackState.zoom.transform, d3.zoomIdentity);
    }

    /**
     * Animation loop
     */
    animate() {
        // Check if disposed
        if (!this.renderer || !this.scene || !this.camera) {
            return;
        }

        this.animationFrameId = requestAnimationFrame(() => this.animate());

        // Update controls
        this.controls.update();
        this.updateActiveTransitions();

        // Keep labels legible relative to camera distance
        this.updateLabelScales();
        this.updateMembraneVisibility();

        // Update LOD (Level of Detail) based on camera distance
        this.updateLOD();

        // Update Fresnel shader uniforms (camera position changes)
        // Render scene
        this.renderer.render(this.scene, this.camera);

        // Update FPS counter
        this.frameCount++;
        const now = Date.now();
        if (now - this.lastFPSUpdate >= 1000) {
            const fps = Math.round((this.frameCount * 1000) / (now - this.lastFPSUpdate));
            document.getElementById('fps-counter').textContent = fps;
            this.frameCount = 0;
            this.lastFPSUpdate = now;
        }
    }

    /**
     * ========================================
     * 2D VISUALIZATION METHODS (Circle Pack & Voronoi)
     * ========================================
     */

    /**
     * Render 2D visualization (Circle Pack or Voronoi)
     */
    async render2DVisualization(mode) {
        console.log('Rendering 2D visualization:', mode);

        // Always rebuild hierarchical data fresh
        this.hierarchicalData = this.buildHierarchicalData();

        if (!this.hierarchicalData || !this.hierarchicalData.children) {
            console.warn('Failed to build hierarchy data; skipping render.');
            return;
        }

        const svg = d3.select('#svg-container-2d');
        svg.selectAll('*').remove();

        const width = window.innerWidth;
        const height = window.innerHeight;
        svg.attr('width', width).attr('height', height);

        const g = svg.append('g').attr('class', 'organic-root');

        this.circlePackState.svg = svg;
        this.circlePackState.group = g;
        this.circlePackState.width = width;
        this.circlePackState.height = height;
        this.circlePackState.zoom = null;

        svg.on('click', () => {
            if (mode === 'circle-pack') {
                this.resetCirclePackZoom();
            }
            this.hideOrganicTooltip();
        });

        if (mode === 'circle-pack') {
            this.renderCirclePacking(svg, g, width, height);
        } else if (mode === 'voronoi') {
            this.renderVoronoiTreemap(svg, g, width, height);
        } else if (mode === 'voronoi-2') {
            await this.renderVoronoi2View(svg, g, width, height);
        } else if (mode === 'voronoi-3') {
            await this.renderVoronoi3View(svg, g, width, height);
        } else if (mode === 'voronoi4') {
            await this.renderVoronoi4View(svg, g, width, height);
        } else if (mode === 'voronoi5') {
            await this.renderVoronoi5View(svg, g, width, height);
        } else if (mode === 'stricttreemap') {
            await this.renderStrictTreemapView(svg, g, width, height);
        } else if (mode === 'hierarchical') {
            await this.renderHierarchicalView(svg, g, width, height);
        }
    }

    /**
     * Hide organic tooltip (stub for now)
     */
    hideOrganicTooltip() {
        // Stub method - can be expanded if tooltips are added later
    }

    /**
     * Build hierarchical data structure for D3
     * CORRECTED HIERARCHY: Root -> L0 (66 Red/Global) -> L1 (762 Gold/Community) -> Entities
     */
    buildHierarchicalData() {
        const clusters = this.clusters || {};
        // Use level_3 as top (coarse), level_2 as mid, level_1 as fine
        // Convert cluster objects to arrays (hierarchy stores clusters as objects with IDs as keys)
        const level3Clusters = Object.values(clusters.level_3 || {});
        const level2Clusters = Object.values(clusters.level_2 || {});
        const level1Clusters = Object.values(clusters.level_1 || {});

        console.log('Building hierarchy from clusters:', {
            level3: level3Clusters.length,
            level2: level2Clusters.length,
            level1: level1Clusters.length
        });

        if (level3Clusters.length > 0) {
            console.log('Sample L3 cluster:', level3Clusters[0]);
        }

        const root = {
            name: "Knowledge Graph",
            id: "root",
            children: []
        };

        // Process Level 3 (7 coarse - top level as RED)
        for (const l3Cluster of level3Clusters) {
            const topNode = {
                name: l3Cluster.title || l3Cluster.name || l3Cluster.id,
                id: l3Cluster.id,
                level: 3,
                color: '#FF4444', // Red
                value: l3Cluster.node_count || l3Cluster.entities?.length || 10,
                children: []
            };

            // Add L2 children (medium clusters as GOLD)
            const l3Children = l3Cluster.children || [];
            for (const childId of l3Children.slice(0, 20)) { // Limit for performance
                const l2Cluster = level2Clusters.find(c => c.id === childId);
                if (!l2Cluster) continue;

                const midNode = {
                    name: l2Cluster.title || l2Cluster.name || childId,
                    id: childId,
                    level: 2,
                    color: '#FFCC00', // Gold
                    value: l2Cluster.node_count || l2Cluster.entities?.length || 5,
                    children: []
                };

                // Add L1 children (fine clusters as CYAN)
                const l2Children = l2Cluster.children || [];
                for (const l1ChildId of l2Children.slice(0, 10)) {
                    const l1Cluster = level1Clusters.find(c => c.id === l1ChildId);
                    if (!l1Cluster) continue;

                    // Store entity IDs for info panel lookup, but don't add as children
                    // This keeps voronoi simple (clusters only) while allowing entity display on click
                    const entityIds = l1Cluster.entities || [];

                    const l1Node = {
                        name: l1Cluster.title || l1Cluster.name || l1ChildId,
                        id: l1ChildId,
                        level: 1,
                        color: '#00CCFF', // Cyan
                        value: l1Cluster.node_count || entityIds.length || 1,
                        entityIds: entityIds, // Store for info panel lookup
                        children: [] // No L0 children in voronoi - displayed in info panel instead
                    };

                    midNode.children.push(l1Node);
                }

                if (midNode.children.length > 0) {
                    topNode.children.push(midNode);
                }
            }

            if (topNode.children.length > 0) {
                root.children.push(topNode);
            }
        }

        console.log(`Built hierarchy: ${root.children.length} top-level clusters`);

        // DEBUG: Log cluster names to verify mapping
        if (root.children.length > 0) {
            console.log('Sample cluster names:');
            root.children.slice(0, 3).forEach(c => {
                console.log(`  L3: "${c.name}" (${c.children.length} children)`);
                if (c.children.length > 0) {
                    c.children.slice(0, 2).forEach(c2 => {
                        console.log(`    L2: "${c2.name}"`);
                    });
                }
            });
        }

        return root;
    }

    /**
     * Render Circle Packing visualization with progressive disclosure
     * Shows only top-level labels by default, reveals children on hover
     */
    renderCirclePacking(svg, g, width, height) {
        const hierarchy = d3.hierarchy(this.hierarchicalData)
            .sum(d => d.value || 1)
            .sort((a, b) => b.value - a.value);

        const pack = d3.pack()
            .size([width, height])
            .padding(8);

        const root = pack(hierarchy);
        let hoveredNode = null;

        // Create circles
        const circles = g.selectAll('circle')
            .data(root.descendants())
            .join('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => d.r)
            .attr('class', d => `circle-node level-${d.data.level || 0}`)
            .attr('fill', d => {
                if (d.depth === 0) return 'none'; // Root
                const level = d.data.level;
                if (level === 3) return '#FF4444'; // L3 Red (top)
                if (level === 2) return '#FFCC00'; // L2 Gold (mid)
                if (level === 1) return '#00CCFF'; // L1 Cyan (fine)
                return '#888888';
            })
            .attr('fill-opacity', d => {
                if (d.depth === 0) return 0; // Root
                // Initially hide L2 and L1 circles (will show on hover)
                const level = d.data.level;
                if (level === 3) return 0.3;
                return 0; // Hide L2 and L1 initially
            })
            .attr('stroke', d => {
                if (d.depth === 0) return 'none';
                const level = d.data.level;
                if (level === 3) return '#FF4444';
                if (level === 2) return '#FFCC00';
                if (level === 1) return '#00CCFF';
                return '#888888';
            })
            .attr('stroke-width', d => d.depth === 0 ? 0 : 2)
            .attr('stroke-opacity', d => {
                if (d.depth === 0) return 0;
                return d.data.level === 3 ? 1 : 0; // Show only L3 borders initially
            })
            .style('cursor', d => d.depth > 0 && d.data.level >= 1 ? 'pointer' : 'default')
            .on('click', (event, d) => {
                if (d.depth > 0 && d.data.level >= 1) {
                    event.stopPropagation(); // Prevent background reset
                    this.updateCirclePackInfoPanel(d);
                }
            })
            .on('mouseover', function(event, d) {
                if (d.depth === 0) return;
                hoveredNode = d;

                // Reveal this node's children and siblings
                circles
                    .transition()
                    .duration(200)
                    .attr('fill-opacity', node => {
                        if (node.depth === 0) return 0;
                        // Show hovered node's direct children
                        if (node.parent === d) return 0.6;
                        // Show siblings of hovered node (same parent)
                        if (node.parent === d.parent && node !== d) return 0.3;
                        // Keep showing L3 nodes
                        if (node.data.level === 3) return 0.3;
                        return 0;
                    })
                    .attr('stroke-opacity', node => {
                        if (node.depth === 0) return 0;
                        // Show borders for children, siblings, and L3
                        if (node.parent === d || node.parent === d.parent || node.data.level === 3) return 1;
                        return 0;
                    });

                // Update labels visibility
                updateLabels(d);
            })
            .on('mouseout', function(event, d) {
                // Check if we're moving to a child or staying in hierarchy
                const relatedTarget = event.relatedTarget;
                if (relatedTarget && relatedTarget.__data__ &&
                    (relatedTarget.__data__.parent === d || relatedTarget.__data__ === d.parent)) {
                    return; // Don't hide if moving within hierarchy
                }

                hoveredNode = null;

                // Hide all except L3
                circles
                    .transition()
                    .duration(300)
                    .attr('fill-opacity', node => {
                        if (node.depth === 0) return 0;
                        return node.data.level === 3 ? 0.3 : 0;
                    })
                    .attr('stroke-opacity', node => {
                        if (node.depth === 0) return 0;
                        return node.data.level === 3 ? 1 : 0;
                    });

                updateLabels(null);
            });

        // Add labels - dynamically show/hide based on hover
        const labels = g.selectAll('text')
            .data(root.descendants().filter(d => d.depth > 0 && d.data.level >= 1))
            .join('text')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('class', d => `label-node level-${d.data.level}`)
            .attr('fill', '#ffffff')
            .attr('font-size', d => {
                // Adaptive font size based on circle radius
                const baseFontSize = Math.min(d.r / 3.5, 18);
                return Math.max(baseFontSize, 10);
            })
            .attr('font-weight', d => d.data.level === 3 ? '700' : (d.data.level === 2 ? '600' : '500'))
            .attr('pointer-events', 'none')
            .style('opacity', d => d.data.level === 3 ? 1 : 0) // Show only L3 labels initially
            .each(function(d) {
                // Wrap text to fit inside circle
                wrapText(d3.select(this), d.data.name, d.r * 1.8);
            });

        // Function to wrap text inside circles
        function wrapText(textElement, text, maxWidth) {
            const words = text.split(/\s+/);
            let line = [];
            let lineNumber = 0;
            const lineHeight = 1.1;
            const y = textElement.attr('y');
            const dy = parseFloat(textElement.attr('dy'));

            textElement.text(null);

            let tspan = textElement.append('tspan')
                .attr('x', textElement.attr('x'))
                .attr('y', y)
                .attr('dy', dy + 'em');

            for (let word of words) {
                line.push(word);
                tspan.text(line.join(' '));
                if (tspan.node().getComputedTextLength() > maxWidth) {
                    line.pop();
                    tspan.text(line.join(' '));
                    line = [word];
                    tspan = textElement.append('tspan')
                        .attr('x', textElement.attr('x'))
                        .attr('y', y)
                        .attr('dy', ++lineNumber * lineHeight + dy + 'em')
                        .text(word);
                }
            }

            // Center multi-line text
            const numLines = textElement.selectAll('tspan').size();
            if (numLines > 1) {
                const offset = -(numLines - 1) * lineHeight * 0.5;
                textElement.selectAll('tspan').attr('dy', function(d, i) {
                    return (offset + i * lineHeight) + 'em';
                });
            }
        }

        // Function to update label visibility based on hover
        function updateLabels(hoveredNode) {
            labels
                .transition()
                .duration(200)
                .style('opacity', d => {
                    // Hide the hovered node's label (so you can see inside it)
                    if (hoveredNode && d === hoveredNode) return 0;

                    // Show labels for hovered node's children
                    if (hoveredNode && d.parent === hoveredNode) return 1;

                    // Show labels for siblings of hovered node
                    if (hoveredNode && d.parent === hoveredNode.parent && d !== hoveredNode) return 1;

                    // Show L3 labels by default (when nothing hovered)
                    if (!hoveredNode && d.data.level === 3) return 1;

                    return 0;
                });
        }

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 10])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);
    }

    /**
     * Update info panel with cluster details when clicked
     */
    updateCirclePackInfoPanel(node) {
        const panel = document.getElementById('info-panel');
        // Try both 'info-content' and 'panel-content' for compatibility
        const content = document.getElementById('info-content') || document.getElementById('panel-content');

        if (!panel || !content) return;

        const levelName = node.data.level === 3 ? 'Top-Level Cluster' :
                         node.data.level === 2 ? 'Community Cluster' : 'Fine Cluster';

        const numEntities = node.data.entities?.length || node.descendants().filter(d => d.data.level === 0).length || 0;
        const numChildren = node.children?.length || 0;

        content.innerHTML = `
            <div class="cluster-info">
                <h3 style="color: #64b5f6; margin: 0 0 12px 0;">${node.data.name || node.data.id}</h3>
                <div style="color: #999; font-size: 13px; margin-bottom: 8px;">${levelName}</div>
                <div style="margin: 12px 0;">
                    <div style="color: #ccc; margin: 4px 0;">
                        <strong>Entities:</strong> ${numEntities.toLocaleString()}
                    </div>
                    ${numChildren > 0 ? `<div style="color: #ccc; margin: 4px 0;">
                        <strong>Sub-clusters:</strong> ${numChildren}
                    </div>` : ''}
                </div>
            </div>
        `;

        // Make sure panel is visible
        panel.classList.remove('collapsed');
    }

    /**
     * Show Voronoi cluster info panel with hierarchical information
     * Called when clicking on a Voronoi cell (cluster)
     */
    showVoronoiClusterInfo(cell) {
        console.log('showVoronoiClusterInfo called with cell:', cell);
        const panel = document.getElementById('info-panel');
        const entityInfo = document.getElementById('entity-info');

        if (!panel) {
            console.error('Info panel not found!');
            return;
        }

        // Get or create voronoi-cluster-info div (for backwards compatibility with cached HTML)
        let voronoiInfo = document.getElementById('voronoi-cluster-info');
        if (!voronoiInfo) {
            console.log('Creating voronoi-cluster-info div dynamically');
            voronoiInfo = document.createElement('div');
            voronoiInfo.id = 'voronoi-cluster-info';
            voronoiInfo.style.display = 'none';
            // Insert after entity-info or at end of panel
            if (entityInfo) {
                entityInfo.parentNode.insertBefore(voronoiInfo, entityInfo.nextSibling);
            } else {
                panel.appendChild(voronoiInfo);
            }
        }

        // Hide entity info, show voronoi cluster info
        if (entityInfo) entityInfo.style.display = 'none';
        voronoiInfo.style.display = 'block';

        const levelName = cell.level === 3 ? 'Top-Level Cluster (L3)' :
                         cell.level === 2 ? 'Community Cluster (L2)' :
                         cell.level === 1 ? 'Fine Cluster (L1)' : 'Entity';

        // Get cluster name
        const clusterName = cell.data.name || cell.data.id || 'Unknown';

        // Count entities from entityIds (stored during hierarchy building)
        let entityCount = 0;
        const entityIds = cell.data.entityIds || [];
        if (entityIds.length > 0) {
            entityCount = entityIds.length;
        } else if (cell.data.entities) {
            entityCount = cell.data.entities.length;
        } else if (cell.data.node_count) {
            entityCount = cell.data.node_count;
        }

        // Build hierarchy path by traversing parents
        const hierarchyPath = [];
        let current = cell;
        while (current) {
            if (current.data && current.data.name) {
                hierarchyPath.unshift({
                    level: current.level,
                    name: current.data.name,
                    id: current.data.id
                });
            }
            current = current.parent;
        }

        // Format level name for display
        const getLevelLabel = (level) => {
            switch(level) {
                case 3: return 'L3 (Top)';
                case 2: return 'L2 (Community)';
                case 1: return 'L1 (Fine)';
                case 0: return 'Entity';
                default: return `L${level}`;
            }
        };

        // Build hierarchy HTML
        let hierarchyHtml = '';
        if (hierarchyPath.length > 0) {
            hierarchyHtml = `
                <div style="margin-top: 16px; padding: 12px; background: rgba(100, 200, 255, 0.05); border: 1px solid rgba(100, 200, 255, 0.15); border-radius: 10px;">
                    <div style="font-size: 12px; color: #a0a0a0; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Hierarchical Path</div>
                    ${hierarchyPath.map((h, idx) => `
                        <div style="display: flex; align-items: center; margin: 6px 0; padding-left: ${idx * 12}px;">
                            <span style="color: #00ffff; font-size: 11px; font-weight: 600; min-width: 70px;">${getLevelLabel(h.level)}</span>
                            <span style="color: ${h.level === cell.level ? '#64b5f6' : '#ccc'}; font-size: 13px; ${h.level === cell.level ? 'font-weight: 600;' : ''}">${h.name}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Get children info if available
        let childrenHtml = '';
        if (cell.children && cell.children.length > 0) {
            const childCount = cell.children.length;
            const childLevel = cell.level - 1;
            const childLevelName = childLevel === 2 ? 'communities' : childLevel === 1 ? 'fine clusters' : 'entities';
            childrenHtml = `
                <div style="color: #ccc; margin: 4px 0;">
                    <strong>Contains:</strong> ${childCount} ${childLevelName}
                </div>
            `;
        }

        // Build entity list HTML for L1 clusters (fine clusters)
        let entitiesHtml = '';
        if (cell.level === 1 && entityIds.length > 0) {
            // Group entities by type
            const entitiesByType = {};
            for (const entityId of entityIds) {
                const entity = this.entities.get(entityId);
                if (entity) {
                    const type = entity.type || 'UNKNOWN';
                    if (!entitiesByType[type]) {
                        entitiesByType[type] = [];
                    }
                    entitiesByType[type].push({
                        id: entityId,
                        name: entity.name || entity.title || entityId,
                        type: type
                    });
                }
            }

            // Sort types by count
            const sortedTypes = Object.keys(entitiesByType).sort((a, b) =>
                entitiesByType[b].length - entitiesByType[a].length
            );

            // Build the entity list
            const typeColors = {
                'PERSON': '#FF6B6B',
                'ORGANIZATION': '#4ECDC4',
                'CONCEPT': '#45B7D1',
                'PLACE': '#96CEB4',
                'PRACTICE': '#DDA0DD',
                'PRODUCT': '#F7DC6F',
                'EVENT': '#BB8FCE',
                'UNKNOWN': '#95A5A6'
            };

            entitiesHtml = `
                <div style="margin-top: 16px; padding: 12px; background: rgba(136, 255, 136, 0.05); border: 1px solid rgba(136, 255, 136, 0.2); border-radius: 10px;">
                    <div style="font-size: 12px; color: #88FF88; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span>Entities in Cluster</span>
                        <span style="color: #ccc; font-size: 11px;">${entityIds.length} total</span>
                    </div>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${sortedTypes.map(type => `
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 11px; color: ${typeColors[type] || '#95A5A6'}; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center;">
                                    <span style="width: 8px; height: 8px; border-radius: 50%; background: ${typeColors[type] || '#95A5A6'}; margin-right: 6px;"></span>
                                    ${type} (${entitiesByType[type].length})
                                </div>
                                ${entitiesByType[type].slice(0, 20).map(e => `
                                    <div class="entity-item" data-entity-id="${e.id}"
                                         style="padding: 6px 8px; margin: 2px 0; background: rgba(255,255,255,0.03); border-radius: 4px; cursor: pointer; font-size: 12px; color: #ccc; transition: background 0.2s;"
                                         onmouseover="this.style.background='rgba(100,180,246,0.15)'"
                                         onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                                        ${e.name}
                                    </div>
                                `).join('')}
                                ${entitiesByType[type].length > 20 ? `
                                    <div style="font-size: 11px; color: #666; padding: 4px 8px; font-style: italic;">
                                        ...and ${entitiesByType[type].length - 20} more
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        voronoiInfo.innerHTML = `
            <div class="cluster-info">
                <h3 style="color: #64b5f6; margin: 0 0 12px 0; word-wrap: break-word;">${clusterName}</h3>
                <div style="color: #999; font-size: 13px; margin-bottom: 8px;">${levelName}</div>
                <div style="margin: 12px 0;">
                    ${entityCount > 0 ? `<div style="color: #ccc; margin: 4px 0;">
                        <strong>Entities:</strong> ${entityCount.toLocaleString()}
                    </div>` : ''}
                    ${childrenHtml}
                </div>
                ${hierarchyHtml}
                ${entitiesHtml}
                ${cell.level !== 1 ? `<div style="margin-top: 12px; font-size: 12px; color: #7a8ca8;">
                    Click on nested cells to explore deeper levels
                </div>` : ''}
            </div>
        `;

        // Add click handlers for entity items
        if (cell.level === 1) {
            const entityItems = voronoiInfo.querySelectorAll('.entity-item');
            entityItems.forEach(item => {
                item.addEventListener('click', () => {
                    const entityId = item.getAttribute('data-entity-id');
                    if (entityId) {
                        this.selectEntity(entityId);
                    }
                });
            });
        }

        // Make sure panel is visible
        panel.classList.remove('collapsed');
    }

    /**
     * Zoom to specific circle
     */
    zoomToCircle(d, svg, width, height) {
        const scale = Math.min(width, height) / (d.r * 2 + 100);
        const translate = [width / 2 - d.x * scale, height / 2 - d.y * scale];

        svg.transition()
            .duration(750)
            .call(
                d3.zoom().transform,
                d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
            );
    }

    /**
     * Render hierarchical Voronoi visualization - organic stained glass / turtle shell pattern
     * Creates nested Voronoi cells for L3 -> L2 -> L1 -> L0 hierarchy
     * Uses INSIDE-OUT sizing: starts with minimum entity size and builds up
     */
    renderVoronoiTreemap(svg, g, width, height) {
        const hierarchyData = this.hierarchicalData;

        if (!hierarchyData || !hierarchyData.children || hierarchyData.children.length === 0) {
            console.warn('No hierarchical data found for Voronoi');
            return;
        }

        console.log('Rendering Hierarchical Voronoi with', hierarchyData.children.length, 'top-level clusters');

        const self = this;
        let hoveredL3 = null;
        let hoveredL2 = null;
        let hoveredL1 = null;

        // === INSIDE-OUT SIZING CALCULATION ===
        // Start with minimum readable entity size and build up
        const MIN_ENTITY_SIZE = 60;  // Minimum L0 entity cell size (for readable 8px text)
        const MIN_FONT_SIZE = 8;     // Minimum readable font size

        // Count total entities to calculate required canvas size
        let totalL0 = 0, totalL1 = 0, totalL2 = 0, totalL3 = 0;
        let maxL0PerL1 = 0, maxL1PerL2 = 0, maxL2PerL3 = 0;

        hierarchyData.children.forEach(l3 => {
            totalL3++;
            const l2Count = (l3.children || []).length;
            maxL2PerL3 = Math.max(maxL2PerL3, l2Count);

            (l3.children || []).forEach(l2 => {
                totalL2++;
                const l1Count = (l2.children || []).length;
                maxL1PerL2 = Math.max(maxL1PerL2, l1Count);

                (l2.children || []).forEach(l1 => {
                    totalL1++;
                    const l0Count = (l1.children || []).length;
                    maxL0PerL1 = Math.max(maxL0PerL1, l0Count);
                    totalL0 += l0Count;
                });
            });
        });

        // Calculate required sizes bottom-up
        // L0 cells need MIN_ENTITY_SIZE
        // L1 cells need to fit maxL0PerL1 entities in a ~square grid
        const l0Size = MIN_ENTITY_SIZE;
        const l1GridSize = Math.ceil(Math.sqrt(Math.max(maxL0PerL1, 1)));
        const l1Size = l0Size * l1GridSize * 1.3; // 30% padding between entities

        const l2GridSize = Math.ceil(Math.sqrt(Math.max(maxL1PerL2, 1)));
        const l2Size = l1Size * l2GridSize * 1.2;

        const l3GridSize = Math.ceil(Math.sqrt(Math.max(maxL2PerL3, 1)));
        const l3Size = l2Size * l3GridSize * 1.15;

        // Total canvas size based on L3 grid
        const totalGridSize = Math.ceil(Math.sqrt(totalL3));
        const internalWidth = l3Size * totalGridSize * 1.1;
        const internalHeight = internalWidth; // Square canvas

        console.log(`Inside-out sizing: L0=${l0Size}, L1=${l1Size}, L2=${l2Size}, L3=${l3Size}`);
        console.log(`Internal canvas: ${internalWidth}x${internalHeight} (${totalL0} entities)`);

        // Set up SVG viewBox for proper zoom/pan with high-resolution internal coordinates
        // Account for side panels
        const leftPanel = document.getElementById('controls-panel');
        const rightPanel = document.getElementById('info-panel');
        const leftPanelWidth = leftPanel ? leftPanel.offsetWidth : 250;
        const rightPanelWidth = rightPanel ? rightPanel.offsetWidth : 250;

        const viewableWidth = width - leftPanelWidth - rightPanelWidth;
        const viewableHeight = height;

        // Set viewBox to show full internal canvas, fitting to viewable area
        const scale = Math.min(viewableWidth / internalWidth, viewableHeight / internalHeight);
        const offsetX = leftPanelWidth + (viewableWidth - internalWidth * scale) / 2;
        const offsetY = (viewableHeight - internalHeight * scale) / 2;

        // Apply transform to g element to position and scale the internal canvas
        g.attr('transform', `translate(${offsetX}, ${offsetY}) scale(${scale})`);

        // Color palettes for each hierarchy level (designed for adjacent contrast)
        // Using 4+ distinct colors per level ensures proper graph coloring
        const levelPalettes = {
            3: ['#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA', '#00ACC1'], // L3: Bold distinct colors
            2: ['#F57C00', '#5E35B1', '#00897B', '#D81B60', '#3949AB', '#7CB342'], // L2: Warm-cool alternating
            1: ['#039BE5', '#C0CA33', '#E91E63', '#00ACC1', '#FF7043', '#AB47BC']  // L1: Bright contrasting
        };

        // Entity-level colors by type (L0 entities)
        const entityTypeColors = {
            'PERSON': '#4CAF50',
            'ORGANIZATION': '#2196F3',
            'CONCEPT': '#9C27B0',
            'PRACTICE': '#FF9800',
            'PRODUCT': '#E91E63',
            'PLACE': '#00BCD4',
            'EVENT': '#FFEB3B',
            'WORK': '#795548',
            'CLAIM': '#607D8B'
        };

        // Check if two polygons share an edge (are adjacent)
        const polygonsAreAdjacent = (poly1, poly2) => {
            if (!poly1 || !poly2 || poly1.length < 3 || poly2.length < 3) return false;
            const threshold = internalWidth * 0.001; // Tolerance for floating point comparison

            // Check if any edges are shared (two vertices in common within threshold)
            let sharedVertices = 0;
            for (const p1 of poly1) {
                for (const p2 of poly2) {
                    const dist = Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
                    if (dist < threshold) {
                        sharedVertices++;
                        if (sharedVertices >= 2) return true; // Shared edge found
                    }
                }
            }
            return false;
        };

        // Greedy graph coloring for a set of cells at the same level
        const assignColorsToLevel = (cells, level) => {
            if (cells.length === 0) return;

            const palette = levelPalettes[level] || levelPalettes[3];
            const numColors = palette.length;

            // Build adjacency list
            const adjacency = new Map();
            cells.forEach((cell, i) => adjacency.set(i, []));

            for (let i = 0; i < cells.length; i++) {
                for (let j = i + 1; j < cells.length; j++) {
                    if (polygonsAreAdjacent(cells[i].polygon, cells[j].polygon)) {
                        adjacency.get(i).push(j);
                        adjacency.get(j).push(i);
                    }
                }
            }

            // Greedy coloring - assign smallest available color not used by neighbors
            cells.forEach((cell, i) => {
                const usedColors = new Set();
                for (const neighborIdx of adjacency.get(i)) {
                    if (cells[neighborIdx].colorIndex !== undefined) {
                        usedColors.add(cells[neighborIdx].colorIndex);
                    }
                }

                // Find smallest color not used by neighbors
                let colorIndex = 0;
                while (usedColors.has(colorIndex)) {
                    colorIndex++;
                }

                cell.colorIndex = colorIndex % numColors;
                cell.color = palette[cell.colorIndex];
            });
        };

        // Get color for a cell (will be assigned after graph coloring)
        const getColor = (cell) => {
            if (cell.level === 0) {
                return entityTypeColors[cell.entityType] || '#88FF88';
            }
            return cell.color || '#888888';
        };

        // Generate seed points for Voronoi within a polygon
        const generateSeeds = (polygon, count, padding = 0.1) => {
            if (!polygon || polygon.length < 3) return [];

            // Get bounding box
            const xs = polygon.map(p => p[0]);
            const ys = polygon.map(p => p[1]);
            const minX = Math.min(...xs), maxX = Math.max(...xs);
            const minY = Math.min(...ys), maxY = Math.max(...ys);
            const w = maxX - minX, h = maxY - minY;

            // Generate points using golden ratio spiral for even distribution
            const seeds = [];
            const goldenAngle = Math.PI * (3 - Math.sqrt(5));
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const maxRadius = Math.min(w, h) * (0.5 - padding);

            for (let i = 0; i < count * 3 && seeds.length < count; i++) {
                const r = maxRadius * Math.sqrt((i + 0.5) / (count * 2));
                const theta = i * goldenAngle;
                const x = centerX + r * Math.cos(theta);
                const y = centerY + r * Math.sin(theta);

                // Check if point is inside polygon
                if (this.pointInPolygon([x, y], polygon)) {
                    seeds.push([x, y]);
                }
            }

            return seeds;
        };

        // Apply Lloyd's relaxation to smooth Voronoi cells
        const lloydRelax = (seeds, polygon, iterations = 3) => {
            if (seeds.length === 0) return seeds;

            const xs = polygon.map(p => p[0]);
            const ys = polygon.map(p => p[1]);
            const bounds = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];

            let points = seeds.map(s => [...s]);

            for (let iter = 0; iter < iterations; iter++) {
                const delaunay = d3.Delaunay.from(points);
                const voronoi = delaunay.voronoi(bounds);

                points = points.map((p, i) => {
                    const cell = voronoi.cellPolygon(i);
                    if (!cell) return p;

                    // Clip cell to parent polygon
                    const clipped = this.clipPolygon(cell, polygon);
                    if (!clipped || clipped.length < 3) return p;

                    // Move to centroid
                    const cx = d3.mean(clipped, pt => pt[0]);
                    const cy = d3.mean(clipped, pt => pt[1]);
                    return [cx, cy];
                });
            }

            return points;
        };

        // Create Voronoi cells within a polygon boundary
        const createVoronoiInPolygon = (seeds, polygon) => {
            if (seeds.length === 0 || !polygon) return [];

            const xs = polygon.map(p => p[0]);
            const ys = polygon.map(p => p[1]);
            const bounds = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];

            const delaunay = d3.Delaunay.from(seeds);
            const voronoi = delaunay.voronoi(bounds);

            const cells = [];
            for (let i = 0; i < seeds.length; i++) {
                const cell = voronoi.cellPolygon(i);
                if (cell) {
                    const clipped = this.clipPolygon(cell, polygon);
                    if (clipped && clipped.length >= 3) {
                        cells.push(clipped);
                    }
                }
            }
            return cells;
        };

        // Use internal coordinate system (not screen coordinates)
        // The outer boundary is now in the large internal canvas
        const padding = internalWidth * 0.02; // 2% padding
        const outerBoundary = [
            [padding, padding],
            [internalWidth - padding, padding],
            [internalWidth - padding, internalHeight - padding],
            [padding, internalHeight - padding]
        ];

        console.log(`Voronoi internal boundary: ${internalWidth - 2*padding}x${internalHeight - 2*padding}`);

        // Generate L3 (top level) Voronoi
        const l3Children = hierarchyData.children;
        const l3Count = l3Children.length;

        let l3Seeds = generateSeeds(outerBoundary, l3Count, 0.05);
        l3Seeds = lloydRelax(l3Seeds, outerBoundary, 5);
        const l3Cells = createVoronoiInPolygon(l3Seeds, outerBoundary);

        // Store all cell data for rendering
        const allCells = [];

        // Process each L3 cluster
        l3Children.forEach((l3Data, i) => {
            if (i >= l3Cells.length) return;

            const l3Polygon = l3Cells[i];
            const l3Cell = {
                polygon: l3Polygon,
                data: l3Data,
                level: 3,
                children: [],
                centroid: d3.polygonCentroid(l3Polygon)
            };

            // Generate L2 cells inside this L3 cell
            const l2Children = l3Data.children || [];
            if (l2Children.length > 0) {
                let l2Seeds = generateSeeds(l3Polygon, l2Children.length, 0.08);
                l2Seeds = lloydRelax(l2Seeds, l3Polygon, 4);
                const l2Cells = createVoronoiInPolygon(l2Seeds, l3Polygon);

                l2Children.forEach((l2Data, j) => {
                    if (j >= l2Cells.length) return;

                    const l2Polygon = l2Cells[j];
                    const l2Cell = {
                        polygon: l2Polygon,
                        data: l2Data,
                        level: 2,
                        parent: l3Cell,
                        children: [],
                        centroid: d3.polygonCentroid(l2Polygon)
                    };

                    // Generate L1 cells inside this L2 cell
                    const l1Children = l2Data.children || [];
                    if (l1Children.length > 0) {
                        let l1Seeds = generateSeeds(l2Polygon, l1Children.length, 0.1);
                        l1Seeds = lloydRelax(l1Seeds, l2Polygon, 3);
                        const l1Cells = createVoronoiInPolygon(l1Seeds, l2Polygon);

                        l1Children.forEach((l1Data, k) => {
                            if (k >= l1Cells.length) return;

                            const l1Polygon = l1Cells[k];
                            const l1Cell = {
                                polygon: l1Polygon,
                                data: l1Data,
                                level: 1,
                                parent: l2Cell,
                                children: [],
                                centroid: d3.polygonCentroid(l1Polygon)
                            };

                            // Generate L0 entity cells inside this L1 cell
                            const l0Children = l1Data.children || [];
                            if (l0Children.length > 0) {
                                let l0Seeds = generateSeeds(l1Polygon, l0Children.length, 0.12);
                                l0Seeds = lloydRelax(l0Seeds, l1Polygon, 2);
                                const l0Cells = createVoronoiInPolygon(l0Seeds, l1Polygon);

                                l0Children.forEach((l0Data, m) => {
                                    if (m >= l0Cells.length) return;

                                    const l0Polygon = l0Cells[m];
                                    if (!l0Polygon || l0Polygon.length < 3) return;

                                    const centroid = d3.polygonCentroid(l0Polygon);
                                    if (!centroid || isNaN(centroid[0])) return;

                                    const l0Cell = {
                                        polygon: l0Polygon,
                                        data: l0Data,
                                        level: 0,
                                        parent: l1Cell,
                                        centroid: centroid,
                                        entityType: l0Data.type
                                    };
                                    l1Cell.children.push(l0Cell);
                                    allCells.push(l0Cell);
                                });
                            }

                            l2Cell.children.push(l1Cell);
                            allCells.push(l1Cell);
                        });
                    }

                    l3Cell.children.push(l2Cell);
                    allCells.push(l2Cell);
                });
            }

            allCells.push(l3Cell);
        });

        // Sort cells so L3 renders first (underneath), then L2, then L1
        allCells.sort((a, b) => b.level - a.level);

        // Apply graph coloring to each level separately to ensure adjacent cells have different colors
        const cellsForColoringL3 = allCells.filter(c => c.level === 3);
        const cellsForColoringL2 = allCells.filter(c => c.level === 2);
        const cellsForColoringL1 = allCells.filter(c => c.level === 1);

        assignColorsToLevel(cellsForColoringL3, 3);
        assignColorsToLevel(cellsForColoringL2, 2);
        assignColorsToLevel(cellsForColoringL1, 1);

        console.log(`Graph coloring applied: ${cellsForColoringL3.length} L3, ${cellsForColoringL2.length} L2, ${cellsForColoringL1.length} L1 cells`);

        // Render all cells
        const cells = g.selectAll('.voronoi-cell')
            .data(allCells)
            .join('path')
            .attr('class', d => `voronoi-cell level-${d.level}`)
            .attr('d', d => {
                if (!d.polygon || d.polygon.length < 3) return '';
                return 'M' + d.polygon.map(p => p.join(',')).join('L') + 'Z';
            })
            .attr('fill', d => getColor(d))
            .attr('fill-opacity', d => d.level === 3 ? 0.35 : 0)
            .attr('stroke', d => getColor(d))
            .attr('stroke-width', d => {
                // Scale stroke widths relative to internal canvas for consistent appearance
                const baseStroke = internalWidth / 1000;
                if (d.level === 3) return baseStroke * 4;
                if (d.level === 2) return baseStroke * 3;
                if (d.level === 1) return baseStroke * 2;
                return baseStroke * 1.5; // L0 entities
            })
            .attr('stroke-opacity', d => d.level === 3 ? 1 : 0)
            .style('cursor', 'pointer');

        // Helper function to calculate polygon width at a given y position
        const getPolygonWidthAtY = (polygon, y) => {
            if (!polygon || polygon.length < 3) return 0;
            const intersections = [];
            for (let i = 0; i < polygon.length; i++) {
                const p1 = polygon[i];
                const p2 = polygon[(i + 1) % polygon.length];
                if ((p1[1] <= y && p2[1] > y) || (p2[1] <= y && p1[1] > y)) {
                    const t = (y - p1[1]) / (p2[1] - p1[1]);
                    intersections.push(p1[0] + t * (p2[0] - p1[0]));
                }
            }
            if (intersections.length >= 2) {
                return Math.abs(intersections[1] - intersections[0]);
            }
            return 0;
        };

        // Helper to estimate text width
        const estimateTextWidth = (text, fontSize) => {
            return text.length * fontSize * 0.55;
        };

        // Helper to get polygon bounding box
        const getPolygonBounds = (polygon) => {
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            for (const [x, y] of polygon) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
            return { width: maxX - minX, height: maxY - minY, minX, maxX, minY, maxY };
        };

        // Helper to calculate font size that fits text within polygon
        // Uses internal canvas coordinates - font sizes scale with the large canvas
        const calculateFittingFontSize = (name, polygon, centroid) => {
            const bounds = getPolygonBounds(polygon);
            // Use width at centroid for more accurate horizontal space
            const widthAtCentroid = getPolygonWidthAtY(polygon, centroid[1]);
            const availableWidth = Math.min(bounds.width, widthAtCentroid) * 0.85;
            const availableHeight = bounds.height * 0.7; // Leave margin

            // Font sizes are now in internal canvas units
            // Scale based on polygon size - aim for text that fills ~70% of smaller dimension
            const targetSize = Math.min(availableWidth, availableHeight) * 0.25;
            const maxFontSize = Math.min(targetSize, availableHeight * 0.4);
            const minFontSize = Math.max(availableHeight * 0.08, 2); // Minimum readable size

            for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= maxFontSize * 0.05) {
                const lineHeight = fontSize * 1.2;
                const words = name.split(/\s+/);
                const lines = [];
                let currentLine = [];

                words.forEach(word => {
                    const testLine = [...currentLine, word].join(' ');
                    if (estimateTextWidth(testLine, fontSize) > availableWidth && currentLine.length > 0) {
                        lines.push(currentLine.join(' '));
                        currentLine = [word];
                    } else {
                        currentLine.push(word);
                    }
                });
                if (currentLine.length > 0) {
                    lines.push(currentLine.join(' '));
                }

                const totalTextHeight = lines.length * lineHeight;
                const maxLineWidth = Math.max(...lines.map(line => estimateTextWidth(line, fontSize)));

                // Check if it fits both horizontally and vertically
                if (totalTextHeight <= availableHeight && maxLineWidth <= availableWidth) {
                    return { fontSize, lines, lineHeight };
                }
            }

            // If nothing fits well, use minimum and truncate
            const fontSize = minFontSize;
            const lineHeight = fontSize * 1.2;
            const maxLines = Math.max(1, Math.floor(availableHeight / lineHeight));
            const words = name.split(/\s+/);
            const lines = [];
            let currentLine = [];

            words.forEach(word => {
                if (lines.length >= maxLines) return;
                const testLine = [...currentLine, word].join(' ');
                if (estimateTextWidth(testLine, fontSize) > availableWidth && currentLine.length > 0) {
                    lines.push(currentLine.join(' '));
                    currentLine = [word];
                } else {
                    currentLine.push(word);
                }
            });
            if (currentLine.length > 0 && lines.length < maxLines) {
                lines.push(currentLine.join(' '));
            }

            return { fontSize, lines: lines.slice(0, Math.max(1, maxLines)), lineHeight };
        };

        // Add labels for ALL levels (including L1) with dynamic font sizing to fit within shapes
        const labels = g.selectAll('.voronoi-label')
            .data(allCells.filter(d => d.centroid))
            .join('text')
            .attr('class', d => `voronoi-label level-${d.level}`)
            .attr('x', d => d.centroid[0])
            .attr('y', d => d.centroid[1])
            .attr('text-anchor', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-weight', d => d.level === 3 ? '700' : (d.level === 2 ? '600' : '500'))
            .attr('pointer-events', 'none')
            .style('opacity', d => d.level === 3 ? 1 : 0)
            .style('text-shadow', '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)')
            .each(function(d) {
                const text = d3.select(this);
                const name = d.data.name || 'Unknown';

                // Calculate fitting font size for this specific polygon
                const { fontSize, lines, lineHeight } = calculateFittingFontSize(name, d.polygon, d.centroid);

                // Set the computed font size
                text.attr('font-size', fontSize);

                // Create tspans for each line
                const totalHeight = lines.length * lineHeight;
                const startY = -totalHeight / 2 + lineHeight / 2;

                text.selectAll('tspan').remove();
                lines.forEach((line, i) => {
                    text.append('tspan')
                        .attr('x', d.centroid[0])
                        .attr('dy', i === 0 ? startY : lineHeight)
                        .text(line);
                });
            });

        // Update visibility function - recursive reveal on hover (now includes L0 entities)
        const updateVisibility = () => {
            cells
                .transition()
                .duration(250)
                .attr('fill-opacity', d => {
                    // L3 always visible
                    if (d.level === 3) return 0.35;

                    // L2 visible if parent L3 is hovered
                    if (d.level === 2) {
                        if (hoveredL3 && d.parent === hoveredL3) return 0.5;
                        return 0;
                    }

                    // L1 visible if parent L2 is hovered
                    if (d.level === 1) {
                        if (hoveredL2 && d.parent === hoveredL2) return 0.6;
                        return 0;
                    }

                    // L0 (entities) visible if parent L1 is hovered
                    if (d.level === 0) {
                        if (hoveredL1 && d.parent === hoveredL1) return 0.7;
                        return 0;
                    }
                    return 0;
                })
                .attr('stroke-opacity', d => {
                    if (d.level === 3) return 1;
                    if (d.level === 2 && hoveredL3 && d.parent === hoveredL3) return 1;
                    if (d.level === 1 && hoveredL2 && d.parent === hoveredL2) return 1;
                    if (d.level === 0 && hoveredL1 && d.parent === hoveredL1) return 1;
                    return 0;
                });

            labels
                .transition()
                .duration(250)
                .style('opacity', d => {
                    // L3: hide label when hovered (to see children inside), show otherwise
                    if (d.level === 3) {
                        if (hoveredL3 === d) return 0; // Hide - we're looking inside
                        return 1; // Show
                    }

                    // L2: show when parent L3 is hovered, hide when this L2 is hovered
                    if (d.level === 2) {
                        if (hoveredL3 && d.parent === hoveredL3) {
                            if (hoveredL2 === d) return 0; // Hide - we're looking inside this one
                            return 1; // Show sibling L2 labels
                        }
                        return 0; // Hidden when parent not hovered
                    }

                    // L1: show when parent L2 is hovered (L1 is now leaf level - don't hide on hover)
                    if (d.level === 1) {
                        if (hoveredL2 && d.parent === hoveredL2) {
                            // L1 is now the leaf level - keep label visible even when hovered
                            return 1;
                        }
                        return 0;
                    }

                    // L0 (entities): no longer rendered in voronoi - entities shown in info panel
                    if (d.level === 0) {
                        return 0;
                    }

                    return 0;
                });
        };

        // Add interactions
        cells
            .on('mouseover', function(event, d) {
                event.stopPropagation();

                if (d.level === 3) {
                    hoveredL3 = d;
                    hoveredL2 = null;
                    hoveredL1 = null;
                } else if (d.level === 2) {
                    hoveredL3 = d.parent;
                    hoveredL2 = d;
                    hoveredL1 = null;
                } else if (d.level === 1) {
                    hoveredL3 = d.parent?.parent;
                    hoveredL2 = d.parent;
                    hoveredL1 = d;
                } else if (d.level === 0) {
                    hoveredL3 = d.parent?.parent?.parent;
                    hoveredL2 = d.parent?.parent;
                    hoveredL1 = d.parent;
                }

                updateVisibility();

                // Highlight stroke
                d3.select(this).attr('stroke-width', d.level === 3 ? 4 : (d.level === 0 ? 2 : 3));
            })
            .on('mouseout', function(event, d) {
                // Check if moving to related cell
                const related = event.relatedTarget;
                if (related && related.__data__) {
                    const relData = related.__data__;
                    // If moving within same hierarchy, don't reset
                    if (d.level === 3 && relData.parent === d) return;
                    if (d.level === 2 && (relData === d.parent || relData.parent === d)) return;
                    if (d.level === 2 && relData.parent === d.parent) return;
                    if (d.level === 1 && (relData === d.parent || relData.parent === d)) return;
                    if (d.level === 1 && relData.parent === d.parent) return;
                    if (d.level === 0 && relData.parent === d.parent) return;
                }

                // Reset based on what we're leaving
                if (d.level === 0) {
                    // Just leaving L0 entity, keep L1, L2, L3 visible
                } else if (d.level === 1) {
                    hoveredL1 = null;
                } else if (d.level === 2) {
                    hoveredL2 = null;
                    hoveredL1 = null;
                } else if (d.level === 3) {
                    hoveredL3 = null;
                    hoveredL2 = null;
                    hoveredL1 = null;
                }

                updateVisibility();
                const strokeWidth = d.level === 3 ? 2.5 : (d.level === 2 ? 2 : (d.level === 1 ? 1.5 : 1));
                d3.select(this).attr('stroke-width', strokeWidth);
            })
            .on('click', (event, d) => {
                event.stopPropagation();
                console.log('Voronoi cell clicked:', d.level, d.data?.name || d.data?.id);

                // For L0 entities, select the actual entity using its ID
                if (d.level === 0 && d.data.id) {
                    self.selectEntity(d.data.id);
                } else {
                    // For clusters, show cluster info panel with hierarchy
                    console.log('Calling showVoronoiClusterInfo for level', d.level);
                    self.showVoronoiClusterInfo(d);
                }
            });

        // Background click resets
        svg.on('click', () => {
            hoveredL3 = null;
            hoveredL2 = null;
            hoveredL1 = null;
            updateVisibility();
        });

        // Add zoom - combine with initial transform for proper panning/zooming
        // Store the initial transform so zoom can build on it
        const initialTransform = { x: offsetX, y: offsetY, k: scale };

        // Calculate dynamic scale extent based on initial scale
        // Allow zooming out to 20% of initial (to see more context)
        // Allow zooming in to 100x for entity-level detail
        const minScale = scale * 0.2;
        const maxScale = scale * 100;

        const zoom = d3.zoom()
            .scaleExtent([minScale, maxScale])
            .on('zoom', (event) => {
                // Apply zoom transform on top of initial positioning
                const t = event.transform;
                g.attr('transform', `translate(${t.x}, ${t.y}) scale(${t.k})`);
            });

        svg.call(zoom);

        // Set initial transform to show the full canvas
        svg.call(zoom.transform, d3.zoomIdentity
            .translate(offsetX, offsetY)
            .scale(scale));

        this.circlePackState.zoom = zoom;

        const l3Count2 = allCells.filter(c => c.level === 3).length;
        const l2Count = allCells.filter(c => c.level === 2).length;
        const l1Count = allCells.filter(c => c.level === 1).length;
        console.log(`Rendered Hierarchical Voronoi: ${l3Count2} L3, ${l2Count} L2, ${l1Count} L1 cells`);
    }

    /**
     * Check if point is inside polygon (ray casting)
     */
    pointInPolygon(point, polygon) {
        const [x, y] = point;
        let inside = false;

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const [xi, yi] = polygon[i];
            const [xj, yj] = polygon[j];

            if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }

        return inside;
    }

    /**
     * Clip polygon to boundary using Sutherland-Hodgman algorithm
     */
    clipPolygon(subject, clip) {
        if (!subject || !clip || subject.length < 3 || clip.length < 3) return null;

        let output = [...subject];

        for (let i = 0; i < clip.length; i++) {
            if (output.length === 0) return null;

            const input = output;
            output = [];

            const edgeStart = clip[i];
            const edgeEnd = clip[(i + 1) % clip.length];

            for (let j = 0; j < input.length; j++) {
                const current = input[j];
                const previous = input[(j + input.length - 1) % input.length];

                const currentInside = this.isLeft(edgeStart, edgeEnd, current);
                const previousInside = this.isLeft(edgeStart, edgeEnd, previous);

                if (currentInside) {
                    if (!previousInside) {
                        const intersection = this.lineIntersection(previous, current, edgeStart, edgeEnd);
                        if (intersection) output.push(intersection);
                    }
                    output.push(current);
                } else if (previousInside) {
                    const intersection = this.lineIntersection(previous, current, edgeStart, edgeEnd);
                    if (intersection) output.push(intersection);
                }
            }
        }

        return output.length >= 3 ? output : null;
    }

    /**
     * Check if point is left of line
     */
    isLeft(a, b, c) {
        return ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) >= 0;
    }

    /**
     * Find intersection of two line segments
     */
    lineIntersection(p1, p2, p3, p4) {
        const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
        if (Math.abs(d) < 1e-10) return null;

        const t = ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) / d;

        return [
            p1[0] + t * (p2[0] - p1[0]),
            p1[1] + t * (p2[1] - p1[1])
        ];
    }

    /**
     * Simple hash function for deterministic positioning
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    /**
     * Dispose of all Three.js resources to free WebGL context
     * Call this before page unload to prevent Chrome from running out of WebGL contexts
     */
    dispose() {
        console.log('Disposing GraphRAG3D viewer resources...');

        // Stop animation loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Dispose of all meshes and their materials/geometries
        if (this.entityMeshes) {
            this.entityMeshes.forEach(mesh => {
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(m => m.dispose());
                    } else {
                        mesh.material.dispose();
                    }
                }
            });
            this.entityMeshes = [];
        }

        // Dispose of cluster meshes
        if (this.clusterMeshes) {
            this.clusterMeshes.forEach(mesh => {
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) mesh.material.dispose();
            });
            this.clusterMeshes = [];
        }

        // Dispose of connection lines
        if (this.connectionLines) {
            this.connectionLines.forEach(line => {
                if (line.geometry) line.geometry.dispose();
                if (line.material) line.material.dispose();
            });
            this.connectionLines = [];
        }

        // Dispose of label sprites
        if (this.labelSprites) {
            this.labelSprites.forEach(sprite => {
                if (sprite.material) {
                    if (sprite.material.map) sprite.material.map.dispose();
                    sprite.material.dispose();
                }
            });
            this.labelSprites = [];
        }

        // Dispose of cluster label sprites
        if (this.clusterLabelSprites) {
            this.clusterLabelSprites.forEach(sprite => {
                if (sprite.material) {
                    if (sprite.material.map) sprite.material.map.dispose();
                    sprite.material.dispose();
                }
            });
            this.clusterLabelSprites = [];
        }

        // Dispose of controls
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }

        // Dispose of renderer (this releases the WebGL context)
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
            this.renderer = null;
        }

        // Clear scene
        if (this.scene) {
            while (this.scene.children.length > 0) {
                this.scene.remove(this.scene.children[0]);
            }
            this.scene = null;
        }

        // Clear maps
        this.entityMeshMap.clear();
        this.entities.clear();
        this.displayedEntityIds.clear();
        this.visibleEntities.clear();

        console.log('GraphRAG3D viewer disposed successfully');
    }

    /**
     * Render Voronoi 2 view using pre-computed Node2Vec + UMAP layout
     * This view positions nodes based on graph topology (structural similarity)
     * rather than semantic/text embeddings
     */
    async renderVoronoi2View(svg, g, width, height) {
        console.log('Rendering Voronoi 2 (Semantic Landscape) view...');

        // Load the pre-computed voronoi_2_layout.json
        let voronoi2Data;
        try {
            const layoutUrl = this.resolveAssetPath('/data/graphrag_hierarchy/voronoi_2_layout.json');
            voronoi2Data = await this.fetchJsonWithFallback([layoutUrl], 'voronoi_2_layout');
            console.log(`Loaded Voronoi 2 layout: ${Object.keys(voronoi2Data.node_positions || {}).length} nodes`);
        } catch (err) {
            console.error('Failed to load voronoi_2_layout.json:', err);
            // Fallback to regular voronoi view
            this.renderVoronoiTreemap(svg, g, width, height);
            return;
        }

        const nodePositions = voronoi2Data.node_positions || {};
        const clusters = voronoi2Data.clusters || {};
        const metadata = voronoi2Data.metadata || {};

        // Calculate bounds for scaling
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const pos of Object.values(nodePositions)) {
            if (pos.x < minX) minX = pos.x;
            if (pos.x > maxX) maxX = pos.x;
            if (pos.y < minY) minY = pos.y;
            if (pos.y > maxY) maxY = pos.y;
        }

        // Add padding
        const padding = 60;
        const scaleX = d3.scaleLinear()
            .domain([minX, maxX])
            .range([padding, width - padding]);
        const scaleY = d3.scaleLinear()
            .domain([minY, maxY])
            .range([padding, height - padding]);

        // Color scales for different cluster levels
        const levelColors = {
            level_1: '#00CCFF',  // Cyan for fine clusters
            level_2: '#FFCC00',  // Gold for medium clusters
            level_3: '#FF4444'   // Red for coarse clusters
        };

        // State for hover tracking
        let hoveredL3 = null;
        const self = this;

        // Build parent-child relationships for L2 clusters
        const level3Clusters = Object.values(clusters.level_3 || {});
        const level2Clusters = Object.values(clusters.level_2 || {});

        // Use pre-computed parent-child relationships if available
        // Only fall back to centroid containment if parentL3 is not already set
        let precomputedCount = 0;
        let computedCount = 0;
        level2Clusters.forEach(l2 => {
            // If parentL3 is already set from the JSON data, use it
            if (l2.parentL3) {
                precomputedCount++;
                return;
            }
            // Otherwise try to compute from centroid containment (fallback)
            if (!l2.centroid) return;
            for (const l3 of level3Clusters) {
                if (l3.polygon && this.pointInPolygon([l2.centroid[0], l2.centroid[1]], l3.polygon)) {
                    l2.parentL3 = l3.id;
                    computedCount++;
                    break;
                }
            }
        });
        console.log(`  Parent-child relationships: ${precomputedCount} pre-computed, ${computedCount} computed from containment`);

        console.log(`Drawing ${level2Clusters.length} level_2 cluster polygons`);

        // Draw L2 polygons - VISIBLE BY DEFAULT since L3 has no polygon data
        const l2Polygons = g.selectAll('.voronoi2-polygon')
            .data(level2Clusters.filter(c => c.polygon && c.polygon.length > 2))
            .enter()
            .append('polygon')
            .attr('class', 'voronoi2-polygon')
            .attr('points', d => {
                return d.polygon.map(p => {
                    const x = scaleX(p[0]);
                    const y = scaleY(p[1]);
                    return `${x},${y}`;
                }).join(' ');
            })
            .attr('fill', d => {
                // Create a color based on cluster index
                const hue = (parseInt(d.id.split('_').pop()) * 137.5) % 360;
                return `hsl(${hue}, 60%, 35%)`;
            })
            .attr('stroke', levelColors.level_2)
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 0.8)  // Visible by default
            .attr('fill-opacity', 0.25)   // Visible by default with subtle fill
            .on('mouseover', (event, d) => {
                d3.select(event.currentTarget)
                    .attr('stroke-width', 3)
                    .attr('stroke-opacity', 1)
                    .attr('fill-opacity', 0.4);
                this.showOrganicTooltip(event, {
                    title: d.title || d.name || d.id,
                    content: `${d.member_count || 0} sub-clusters, ${d.total_entities || 0} entities`
                });
            })
            .on('mouseout', (event, d) => {
                d3.select(event.currentTarget)
                    .attr('stroke-width', 2)
                    .attr('stroke-opacity', 0.8)
                    .attr('fill-opacity', 0.25);
                this.hideOrganicTooltip();
            })
            .on('click', (event, d) => {
                event.stopPropagation();
                this.showClusterInfo(d, 2);
            });

        // Draw L2 labels - VISIBLE BY DEFAULT
        // Use labelPosition (polygon centroid) if available, else fall back to centroid (data centroid)
        const l2Labels = g.selectAll('.voronoi2-label-l2')
            .data(level2Clusters.filter(c => c.labelPosition || c.centroid))
            .enter()
            .append('text')
            .attr('class', 'voronoi2-label-l2')
            .attr('x', d => scaleX((d.labelPosition || d.centroid)[0]))
            .attr('y', d => scaleY((d.labelPosition || d.centroid)[1]))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-size', '9px')
            .attr('font-weight', '600')
            .attr('opacity', 1)  // Visible by default
            .attr('pointer-events', 'none')
            .style('text-shadow', '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)')
            .text(d => {
                const name = d.title || d.name || d.id;
                return name.length > 18 ? name.substring(0, 16) + '...' : name;
            });

        // Draw L3 labels FIRST (so they can be referenced in polygon hover handlers)
        // Labels are always visible by default
        // Use labelPosition (polygon centroid) if available, else fall back to centroid (data centroid)
        const l3Labels = g.selectAll('.voronoi2-label-l3')
            .data(level3Clusters.filter(c => c.labelPosition || c.centroid))
            .enter()
            .append('text')
            .attr('class', 'voronoi2-label-l3')
            .attr('x', d => scaleX((d.labelPosition || d.centroid)[0]))
            .attr('y', d => scaleY((d.labelPosition || d.centroid)[1]))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-size', '14px')
            .attr('font-weight', '700')
            .attr('opacity', 1)  // Always visible
            .attr('pointer-events', 'none')
            .style('text-shadow', '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)')
            .text(d => {
                const name = d.title || d.name || d.id;
                return name.length > 25 ? name.substring(0, 23) + '...' : name;
            });

        // Draw L3 polygon outlines (coarse clusters) - always visible with fill
        const l3Polygons = g.selectAll('.voronoi2-polygon-l3')
            .data(level3Clusters.filter(c => c.polygon && c.polygon.length > 2))
            .enter()
            .append('polygon')
            .attr('class', 'voronoi2-polygon-l3')
            .attr('points', d => {
                return d.polygon.map(p => {
                    const x = scaleX(p[0]);
                    const y = scaleY(p[1]);
                    return `${x},${y}`;
                }).join(' ');
            })
            .attr('fill', d => {
                // Subtle fill color based on cluster
                const hue = (parseInt(d.id.split('_').pop()) * 137.5) % 360;
                return `hsl(${hue}, 50%, 30%)`;
            })
            .attr('fill-opacity', 0.35)  // Explicit fill opacity for visibility
            .attr('stroke', levelColors.level_3)
            .attr('stroke-width', 3)
            .attr('stroke-opacity', 1)
            .on('mouseover', function(event, d) {
                hoveredL3 = d;

                // Highlight this L3
                d3.select(this)
                    .attr('stroke-width', 5)
                    .attr('fill-opacity', 0.15);

                // Show L2 children of this L3
                l2Polygons
                    .transition()
                    .duration(200)
                    .attr('stroke-opacity', c => c.parentL3 === d.id ? 0.8 : 0)
                    .attr('fill-opacity', c => c.parentL3 === d.id ? 0.4 : 0);

                l2Labels
                    .transition()
                    .duration(200)
                    .attr('opacity', c => c.parentL3 === d.id ? 0.9 : 0);

                // Hide L3 label when hovering (to see children)
                l3Labels
                    .transition()
                    .duration(200)
                    .attr('opacity', c => c === d ? 0 : 1);

                self.showOrganicTooltip(event, {
                    title: d.title || d.name || d.id,
                    content: `${d.member_count || 0} communities, ${d.total_entities || 0} entities`
                });
            })
            .on('mouseout', function(event, d) {
                // Check if moving to a child L2
                const related = event.relatedTarget;
                if (related && related.__data__ && related.__data__.parentL3 === d.id) {
                    return; // Don't hide children if moving within
                }

                hoveredL3 = null;

                // Reset L3 styling
                d3.select(this)
                    .attr('stroke-width', 3)
                    .attr('fill-opacity', 0.35);

                // Hide all L2 children
                l2Polygons
                    .transition()
                    .duration(200)
                    .attr('stroke-opacity', 0)
                    .attr('fill-opacity', 0);

                l2Labels
                    .transition()
                    .duration(200)
                    .attr('opacity', 0);

                // Show all L3 labels again
                l3Labels
                    .transition()
                    .duration(200)
                    .attr('opacity', 1);

                self.hideOrganicTooltip();
            })
            .on('click', (event, d) => {
                event.stopPropagation();
                this.showClusterInfo(d, 3);
            });

        // Raise L3 labels to top so they're above the polygons
        l3Labels.raise();

        // Draw entity nodes
        const nodeEntries = Object.entries(nodePositions);
        console.log(`Drawing ${nodeEntries.length} entity nodes`);

        // Limit nodes for performance (sample if too many)
        const maxNodes = 5000;
        const nodesToDraw = nodeEntries.length > maxNodes
            ? nodeEntries.filter((_, i) => i % Math.ceil(nodeEntries.length / maxNodes) === 0)
            : nodeEntries;

        g.selectAll('.voronoi2-node')
            .data(nodesToDraw)
            .enter()
            .append('circle')
            .attr('class', 'voronoi2-node')
            .attr('cx', d => scaleX(d[1].x))
            .attr('cy', d => scaleY(d[1].y))
            .attr('r', 2)
            .attr('fill', d => {
                // Use entity type color if available
                const entity = this.entities.get(d[0]);
                if (entity && entity.type && this.typeColors[entity.type]) {
                    return '#' + this.typeColors[entity.type].toString(16).padStart(6, '0');
                }
                return '#00DDFF';
            })
            .attr('opacity', 0.7)
            .on('mouseover', (event, d) => {
                d3.select(event.currentTarget)
                    .attr('r', 5)
                    .attr('opacity', 1);
                const entity = this.entities.get(d[0]);
                this.showOrganicTooltip(event, {
                    title: d[0],
                    content: entity ? `Type: ${entity.type || 'Unknown'}` : 'Entity'
                });
            })
            .on('mouseout', (event) => {
                d3.select(event.currentTarget)
                    .attr('r', 2)
                    .attr('opacity', 0.7);
                this.hideOrganicTooltip();
            })
            .on('click', (event, d) => {
                event.stopPropagation();
                const entity = this.entities.get(d[0]);
                if (entity) {
                    this.showEntityInfo(entity);
                }
            });

        // Add zoom/pan behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 10])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });
        svg.call(zoom);

        // Store zoom for potential reset
        this.circlePackState.zoom = zoom;

        console.log('Voronoi 2 view rendering complete');
    }

    /**
     * Render Voronoi 3 view using constrained Voronoi layout
     * This view ensures 100% containment of nodes within their cluster Voronoi cells
     */
    async renderVoronoi3View(svg, g, width, height) {
        console.log('Rendering Voronoi 3 (Constrained Cells) view...');

        // Load the pre-computed constrained_voronoi_layout.json
        let voronoi3Data;
        try {
            const layoutUrl = this.resolveAssetPath('/data/graphrag_hierarchy/constrained_voronoi_layout.json');
            voronoi3Data = await this.fetchJsonWithFallback([layoutUrl], 'constrained_voronoi_layout');
            console.log(`Loaded Voronoi 3 layout: ${Object.keys(voronoi3Data.node_positions || {}).length} nodes`);
        } catch (err) {
            console.error('Failed to load constrained_voronoi_layout.json:', err);
            // Fallback to regular voronoi-2 view
            await this.renderVoronoi2View(svg, g, width, height);
            return;
        }

        const nodePositions = voronoi3Data.node_positions || {};
        const clusterCentroids = voronoi3Data.cluster_centroids || {};
        const voronoiPolygons = voronoi3Data.voronoi_polygons || {};
        const metadata = voronoi3Data.metadata || {};

        console.log(`  Clusters: ${Object.keys(clusterCentroids).length}`);
        console.log(`  Polygons: ${Object.keys(voronoiPolygons).length}`);

        // Calculate bounds from BOTH nodes AND polygon vertices
        // Voronoi cells can extend beyond node bounds - must include polygon coords for correct scaling
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        // Include node positions
        for (const pos of Object.values(nodePositions)) {
            if (pos.x < minX) minX = pos.x;
            if (pos.x > maxX) maxX = pos.x;
            if (pos.y < minY) minY = pos.y;
            if (pos.y > maxY) maxY = pos.y;
        }

        // Include polygon vertices (Voronoi cells extend beyond node bounds)
        for (const coords of Object.values(voronoiPolygons)) {
            for (const [x, y] of coords) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }

        console.log(`Voronoi 3 combined bounds: X=[${minX.toFixed(2)}, ${maxX.toFixed(2)}], Y=[${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);

        // Add padding
        const padding = 60;
        const scaleX = d3.scaleLinear()
            .domain([minX, maxX])
            .range([padding, width - padding]);
        const scaleY = d3.scaleLinear()
            .domain([minY, maxY])
            .range([padding, height - padding]);

        // Generate colors for clusters using golden angle
        const clusterColors = new Map();
        const clusterIds = Object.keys(clusterCentroids);
        clusterIds.forEach((clusterId, i) => {
            const hue = (i * 137.5) % 360;
            clusterColors.set(clusterId, `hsl(${hue}, 60%, 40%)`);
        });

        // Draw Voronoi polygons
        const polygonData = Object.entries(voronoiPolygons).map(([clusterId, coords]) => ({
            id: clusterId,
            coords: coords,
            centroid: clusterCentroids[clusterId]
        })).filter(d => d.coords && d.coords.length > 2);

        console.log(`Drawing ${polygonData.length} Voronoi polygons`);

        const self = this;

        // Draw polygon fills
        g.selectAll('.voronoi3-polygon')
            .data(polygonData)
            .enter()
            .append('polygon')
            .attr('class', 'voronoi3-polygon')
            .attr('points', d => {
                return d.coords.map(p => {
                    const x = scaleX(p[0]);
                    const y = scaleY(p[1]);
                    return `${x},${y}`;
                }).join(' ');
            })
            .attr('fill', d => clusterColors.get(d.id) || '#333333')
            .attr('fill-opacity', 0.5)
            .attr('stroke', '#1a1a2e')
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 1)
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('stroke-width', 4)
                    .attr('fill-opacity', 0.7);

                // Count nodes visually inside this polygon using point-in-polygon test
                const polygon = d.coords;
                let nodesInPolygon = 0;
                for (const node of Object.values(nodePositions)) {
                    if (self.pointInPolygon([node.x, node.y], polygon)) {
                        nodesInPolygon++;
                    }
                }

                self.showOrganicTooltip(event, {
                    title: d.id.replace('level_1_', 'Cluster '),
                    content: `${nodesInPolygon} entities`
                });
            })
            .on('mouseout', function(event, d) {
                d3.select(this)
                    .attr('stroke-width', 2)
                    .attr('fill-opacity', 0.5);
                self.hideOrganicTooltip();
            });

        // Draw entity nodes - all nodes now have valid cluster assignments
        const nodeEntries = Object.entries(nodePositions);
        console.log(`Drawing ${nodeEntries.length} entity nodes`);

        // Limit nodes for performance (sample if too many)
        const maxNodes = 15000;
        const nodesToDraw = nodeEntries.length > maxNodes
            ? nodeEntries.filter((_, i) => i % Math.ceil(nodeEntries.length / maxNodes) === 0)
            : nodeEntries;

        g.selectAll('.voronoi3-node')
            .data(nodesToDraw)
            .enter()
            .append('circle')
            .attr('class', 'voronoi3-node')
            .attr('cx', d => scaleX(d[1].x))
            .attr('cy', d => scaleY(d[1].y))
            .attr('r', d => d[1].was_moved ? 2 : 2.5)  // Slightly larger for non-moved nodes
            .attr('fill', d => {
                // Use cluster color for coloring
                const clusterId = d[1].cluster;
                if (clusterId && clusterColors.has(clusterId)) {
                    return clusterColors.get(clusterId);
                }
                // Fallback to entity type color
                const entity = this.entities.get(d[0]);
                if (entity && entity.type && this.typeColors[entity.type]) {
                    return '#' + this.typeColors[entity.type].toString(16).padStart(6, '0');
                }
                return '#00DDFF';
            })
            .attr('opacity', d => d[1].was_moved ? 0.6 : 0.8)  // Slightly dimmer for moved nodes
            .on('mouseover', (event, d) => {
                d3.select(event.currentTarget)
                    .attr('r', 6)
                    .attr('opacity', 1);
                const entity = this.entities.get(d[0]);
                const moveInfo = d[1].was_moved ? ' (repositioned)' : '';
                this.showOrganicTooltip(event, {
                    title: d[0],
                    content: entity ? `Type: ${entity.type || 'Unknown'}${moveInfo}` : `Entity${moveInfo}`
                });
            })
            .on('mouseout', (event, d) => {
                d3.select(event.currentTarget)
                    .attr('r', d[1].was_moved ? 2 : 2.5)
                    .attr('opacity', d[1].was_moved ? 0.6 : 0.8);
                this.hideOrganicTooltip();
            })
            .on('click', (event, d) => {
                event.stopPropagation();
                const entity = this.entities.get(d[0]);
                if (entity) {
                    this.showEntityInfo(entity);
                }
            });

        // Add zoom/pan behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 10])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });
        svg.call(zoom);

        // Store zoom for potential reset
        this.circlePackState.zoom = zoom;

        console.log('Voronoi 3 view rendering complete');
    }

    /**
     * Render Voronoi 4 view (progressive disclosure based on precomputed hierarchy JSON)
     */
    async renderVoronoiHierarchyView(svg, g, width, height, layoutUrl, label = 'Voronoi Hierarchy') {
        console.log(`Rendering ${label}...`);

        // Helper to compute bounds if metadata is missing
        const computeBoundsFromHierarchy = (clusters) => {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            const considerPoint = (x, y) => {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            };

            const walk = (node) => {
                (node.polygons || []).forEach(poly => poly.forEach(([x, y]) => considerPoint(x, y)));
                if (node.centroid) {
                    considerPoint(node.centroid[0], node.centroid[1]);
                }
                (node.children || []).forEach(walk);
                (node.entities || []).forEach(e => considerPoint(e.x, e.y));
            };
            (clusters || []).forEach(walk);

            if (!isFinite(minX) || !isFinite(minY)) {
                return { min_x: 0, min_y: 0, max_x: width, max_y: height };
            }
            const span = Math.max(maxX - minX, maxY - minY) || 1;
            const pad = span * 0.08;
            return {
                min_x: minX - pad,
                min_y: minY - pad,
                max_x: maxX + pad,
                max_y: maxY + pad
            };
        };

        let voronoiData;
        try {
            voronoiData = await this.fetchJsonWithFallback([layoutUrl], label);
            console.log(`Loaded ${label}: ${(voronoiData.clusters || []).length} L3 clusters`);
        } catch (err) {
            console.error(`Failed to load ${label}:`, err);
            // Fall back gracefully
            await this.renderVoronoi3View(svg, g, width, height);
            return;
        }

        const clusters = voronoiData.clusters || [];
        const metadata = voronoiData.metadata || {};
        const bounds = metadata.bounds || computeBoundsFromHierarchy(clusters);

        const padding = Math.min(width, height) * 0.03; // keep shapes large on screen
        const scaleX = d3.scaleLinear()
            .domain([bounds.min_x, bounds.max_x])
            .range([padding, width - padding]);
        const scaleY = d3.scaleLinear()
            .domain([bounds.min_y, bounds.max_y])
            .range([padding, height - padding]);

        const polygonToPath = (poly) => {
            if (!poly || !Array.isArray(poly) || poly.length < 3) return '';
            return 'M' + poly.map(p => `${scaleX(p[0])},${scaleY(p[1])}`).join('L') + 'Z';
        };

        const centroidFor = (node) => {
            if (!node) return null;

            const polyArea = (poly) => {
                if (!poly || poly.length < 3) return 0;
                let area = 0;
                for (let i = 0; i < poly.length; i++) {
                    const [x1, y1] = poly[i];
                    const [x2, y2] = poly[(i + 1) % poly.length];
                    area += x1 * y2 - x2 * y1;
                }
                return Math.abs(area) / 2;
            };

            const polygons = node.polygons || [];
            let targetPoly = null;
            let maxArea = 0;
            polygons.forEach(poly => {
                const area = polyArea(poly);
                if (area > maxArea) {
                    maxArea = area;
                    targetPoly = poly;
                }
            });

            const chosen = targetPoly || polygons[0];
            if (!chosen || chosen.length < 3) {
                if (node.centroid && node.centroid.length === 2) {
                    return [scaleX(node.centroid[0]), scaleY(node.centroid[1])];
                }
                return null;
            }

            const avgX = d3.mean(chosen, p => p[0]);
            const avgY = d3.mean(chosen, p => p[1]);
            return [scaleX(avgX), scaleY(avgY)];
        };

        // Flatten polygons and entities for rendering
        const l3Polys = [];
        const l2Polys = [];
        const l1Polys = [];
        const entities = [];

        clusters.forEach((l3, idx) => {
            (l3.polygons || []).forEach(poly => l3Polys.push({ cluster: l3, polygon: poly, index: idx }));
            (l3.children || []).forEach(l2 => {
                (l2.polygons || []).forEach(poly => l2Polys.push({ cluster: l2, polygon: poly, parent: l3 }));
                (l2.children || []).forEach(l1 => {
                    (l1.polygons || []).forEach(poly => l1Polys.push({ cluster: l1, polygon: poly, parent: l2, parentL3: l3 }));
                    (l1.entities || []).forEach(ent => {
                        entities.push({
                            ...ent,
                            parent: l1,
                            parentL2: l2,
                            parentL3: l3
                        });
                    });
                });
            });
        });

        // Label datasets (one entry per cluster)
        const l2LabelData = [];
        const l1LabelData = [];
        clusters.forEach(l3 => {
            (l3.children || []).forEach(l2 => l2LabelData.push({ node: l2, parent: l3 }));
            (l3.children || []).forEach(l2 => (l2.children || []).forEach(l1 => l1LabelData.push({ node: l1, parentL2: l2, parentL3: l3 })));
        });

        // Color palettes keyed by L3 cluster (L2/L1 derive from it)
        const l3Colors = new Map();
        clusters.forEach((c, i) => {
            const hue = (i * 137.5) % 360;
            l3Colors.set(c.id, `hsl(${hue}, 65%, 40%)`);
        });
        const adjustColor = (base, delta) => {
            try {
                const hsl = d3.hsl(base);
                hsl.l = Math.min(0.9, Math.max(0.15, hsl.l + delta));
                return hsl.toString();
            } catch (err) {
                return base;
            }
        };

        const l2Color = (d) => adjustColor(l3Colors.get(d.parent.id) || '#2a5bd7', 0.12);
        const l1Color = (d) => adjustColor(l3Colors.get(d.parentL3.id) || '#2a5bd7', 0.22);

        // Layer groups
        const l3Group = g.append('g').attr('class', 'voronoi4-layer-l3');
        const l2Group = g.append('g').attr('class', 'voronoi4-layer-l2');
        const l1Group = g.append('g').attr('class', 'voronoi4-layer-l1');
        const nodeGroup = g.append('g').attr('class', 'voronoi4-layer-nodes');
        const labelGroup = g.append('g').attr('class', 'voronoi4-layer-labels');

        // Draw polygons
        const l3Paths = l3Group.selectAll('.voronoi4-l3')
            .data(l3Polys)
            .enter()
            .append('path')
            .attr('class', 'voronoi4-l3')
            .attr('d', d => polygonToPath(d.polygon))
            .attr('fill', d => l3Colors.get(d.cluster.id) || '#334')
            .attr('fill-opacity', 0.38)
            .attr('stroke', '#111c2f')
            .attr('stroke-width', 3)
            .attr('stroke-opacity', 0.9);

        const l2Paths = l2Group.selectAll('.voronoi4-l2')
            .data(l2Polys)
            .enter()
            .append('path')
            .attr('class', 'voronoi4-l2')
            .attr('d', d => polygonToPath(d.polygon))
            .attr('fill', d => l2Color(d))
            .attr('fill-opacity', 0)
            .attr('stroke', d => l2Color(d))
            .attr('stroke-width', 2.5)
            .attr('stroke-opacity', 0)
            .style('pointer-events', 'none');

        const l1Paths = l1Group.selectAll('.voronoi4-l1')
            .data(l1Polys)
            .enter()
            .append('path')
            .attr('class', 'voronoi4-l1')
            .attr('d', d => polygonToPath(d.polygon))
            .attr('fill', d => l1Color(d))
            .attr('fill-opacity', 0)
            .attr('stroke', d => l1Color(d))
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 0)
            .style('pointer-events', 'none');

        // Labels
        const l3Labels = labelGroup.selectAll('.voronoi4-label-l3')
            .data(clusters.filter(c => centroidFor(c)))
            .enter()
            .append('text')
            .attr('class', 'voronoi4-label-l3')
            .attr('x', d => centroidFor(d)[0])
            .attr('y', d => centroidFor(d)[1])
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-size', '11px')
            .attr('font-weight', '700')
            .style('pointer-events', 'none')
            .style('text-shadow', '0 2px 4px rgba(0,0,0,0.8)')
            .text(d => (d.name || d.id).slice(0, 42));

        const l2Labels = labelGroup.selectAll('.voronoi4-label-l2')
            .data(l2LabelData.filter(d => centroidFor(d.node)))
            .enter()
            .append('text')
            .attr('class', 'voronoi4-label-l2')
            .attr('x', d => centroidFor(d.node)[0])
            .attr('y', d => centroidFor(d.node)[1])
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#e5ecff')
            .attr('font-size', '9px')
            .attr('font-weight', '600')
            .style('pointer-events', 'none')
            .style('text-shadow', '0 1px 3px rgba(0,0,0,0.75)')
            .style('opacity', 0)
            .text(d => (d.node.name || d.node.id).slice(0, 32));

        const l1Labels = labelGroup.selectAll('.voronoi4-label-l1')
            .data(l1LabelData.filter(d => centroidFor(d.node)))
            .enter()
            .append('text')
            .attr('class', 'voronoi4-label-l1')
            .attr('x', d => centroidFor(d.node)[0])
            .attr('y', d => centroidFor(d.node)[1])
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#f5f9ff')
            .attr('font-size', '8px')
            .attr('font-weight', '500')
            .style('pointer-events', 'none')
            .style('text-shadow', '0 1px 2px rgba(0,0,0,0.7)')
            .style('opacity', 0)
            .text(d => (d.node.name || d.node.id).slice(0, 28));

        // Entities
        const entityNodes = nodeGroup.selectAll('.voronoi4-entity')
            .data(entities)
            .enter()
            .append('circle')
            .attr('class', 'voronoi4-entity')
            .attr('cx', d => scaleX(d.x))
            .attr('cy', d => scaleY(d.y))
            .attr('r', 2.2)
            .attr('fill', d => {
                const entity = this.entities.get(d.id);
                if (entity && entity.type && this.typeColors[entity.type]) {
                    return '#' + this.typeColors[entity.type].toString(16).padStart(6, '0');
                }
                return '#00e0ff';
            })
            .attr('opacity', 0)
            .style('pointer-events', 'none');

        // Hover state
        let hoveredL3 = null;
        let hoveredL2 = null;
        let hoveredL1 = null;
        const self = this;

        const updateVisibility = () => {
            const activeL3 = hoveredL3 ? hoveredL3.id : null;
            const activeL2 = hoveredL2 ? hoveredL2.id : null;
            const activeL1 = hoveredL1 ? hoveredL1.id : null;

            l3Paths
                .transition()
                .duration(180)
                .attr('fill-opacity', d => (activeL3 && d.cluster.id === activeL3) ? 0.1 : 0.38)
                .attr('stroke-width', d => (activeL3 && d.cluster.id === activeL3) ? 4 : 3);

            l3Labels
                .transition()
                .duration(180)
                .style('opacity', d => activeL3 && d.id === activeL3 ? 0 : 1);

            l2Paths
                .transition()
                .duration(150)
                .attr('fill-opacity', d => (activeL3 && d.parent.id === activeL3) ? 0.55 : 0)
                .attr('stroke-opacity', d => (activeL3 && d.parent.id === activeL3) ? 0.9 : 0)
                .style('pointer-events', d => (activeL3 && d.parent.id === activeL3) ? 'all' : 'none');

            l2Labels
                .transition()
                .duration(150)
                .style('opacity', d => (activeL3 && d.parent.id === activeL3) ? 0.95 : 0);

            l1Paths
                .transition()
                .duration(150)
                .attr('fill-opacity', d => (activeL2 && d.parent.id === activeL2) ? 0.72 : 0)
                .attr('stroke-opacity', d => (activeL2 && d.parent.id === activeL2) ? 1 : 0)
                .style('pointer-events', d => (activeL2 && d.parent.id === activeL2) ? 'all' : 'none');

            l1Labels
                .transition()
                .duration(150)
                .style('opacity', d => (activeL2 && d.parentL2.id === activeL2) ? 0.95 : 0);

            entityNodes
                .transition()
                .duration(120)
                .attr('opacity', d => (activeL1 && d.parent.id === activeL1) ? 0.9 : 0)
                .attr('r', d => (activeL1 && d.parent.id === activeL1) ? 3 : 2.2);
        };

        // Tooltip helpers
        const summarizeCluster = (node) => {
            const l2Count = (node.children || []).length;
            const l1Count = (node.children || []).reduce((sum, l2) => sum + (l2.children || []).length, 0);
            const entCount = (node.children || []).reduce((sum, l2) => {
                return sum + (l2.children || []).reduce((s, l1) => s + (l1.entities || []).length, 0);
            }, 0);
            return `${l2Count} L2 | ${l1Count} L1 | ${entCount} entities`;
        };

        const summarizeL2 = (node) => {
            const l1Count = (node.children || []).length;
            const entCount = (node.children || []).reduce((sum, l1) => sum + (l1.entities || []).length, 0);
            return `${l1Count} L1 | ${entCount} entities`;
        };

        // Interactions
        l3Paths
            .on('mouseover', function(event, d) {
                hoveredL3 = d.cluster;
                hoveredL2 = null;
                hoveredL1 = null;
                updateVisibility();
                self.showOrganicTooltip(event, {
                    title: d.cluster.name || d.cluster.id,
                    content: summarizeCluster(d.cluster)
                });
            })
            .on('mouseout', function(event, d) {
                const related = event.relatedTarget;
                if (related && related.__data__ && related.__data__.parent && related.__data__.parent.id === d.cluster.id) {
                    return; // Moving into L2 child
                }
                hoveredL3 = null;
                hoveredL2 = null;
                hoveredL1 = null;
                updateVisibility();
                self.hideOrganicTooltip();
            });

        l2Paths
            .on('mouseover', function(event, d) {
                hoveredL3 = d.parent;
                hoveredL2 = d.cluster;
                hoveredL1 = null;
                updateVisibility();
                self.showOrganicTooltip(event, {
                    title: d.cluster.name || d.cluster.id,
                    content: summarizeL2(d.cluster)
                });
            })
            .on('mouseout', function(event, d) {
                const related = event.relatedTarget;
                if (related && related.__data__ && related.__data__.parent && related.__data__.parent.id === d.cluster.id) {
                    return; // Moving into L1 child
                }
                hoveredL2 = null;
                hoveredL1 = null;
                updateVisibility();
                self.hideOrganicTooltip();
            });

        l1Paths
            .on('mouseover', function(event, d) {
                hoveredL3 = d.parentL3;
                hoveredL2 = d.parent;
                hoveredL1 = d.cluster;
                updateVisibility();
                self.showOrganicTooltip(event, {
                    title: d.cluster.name || d.cluster.id,
                    content: `${(d.cluster.entities || []).length} entities`
                });
            })
            .on('mouseout', function() {
                hoveredL1 = null;
                updateVisibility();
                self.hideOrganicTooltip();
            });

        entityNodes
            .on('mouseover', function(event, d) {
                d3.select(this).attr('r', 4.5);
                const entity = self.entities.get(d.id);
                self.showOrganicTooltip(event, {
                    title: d.id,
                    content: entity ? `Type: ${entity.type || 'Unknown'}` : 'Entity'
                });
            })
            .on('mouseout', function() {
                d3.select(this).attr('r', 3);
                self.hideOrganicTooltip();
            })
            .style('pointer-events', 'auto');

        // Zoom/pan
        const zoom = d3.zoom()
            .scaleExtent([0.5, 10])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });
        svg.call(zoom);
        this.circlePackState.zoom = zoom;

        // Initialize visibility state
        updateVisibility();

        console.log(`${label} rendering complete`);
    }

    async renderVoronoi4View(svg, g, width, height) {
        const layoutUrl = this.resolveAssetPath('/data/graphrag_hierarchy/voronoi4_hierarchy.json');
        await this.renderVoronoiHierarchyView(svg, g, width, height, layoutUrl, 'Voronoi 4 (Progressive Disclosure)');
    }

    async renderVoronoi5View(svg, g, width, height) {
        const layoutUrl = this.resolveAssetPath('/data/graphrag_hierarchy/voronoi5_hierarchy.json');
        await this.renderVoronoiHierarchyView(svg, g, width, height, layoutUrl, 'Voronoi 5 (Subset, 1k nodes)');
    }

    /**
     * Render Strict Treemap View
     *
     * Top-down strict treemap with connectivity-based positioning.
     * Features:
     * - L3 clusters positioned based on relationship connectivity
     * - L2/L1 clusters nested within parent polygons
     * - Entities shown in info panel only (not on map)
     * - 3-level progressive disclosure: L3 → L2 → L1
     * - Labels fit inside polygons with dynamic sizing
     */
    async renderStrictTreemapView(svg, g, width, height) {
        console.log('Rendering Strict Treemap (Connectivity-based) view...');

        let layoutData;
        try {
            const layoutUrl = this.resolveAssetPath('/data/graphrag_hierarchy/voronoi5_strict_treemap.json');
            layoutData = await this.fetchJsonWithFallback([layoutUrl], 'strict_treemap');
            const meta = layoutData.metadata || {};
            console.log(`Loaded strict treemap: ${meta.l3_clusters || 0} L3, ${meta.l2_clusters || 0} L2, ${meta.l1_clusters || 0} L1 clusters, ${meta.total_entities || 0} entities`);
        } catch (err) {
            console.error('Failed to load strict treemap layout:', err);
            await this.renderHierarchicalView(svg, g, width, height);
            return;
        }

        const hierarchy = layoutData.hierarchy || [];
        const metadata = layoutData.metadata || {};
        const bounds = metadata.bounds || [-15, 15, -15, 15];

        // Compute bounds from all polygon coordinates
        let minX = bounds[0], maxX = bounds[1], minY = bounds[2], maxY = bounds[3];

        hierarchy.forEach(l3 => {
            (l3.polygon_coords || []).forEach(([x, y]) => {
                minX = Math.min(minX, x); maxX = Math.max(maxX, x);
                minY = Math.min(minY, y); maxY = Math.max(maxY, y);
            });
            (l3.children || []).forEach(l2 => {
                (l2.polygon_coords || []).forEach(([x, y]) => {
                    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
                });
                (l2.children || []).forEach(l1 => {
                    (l1.polygon_coords || []).forEach(([x, y]) => {
                        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
                        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
                    });
                });
            });
        });

        console.log(`Strict treemap bounds: X=[${minX.toFixed(2)}, ${maxX.toFixed(2)}], Y=[${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);

        const padding = 60;
        const scaleX = d3.scaleLinear()
            .domain([minX - 0.5, maxX + 0.5])
            .range([padding, width - padding]);
        const scaleY = d3.scaleLinear()
            .domain([minY - 0.5, maxY + 0.5])
            .range([padding, height - padding]);

        const polygonToPath = (coords) => {
            if (!coords || !Array.isArray(coords) || coords.length < 3) return '';
            return 'M' + coords.map(([x, y]) => `${scaleX(x)},${scaleY(y)}`).join('L') + 'Z';
        };

        // Transform coords to screen space
        const transformCoords = (coords) => {
            if (!coords) return [];
            return coords.map(([x, y]) => [scaleX(x), scaleY(y)]);
        };

        // Color palettes for each level (designed for adjacent contrast)
        const levelPalettes = {
            3: ['#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA', '#00ACC1', '#FFB300', '#5E35B1'],
            2: ['#F57C00', '#5E35B1', '#00897B', '#D81B60', '#3949AB', '#7CB342', '#00ACC1', '#FF7043'],
            1: ['#039BE5', '#C0CA33', '#E91E63', '#00ACC1', '#FF7043', '#AB47BC', '#26A69A', '#EF5350']
        };

        // State tracking for progressive disclosure
        const state = {
            expandedL3: null,
            expandedL2: null,
            lockedL3: null,
            lockedL2: null
        };

        const self = this;

        // Create layer groups for proper z-ordering
        const l3Layer = g.append('g').attr('class', 'l3-layer');
        const l2Layer = g.append('g').attr('class', 'l2-layer');
        const l1Layer = g.append('g').attr('class', 'l1-layer');
        const labelLayer = g.append('g').attr('class', 'label-layer');

        // Helper to get polygon bounding box (in screen coords)
        const getPolygonBounds = (screenCoords) => {
            if (!screenCoords || screenCoords.length < 3) return null;
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            for (const [x, y] of screenCoords) {
                minX = Math.min(minX, x); maxX = Math.max(maxX, x);
                minY = Math.min(minY, y); maxY = Math.max(maxY, y);
            }
            return { width: maxX - minX, height: maxY - minY, minX, maxX, minY, maxY, cx: (minX+maxX)/2, cy: (minY+maxY)/2 };
        };

        // Helper to estimate text width
        const estimateTextWidth = (text, fontSize) => text.length * fontSize * 0.55;

        // Calculate font size and lines that fit within polygon bounds
        const calculateFittingFontSize = (name, screenCoords) => {
            const bounds = getPolygonBounds(screenCoords);
            if (!bounds) return { fontSize: 8, lines: [name.substring(0, 15)], lineHeight: 10 };

            const availableWidth = bounds.width * 0.9;  // Use more of the width
            const availableHeight = bounds.height * 0.8; // Use more of the height

            // Allow smaller fonts for small polygons
            const maxFontSize = Math.min(availableHeight * 0.35, 22);
            const minFontSize = Math.max(4, availableHeight * 0.06);  // Allow down to 4px

            for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 0.5) {
                const lineHeight = fontSize * 1.15;  // Tighter line height
                const words = name.split(/\s+/);
                const lines = [];
                let currentLine = [];

                words.forEach(word => {
                    const testLine = [...currentLine, word].join(' ');
                    if (estimateTextWidth(testLine, fontSize) > availableWidth && currentLine.length > 0) {
                        lines.push(currentLine.join(' '));
                        currentLine = [word];
                    } else {
                        currentLine.push(word);
                    }
                });
                if (currentLine.length > 0) lines.push(currentLine.join(' '));

                const totalTextHeight = lines.length * lineHeight;
                const maxLineWidth = Math.max(...lines.map(line => estimateTextWidth(line, fontSize)));

                if (totalTextHeight <= availableHeight && maxLineWidth <= availableWidth) {
                    return { fontSize, lines, lineHeight };
                }
            }

            // Fallback: use minimum font, wrap text properly with multiple lines
            const fontSize = minFontSize;
            const lineHeight = fontSize * 1.15;
            const maxLines = Math.max(1, Math.floor(availableHeight / lineHeight));
            const maxCharsPerLine = Math.max(3, Math.floor(availableWidth / (fontSize * 0.55)));

            // Word wrap properly for fallback
            const words = name.split(/\s+/);
            const lines = [];
            let currentLine = '';

            for (const word of words) {
                if (lines.length >= maxLines) break;

                const testLine = currentLine ? currentLine + ' ' + word : word;
                if (testLine.length <= maxCharsPerLine) {
                    currentLine = testLine;
                } else {
                    if (currentLine) {
                        lines.push(currentLine);
                        currentLine = word.length <= maxCharsPerLine ? word : word.substring(0, maxCharsPerLine);
                    } else {
                        // First word is too long
                        lines.push(word.substring(0, maxCharsPerLine));
                    }
                }
            }
            if (currentLine && lines.length < maxLines) {
                lines.push(currentLine);
            }

            // If still no lines, force at least one
            if (lines.length === 0) {
                lines.push(name.substring(0, maxCharsPerLine));
            }

            return { fontSize, lines, lineHeight };
        };

        // Assign colors using graph coloring to avoid adjacent same colors
        const assignColors = (items, level, parentPolygons = null) => {
            const palette = levelPalettes[level] || levelPalettes[3];
            items.forEach((item, i) => {
                item.colorIndex = i % palette.length;
                item.color = palette[item.colorIndex];
            });
        };

        // Prepare data structures with transformed coords
        const l3Data = hierarchy.map((l3, idx) => {
            const screenCoords = transformCoords(l3.polygon_coords);
            return {
                cluster: l3,
                coords: l3.polygon_coords || [],
                screenCoords,
                index: idx,
                children: (l3.children || []).map(l2 => {
                    const l2ScreenCoords = transformCoords(l2.polygon_coords);
                    return {
                        cluster: l2,
                        coords: l2.polygon_coords || [],
                        screenCoords: l2ScreenCoords,
                        parentL3: l3,
                        entityIds: (l2.entities || []).map(e => e.id),
                        children: (l2.children || []).map(l1 => {
                            const l1ScreenCoords = transformCoords(l1.polygon_coords);
                            return {
                                cluster: l1,
                                coords: l1.polygon_coords || [],
                                screenCoords: l1ScreenCoords,
                                parentL2: l2,
                                parentL3: l3,
                                entityIds: (l1.entities || []).map(e => e.id)
                            };
                        })
                    };
                })
            };
        });
        // Assign colors to L3
        assignColors(l3Data, 3);

        // === RENDER L3 POLYGONS ===
        const l3Polygons = l3Layer.selectAll('path.l3-polygon')
            .data(l3Data.filter(d => d.coords.length >= 3))
            .enter()
            .append('path')
            .attr('class', 'l3-polygon')
            .attr('data-id', d => d.cluster.id)
            .attr('d', d => polygonToPath(d.coords))
            .attr('fill', d => d.color)
            .attr('fill-opacity', 0.5)
            .attr('stroke', d => d3.color(d.color).darker(0.5))
            .attr('stroke-width', 2.5)
            .style('cursor', 'pointer');

        // L3 Labels with dynamic sizing
        labelLayer.selectAll('text.l3-label')
            .data(l3Data.filter(d => d.screenCoords.length > 0))
            .enter()
            .append('text')
            .attr('class', 'l3-label')
            .attr('data-id', d => d.cluster.id)
            .attr('text-anchor', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-weight', '700')
            .style('text-shadow', '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)')
            .style('pointer-events', 'none')
            .each(function(d) {
                const text = d3.select(this);
                const name = d.cluster.title || d.cluster.id || 'Unknown';
                const bounds = getPolygonBounds(d.screenCoords);
                const { fontSize, lines, lineHeight } = calculateFittingFontSize(name, d.screenCoords);

                text.attr('font-size', fontSize)
                    .attr('x', bounds.cx)
                    .attr('y', bounds.cy);

                const totalHeight = lines.length * lineHeight;
                const startY = -totalHeight / 2 + lineHeight / 2;

                lines.forEach((line, i) => {
                    text.append('tspan')
                        .attr('x', bounds.cx)
                        .attr('dy', i === 0 ? startY : lineHeight)
                        .text(line);
                });
            });

        // Keep L3 labels hidden when a cluster is expanded/locked (mirrors Voronoi behaviour)
        const updateL3LabelVisibility = () => {
            const activeL3 = state.lockedL3 || state.expandedL3;
            labelLayer.selectAll('text.l3-label')
                .style('opacity', d => {
                    const id = d.cluster?.id || d.id;
                    return activeL3 && id === activeL3 ? 0 : 1;
                })
                .style('display', d => {
                    const id = d.cluster?.id || d.id;
                    return activeL3 && id === activeL3 ? 'none' : null;
                });
        };

        // === HELPER FUNCTIONS ===

        function showL2Children(l3Item) {
            // Fade out L3 polygon
            l3Layer.select(`path[data-id="${l3Item.cluster.id}"]`)
                .transition().duration(300)
                .attr('fill-opacity', 0.2);

            // Hide the hovered L3 label so L2 labels inside are visible
            const clusterId = l3Item.cluster.id;
            labelLayer.selectAll('text.l3-label')
                .filter(function() { return d3.select(this).attr('data-id') === clusterId; })
                .style('opacity', 0)
                .style('display', 'none');

            const l2Data = l3Item.children.filter(c => c.coords.length >= 3);
            assignColors(l2Data, 2);

            const l2Selection = l2Layer.selectAll(`path.l2-polygon-${l3Item.index}`)
                .data(l2Data, d => d.cluster.id);

            l2Selection.enter()
                .append('path')
                .attr('class', `l2-polygon l2-polygon-${l3Item.index}`)
                .attr('data-id', d => d.cluster.id)
                .attr('d', d => polygonToPath(d.coords))
                .attr('fill', d => d.color)
                .attr('fill-opacity', 0)
                .attr('stroke', d => d3.color(d.color).darker(0.3))
                .attr('stroke-width', 1.5)
                .style('cursor', 'pointer')
                .on('mouseenter', function(event, d) {
                    if (state.lockedL2 !== d.cluster.id) {
                        state.expandedL2 = d.cluster.id;
                        showL1Children(d, l3Item.index);
                    }
                })
                .on('mouseleave', function(event, d) {
                    if (!state.lockedL2) {
                        state.expandedL2 = null;
                        hideL1Children(d, l3Item.index);
                    }
                })
                .on('click', function(event, d) {
                    event.stopPropagation();
                    if (state.lockedL2 === d.cluster.id) {
                        state.lockedL2 = null;
                        hideL1Children(d, l3Item.index);
                    } else {
                        state.lockedL2 = d.cluster.id;
                        showL1Children(d, l3Item.index);
                    }
                    self.showStrictTreemapClusterInfo(d, 2, l3Item);
                })
                .transition().duration(400)
                .attr('fill-opacity', 0.5);

            // L2 Labels
            const l2Labels = labelLayer.selectAll(`text.l2-label-${l3Item.index}`)
                .data(l2Data, d => d.cluster.id);

            l2Labels.enter()
                .append('text')
                .attr('class', `l2-label l2-label-${l3Item.index}`)
                .attr('data-id', d => d.cluster.id)
                .attr('text-anchor', 'middle')
                .attr('fill', '#ffffff')
                .attr('font-weight', '600')
                .style('opacity', 0)
                .style('text-shadow', '0 1px 2px rgba(0,0,0,0.8)')
                .style('pointer-events', 'none')
                .each(function(d) {
                    const text = d3.select(this);
                    const name = d.cluster.title || d.cluster.id || 'Unknown';
                    const bounds = getPolygonBounds(d.screenCoords);
                    if (!bounds) return;
                    const { fontSize, lines, lineHeight } = calculateFittingFontSize(name, d.screenCoords);

                    text.attr('font-size', fontSize)
                        .attr('x', bounds.cx)
                        .attr('y', bounds.cy);

                    const totalHeight = lines.length * lineHeight;
                    const startY = -totalHeight / 2 + lineHeight / 2;

                    lines.forEach((line, i) => {
                        text.append('tspan')
                            .attr('x', bounds.cx)
                            .attr('dy', i === 0 ? startY : lineHeight)
                            .text(line);
                    });
                })
                .transition().duration(400)
                .style('opacity', 1);
        }

        function hideL2Children(l3Item) {
            l3Layer.select(`path[data-id="${l3Item.cluster.id}"]`)
                .transition().duration(300)
                .attr('fill-opacity', 0.5);

            l2Layer.selectAll(`path.l2-polygon-${l3Item.index}`)
                .transition().duration(300)
                .attr('fill-opacity', 0)
                .remove();

            labelLayer.selectAll(`text.l2-label-${l3Item.index}`)
                .transition().duration(300)
                .style('opacity', 0)
                .remove();

            l1Layer.selectAll('*').remove();
            labelLayer.selectAll('.l1-label').remove();

            // Restore the L3 label when collapsing
            const clusterId = l3Item.cluster.id;
            labelLayer.selectAll('text.l3-label')
                .filter(function() { return d3.select(this).attr('data-id') === clusterId; })
                .style('opacity', 1)
                .style('display', null);
        }

        function showL1Children(l2Item, l3Index) {
            l2Layer.select(`path[data-id="${l2Item.cluster.id}"]`)
                .transition().duration(300)
                .attr('fill-opacity', 0.2);

            // Hide the hovered L2 label so L1 labels inside are visible
            const l2ClusterId = l2Item.cluster.id;
            labelLayer.selectAll(`text.l2-label-${l3Index}`)
                .filter(function() { return d3.select(this).attr('data-id') === l2ClusterId; })
                .style('opacity', 0);

            const l1Data = l2Item.children.filter(c => c.coords.length >= 3);
            assignColors(l1Data, 1);

            const l1Selection = l1Layer.selectAll(`path.l1-polygon-${l2Item.cluster.id}`)
                .data(l1Data, d => d.cluster.id);

            l1Selection.enter()
                .append('path')
                .attr('class', `l1-polygon l1-polygon-${l2Item.cluster.id}`)
                .attr('data-id', d => d.cluster.id)
                .attr('d', d => polygonToPath(d.coords))
                .attr('fill', d => d.color)
                .attr('fill-opacity', 0)
                .attr('stroke', d => d3.color(d.color).darker(0.1))
                .attr('stroke-width', 1)
                .style('cursor', 'pointer')
                .on('click', function(event, d) {
                    event.stopPropagation();
                    self.showStrictTreemapClusterInfo(d, 1, null, l2Item);
                })
                .transition().duration(400)
                .attr('fill-opacity', 0.6);

            // L1 Labels
            const l1Labels = labelLayer.selectAll(`text.l1-label-${l2Item.cluster.id}`)
                .data(l1Data, d => d.cluster.id);

            l1Labels.enter()
                .append('text')
                .attr('class', `l1-label l1-label-${l2Item.cluster.id}`)
                .attr('data-id', d => d.cluster.id)
                .attr('text-anchor', 'middle')
                .attr('fill', '#ffffff')
                .attr('font-weight', '500')
                .style('opacity', 0)
                .style('text-shadow', '0 1px 2px rgba(0,0,0,0.8)')
                .style('pointer-events', 'none')
                .each(function(d) {
                    const text = d3.select(this);
                    const name = d.cluster.title || d.cluster.id || 'Unknown';
                    const bounds = getPolygonBounds(d.screenCoords);
                    if (!bounds) return;
                    const { fontSize, lines, lineHeight } = calculateFittingFontSize(name, d.screenCoords);

                    text.attr('font-size', fontSize)
                        .attr('x', bounds.cx)
                        .attr('y', bounds.cy);

                    const totalHeight = lines.length * lineHeight;
                    const startY = -totalHeight / 2 + lineHeight / 2;

                    lines.forEach((line, i) => {
                        text.append('tspan')
                            .attr('x', bounds.cx)
                            .attr('dy', i === 0 ? startY : lineHeight)
                            .text(line);
                    });
                })
                .transition().duration(400)
                .style('opacity', 1);
        }

        function hideL1Children(l2Item, l3Index) {
            l2Layer.select(`path[data-id="${l2Item.cluster.id}"]`)
                .transition().duration(300)
                .attr('fill-opacity', 0.5);

            // Show the hovered L2 label again
            const l2ClusterId = l2Item.cluster.id;
            labelLayer.selectAll(`text.l2-label-${l3Index}`)
                .filter(function() { return d3.select(this).attr('data-id') === l2ClusterId; })
                .style('opacity', 1);

            l1Layer.selectAll(`path.l1-polygon-${l2Item.cluster.id}`)
                .transition().duration(300)
                .attr('fill-opacity', 0)
                .remove();

            labelLayer.selectAll(`text.l1-label-${l2Item.cluster.id}`)
                .transition().duration(300)
                .style('opacity', 0)
                .remove();
        }

        // L3 interactions
        l3Polygons
            .on('click', function(event, d) {
                event.stopPropagation();
                if (state.lockedL3 === d.cluster.id) {
                    state.lockedL3 = null;
                    state.lockedL2 = null;
                    state.expandedL3 = null;
                    hideL2Children(d);
                } else {
                    if (state.lockedL3) {
                        const prevL3 = l3Data.find(item => item.cluster.id === state.lockedL3);
                        if (prevL3) hideL2Children(prevL3);
                    }
                    state.lockedL3 = d.cluster.id;
                    state.lockedL2 = null;
                    state.expandedL3 = d.cluster.id;
                    showL2Children(d);
                }
                updateL3LabelVisibility();
                self.showStrictTreemapClusterInfo(d, 3);
            });

        // Fallback pointer tracking on the SVG to keep hover state stable (hit-test polygons directly)
        const hitTestL3 = (x, y) => {
            for (const item of l3Data) {
                if (item.screenCoords && item.screenCoords.length >= 3 && d3.polygonContains(item.screenCoords, [x, y])) {
                    return item;
                }
            }
            return null;
        };

        let lastHoveredL3 = null;
        const svgNode = svg.node();
        const applyHover = (event) => {
            if (state.lockedL3 || state.lockedL2) return;
            const pointer = d3.pointer(event, svgNode);
            const t = d3.zoomTransform(svgNode);
            const [mx, my] = t.invert(pointer); // account for current zoom/pan
            const hit = hitTestL3(mx, my);
            const l3Id = hit ? hit.cluster.id : null;

            if (l3Id && l3Id !== lastHoveredL3) {
                if (lastHoveredL3) {
                    const prev = l3Data.find(item => item.cluster.id === lastHoveredL3);
                    if (prev) hideL2Children(prev);
                }
                state.expandedL3 = l3Id;
                showL2Children(hit);
                updateL3LabelVisibility();
                lastHoveredL3 = l3Id;
            } else if (!l3Id && lastHoveredL3) {
                const prev = l3Data.find(item => item.cluster.id === lastHoveredL3);
                if (prev && !state.lockedL3 && !state.lockedL2) {
                    hideL2Children(prev);
                    state.expandedL3 = null;
                    lastHoveredL3 = null;
                    updateL3LabelVisibility();
                }
            }
        };

        const clearHover = () => {
            if (lastHoveredL3 && !state.lockedL3 && !state.lockedL2) {
                const prev = l3Data.find(item => item.cluster.id === lastHoveredL3);
                if (prev) hideL2Children(prev);
                state.expandedL3 = null;
                lastHoveredL3 = null;
                updateL3LabelVisibility();
            }
        };

        svgNode.addEventListener('mousemove', applyHover);
        svgNode.addEventListener('mouseleave', clearHover);

        // Setup zoom
        const zoom = d3.zoom()
            .scaleExtent([0.5, 10])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });
        svg.call(zoom);
        this.circlePackState.zoom = zoom;

        console.log('Strict Treemap rendering complete');
    }

    /**
     * Show info panel for strict treemap cluster (like showVoronoiClusterInfo)
     */
    showStrictTreemapClusterInfo(item, level, parentL3 = null, parentL2 = null) {
        const panel = document.getElementById('info-panel');
        const entityInfo = document.getElementById('entity-info');

        if (!panel) return;

        // Get or create voronoi-cluster-info div
        let voronoiInfo = document.getElementById('voronoi-cluster-info');
        if (!voronoiInfo) {
            voronoiInfo = document.createElement('div');
            voronoiInfo.id = 'voronoi-cluster-info';
            voronoiInfo.style.display = 'none';
            if (entityInfo) {
                entityInfo.parentNode.insertBefore(voronoiInfo, entityInfo.nextSibling);
            } else {
                panel.appendChild(voronoiInfo);
            }
        }

        if (entityInfo) entityInfo.style.display = 'none';
        voronoiInfo.style.display = 'block';

        const cluster = item.cluster || item;
        const levelNames = { 1: 'Fine Cluster (L1)', 2: 'Community Cluster (L2)', 3: 'Top-Level Cluster (L3)' };
        const clusterName = cluster.title || cluster.id || 'Unknown';
        const entityCount = cluster.entity_count || (item.entityIds ? item.entityIds.length : 0);

        // Build hierarchy path
        let hierarchyHtml = '';
        const hierarchyPath = [];

        if (level === 1 && parentL2) {
            if (parentL2.parentL3) {
                hierarchyPath.push({ level: 3, name: parentL2.parentL3.title || parentL2.parentL3.id });
            }
            hierarchyPath.push({ level: 2, name: parentL2.cluster.title || parentL2.cluster.id });
            hierarchyPath.push({ level: 1, name: clusterName });
        } else if (level === 2 && parentL3) {
            hierarchyPath.push({ level: 3, name: parentL3.cluster.title || parentL3.cluster.id });
            hierarchyPath.push({ level: 2, name: clusterName });
        } else if (level === 3) {
            hierarchyPath.push({ level: 3, name: clusterName });
        }

        if (hierarchyPath.length > 0) {
            const getLevelLabel = (l) => l === 3 ? 'L3 (Top)' : l === 2 ? 'L2 (Community)' : 'L1 (Fine)';
            hierarchyHtml = `
                <div style="margin-top: 16px; padding: 12px; background: rgba(100, 200, 255, 0.05); border: 1px solid rgba(100, 200, 255, 0.15); border-radius: 10px;">
                    <div style="font-size: 12px; color: #a0a0a0; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Hierarchical Path</div>
                    ${hierarchyPath.map((h, idx) => `
                        <div style="display: flex; align-items: center; margin: 6px 0; padding-left: ${idx * 12}px;">
                            <span style="color: #00ffff; font-size: 11px; font-weight: 600; min-width: 85px;">${getLevelLabel(h.level)}</span>
                            <span style="color: ${h.level === level ? '#64b5f6' : '#ccc'}; font-size: 13px; ${h.level === level ? 'font-weight: 600;' : ''}">${h.name}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Build entity list for L1 clusters
        let entitiesHtml = '';
        const entityIds = item.entityIds || [];

        if (level === 1 && entityIds.length > 0) {
            const entitiesByType = {};
            for (const entityId of entityIds) {
                const entity = this.entities.get(entityId);
                const type = entity?.type || 'UNKNOWN';
                if (!entitiesByType[type]) entitiesByType[type] = [];
                entitiesByType[type].push({ id: entityId, name: entity?.name || entity?.title || entityId, type });
            }

            const sortedTypes = Object.keys(entitiesByType).sort((a, b) => entitiesByType[b].length - entitiesByType[a].length);
            const typeColors = {
                'PERSON': '#FF6B6B', 'ORGANIZATION': '#4ECDC4', 'CONCEPT': '#45B7D1',
                'PLACE': '#96CEB4', 'PRACTICE': '#DDA0DD', 'PRODUCT': '#F7DC6F',
                'EVENT': '#BB8FCE', 'UNKNOWN': '#95A5A6'
            };

            entitiesHtml = `
                <div style="margin-top: 16px; padding: 12px; background: rgba(136, 255, 136, 0.05); border: 1px solid rgba(136, 255, 136, 0.2); border-radius: 10px;">
                    <div style="font-size: 12px; color: #88FF88; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; display: flex; justify-content: space-between;">
                        <span>Entities in Cluster</span>
                        <span style="color: #ccc; font-size: 11px;">${entityIds.length} total</span>
                    </div>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${sortedTypes.map(type => `
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 11px; color: ${typeColors[type] || '#95A5A6'}; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center;">
                                    <span style="width: 8px; height: 8px; border-radius: 50%; background: ${typeColors[type] || '#95A5A6'}; margin-right: 6px;"></span>
                                    ${type} (${entitiesByType[type].length})
                                </div>
                                ${entitiesByType[type].slice(0, 20).map(e => `
                                    <div class="strict-entity-item" data-entity-id="${e.id}"
                                         style="padding: 6px 8px; margin: 2px 0; background: rgba(255,255,255,0.03); border-radius: 4px; cursor: pointer; font-size: 12px; color: #ccc; transition: background 0.2s;"
                                         onmouseover="this.style.background='rgba(100,180,246,0.15)'"
                                         onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                                        ${e.name}
                                    </div>
                                `).join('')}
                                ${entitiesByType[type].length > 20 ? `<div style="font-size: 11px; color: #666; padding: 4px 8px; font-style: italic;">...and ${entitiesByType[type].length - 20} more</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Children info for L3/L2
        let childrenHtml = '';
        if (level > 1) {
            const children = item.children || [];
            const childLevel = level - 1;
            const childLevelName = childLevel === 2 ? 'communities' : 'fine clusters';
            if (children.length > 0) {
                childrenHtml = `<div style="color: #ccc; margin: 4px 0;"><strong>Contains:</strong> ${children.length} ${childLevelName}</div>`;
            }
        }

        voronoiInfo.innerHTML = `
            <div class="cluster-info">
                <h3 style="color: #64b5f6; margin: 0 0 12px 0; word-wrap: break-word;">${clusterName}</h3>
                <div style="color: #999; font-size: 13px; margin-bottom: 8px;">${levelNames[level] || 'Unknown'}</div>
                <div style="margin: 12px 0;">
                    ${entityCount > 0 ? `<div style="color: #ccc; margin: 4px 0;"><strong>Entities:</strong> ${entityCount.toLocaleString()}</div>` : ''}
                    ${childrenHtml}
                </div>
                ${hierarchyHtml}
                ${entitiesHtml}
                ${level !== 1 ? '<div style="margin-top: 12px; font-size: 12px; color: #7a8ca8;">Click on nested cells to explore deeper levels</div>' : ''}
            </div>
        `;

        // Add click handlers for entity items
        if (level === 1) {
            const entityItems = voronoiInfo.querySelectorAll('.strict-entity-item');
            entityItems.forEach(item => {
                item.addEventListener('click', () => {
                    const entityId = item.getAttribute('data-entity-id');
                    if (entityId) this.selectEntity(entityId);
                });
            });
        }

        panel.classList.remove('collapsed');
    }

    /**
     * Show organic tooltip for 2D views
     */
    showOrganicTooltip(event, data) {
        const tooltip = d3.select('#organic-tooltip');
        if (!tooltip.node()) return;

        tooltip.select('#organic-tooltip-title').text(data.title || '');
        tooltip.select('#organic-tooltip-content').text(data.content || '');

        tooltip
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .classed('visible', true);
    }

    /**
     * Render Hierarchical Voronoi view with 4-LEVEL PROGRESSIVE DISCLOSURE
     *
     * Interaction Logic:
     * - Initial State: Only L3 polygons visible (filled, labeled)
     * - Hover L3: Fade L3, reveal its L2 children
     * - Hover L2: Fade L2, reveal its L1 children (micro-clusters)
     * - Hover L1: Fade L1, reveal entities inside
     * - Click: Lock the expanded state at any level
     */
    async renderHierarchicalView(svg, g, width, height) {
        console.log('Rendering 4-Level Hierarchical Voronoi view with Progressive Disclosure...');
        console.log('Hierarchy: L3 → L2 → L1 → Entities');

        let hierarchyData;
        try {
            const layoutUrl = this.resolveAssetPath('/data/graphrag_hierarchy/hierarchical_voronoi.json');
            hierarchyData = await this.fetchJsonWithFallback([layoutUrl], 'hierarchical_voronoi');
            const meta = hierarchyData.metadata || {};
            console.log(`Loaded hierarchical layout: ${hierarchyData.hierarchy?.length || 0} L3, ${meta.l2_clusters || 0} L2, ${meta.l1_clusters || 0} L1 clusters`);
        } catch (err) {
            console.error('Failed to load hierarchical_voronoi.json:', err);
            await this.renderVoronoi3View(svg, g, width, height);
            return;
        }

        const hierarchy = hierarchyData.hierarchy || [];
        const metadata = hierarchyData.metadata || {};
        const bounds = metadata.bounds || [0, 20, 0, 20];

        // Compute bounds including all polygon vertices (all 4 levels)
        let minX = bounds[0], maxX = bounds[1], minY = bounds[2], maxY = bounds[3];

        hierarchy.forEach(l3 => {
            (l3.polygon_coords || []).forEach(([x, y]) => {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            });
            (l3.children || []).forEach(l2 => {
                (l2.polygon_coords || []).forEach(([x, y]) => {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                });
                // Include L1 polygons in bounds
                (l2.children || []).forEach(l1 => {
                    (l1.polygon_coords || []).forEach(([x, y]) => {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    });
                });
            });
        });

        console.log(`Hierarchical bounds: X=[${minX.toFixed(2)}, ${maxX.toFixed(2)}], Y=[${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);

        const padding = 60;
        const scaleX = d3.scaleLinear()
            .domain([minX - 0.5, maxX + 0.5])
            .range([padding, width - padding]);
        const scaleY = d3.scaleLinear()
            .domain([minY - 0.5, maxY + 0.5])
            .range([padding, height - padding]);

        const polygonToPath = (coords) => {
            if (!coords || !Array.isArray(coords) || coords.length < 3) return '';
            return 'M' + coords.map(([x, y]) => `${scaleX(x)},${scaleY(y)}`).join('L') + 'Z';
        };

        // Color scale for L3 clusters
        const l3Colors = d3.scaleOrdinal(d3.schemeTableau10);

        // State tracking for 4-level progressive disclosure
        const state = {
            expandedL3: null,
            expandedL2: null,
            expandedL1: null,
            lockedL3: null,
            lockedL2: null,
            lockedL1: null
        };

        const self = this;

        // Create layer groups for proper z-ordering (5 layers)
        const l3Layer = g.append('g').attr('class', 'l3-layer');
        const l2Layer = g.append('g').attr('class', 'l2-layer');
        const l1Layer = g.append('g').attr('class', 'l1-layer');
        const entityLayer = g.append('g').attr('class', 'entity-layer');
        const labelLayer = g.append('g').attr('class', 'label-layer');

        // Prepare 4-level data structures
        const l3Data = hierarchy.map((l3, idx) => ({
            cluster: l3,
            coords: l3.polygon_coords || [],
            color: l3Colors(idx),
            index: idx,
            children: (l3.children || []).map(l2 => ({
                cluster: l2,
                coords: l2.polygon_coords || [],
                parentL3: l3,
                parentColor: l3Colors(idx),
                // L2 has L1 children
                children: (l2.children || []).map(l1 => ({
                    cluster: l1,
                    coords: l1.polygon_coords || [],
                    parentL2: l2,
                    parentL3: l3,
                    parentColor: l3Colors(idx),
                    entities: (l1.entities || []).map(e => ({
                        ...e,
                        parentL1: l1,
                        parentL2: l2,
                        parentL3: l3
                    }))
                }))
            }))
        }));

        // === RENDER L3 POLYGONS (Initial State - All Visible) ===
        const l3Polygons = l3Layer.selectAll('path.l3-polygon')
            .data(l3Data.filter(d => d.coords.length >= 3))
            .enter()
            .append('path')
            .attr('class', 'l3-polygon')
            .attr('data-id', d => d.cluster.id)
            .attr('d', d => polygonToPath(d.coords))
            .attr('fill', d => d.color)
            .attr('fill-opacity', 0.6)
            .attr('stroke', d => d3.color(d.color).darker(0.5))
            .attr('stroke-width', 2)
            .style('cursor', 'pointer');

        // L3 Labels (visible initially)
        labelLayer.selectAll('text.l3-label')
            .data(l3Data.filter(d => d.coords.length > 0))
            .enter()
            .append('text')
            .attr('class', 'l3-label')
            .attr('data-id', d => d.cluster.id)
            .attr('x', d => scaleX(d3.mean(d.coords, p => p[0])))
            .attr('y', d => scaleY(d3.mean(d.coords, p => p[1])))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .style('text-shadow', '2px 2px 4px rgba(0,0,0,0.9)')
            .style('pointer-events', 'none')
            .text(d => (d.cluster.title || d.cluster.id).substring(0, 25));

        // === HELPER FUNCTIONS FOR 4-LEVEL PROGRESSIVE DISCLOSURE ===

        function showL2Children(l3Item) {
            l3Layer.select(`path[data-id="${l3Item.cluster.id}"]`)
                .transition().duration(200)
                .attr('fill-opacity', 0.1)
                .attr('stroke-width', 1);

            labelLayer.select(`text.l3-label[data-id="${l3Item.cluster.id}"]`)
                .transition().duration(200)
                .attr('fill-opacity', 0.3);

            const l2Selection = l2Layer.selectAll(`path.l2-polygon-${l3Item.index}`)
                .data(l3Item.children.filter(c => c.coords.length >= 3))
                .enter()
                .append('path')
                .attr('class', `l2-polygon l2-polygon-${l3Item.index}`)
                .attr('data-id', d => d.cluster.id)
                .attr('data-parent-l3', l3Item.cluster.id)
                .attr('d', d => polygonToPath(d.coords))
                .attr('fill', d => d.parentColor)
                .attr('fill-opacity', 0)
                .attr('stroke', d => d3.color(d.parentColor).darker(0.3))
                .attr('stroke-width', 1)
                .style('cursor', 'pointer');

            l2Selection.transition().duration(300).attr('fill-opacity', 0.5);

            // L2 hover handlers - reveal L1 children
            l2Selection
                .on('mouseover', function(event, d) {
                    if (state.lockedL2 && state.lockedL2 !== d.cluster.id) return;
                    d3.select(this).attr('fill-opacity', 0.2).attr('stroke-width', 2);
                    state.expandedL2 = d.cluster.id;
                    showL1Children(d, l3Item.index);
                    const l1Count = d.children ? d.children.length : 0;
                    self.showOrganicTooltip(event, {
                        title: d.cluster.title || d.cluster.id,
                        content: `L2 Cluster | ${l1Count} L1 tiles | ${d.cluster.entity_count || 0} entities`
                    });
                })
                .on('mouseout', function(event, d) {
                    if (state.lockedL2 === d.cluster.id) return;
                    d3.select(this).attr('fill-opacity', 0.5).attr('stroke-width', 1);
                    state.expandedL2 = null;
                    hideL1Children(d.cluster.id);
                    self.hideOrganicTooltip();
                })
                .on('click', function(event, d) {
                    event.stopPropagation();
                    if (state.lockedL2 === d.cluster.id) {
                        state.lockedL2 = null;
                        state.lockedL1 = null;
                        d3.select(this).attr('stroke', d3.color(d.parentColor).darker(0.3));
                        hideL1Children(d.cluster.id);
                    } else {
                        state.lockedL2 = d.cluster.id;
                        state.lockedL1 = null;
                        d3.select(this).attr('stroke', '#ffffff');
                        showL1Children(d, l3Item.index);
                    }
                });

            labelLayer.selectAll(`text.l2-label-${l3Item.index}`)
                .data(l3Item.children.filter(c => c.coords.length >= 3))
                .enter()
                .append('text')
                .attr('class', `l2-label l2-label-${l3Item.index}`)
                .attr('data-parent-l3', l3Item.cluster.id)
                .attr('x', d => scaleX(d3.mean(d.coords, p => p[0])))
                .attr('y', d => scaleY(d3.mean(d.coords, p => p[1])))
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('fill', '#ffffff')
                .attr('font-size', '10px')
                .style('text-shadow', '1px 1px 3px rgba(0,0,0,0.8)')
                .style('pointer-events', 'none')
                .attr('fill-opacity', 0)
                .text(d => (d.cluster.title || d.cluster.id).substring(0, 20))
                .transition().duration(300)
                .attr('fill-opacity', 0.9);
        }

        function hideL2Children(l3Item) {
            if (state.lockedL3 === l3Item.cluster.id) return;

            l3Layer.select(`path[data-id="${l3Item.cluster.id}"]`)
                .transition().duration(200)
                .attr('fill-opacity', 0.6)
                .attr('stroke-width', 2);

            labelLayer.select(`text.l3-label[data-id="${l3Item.cluster.id}"]`)
                .transition().duration(200)
                .attr('fill-opacity', 1);

            l2Layer.selectAll(`path[data-parent-l3="${l3Item.cluster.id}"]`)
                .transition().duration(200)
                .attr('fill-opacity', 0)
                .remove();

            labelLayer.selectAll(`text[data-parent-l3="${l3Item.cluster.id}"]`)
                .transition().duration(200)
                .attr('fill-opacity', 0)
                .remove();

            l1Layer.selectAll(`path[data-grandparent-l3="${l3Item.cluster.id}"]`)
                .transition().duration(150)
                .attr('fill-opacity', 0)
                .remove();

            labelLayer.selectAll(`text[data-grandparent-l3="${l3Item.cluster.id}"]`)
                .transition().duration(150)
                .attr('fill-opacity', 0)
                .remove();

            entityLayer.selectAll(`circle[data-grandparent-l3="${l3Item.cluster.id}"]`)
                .transition().duration(150)
                .attr('r', 0)
                .remove();
        }

        function showL1Children(l2Item, l3Index) {
            const l1Children = l2Item.children || [];
            if (l1Children.length === 0) return;

            const l1Selection = l1Layer.selectAll(`path.l1-polygon-${l2Item.cluster.id.replace(/[^a-zA-Z0-9]/g, '_')}`)
                .data(l1Children.filter(c => c.coords.length >= 3))
                .enter()
                .append('path')
                .attr('class', `l1-polygon l1-polygon-${l2Item.cluster.id.replace(/[^a-zA-Z0-9]/g, '_')}`)
                .attr('data-id', d => d.cluster.id)
                .attr('data-parent-l2', l2Item.cluster.id)
                .attr('data-grandparent-l3', l2Item.parentL3.id)
                .attr('d', d => polygonToPath(d.coords))
                .attr('fill', d => d.parentColor)
                .attr('fill-opacity', 0)
                .attr('stroke', d => d3.color(d.parentColor).darker(0.1))
                .attr('stroke-width', 0.5)
                .style('cursor', 'pointer');

            l1Selection.transition().duration(250).attr('fill-opacity', 0.4);

            // L1 hover handlers - reveal entities
            l1Selection
                .on('mouseover', function(event, d) {
                    if (state.lockedL1 && state.lockedL1 !== d.cluster.id) return;
                    d3.select(this).attr('fill-opacity', 0.15).attr('stroke-width', 1.5);
                    state.expandedL1 = d.cluster.id;
                    showEntities(d);
                    self.showOrganicTooltip(event, {
                        title: d.cluster.title || d.cluster.id,
                        content: `L1 Micro-Cluster | ${d.entities.length} entities`
                    });
                })
                .on('mouseout', function(event, d) {
                    if (state.lockedL1 === d.cluster.id) return;
                    d3.select(this).attr('fill-opacity', 0.4).attr('stroke-width', 0.5);
                    state.expandedL1 = null;
                    hideEntities(d.cluster.id);
                    self.hideOrganicTooltip();
                })
                .on('click', function(event, d) {
                    event.stopPropagation();
                    if (state.lockedL1 === d.cluster.id) {
                        state.lockedL1 = null;
                        d3.select(this).attr('stroke', d3.color(d.parentColor).darker(0.1));
                        hideEntities(d.cluster.id);
                    } else {
                        state.lockedL1 = d.cluster.id;
                        d3.select(this).attr('stroke', '#ffffff');
                        showEntities(d);
                    }
                });

            labelLayer.selectAll(`text.l1-label-${l2Item.cluster.id.replace(/[^a-zA-Z0-9]/g, '_')}`)
                .data(l1Children.filter(c => c.coords.length >= 3))
                .enter()
                .append('text')
                .attr('class', `l1-label l1-label-${l2Item.cluster.id.replace(/[^a-zA-Z0-9]/g, '_')}`)
                .attr('data-parent-l2', l2Item.cluster.id)
                .attr('data-grandparent-l3', l2Item.parentL3.id)
                .attr('x', d => scaleX(d3.mean(d.coords, p => p[0])))
                .attr('y', d => scaleY(d3.mean(d.coords, p => p[1])))
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('fill', '#cccccc')
                .attr('font-size', '8px')
                .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.7)')
                .style('pointer-events', 'none')
                .attr('fill-opacity', 0)
                .text(d => (d.cluster.title || d.cluster.id).substring(0, 15))
                .transition().duration(250)
                .attr('fill-opacity', 0.8);
        }

        function hideL1Children(l2Id) {
            if (state.lockedL2 === l2Id) return;

            l1Layer.selectAll(`path[data-parent-l2="${l2Id}"]`)
                .transition().duration(150)
                .attr('fill-opacity', 0)
                .remove();

            labelLayer.selectAll(`text[data-parent-l2="${l2Id}"]`)
                .transition().duration(150)
                .attr('fill-opacity', 0)
                .remove();

            entityLayer.selectAll(`circle[data-parent-l2="${l2Id}"]`)
                .transition().duration(100)
                .attr('r', 0)
                .remove();
        }

        function showEntities(l1Item) {
            const entities = l1Item.entities;
            if (!entities || entities.length === 0) return;

            const color = l1Item.parentColor;
            const safeL1Id = l1Item.cluster.id.replace(/[^a-zA-Z0-9]/g, '_');

            entityLayer.selectAll(`circle.entity-${safeL1Id}`)
                .data(entities)
                .enter()
                .append('circle')
                .attr('class', `entity entity-${safeL1Id}`)
                .attr('data-l1', l1Item.cluster.id)
                .attr('data-parent-l2', l1Item.parentL2.id)
                .attr('data-grandparent-l3', l1Item.parentL3.id)
                .attr('cx', d => scaleX(d.x))
                .attr('cy', d => scaleY(d.y))
                .attr('r', 0)
                .attr('fill', color)
                .attr('fill-opacity', 0.8)
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 0.5)
                .style('cursor', 'pointer')
                .on('mouseover', function(event, d) {
                    d3.select(this).attr('r', 8).attr('stroke-width', 2);
                    self.showOrganicTooltip(event, {
                        title: d.id,
                        content: `In: ${l1Item.cluster.title || l1Item.cluster.id}`
                    });
                })
                .on('mouseout', function() {
                    d3.select(this).attr('r', 4).attr('stroke-width', 0.5);
                    self.hideOrganicTooltip();
                })
                .on('click', function(event, d) {
                    event.stopPropagation();
                    const entity = self.entities.get(d.id);
                    if (entity) {
                        self.showInfoPanel(entity);
                    }
                })
                .transition().duration(200)
                .attr('r', 4);
        }

        function hideEntities(l1Id) {
            if (state.lockedL1 === l1Id) return;

            entityLayer.selectAll(`circle[data-l1="${l1Id}"]`)
                .transition().duration(100)
                .attr('r', 0)
                .remove();
        }

        // === L3 HOVER HANDLERS ===
        l3Polygons
            .on('mouseover', function(event, d) {
                if (state.lockedL3 && state.lockedL3 !== d.cluster.id) return;
                state.expandedL3 = d.cluster.id;
                showL2Children(d);
                const l2Count = d.children ? d.children.length : 0;
                self.showOrganicTooltip(event, {
                    title: d.cluster.title || d.cluster.id,
                    content: `L3 Super-Cluster | ${d.cluster.entity_count || 0} entities | ${l2Count} L2 clusters`
                });
            })
            .on('mouseout', function(event, d) {
                if (state.lockedL3 === d.cluster.id) return;
                state.expandedL3 = null;
                state.expandedL2 = null;
                state.expandedL1 = null;
                hideL2Children(d);
                self.hideOrganicTooltip();
            })
            .on('click', function(event, d) {
                if (state.lockedL3 === d.cluster.id) {
                    state.lockedL3 = null;
                    state.lockedL2 = null;
                    state.lockedL1 = null;
                    d3.select(this).attr('stroke', d3.color(d.color).darker(0.5));
                    hideL2Children(d);
                } else {
                    if (state.lockedL3) {
                        const prevL3 = l3Data.find(x => x.cluster.id === state.lockedL3);
                        if (prevL3) {
                            l3Layer.select(`path[data-id="${prevL3.cluster.id}"]`)
                                .attr('stroke', d3.color(prevL3.color).darker(0.5));
                            hideL2Children(prevL3);
                        }
                    }
                    state.lockedL3 = d.cluster.id;
                    state.lockedL2 = null;
                    state.lockedL1 = null;
                    d3.select(this).attr('stroke', '#ffffff');
                    showL2Children(d);
                }
            });

        // === ZOOM/PAN ===
        const zoom = d3.zoom()
            .scaleExtent([0.5, 30])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });
        svg.call(zoom);

        // Click on background to reset
        svg.on('click', function(event) {
            if (event.target === this) {
                if (state.lockedL3) {
                    const prevL3 = l3Data.find(x => x.cluster.id === state.lockedL3);
                    if (prevL3) {
                        state.lockedL3 = null;
                        state.lockedL2 = null;
                        state.lockedL1 = null;
                        l3Layer.select(`path[data-id="${prevL3.cluster.id}"]`)
                            .attr('stroke', d3.color(prevL3.color).darker(0.5));
                        hideL2Children(prevL3);
                    }
                }
            }
        });

        console.log(`4-Level Hierarchical Progressive Disclosure ready: ${l3Data.length} L3 -> L2 -> L1 -> Entities`);
    }


    /**
     * Show cluster info in the info panel
     */
    showClusterInfo(cluster, level) {
        const infoPanel = document.getElementById('voronoi-cluster-info');
        const entityInfo = document.getElementById('entity-info');

        if (infoPanel && entityInfo) {
            entityInfo.style.display = 'none';
            infoPanel.style.display = 'block';

            const title = cluster.title || cluster.name || cluster.id;
            const memberCount = cluster.member_count || 0;
            const totalEntities = cluster.total_entities || 0;

            infoPanel.innerHTML = `
                <div style="margin-bottom: 12px;">
                    <div style="font-size: 16px; font-weight: 600; color: #00ffff; margin-bottom: 8px;">
                        ${title}
                    </div>
                    <div style="font-size: 12px; color: #808080; text-transform: uppercase;">
                        Level ${level} Cluster
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div style="background: rgba(100, 200, 255, 0.1); padding: 8px; border-radius: 6px;">
                        <div style="font-size: 11px; color: #808080;">Sub-clusters</div>
                        <div style="font-size: 16px; font-weight: 600; color: #00ffff;">${memberCount}</div>
                    </div>
                    <div style="background: rgba(100, 200, 255, 0.1); padding: 8px; border-radius: 6px;">
                        <div style="font-size: 11px; color: #808080;">Entities</div>
                        <div style="font-size: 16px; font-weight: 600; color: #00ffff;">${totalEntities}</div>
                    </div>
                </div>
            `;
        }
    }
}

// Export for use
window.GraphRAG3DEmbeddingView = GraphRAG3DEmbeddingView;

// Register beforeunload handler to dispose resources on page refresh/close
window.addEventListener('beforeunload', () => {
    if (window.viewer && typeof window.viewer.dispose === 'function') {
        window.viewer.dispose();
    }
});

// Also handle visibilitychange for mobile browsers that don't fire beforeunload
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && window.viewer && typeof window.viewer.dispose === 'function') {
        // Don't fully dispose, but release some resources
        // Full dispose would break the page when returning
    }
});
