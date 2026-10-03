import { ensureThreeLibLoaded } from "./threeRenderer.js";

// Welcome modal hero atom renderer (loaded on demand)
export async function initHeroAtom() {
  if (window._heroAtomRunning) return;

  const heroContainer = document.getElementById("hero-atom-container");
  if (!heroContainer) return;

  window._heroAtomRunning = true;

  try {
    await ensureThreeLibLoaded();
  } catch (e) {
    window._heroAtomRunning = false;
    throw e;
  }

  if (typeof window.THREE === "undefined") {
    window._heroAtomRunning = false;
    return;
  }

  const THREE = window.THREE;

  let heroScene;
  let heroCamera;
  let heroRenderer;
  let heroAtomGroup;
  let heroAnimationId;
  let heroElectrons = [];

  function initHero3D() {
    try {
      heroScene = new THREE.Scene();
      const width = 480;
      const height = 480;
      heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      heroCamera.position.z = 18;

      heroRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
      heroRenderer.setSize(width, height);
      heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      heroContainer.appendChild(heroRenderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
      heroScene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
      directionalLight.position.set(10, 10, 10);
      heroScene.add(directionalLight);

      heroAtomGroup = new THREE.Group();
      heroScene.add(heroAtomGroup);

      buildHeroAtom(11);
      animateHero();
    } catch (e) {
      window._heroAtomRunning = false;
    }
  }

  function buildHeroAtom(atomicNumber) {
    const nucleusGroup = new THREE.Group();
    nucleusGroup.name = "nucleusGroup";
    heroAtomGroup.add(nucleusGroup);
    const wobbleGroup = new THREE.Group();
    wobbleGroup.name = "wobbleGroup";
    heroAtomGroup.add(wobbleGroup);

    const neutronCount = 12;
    const particleRadius = 0.6;

    const protonGeo = new THREE.SphereGeometry(particleRadius, 32, 32);
    const protonMat = new THREE.MeshStandardMaterial({
      color: 0xff2222,
      roughness: 0.25,
      metalness: 0.4,
      emissive: 0xff0000,
      emissiveIntensity: 1.5,
    });
    const neutronGeo = new THREE.SphereGeometry(particleRadius, 32, 32);
    const neutronMat = new THREE.MeshStandardMaterial({
      color: 0x999999,
      roughness: 0.15,
      metalness: 0.5,
      emissive: 0x333333,
      emissiveIntensity: 0.6,
    });

    const particles = [];
    for (let i = 0; i < atomicNumber; i++) particles.push({ type: "proton" });
    for (let i = 0; i < neutronCount; i++) particles.push({ type: "neutron" });

    for (let i = particles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [particles[i], particles[j]] = [particles[j], particles[i]];
    }

    const phi = Math.PI * (3 - Math.sqrt(5));
    const n = particles.length;
    const clusterScale = Math.pow(n, 1 / 3) * particleRadius * 0.8;

    particles.forEach((p, i) => {
      const k = i + 0.5;
      const y = 1 - (k / n) * 2;
      const theta = phi * k;
      const r = Math.sqrt(1 - y * y);
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      p.pos = new THREE.Vector3(
        x * clusterScale,
        y * clusterScale,
        z * clusterScale,
      );
      p.pos.x += (Math.random() - 0.5) * 0.15;
      p.pos.y += (Math.random() - 0.5) * 0.15;
      p.pos.z += (Math.random() - 0.5) * 0.15;
    });

    const repulsionDist = particleRadius * 1.5;
    const kRepulse = 0.2;
    const kCenter = 0.1;
    const vForce = new THREE.Vector3();
    const vDiff = new THREE.Vector3();
    const vTemp = new THREE.Vector3();

    for (let iter = 0; iter < 5; iter++) {
      particles.forEach((p1, idx1) => {
        vForce.set(0, 0, 0);
        vTemp.copy(p1.pos).multiplyScalar(-kCenter);
        vForce.add(vTemp);

        particles.forEach((p2, idx2) => {
          if (idx1 === idx2) return;
          vDiff.subVectors(p1.pos, p2.pos);
          const dist = vDiff.length();
          if (dist < repulsionDist && dist > 0.01) {
            vDiff.normalize().multiplyScalar((repulsionDist - dist) * kRepulse);
            vForce.add(vDiff);
          }
        });

        p1.pos.add(vForce);
      });
    }

    const centerLight = new THREE.PointLight(0xff0000, 2.0, 15);
    nucleusGroup.add(centerLight);

    particles.forEach((p) => {
      const mesh = new THREE.Mesh(
        p.type === "proton" ? protonGeo : neutronGeo,
        p.type === "proton" ? protonMat : neutronMat,
      );
      mesh.position.copy(p.pos);
      nucleusGroup.add(mesh);
    });

    const shells = [2, 8, 8, 18, 18, 32, 32];
    let electronsLeft = atomicNumber;

    for (let s = 0; s < shells.length; s++) {
      if (electronsLeft <= 0) break;

      const capacity = shells[s];
      const count = Math.min(electronsLeft, capacity);
      electronsLeft -= count;
      const radius = 4.5 + s * 2.5;

      const orbitGeo = new THREE.TorusGeometry(radius, 0.04, 64, 100);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0x8d7f71,
        transparent: true,
        opacity: 0.3,
      });
      const orbit = new THREE.Mesh(orbitGeo, orbitMat);
      orbit.rotation.x = Math.PI / 2;
      wobbleGroup.add(orbit);

      const elGeo = new THREE.SphereGeometry(0.3, 32, 32);
      const elMat = new THREE.MeshStandardMaterial({
        color: 0x0000ff,
        roughness: 0.4,
        metalness: 0.6,
      });

      const trailGeos = [];
      const TRAIL_LENGTH = 10;
      for (let t = 0; t < TRAIL_LENGTH; t++) {
        trailGeos.push(new THREE.SphereGeometry(0.2 - t * 0.015, 8, 8));
      }

      for (let e = 0; e < count; e++) {
        const elMesh = new THREE.Mesh(elGeo, elMat);
        const angleOffset = (e / count) * Math.PI * 2;
        elMesh.userData = {
          radius,
          angle: angleOffset,
          speed: 0.02 - s * 0.002,
          trails: [],
        };
        elMesh.position.x = radius * Math.cos(angleOffset);
        elMesh.position.z = radius * Math.sin(angleOffset);

        for (let t = 0; t < TRAIL_LENGTH; t++) {
          const tGeo = trailGeos[t];
          const tMat = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            transparent: true,
            opacity: 0.3 - t * 0.03,
          });
          const tMesh = new THREE.Mesh(tGeo, tMat);
          tMesh.position.copy(elMesh.position);
          wobbleGroup.add(tMesh);
          elMesh.userData.trails.push(tMesh);
        }

        wobbleGroup.add(elMesh);
        heroElectrons.push(elMesh);
      }
    }

    heroAtomGroup.userData.popStartTime = Date.now();
    heroAtomGroup.scale.set(0.1, 0.1, 0.1);
  }

  function animateHero() {
    heroAnimationId = requestAnimationFrame(animateHero);

    const isPaused = window._spaceAgencyAnimPaused || false;
    const speedMul =
      typeof window._spaceAgencyAnimSpeed === "number"
        ? window._spaceAgencyAnimSpeed
        : 0.6;
    const time = Date.now() * 0.001;

    if (heroAtomGroup && heroAtomGroup.userData.popStartTime) {
      const popElapsed =
        (Date.now() - heroAtomGroup.userData.popStartTime) * 0.001;
      const popDur = 0.5;
      if (popElapsed < popDur) {
        const t = popElapsed / popDur;
        const ease = 1 - Math.pow(1 - t, 3);
        const s = 0.1 + (1 - 0.1) * ease;
        heroAtomGroup.scale.set(s, s, s);
      } else {
        heroAtomGroup.scale.set(1, 1, 1);
        heroAtomGroup.userData.popStartTime = null;
      }
    }

    if (!isPaused) heroAtomGroup.rotation.y += 0.002 * speedMul;

    const wobbleGroup = heroAtomGroup.getObjectByName("wobbleGroup");
    if (wobbleGroup && !isPaused) {
      wobbleGroup.rotation.y += 0.002 * speedMul;
      wobbleGroup.rotation.z = Math.sin(time * 0.5 * speedMul) * 0.2;
      wobbleGroup.rotation.x = Math.cos(time * 0.3 * speedMul) * 0.1;
    }

    const nucleusGroup = heroAtomGroup.getObjectByName("nucleusGroup");
    if (nucleusGroup && !isPaused) {
      nucleusGroup.rotation.y -= 0.005 * speedMul;
      nucleusGroup.rotation.x = Math.sin(time * 0.2 * speedMul) * 0.1;
    }

    heroElectrons.forEach((el) => {
      if (!isPaused) el.userData.angle += el.userData.speed * speedMul;
      const r = el.userData.radius;
      el.position.x = r * Math.cos(el.userData.angle);
      el.position.z = r * Math.sin(el.userData.angle);

      const trails = el.userData.trails;
      if (trails && trails.length > 0) {
        for (let i = trails.length - 1; i > 0; i--) {
          trails[i].position.copy(trails[i - 1].position);
        }
        trails[0].position.copy(el.position);
      }
    });

    heroRenderer.render(heroScene, heroCamera);
  }

  window._heroCleanup = function () {
    if (heroAnimationId) cancelAnimationFrame(heroAnimationId);
    heroAnimationId = null;

    if (heroRenderer) {
      heroRenderer.forceContextLoss();
      heroRenderer.dispose();
      if (heroRenderer.domElement && heroRenderer.domElement.parentNode) {
        heroRenderer.domElement.parentNode.removeChild(heroRenderer.domElement);
      }
      heroRenderer = null;
    }

    heroScene = null;
    heroCamera = null;
    heroAtomGroup = null;
    heroElectrons = [];
    window._heroAtomRunning = false;
  };

  initHero3D();
}
