import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { Event, Texture } from "three";
// Colors & Settings
const developerMode = false;
const textColor = 0x9042f5;
const helpers = false;
// Init Controls & Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const manager = new THREE.LoadingManager();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  10000
);
renderer.compile(scene, camera);
const controls = new PointerLockControls(camera, renderer.domElement);
camera.position.set(0, 5, 0);
// Background Skybox

const backgroundScene = new THREE.Scene();
const backgroundCam = new THREE.Camera();
backgroundScene.add(backgroundCam);
const bgTexture = new THREE.TextureLoader(manager).load("nightSky.jpg");
const bgMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.MeshBasicMaterial({ map: bgTexture })
);
bgMesh.material.depthTest = false;
bgMesh.material.depthWrite = false;
backgroundScene.add(bgMesh);
// backgroundScene.add(bgMesh);

// Defining Materials
const textureList: Array<Texture> = [];
const loadTexture = (path: string) => {
  const texture = new THREE.TextureLoader(manager).load(path);
  texture.wrapS = THREE.MirroredRepeatWrapping;
  texture.wrapT = THREE.MirroredRepeatWrapping;
  texture.repeat.set(4, 4);
  textureList.push(texture);
};
loadTexture("textures/sand.jpg");
loadTexture("textures/wood.jpg");

// Floor
const addFloor = () => {
  const geometry = new THREE.ConeGeometry(80, 10, 360);
  const material = new THREE.MeshStandardMaterial();
  const texture = new THREE.TextureLoader(manager).load(
    "/textures/floor/3468_AO.jpeg",
    () => {}
  );
  const normalMap = new THREE.TextureLoader(manager).load(
    "textures/floor/3468_Normal.jpeg",
    () => {}
  );
  const roughMap = new THREE.TextureLoader(manager).load(
    "textures/floor/3468_Roughness.jpg",
    () => {}
  );
  const heightMap = new THREE.TextureLoader(manager).load(
    "textures/floor/3468_Height.jpeg",
    () => {}
  );
  material.bumpMap = heightMap;
  material.bumpScale = 2;
  material.roughnessMap = roughMap;
  material.roughness = 5;
  material.normalMap = normalMap;
  material.normalMapType = THREE.ObjectSpaceNormalMap;
  material.normalScale.set(1, 1);
  material.map = texture;
  const floor = new THREE.Mesh(geometry, material);
  floor.position.set(0, -5, 0);
  // floor.rotateX(0.5);
  scene.add(floor);
};
addFloor();

// Grid
if (helpers) {
  const gridHelper = new THREE.GridHelper(50, 25);
  scene.add(gridHelper);
}
// light
const createLight = (x: number, y: number, z: number) => {
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.x = x;
  directionalLight.position.y = y;
  directionalLight.position.z = z;
  scene.add(directionalLight);
};
createLight(5, 10, -30);
createLight(-5, 10, -30);
createLight(0, 10, 10);
createLight(10, 100, 0);
createLight(-100, 100, 0);
createLight(100, 100, 0);

