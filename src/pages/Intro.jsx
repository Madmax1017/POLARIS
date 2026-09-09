import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * POLARIS — Polar Operations Command intro
 * -----------------------------------------------------------------------
 * Standalone cinematic entry screen. Does not touch any existing
 * dashboard/routing — it only calls `onEnter` when the user activates
 * the main CTA. Wire that prop to your router, e.g.:
 *
 *   <PolarisIntro onEnter={() => navigate("/dashboard")} />          // react-router
 *   <PolarisIntro onEnter={() => router.push("/dashboard")} />       // next.js
 *
 * The globe is built entirely from primitives (SphereGeometry + two
 * generated canvas textures for landmass / arctic glow). No .glb or
 * external image is required. Swap `buildEarthTexture()` /
 * `buildArcticMaskTexture()` for `new THREE.TextureLoader().load(url)`
 * calls if you later want real imagery — the material wiring below
 * doesn't need to change.
 *
 * Three.js is used directly (no @react-three/fiber / drei dependency),
 * so this drops into any React app that already has `three` installed.
 * -----------------------------------------------------------------------
 */

const BOOT_SEQUENCE = [
    { label: "SATELLITE LINK", status: "ONLINE" },
    { label: "EXPEDITION NETWORK", status: "ONLINE" },
    { label: "WEATHER INTELLIGENCE", status: "ONLINE" },
    { label: "RESOURCE MONITORING", status: "ONLINE" },
    { label: "EMERGENCY SYSTEM", status: "ARMED" },
];

// lat/lon in degrees -> real station coordinates where they exist, so the
// network reads as an actual polar footprint rather than decoration.
const MARKERS = [
    { id: "arctic-01", label: "ARCTIC NODE 01", lat: 84.0, lon: 11.0 },
    { id: "maitri", label: "MAITRI", lat: -70.76, lon: 11.73 },
    { id: "bharati", label: "BHARATI", lat: -69.4, lon: 76.19 },
    { id: "expedition-07", label: "EXPEDITION 07", lat: -75.0, lon: -60.0 },
    { id: "ncpor", label: "NCPOR · HQ", lat: 15.45, lon: 73.8 },
];

function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

function buildEarthTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    const ocean = ctx.createLinearGradient(0, 0, 0, 512);
    ocean.addColorStop(0, "#071827");
    ocean.addColorStop(0.45, "#050f1a");
    ocean.addColorStop(1, "#02060a");
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, 1024, 512);

    // rough, non-literal landmasses — enough to read as "earth" without
    // claiming geographic accuracy
    ctx.fillStyle = "#0d2436";
    const blob = (cx, cy, r, pts, squash = 0.6) => {
        ctx.beginPath();
        for (let i = 0; i < pts; i++) {
            const a = (i / pts) * Math.PI * 2;
            const rr = r * (0.65 + Math.sin(i * 12.9) * 0.15 + Math.random() * 0.25);
            const x = cx + Math.cos(a) * rr;
            const y = cy + Math.sin(a) * rr * squash;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    };
    blob(175, 150, 95, 16);
    blob(300, 320, 65, 14);
    blob(520, 130, 85, 16);
    blob(660, 250, 115, 18);
    blob(560, 330, 55, 12);
    blob(830, 400, 65, 14);
    blob(430, 60, 60, 12, 0.4);

    // faint lat/long scaffold so the sphere reads as instrumented, not flat
    ctx.strokeStyle = "rgba(103,232,249,0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
    }
    for (let y = 0; y < 512; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
    }

    // ice caps
    const north = ctx.createLinearGradient(0, 0, 0, 46);
    north.addColorStop(0, "rgba(207,250,254,0.55)");
    north.addColorStop(1, "rgba(207,250,254,0)");
    ctx.fillStyle = north;
    ctx.fillRect(0, 0, 1024, 46);

    const south = ctx.createLinearGradient(0, 466, 0, 512);
    south.addColorStop(0, "rgba(207,250,254,0)");
    south.addColorStop(1, "rgba(207,250,254,0.4)");
    ctx.fillStyle = south;
    ctx.fillRect(0, 466, 1024, 46);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
}

function buildArcticMaskTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 1024, 512);

    const glow = ctx.createRadialGradient(512, 0, 0, 512, 0, 200);
    glow.addColorStop(0, "rgba(103,232,249,0.95)");
    glow.addColorStop(0.5, "rgba(56,189,248,0.35)");
    glow.addColorStop(1, "rgba(56,189,248,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1024, 200);

    return new THREE.CanvasTexture(canvas);
}

const ATMOSPHERE_VERT = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;
const ATMOSPHERE_FRAG = `
  uniform vec3 glowColor;
  uniform float intensity;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.6);
    gl_FragColor = vec4(glowColor, fresnel * intensity);
  }
`;

function GlobeCanvas({ onWebglUnavailable }) {
    const mountRef = useRef(null);
    const labelRefs = useRef({});
    const frameRef = useRef(0);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        } catch (e) {
            onWebglUnavailable?.();
            return;
        }
        if (!renderer) {
            onWebglUnavailable?.();
            return;
        }

        const width = mount.clientWidth;
        const height = mount.clientHeight;

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
        camera.position.set(0, 0, 6.4);

        // ---- lighting -------------------------------------------------
        const ambient = new THREE.AmbientLight(0x1a2c3a, 1.1);
        scene.add(ambient);
        const sun = new THREE.DirectionalLight(0xbfe8ff, 1.4);
        sun.position.set(-4, 2, 3);
        scene.add(sun);
        const rim = new THREE.PointLight(0x38bdf8, 0.6, 20);
        rim.position.set(3, 3, -2);
        scene.add(rim);

        // ---- earth ------------------------------------------------------
        const earthGroup = new THREE.Group();
        const earthTexture = buildEarthTexture();
        const arcticMask = buildArcticMaskTexture();
        const earthGeo = new THREE.SphereGeometry(1.65, 64, 64);
        const earthMat = new THREE.MeshPhongMaterial({
            map: earthTexture,
            emissiveMap: arcticMask,
            emissive: new THREE.Color("#67e8f9"),
            emissiveIntensity: 0.55,
            shininess: 10,
            specular: new THREE.Color("#0b2233"),
        });
        const earthMesh = new THREE.Mesh(earthGeo, earthMat);
        earthGroup.add(earthMesh);

        // thin arctic ring accent
        const ringGeo = new THREE.TorusGeometry(0.62, 0.004, 8, 96);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x67e8f9,
            transparent: true,
            opacity: 0.5,
        });
        const arcticRing = new THREE.Mesh(ringGeo, ringMat);
        arcticRing.position.y = 1.5;
        arcticRing.rotation.x = Math.PI / 2;
        earthGroup.add(arcticRing);

        // marker points, attached to earthGroup so they rotate with the sphere
        const markerObjects = MARKERS.map((m) => {
            const pos = latLonToVector3(m.lat, m.lon, 1.68);
            const dotGeo = new THREE.SphereGeometry(0.018, 12, 12);
            const dotMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
            const dot = new THREE.Mesh(dotGeo, dotMat);
            dot.position.copy(pos);
            earthGroup.add(dot);
            return { ...m, mesh: dot, normal: pos.clone().normalize() };
        });

        scene.add(earthGroup);

        // ---- atmosphere ---------------------------------------------------
        const atmoGeo = new THREE.SphereGeometry(1.78, 64, 64);
        const atmoMat = new THREE.ShaderMaterial({
            vertexShader: ATMOSPHERE_VERT,
            fragmentShader: ATMOSPHERE_FRAG,
            uniforms: {
                glowColor: { value: new THREE.Color("#38bdf8") },
                intensity: { value: 1.1 },
            },
            side: THREE.BackSide,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
        scene.add(atmosphere);

        // ---- orbital paths --------------------------------------------------
        const orbitsGroup = new THREE.Group();
        const orbitDefs = [
            { r: 2.05, tiltX: 0.9, tiltZ: 0.15, speed: 0.03, opacity: 0.28 },
            { r: 2.25, tiltX: -0.5, tiltZ: 0.8, speed: -0.018, opacity: 0.18 },
            { r: 2.45, tiltX: 1.4, tiltZ: -0.3, speed: 0.012, opacity: 0.12 },
        ];
        const orbitMeshes = orbitDefs.map((def) => {
            const curvePts = [];
            const segments = 128;
            for (let i = 0; i <= segments; i++) {
                const t = (i / segments) * Math.PI * 2;
                curvePts.push(new THREE.Vector3(Math.cos(t) * def.r, 0, Math.sin(t) * def.r));
            }
            const geo = new THREE.BufferGeometry().setFromPoints(curvePts);
            const mat = new THREE.LineBasicMaterial({
                color: 0x38bdf8,
                transparent: true,
                opacity: def.opacity,
            });
            const line = new THREE.LineLoop(geo, mat);
            line.rotation.x = def.tiltX;
            line.rotation.z = def.tiltZ;
            orbitsGroup.add(line);
            return { line, speed: def.speed };
        });
        scene.add(orbitsGroup);

        // ---- particle field ---------------------------------------------
        const particleCount = 260;
        const particlePositions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const r = 3.2 + Math.random() * 2.4;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            particlePositions[i * 3 + 2] = r * Math.cos(phi);
        }
        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
        const particleMat = new THREE.PointsMaterial({
            color: 0x9fd8ec,
            size: 0.012,
            transparent: true,
            opacity: 0.5,
            sizeAttenuation: true,
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // ---- interaction: manual drag rotation + momentum ------------------
        let isDragging = false;
        let prev = { x: 0, y: 0 };
        let velocity = { x: 0, y: 0 };
        let lastInteraction = performance.now();
        const targetRotation = { x: 0.15, y: 0 };

        const onPointerDown = (e) => {
            isDragging = true;
            prev = { x: e.clientX, y: e.clientY };
            lastInteraction = performance.now();
        };
        const onPointerMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - prev.x;
            const dy = e.clientY - prev.y;
            prev = { x: e.clientX, y: e.clientY };
            velocity = { x: dx * 0.0028, y: dy * 0.002 };
            targetRotation.y += velocity.x;
            targetRotation.x = Math.max(-0.6, Math.min(0.6, targetRotation.x + velocity.y));
            lastInteraction = performance.now();
        };
        const onPointerUp = () => {
            isDragging = false;
        };
        renderer.domElement.style.touchAction = "none";
        renderer.domElement.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);

        // subtle whole-scene parallax on plain mouse movement (no drag needed)
        const mouseParallax = { x: 0, y: 0 };
        const onMouseMove = (e) => {
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = (e.clientY / window.innerHeight) * 2 - 1;
            mouseParallax.x = nx * 0.35;
            mouseParallax.y = ny * 0.2;
        };
        window.addEventListener("mousemove", onMouseMove);

        // wheel zoom, clamped
        const onWheel = (e) => {
            e.preventDefault();
            camera.position.z = Math.max(4.6, Math.min(8.5, camera.position.z + e.deltaY * 0.0025));
        };
        mount.addEventListener("wheel", onWheel, { passive: false });

        // ---- resize ---------------------------------------------------------
        const onResize = () => {
            const w = mount.clientWidth;
            const h = mount.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", onResize);

        // ---- animation loop ---------------------------------------------------
        const clock = new THREE.Clock();
        const tmpWorld = new THREE.Vector3();
        const tmpNormal = new THREE.Vector3();
        const camDir = new THREE.Vector3();

        const animate = () => {
            const dt = clock.getDelta();
            const idleFor = performance.now() - lastInteraction;

            if (!isDragging) {
                velocity.x *= 0.94;
                velocity.y *= 0.94;
                targetRotation.y += velocity.x;
                targetRotation.x += velocity.y * 0.2;
                if (idleFor > 900 && Math.abs(velocity.x) < 0.0004) {
                    targetRotation.y += dt * 0.045;
                }
            }

            earthGroup.rotation.y += (targetRotation.y - earthGroup.rotation.y) * 0.08;
            earthGroup.rotation.x += (targetRotation.x - earthGroup.rotation.x) * 0.08;

            arcticRing.material.opacity = 0.35 + Math.sin(clock.elapsedTime * 1.6) * 0.15;
            atmosphere.rotation.y += dt * 0.01;

            orbitMeshes.forEach(({ line, speed }) => {
                line.rotation.y += speed * dt * 6;
            });
            particles.rotation.y += dt * 0.008;

            camera.position.x += (mouseParallax.x - camera.position.x) * 0.03;
            camera.position.y += (-mouseParallax.y - camera.position.y) * 0.03;
            camera.lookAt(0, 0, 0);

            // project markers to screen space
            markerObjects.forEach((m) => {
                tmpWorld.copy(m.mesh.position);
                earthGroup.localToWorld(tmpWorld);
                tmpNormal.copy(m.normal).applyQuaternion(earthGroup.quaternion);
                camDir.copy(camera.position).sub(tmpWorld).normalize();
                const facing = tmpNormal.dot(camDir);

                const projected = tmpWorld.clone().project(camera);
                const el = labelRefs.current[m.id];
                if (el) {
                    const x = (projected.x * 0.5 + 0.5) * mount.clientWidth;
                    const y = (-projected.y * 0.5 + 0.5) * mount.clientHeight;
                    const visible = facing > 0.28 && projected.z < 1;
                    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                    el.style.opacity = visible ? Math.min(1, (facing - 0.28) * 3.2) : 0;
                }
            });

            renderer.render(scene, camera);
            frameRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(frameRef.current);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("resize", onResize);
            mount.removeEventListener("wheel", onWheel);
            renderer.domElement.removeEventListener("pointerdown", onPointerDown);

            earthGeo.dispose();
            earthMat.dispose();
            earthTexture.dispose();
            arcticMask.dispose();
            ringGeo.dispose();
            ringMat.dispose();
            atmoGeo.dispose();
            atmoMat.dispose();
            particleGeo.dispose();
            particleMat.dispose();
            orbitMeshes.forEach(({ line }) => {
                line.geometry.dispose();
                line.material.dispose();
            });
            markerObjects.forEach((m) => {
                m.mesh.geometry.dispose();
                m.mesh.material.dispose();
            });
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, [onWebglUnavailable]);

    return (
        <div className="polaris-globe-mount" ref={mountRef}>
            {MARKERS.map((m) => (
                <div
                    key={m.id}
                    className="polaris-marker-label"
                    ref={(el) => (labelRefs.current[m.id] = el)}
                >
                    <span className="polaris-marker-dot" />
                    {m.label}
                </div>
            ))}
        </div>
    );
}

function GlobeFallback() {
    return (
        <div className="polaris-globe-mount polaris-globe-fallback">
            <div className="polaris-fallback-orb" />
            <p className="polaris-fallback-text">
                3D VISUALIZATION UNAVAILABLE — WEBGL NOT DETECTED
            </p>
        </div>
    );
}

export default function PolarisIntro({ onEnter }) {
    const navigate = useNavigate();
    const [phase, setPhase] = useState(0);
    const [bootIndex, setBootIndex] = useState(-1);
    const [webglOk, setWebglOk] = useState(true);
    const [exiting, setExiting] = useState(false);
    const detailRef = useRef(null);

    useEffect(() => {
        const steps = [
            () => setPhase(1), // background + logo
            () => setPhase(2), // globe fades in
            () => setPhase(3), // headline reveals
            () => setPhase(4), // CTA active
        ];
        const timers = steps.map((fn, i) => setTimeout(fn, 220 + i * 380));
        return () => timers.forEach(clearTimeout);
    }, []);

    useEffect(() => {
        if (phase < 3) return;
        let i = 0;
        const timers = [];
        const step = () => {
            setBootIndex(i);
            i += 1;
            if (i < BOOT_SEQUENCE.length) {
                timers.push(setTimeout(step, 260));
            }
        };
        timers.push(setTimeout(step, 200));
        return () => timers.forEach(clearTimeout);
    }, [phase]);

    const handleEnter = useCallback(() => {
        setExiting(true);
        setTimeout(() => {
            if (onEnter) {
                onEnter();
            } else {
                navigate("/dashboard");
            }
        }, 620);
    }, [onEnter, navigate]);

    const handleExplore = useCallback(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    return (
        <div className={`polaris-root ${exiting ? "is-exiting" : ""}`}>
            <style>{POLARIS_CSS}</style>

            <section className="polaris-hero">
                <div className="polaris-bg" data-phase={phase >= 1 ? "on" : "off"}>
                    <div className="polaris-bg-grid" />
                    <div className="polaris-bg-vignette" />
                    <div className="polaris-bg-stars" />
                </div>

                <nav className="polaris-nav" data-phase={phase >= 1 ? "on" : "off"}>
                    <div className="polaris-nav-brand">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="polaris-mark">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                            <path d="M12 2 L12 22 M2 12 L22 12" stroke="currentColor" strokeWidth="1" opacity="0.35" />
                            <path d="M12 5 L14 12 L12 19 L10 12 Z" fill="currentColor" opacity="0.9" />
                        </svg>
                        <div>
                            <div className="polaris-nav-title">POLARIS</div>
                            <div className="polaris-nav-subtitle">NCPOR · POLAR OPERATIONS</div>
                        </div>
                    </div>
                    <div className="polaris-nav-status">
                        <div className="polaris-status-row">
                            <span className="polaris-status-dot" />
                            SAT-LINK ONLINE
                        </div>
                        <div className="polaris-status-caption">SYSTEM STATUS</div>
                    </div>
                </nav>

                <div className="polaris-hero-grid">
                    <div className="polaris-hero-copy" data-phase={phase >= 2 ? "on" : "off"}>
                        <div className="polaris-eyebrow polaris-reveal polaris-delay-1">Polar Operations Command</div>

                        <h1 className="polaris-headline polaris-reveal polaris-delay-2">
                            <span className="polaris-headline-line">COMMAND THE</span>
                            <span className="polaris-headline-line polaris-headline-accent">EXTREME.</span>
                        </h1>

                        <p className="polaris-lede polaris-reveal polaris-delay-3">
                            One operational picture.
                            <br />
                            Every mission. Every person. Every decision.
                        </p>

                        <p className="polaris-desc polaris-reveal polaris-delay-4">
                            POLARIS unifies expedition planning, personnel, assets, logistics,
                            intelligence and emergency response into one resilient command
                            system built for the world's most extreme environments.
                        </p>

                        <div className="polaris-cta-row polaris-reveal polaris-delay-5">
                            <button className="polaris-cta" onClick={handleEnter}>
                                <span>ENTER COMMAND CENTER</span>
                                <ArrowRight size={16} className="polaris-cta-arrow" />
                            </button>
                            <button className="polaris-cta-secondary" onClick={handleExplore}>
                                <span>EXPLORE SYSTEM</span>
                                <ChevronDown size={14} />
                            </button>
                        </div>

                        <div className="polaris-boot polaris-reveal polaris-delay-6">
                            <div className="polaris-boot-title">
                                <span>POLARIS CORE</span>
                                <span className="polaris-boot-sub">INITIALIZING…</span>
                            </div>
                            <ul className="polaris-boot-list">
                                {BOOT_SEQUENCE.map((item, i) => {
                                    const active = bootIndex >= i;
                                    return (
                                        <li key={item.label} className={active ? "is-active" : ""}>
                                            <span className="polaris-boot-label">{item.label}</span>
                                            <span
                                                className={`polaris-boot-status ${active ? (item.status === "ARMED" ? "is-armed" : "is-online") : ""
                                                    }`}
                                            >
                                                {active ? item.status : "· · ·"}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    <div className="polaris-hero-globe" data-phase={phase >= 2 ? "on" : "off"}>
                        {webglOk ? (
                            <GlobeCanvas onWebglUnavailable={() => setWebglOk(false)} />
                        ) : (
                            <GlobeFallback />
                        )}

                        <div className="polaris-hud polaris-hud-tl">
                            <div className="polaris-hud-title">N 82° 14' 52"</div>
                            <div className="polaris-hud-sub">ARCTIC OPERATIONS ZONE</div>
                        </div>
                        <div className="polaris-hud polaris-hud-bl">
                            <div className="polaris-hud-row">
                                <span>SAT-LINK</span>
                                <span className="polaris-hud-value polaris-hud-online">
                                    <span className="polaris-status-dot small" /> CONNECTED
                                </span>
                            </div>
                            <div className="polaris-hud-row">
                                <span>EXPEDITIONS</span>
                                <span className="polaris-hud-value">07 ACTIVE</span>
                            </div>
                            <div className="polaris-hud-row">
                                <span>POLAR NODE</span>
                                <span className="polaris-hud-value">MAITRI</span>
                            </div>
                        </div>
                        <div className="polaris-hud polaris-hud-br">
                            <div className="polaris-hud-title">RESOURCE FORECAST</div>
                            <div className="polaris-hud-big">72%</div>
                        </div>
                    </div>
                </div>

                <div className="polaris-transition-line" />
            </section>

            <section className="polaris-detail" ref={detailRef}>
                <div className="polaris-detail-grid">
                    <div className="polaris-detail-card">
                        <div className="polaris-detail-index">01</div>
                        <h3>Expedition Network</h3>
                        <p>
                            Live positions, headcounts and mission status across every active
                            deployment, from Arctic transects to Antarctic stations.
                        </p>
                    </div>
                    <div className="polaris-detail-card">
                        <div className="polaris-detail-index">02</div>
                        <h3>Weather Intelligence</h3>
                        <p>
                            Continuous polar forecasting fused with satellite and ground
                            telemetry to flag windows and risk before they close.
                        </p>
                    </div>
                    <div className="polaris-detail-card">
                        <div className="polaris-detail-index">03</div>
                        <h3>Emergency Response</h3>
                        <p>
                            A single armed protocol layer connecting personnel, assets and
                            command — ready the moment conditions turn.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

const POLARIS_CSS = `
:root {
  --p-bg-0: #03070B;
  --p-bg-1: #05090D;
  --p-bg-2: #071018;
  --p-primary: #38BDF8;
  --p-arctic: #67E8F9;
  --p-ice: #CFFAFE;
  --p-text: #E6F4FA;
  --p-muted: #718B9A;
  --p-success: #22C55E;
  --p-warning: #F59E0B;
  --p-critical: #F43F5E;
  --p-mono: "SF Mono", "JetBrains Mono", "Consolas", ui-monospace, monospace;
  --p-sans: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.polaris-root {
  background: var(--p-bg-0);
  color: var(--p-text);
  font-family: var(--p-sans);
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  transition: opacity 0.6s ease;
}
.polaris-root.is-exiting { opacity: 0.15; }
.polaris-root * { box-sizing: border-box; }

.polaris-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 640px;
  overflow: hidden;
}

.polaris-bg { position: absolute; inset: 0; opacity: 0; transition: opacity 1.2s ease; }
.polaris-bg[data-phase="on"] { opacity: 1; }
.polaris-bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(103,232,249,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(103,232,249,0.035) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse at 65% 45%, black 10%, transparent 70%);
}
.polaris-bg-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 68% 45%, rgba(56,189,248,0.08), transparent 55%),
    radial-gradient(ellipse at 50% 100%, var(--p-bg-2), var(--p-bg-0) 60%);
}
.polaris-bg-stars {
  position: absolute; inset: 0;
  background-image: radial-gradient(1px 1px at 20% 30%, rgba(230,244,250,0.5), transparent),
    radial-gradient(1px 1px at 70% 15%, rgba(230,244,250,0.35), transparent),
    radial-gradient(1px 1px at 40% 70%, rgba(230,244,250,0.4), transparent),
    radial-gradient(1px 1px at 85% 60%, rgba(230,244,250,0.3), transparent),
    radial-gradient(1px 1px at 10% 85%, rgba(230,244,250,0.3), transparent);
  background-repeat: no-repeat;
}

.polaris-nav {
  position: absolute; top: 0; left: 0; right: 0; z-index: 20;
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 28px 40px;
  opacity: 0; transform: translateY(-8px);
  transition: opacity 0.9s ease, transform 0.9s ease;
}
.polaris-nav[data-phase="on"] { opacity: 1; transform: translateY(0); }
.polaris-nav-brand { display: flex; align-items: center; gap: 14px; }
.polaris-mark { color: var(--p-arctic); flex-shrink: 0; }
.polaris-nav-title { font-size: 14px; letter-spacing: 0.16em; font-weight: 600; }
.polaris-nav-subtitle { font-size: 10px; letter-spacing: 0.12em; color: var(--p-muted); margin-top: 9px; font-family: var(--p-mono); }
.polaris-nav-status { text-align: right; }
.polaris-status-row {
  display: flex; align-items: center; gap: 8px; justify-content: flex-end;
  font-family: var(--p-mono); font-size: 11px; letter-spacing: 0.08em; color: var(--p-ice);
}
.polaris-status-caption { font-size: 9px; letter-spacing: 0.14em; color: var(--p-muted); margin-top: 4px; }
.polaris-status-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--p-success);
  box-shadow: 0 0 8px var(--p-success);
  animation: polaris-pulse 2.4s ease-in-out infinite;
}
.polaris-status-dot.small { width: 5px; height: 5px; }

.polaris-hero-grid {
  position: relative; z-index: 10; height: 100%;
  display: grid; grid-template-columns: minmax(380px, 45%) 1fr;
  align-items: center;
  padding: 0 40px;
}

.polaris-hero-copy { max-width: 600px; }

/* individual reveal — each child fades/lifts on its own delay so the
   hierarchy reads as an intentional sequence rather than one block */
.polaris-reveal {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.polaris-hero-copy[data-phase="on"] .polaris-reveal { opacity: 1; transform: translateY(0); }
.polaris-delay-1 { transition-delay: 0.05s; }
.polaris-delay-2 { transition-delay: 0.16s; }
.polaris-delay-3 { transition-delay: 0.30s; }
.polaris-delay-4 { transition-delay: 0.42s; }
.polaris-delay-5 { transition-delay: 0.56s; }
.polaris-delay-6 { transition-delay: 0.74s; }

.polaris-eyebrow {
  font-family: var(--p-mono); font-size: 12px; letter-spacing: 0.22em; color: var(--p-primary);
  margin: 0 0 18px 0;
}
.polaris-headline {
  font-size: clamp(44px, 4.6vw, 88px);
  line-height: 0.94; font-weight: 700; letter-spacing: -0.015em;
  margin: 0 0 26px 0;
  display: flex; flex-direction: column;
}
.polaris-headline-line { color: #E7E9E7; }
.polaris-headline-accent { color: #C9D9DE; }
.polaris-lede { font-size: 21px; line-height: 1.45; color: rgba(207,250,254,0.82); margin: 0 0 18px 0; font-weight: 400; }
.polaris-desc { font-size: 15px; line-height: 1.6; color: var(--p-muted); max-width: 500px; margin: 0 0 38px 0; }

.polaris-cta-row { display: flex; align-items: center; gap: 14px; margin-bottom: 52px; }

.polaris-cta {
  display: inline-flex; align-items: center; gap: 10px;
  background: var(--p-ice);
  border: 1px solid var(--p-ice);
  color: #04121A;
  font-family: var(--p-mono); font-size: 12px; letter-spacing: 0.1em; font-weight: 600;
  height: 54px; padding: 0 22px; cursor: pointer;
  transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
}
.polaris-cta:hover {
  background: #FFFFFF;
  box-shadow: 0 0 28px rgba(207,250,254,0.35);
  transform: translateY(-1px);
}
.polaris-cta-arrow { transition: transform 0.25s ease; }
.polaris-cta:hover .polaris-cta-arrow { transform: translateX(4px); }

.polaris-cta-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(113,139,154,0.35);
  color: var(--p-muted);
  font-family: var(--p-mono); font-size: 12px; letter-spacing: 0.1em;
  height: 54px; padding: 0 20px; cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}
.polaris-cta-secondary:hover {
  color: var(--p-ice);
  border-color: rgba(103,232,249,0.4);
  background: rgba(255,255,255,0.04);
}

.polaris-boot { font-family: var(--p-mono); max-width: 450px; padding-top: 22px; border-top: 1px solid rgba(113,139,154,0.14); }
.polaris-boot-title { font-size: 10px; letter-spacing: 0.12em; color: var(--p-muted); display: flex; gap: 10px; align-items: baseline; margin-bottom: 12px; }
.polaris-boot-sub { color: rgba(113,139,154,0.6); font-size: 10px; }
.polaris-boot-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.polaris-boot-list li {
  display: flex; justify-content: space-between; font-size: 10.5px; letter-spacing: 0.06em;
  color: rgba(113,139,154,0.5); border-bottom: 1px solid rgba(113,139,154,0.08); padding-bottom: 5px;
  transition: color 0.3s ease;
}
.polaris-boot-list li.is-active { color: var(--p-muted); }
.polaris-boot-status.is-online { color: var(--p-success); }
.polaris-boot-status.is-armed { color: var(--p-warning); }

.polaris-hero-globe { position: relative; height: 100%; opacity: 0; transform: scale(0.92); transition: opacity 1.3s ease, transform 1.3s ease; }
.polaris-hero-globe[data-phase="on"] { opacity: 1; transform: scale(1); }

.polaris-globe-mount { position: absolute; inset: 0; }
.polaris-globe-mount canvas { display: block; width: 100%; height: 100%; cursor: grab; }
.polaris-globe-mount canvas:active { cursor: grabbing; }

.polaris-globe-fallback { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
.polaris-fallback-orb {
  width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, rgba(56,189,248,0.35), rgba(5,9,13,0.9) 70%);
  box-shadow: 0 0 60px rgba(56,189,248,0.2);
  animation: polaris-pulse 3s ease-in-out infinite;
}
.polaris-fallback-text { font-family: var(--p-mono); font-size: 10px; letter-spacing: 0.1em; color: var(--p-muted); }

.polaris-marker-label {
  position: absolute; top: 0; left: 0;
  display: flex; align-items: center; gap: 6px;
  font-family: var(--p-mono); font-size: 9.5px; letter-spacing: 0.08em; color: var(--p-ice);
  white-space: nowrap; pointer-events: none;
  transition: opacity 0.3s ease;
  opacity: 0;
  text-shadow: 0 0 8px rgba(3,7,11,0.9);
}
.polaris-marker-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--p-arctic); box-shadow: 0 0 6px var(--p-arctic); }

.polaris-hud {
  position: absolute; padding: 12px 14px;
  background: rgba(5,9,13,0.45); border: 1px solid rgba(103,232,249,0.14);
  backdrop-filter: blur(6px); font-family: var(--p-mono);
  opacity: 0; animation: polaris-fade-in 1s ease forwards;
  animation-delay: 1.4s;
}
.polaris-hud-tl { top: 6%; left: 4%; animation-delay: 1.2s; }
.polaris-hud-bl { bottom: 8%; left: 4%; display: flex; flex-direction: column; gap: 8px; animation-delay: 1.5s; }
.polaris-hud-br { top: 10%; right: 5%; animation-delay: 1.7s; }
.polaris-hud-title { font-size: 10px; letter-spacing: 0.1em; color: var(--p-ice); }
.polaris-hud-sub { font-size: 9px; letter-spacing: 0.1em; color: var(--p-muted); margin-top: 3px; }
.polaris-hud-row { display: flex; justify-content: space-between; gap: 18px; font-size: 9.5px; letter-spacing: 0.06em; color: var(--p-muted); }
.polaris-hud-value { color: var(--p-ice); display: flex; align-items: center; gap: 5px; }
.polaris-hud-online { color: var(--p-success); }
.polaris-hud-big { font-size: 26px; color: var(--p-primary); margin-top: 4px; }

.polaris-transition-line {
  position: absolute; top: 50%; left: 0; height: 1px; width: 0;
  background: var(--p-arctic); box-shadow: 0 0 12px var(--p-arctic);
  z-index: 30; transition: width 0.55s cubic-bezier(0.4,0,0.2,1);
}
.is-exiting .polaris-transition-line { width: 100%; }

.polaris-detail {
  background: var(--p-bg-2);
  padding: 100px 40px;
  border-top: 1px solid rgba(103,232,249,0.08);
}
.polaris-detail-grid {
  max-width: 1080px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;
}
.polaris-detail-card { border-top: 1px solid rgba(103,232,249,0.2); padding-top: 20px; }
.polaris-detail-index { font-family: var(--p-mono); font-size: 11px; color: var(--p-primary); margin-bottom: 14px; }
.polaris-detail-card h3 { font-size: 18px; margin: 0 0 10px 0; font-weight: 600; }
.polaris-detail-card p { font-size: 13.5px; line-height: 1.7; color: var(--p-muted); margin: 0; }

@keyframes polaris-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes polaris-fade-in { to { opacity: 1; } }

@media (max-width: 980px) {
  .polaris-hero-grid { grid-template-columns: 1fr; }
  .polaris-hero-globe { position: absolute; inset: 0; opacity: 0.35; }
  .polaris-hud-br, .polaris-hud-tl { display: none; }
  .polaris-hero-copy { padding-top: 90px; max-width: 100%; }
  .polaris-headline { font-size: clamp(40px, 11vw, 64px); }
  .polaris-lede { font-size: 18px; }
  .polaris-detail-grid { grid-template-columns: 1fr; gap: 48px; }
}

@media (prefers-reduced-motion: reduce) {
  .polaris-status-dot, .polaris-fallback-orb { animation: none; }
  .polaris-root, .polaris-nav, .polaris-reveal, .polaris-hero-globe, .polaris-hud {
    transition: none; animation: none; opacity: 1; transform: none;
  }
}
`;