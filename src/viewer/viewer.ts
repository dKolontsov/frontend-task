import * as THREE from "three";
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import CameraControls from "camera-controls";
import axios from "axios";
import parseJSON, { findThreeJSJSON } from "../utils/parse-json";
import * as uuid from "uuid";
import * as RX from "rxjs";

CameraControls.install({ THREE });

export type ViewerStatus = "loading" | "error" | "idle";

class Viewer {
  public id: string;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  private _renderer: THREE.WebGLRenderer;
  private _cameraControl: CameraControls;
  private _renderNeeded = true;
  private _clock = new THREE.Clock();

  public model: THREE.Object3D | undefined;

  public status = new RX.BehaviorSubject<ViewerStatus>("idle");

  private _labelRenderer: CSS2DRenderer;

  constructor(container: HTMLDivElement) {
    this.id = uuid.v4();

    // console.log("init viewer", this.id);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#333333");
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(10, 10, 10);

    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this._renderer.domElement);

    this._cameraControl = new CameraControls(
      this.camera,
      this._renderer.domElement
    );

    this._cameraControl.dollyToCursor = true;
    this._cameraControl.dollySpeed = 0.4;
    this._cameraControl.draggingSmoothTime = 0;
    this._cameraControl.smoothTime = 0;
    this._cameraControl.mouseButtons.right = CameraControls.ACTION.ROTATE;
    this._cameraControl.mouseButtons.left = CameraControls.ACTION.NONE;

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    this.scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);

    // Инициализация CSS2D рендерера
    this._labelRenderer = new CSS2DRenderer();
    this._labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this._labelRenderer.domElement.style.position = 'absolute';
    this._labelRenderer.domElement.style.top = '0';
    this._labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(this._labelRenderer.domElement);

    window.addEventListener("resize", this.resize);

    this.loadModel().then((object3d) => {
      if (object3d) {
        object3d.rotateX(-Math.PI / 2);
        this.scene.add(object3d);
        const boundingBox = new THREE.Box3().setFromObject(object3d);
        this._cameraControl.fitToBox(boundingBox, false);
        this.model = object3d;
        this.status.next("idle");
      }
    });

    this.updateViewer();
  }

  public updateViewer() {
    this._renderNeeded = true;
    this._render();
  }

  private resize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderNeeded = true;
    this._labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.updateViewer();
  };

  private _render = () => {
    const clockDelta = this._clock.getDelta();
    const hasControlsUpdated = this._cameraControl.update(clockDelta);

    if (hasControlsUpdated || this._renderNeeded) {
      this._renderer.render(this.scene, this.camera);
      this._renderNeeded = false;
    }

    window.requestAnimationFrame(this._render);
    this.updateLabels();
  };

  private createStatusLabel(object: THREE.Object3D) {
    const wrapper = document.createElement('div');
    wrapper.className = 'status-label';
    
    const status = object.userData.propertyValue;
    wrapper.innerHTML = `
      <div class="status-text status-${status.statusCode}">${status.statusText}</div>
    `;

    const label = new CSS2DObject(wrapper);
    label.position.set(0, 0, 0);
    object.add(label);
  }

  private updateLabels() {
    this._labelRenderer.render(this.scene, this.camera);
  }

  private async loadModel() {
    this.status.next("loading");

    try {
      const modelUrl =
        "https://storage.yandexcloud.net/lahta.contextmachine.online/files/pretty_ceiling_props.json";

      const response = await axios.get(modelUrl, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      const data = response.data;

      const jsonObject = findThreeJSJSON(data);
      if (jsonObject) {
        const object3d = await parseJSON(jsonObject);
        // Assign property values
        this.assignPropertyValues(object3d);

        return object3d;
      }
    } catch {
      this.status.next("error");
      throw new Error("Failed to load model");
    }
  }

  /**
   * Traverses all child objects in the model and assigns a propertyValue.
   */
  /**
   * Traverses all child objects in the model and assigns an AEC installation progress status.
   */
  private assignPropertyValues(object: THREE.Object3D) {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Define meaningful AEC installation progress values
        const progressStatuses: any = {
          1: "Not Started",
          2: "In Progress",
          3: "Partially Installed",
          4: "Installed",
        };

        // Assign installation status based on some criteria (e.g., object name, metadata, or just sequence)
        const statusIndex: number = (child.id % 4) + 1; // Ensures a cyclic assignment (1 to 4)
        child.userData.propertyValue = {
          statusCode: statusIndex,
          statusText: progressStatuses[statusIndex],
        };
        this.createStatusLabel(child);
      }
    });

    console.log("Updated Model with Installation Progress:", object);
  }

  public dispose() {
    // console.log("dispose viewer", this.id);
    window.removeEventListener("resize", this.resize);
    this._renderer.domElement.remove();
    this._renderer.dispose();
    this._cameraControl.dispose();
    this.scene.clear();
    this._renderNeeded = false;
    this._labelRenderer.domElement.remove();
  }
}

export default Viewer;