// Text Loader
const textLoader = new FontLoader(manager);
textLoader.load("./font.json", function (font) {
  const makeText = (text: string, size: number) => {
    const geometry = new TextGeometry(text, {
      font: font,
      size: size,
      height: 0.5,
      bevelEnabled: true,
      bevelSize: 0.05,
      bevelThickness: 1,
    });
    return geometry;
  };
  // Add Text to scene
  const material = new THREE.MeshPhongMaterial({
    color: textColor,
    flatShading: true,
  });
  const name = new THREE.Mesh(makeText("Jed Borseth", 8), material);
  name.position.x = -28;
  name.position.z = -30;
  name.position.y = 10;
  scene.add(name);
  const jobText = new THREE.Mesh(makeText("Front End Developer", 4), material);
  jobText.position.x = -24;
  jobText.position.z = -40;
  jobText.position.y = 0;
  scene.add(jobText);
});
// Project Function
type projectTypes = { name: string; id: number; url: string };
const projectsArr: Array<projectTypes> = [];
const generateProject = (
  name: string,
  fontSize: number,
  imagePath: string,
  sitePath: string,
  description: Array<string>,
  pos: { x: number; y: number; z: number },
  textureList: Array<Texture>,
  rotate: boolean
) => {
  const group = new THREE.Group();
  const wood = new THREE.MeshBasicMaterial({ map: textureList[1] });
  const bg = new THREE.Mesh(new THREE.BoxGeometry(1, 5, 5), wood);
  bg.position.set(0.5, 0, 0);
  group.add(bg);
  textLoader.load("./font.json", (font) => {
    const geometry = new TextGeometry(name, {
      font: font,
      size: fontSize,
      height: 0.1,
      bevelEnabled: true,
      bevelSize: 0.05,
      bevelThickness: 0.2,
    });
    const title = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({ color: textColor, flatShading: true })
    );
    title.position.set(0, 1.8, -2);
    title.scale.set(0.5, 0.5, 0.5);
    title.rotateY(1.5708 + 3.1415);

    group.add(title);
  });
  if (imagePath) {
    const imageTexture = new THREE.TextureLoader(manager).load(
      imagePath,
      () => {}
    );
    const image = new THREE.MeshBasicMaterial({ map: imageTexture });
    const imageModel = new THREE.Mesh(new THREE.BoxGeometry(0, 2, 4), image);
    imageModel.position.set(-0.1, 0, 0);
    group.add(imageModel);
  }
  const pedestal = () => {
    const pedistalGroup = new THREE.Group();
    const baseGeo = new THREE.BoxGeometry(2, 6, 2);
    const baseMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0.3, -5.5, 0);
    pedistalGroup.add(base);

    const bgGeo = new THREE.BoxGeometry(6, 0.25, 2);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    bg.rotation.x = 1.5708;
    bg.rotation.z = 1.5708;
    bg.rotateX(-1);
    bg.position.set(-1, -2.5, 0);
    pedistalGroup.add(bg);
    const generateDescription = (text: string, index: number) => {
      textLoader.load("./font.json", (font) => {
        const textGeo = new TextGeometry(text, {
          font: font,
          size: 0.2,
          height: 0.005,
          bevelEnabled: true,
          bevelSize: 0.005,
          bevelThickness: 0.005,
        });
        const textEl = new THREE.Mesh(
          textGeo,
          new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true })
        );
        textEl.rotateY(1.5708);
        textEl.rotateY(3.14159);
        // text.rotateX(-1);
        if (index === 0) {
          textEl.position.set(-1, -2, -2.5);
        }
        if (index === 1) {
          textEl.position.set(-1.25, -2.5, -1.75);
        }

        pedistalGroup.add(textEl);
      });
    };
    description.forEach((text, index) => {
      generateDescription(text, index);
    });

    return pedistalGroup;
  };
  const pedestalGroup = pedestal();
  pedestalGroup.name = "projectBase";
  group.add(pedestalGroup);
  // Add Group to scene
  group.name = name;
  group.position.set(pos.x, pos.y, pos.z);
  if (rotate) {
    group.rotateY(3.14159);
  }
  scene.add(group);

  projectsArr.push({ name: name, id: group.id, url: sitePath });
};
// Calling Project Function
// This is the last thing added to scene
generateProject(
  "Movie Database",
  0.9,
  "images/moviedb.png",
  "https://moviedb.jedborseth.com",
  [
    "BCIT | NextJS, SCSS, Supabase, NextAuth",
    "Click poster to go to live site!",
  ],
  { x: 15, y: 6, z: -10 },
  textureList,
  false
);
generateProject(
  "THREEjs Gallery",
  0.9,
  "./images/threejs.png",
  "https://gallery.jedborseth.com",
  [
    "Personal | Typescript, THREEjs, Tailwind",
    "This is the site your currently on!",
  ],
  { x: 15, y: 6, z: 0 },
  textureList,
  false
);
generateProject(
  "Portfolio Site",
  1,
  "./images/portfolio.png",
  "https://jedborseth.com",
  ["Personal | AstroJS, React, Tailwind", "Click poster to go to live site!"],
  { x: 15, y: 6, z: 10 },
  textureList,
  false
);

generateProject(
  "Movie Search",
  1,
  "./images/movie-search.png",
  "https://search.jedborseth.com/",
  [
    "Personal | React, Tailwind, Typescript",
    "Click poster to go to live site!",
  ],
  { x: -10, y: 6, z: 10 },
  textureList,
  true
);

//
// Raycaster
//
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
function onPointerMove(e: Event) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

// Camera Controls
type coordsTypes = { x: number; y: number; z: number };

const handleClicks = (click: any) => {
  const coords: coordsTypes = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  };
  // Checking if click is on project
  if (click[0].object.parent.name) {
    let projectPos = click[0].object.parent.position;

    let projectView: number;
    if (projectPos.x > 0) {
      projectView = 5;
    } else {
      projectView = -5;
    }
    if (click[0].object.parent.name === "projectBase") {
      // Checking if click is on project base then comparing the position of the camera to the position of the project not the base group pos
      if (click[0].object.parent.parent.position.x > 0) {
        projectView = 5;
      } else {
        projectView = -5;
      }
    }

    if (
      camera.position.x + projectView === projectPos.x &&
      camera.position.z === projectPos.z
    ) {
      projectsArr.forEach((i) => {
        if (i.id === click[0].object.parent.id) {
          new TWEEN.Tween(coords)
            .to({
              x: camera.position.x + projectView,
              y: camera.position.y + 1,
              z: camera.position.z,
            })
            .onUpdate((e) => {
              camera.position.set(e.x, e.y, e.z);
            })
            .start();
          setInterval(() => {
            console.log(`Redirecting to ${i.url}`);
            window.location.href = i.url;
          }, 750);
        }
      });
    } else {
      if (click[0].object.parent.name === "projectBase") {
        // if base is click use the full project coords not just the base group
        projectPos = click[0].object.parent.parent.position;
      }
      new TWEEN.Tween(coords)
        .to({
          x: projectPos.x - projectView,
          y: camera.position.y,
          z: projectPos.z,
        })
        .onUpdate((e: coordsTypes) => {
          camera.position.set(e.x, e.y, e.z);
        })
        .onComplete(() => {
          console.log("moved from", coords, "to", projectPos);
        })
        .start();
    }
  } else {
    new TWEEN.Tween(coords)
      .to({ x: 0, y: camera.position.y, z: 0 })
      .onUpdate((e: coordsTypes) => {
        camera.position.set(e.x, e.y, e.z);
      })
      .onComplete(() => {
        console.log("moved to", camera.position);
      })
      .start();
  }
};
// Animation Loop
camera.fov = 100;
scene.fog = new THREE.Fog(0x222222, 1, 100);
function animate(time: number) {
  requestAnimationFrame(animate);
  TWEEN.update(time);
  raycaster.setFromCamera(pointer, camera);

  // calculate objects intersecting the picking ray
  renderer.autoClear = false;
  renderer.clear();
  renderer.render(backgroundScene, backgroundCam);
  renderer.render(scene, camera);
}
animate(60);
const loadingEl = document.getElementById("loadingEl");
if (loadingEl) {
  manager.onLoad = () => {
    loadingEl.classList.add("hidden");
    camera.position.set(0, camera.position.y, -50);
    const coords = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };
    new TWEEN.Tween(coords)
      .to({ x: 0, y: camera.position.y, z: 0 })
      .onUpdate((e) => {
        camera.position.set(e.x, e.y, e.z);
      })
      .start();
  };
}
const app = document.getElementById("app");
if (app) {
  app.append(renderer.domElement);
}
const ctrlsBtn = document.getElementById("controls");
if (ctrlsBtn) {
  ctrlsBtn.addEventListener("click", () => {
    controls.lock();
    document.getElementById("helpinfo")?.classList.add("hidden");
    document.getElementById("credits")?.classList.add("hidden");
  });
  ctrlsBtn.addEventListener("touchend", () => {
    controls.lock();
    document.getElementById("helpinfo")?.classList.add("hidden");
    document.getElementById("credits")?.classList.add("hidden");
  });
}
camera.updateProjectionMatrix();
controls.connect();
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
if (developerMode) {
  document.addEventListener("keypress", (e) => {
    if (e.key === "p") {
      console.log(scene);
      console.log(projectsArr);
      console.log(camera);
    }
    if (e.key === "o") {
      camera.position.set(1, 15, 1);
    }
    if (e.key === "w") {
      controls.moveForward(1);
    }
  });
}

window.addEventListener("pointermove", onPointerMove);
document.addEventListener("click", () => {
  if (raycaster.intersectObjects(scene.children).length > 0) {
    handleClicks(raycaster.intersectObjects(scene.children));
  }
});
