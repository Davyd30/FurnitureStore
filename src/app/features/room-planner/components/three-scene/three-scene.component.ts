import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { RoomConfigModalComponent, RoomConfig } from '../room-config-modal/room-config-modal.component';
import { FurnitureSidebarComponent, FurnitureItem } from '../furniture-sidebar/furniture-sidebar.component';
import { CartService } from '../../../../services/cart.service';
import { ShopService } from '../../../../services/shop.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-three-scene',
  standalone: true,
  imports: [FormsModule, CommonModule, RoomConfigModalComponent, FurnitureSidebarComponent],
  templateUrl: './three-scene.component.html',
  styleUrls: ['./three-scene.component.css'],
})
export class ThreeSceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true })
  containerRef!: ElementRef<HTMLDivElement>;

  // Modal state
  showConfigModal = true;
  roomConfigured = false;
  isRightPanelCollapsed = true; // Start collapsed
  isMobileSidebarOpen = true; // Track mobile sidebar state

  // Inputs bound to UI
  roomWidth = 6;
  roomHeight = 3;
  roomDepth = 5;
  wallThickness = 0.2;
  wallColor = '#c0e0ff';
  floorColor = '#f2f2f2';
  floorTexture = 'color'; // Options: 'color', 'wood', 'tile', 'concrete', 'carpet'
  isInsideView = false;
  currentRotationDegrees = 0;

  // Internal references
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private controls!: OrbitControls;
  private animationId: number | null = null;

  private wallMaterial!: THREE.MeshStandardMaterial;
  private floorMaterial!: THREE.MeshStandardMaterial;
  private textureLoader = new THREE.TextureLoader();
  private roomGroup = new THREE.Group();

  // Object interaction
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  selectedObject: THREE.Object3D | null = null;
  selectedObjectDisplayName: string = '';
  private selectionBox: THREE.BoxHelper | null = null;
  private isDragging = false;
  private dragPlane = new THREE.Plane();
  private dragOffset = new THREE.Vector3();
  private movableObjects: THREE.Object3D[] = [];
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly PLY_PRODUCT_IDS = new Set<string>([
    '69a308c3ea78ee8f8426f76a'
  ]);

  constructor(
    private cartService: CartService,
    private router: Router,
    private shopService: ShopService,
    private authService: AuthService
  ) {}

  ngAfterViewInit(): void {
    const user = this.authService.getCurrentUser();
    if (user?.savedRoom) {
      // Saved room exists, skip config modal and restore
      this.showConfigModal = false;
      this.roomConfigured = true;
      this.loadFromSavedRoom(user.savedRoom);
    }
    // else: showConfigModal
  }

  onRoomConfigured(config: RoomConfig): void {
    // Apply configuration
    this.roomWidth = config.width;
    this.roomHeight = config.height;
    this.roomDepth = config.depth;
    this.wallColor = config.wallColor;
    this.floorTexture = config.floorTexture;
    this.floorColor = config.floorColor;
    
    // Close modal and mark as configured
    this.showConfigModal = false;
    this.roomConfigured = true;
    
    // Initialize the 3D scene
    this.initializeScene();

    this.triggerSave();
  }

  private initializeScene(): void {
    this.initThree();
    this.buildRoom();
    this.startRenderingLoop();
    window.addEventListener('resize', this.onWindowResize, { passive: true });
    this.setupMouseEvents();
    this.setupDragAndDrop();
  }

  private setupDragAndDrop(): void {
    // Add drag and drop listeners to document body
    document.body.addEventListener('dragover', this.handleDragOver);
    document.body.addEventListener('drop', this.handleDrop);
  }

  private handleDragOver = (event: DragEvent): void => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  private handleDrop = (event: DragEvent): void => {
    event.preventDefault();
    
    if (!event.dataTransfer) return;
    
    const data = event.dataTransfer.getData('application/json');
    if (!data) return;
    
    // Check if drop is over the canvas area
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const isOverCanvas = event.clientX >= rect.left && 
                         event.clientX <= rect.right && 
                         event.clientY >= rect.top && 
                         event.clientY <= rect.bottom;
    
    if (!isOverCanvas) return;
    
    const item: FurnitureItem = JSON.parse(data);
    this.loadFurnitureAtDropPosition(event, item);
  };

  private loadFurnitureAtDropPosition(event: DragEvent, item: FurnitureItem): void {
    // Calculate 3D position from mouse coordinates
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.mouse.set(x, y);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Create a plane at floor level to intersect with
    const floorY = -this.roomHeight / 2;
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -floorY);
    const intersectPoint = new THREE.Vector3();
    
    this.raycaster.ray.intersectPlane(floorPlane, intersectPoint);
    
    // Load furniture at the drop position
    this.onFurnitureItemSelected(item, intersectPoint);
  }

  ngOnDestroy(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    window.removeEventListener('resize', this.onWindowResize);
    document.body.removeEventListener('dragover', this.handleDragOver);
    document.body.removeEventListener('drop', this.handleDrop);
    this.removeMouseEvents();
    this.stopRenderingLoop();
    this.controls.dispose();
    this.renderer.dispose();
  }

  private initThree() {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(7, 4, 8);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 1, 0);
    this.controls.maxPolarAngle = Math.PI / 2;
    
    // Set initial zoom limits for outside view
    this.setOutsideViewLimits();

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7.5);
    this.scene.add(dirLight);

    // Add container for the room
    this.scene.add(this.roomGroup);
    this.roomGroup.position.y = 1;
  }

  private buildRoom() {
    this.roomGroup.clear();

    const { roomWidth, roomHeight, roomDepth, wallThickness } = this;

    // Wall material
    this.wallMaterial = new THREE.MeshStandardMaterial({
      color: this.wallColor,
      side: THREE.BackSide, // render interior
    });

    // Floor material
    this.floorMaterial = new THREE.MeshStandardMaterial({
      color: this.floorColor,
      side: THREE.DoubleSide,
    });

    // Room walls (BoxGeometry)
    const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);
    const roomMesh = new THREE.Mesh(roomGeometry, this.wallMaterial);
    roomMesh.position.set(0, 0, 0); // center at roomGroup origin
    this.roomGroup.add(roomMesh);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(
      roomWidth - wallThickness,
      roomDepth - wallThickness
    );
    const floor = new THREE.Mesh(floorGeometry, this.floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -roomHeight / 2 + 0.01; // bottom of room
    this.roomGroup.add(floor);

    // Apply initial floor texture after floor is created
    this.updateFloorTexture();

    // Load door and window on walls
    this.loadDoor();
    this.loadWindow();
  }

  private loadDoor() {
    const loader = new GLTFLoader();
    loader.load(
      'assets/models/door.glb',
      (gltf) => {
        const door = gltf.scene;
        

        const wallZ = this.roomDepth / 2;
        const floorY = -this.roomHeight / 2; // Floor level
        
        door.position.set(0, floorY, wallZ);
        door.rotation.y = Math.PI; // Rotate to face inside the room
        door.scale.set(0.6, 0.6, 0.6); // Scale down to 60% of original size
        
        this.roomGroup.add(door);
      },
      undefined,
      (error) => {
        console.error('Error loading door model:', error);
      }
    );
  }

  private loadWindow() {
    const loader = new GLTFLoader();
    loader.load(
      'assets/models/window.glb',
      (gltf) => {
        const window = gltf.scene;
        
        const wallX = -this.roomWidth / 2; // Left wall
        const windowHeight = -this.roomHeight / 2 + this.roomHeight * 0.3; // 30% up the wall
        
        window.position.set(wallX, windowHeight, 0);
        window.rotation.y = Math.PI / 2; // Rotate to face inside the room
        
        this.roomGroup.add(window);
      },
      undefined,
      (error) => {
        console.error('Error loading window model:', error);
      }
    );
  }

  updateRoom() {
    // Clear all furniture objects before rebuilding room
    this.clearAllFurniture();
    this.buildRoom();
    this.triggerSave();
  }

  private clearAllFurniture() {
    // Remove all movable objects from the scene
    this.movableObjects.forEach(obj => {
      this.roomGroup.remove(obj);
      // Traverse and dispose of geometries and materials
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => mat.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });
    });
    
    // Clear the movable objects array
    this.movableObjects = [];
    
    // Deselect any selected object
    this.deselectObject();
  }

  updateWallColor() {
    this.wallMaterial.color.set(this.wallColor);
    this.triggerSave();
  }

  updateFloorColor() {
    this.floorMaterial.color.set(this.floorColor);
    this.triggerSave();
  }

  updateFloorTexture() {
    // Remove existing texture
    if (this.floorMaterial.map) {
      this.floorMaterial.map.dispose();
      this.floorMaterial.map = null;
    }

    if (this.floorTexture === 'color') {
      // Solid color - no texture
      this.floorMaterial.color.set(this.floorColor);
      this.floorMaterial.needsUpdate = true;
      this.triggerSave();
    } else {
      // Load texture image from assets
      const texturePath = `assets/textures/${this.floorTexture}.jpg`;
      
      this.textureLoader.load(
        texturePath,
        (texture) => {
          // Configure texture wrapping and repeat
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(4, 4);
          
          // Apply texture to floor material
          this.floorMaterial.map = texture;
          this.floorMaterial.color.set(0xffffff); // Reset to white to show texture properly
          this.floorMaterial.needsUpdate = true;
          this.triggerSave();
        },
        undefined,
        (error) => {
          console.error(`Error loading texture: ${texturePath}`, error);
        }
      );
    }
  }

  toggleCameraView() {
    this.isInsideView = !this.isInsideView;
    
    if (this.isInsideView) {
      // Inside view: position camera inside the room
      this.camera.position.set(0, 1, 0);
      this.controls.target.set(0, 1, 0);
      this.setInsideViewLimits();
    } else {
      // Outside view: position camera outside the room
      this.camera.position.set(7, 4, 8);
      this.controls.target.set(0, 1, 0);
      this.setOutsideViewLimits();
    }
    
    this.controls.update();
  }

  private setInsideViewLimits() {
    // Inside view
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 4;
    this.controls.maxPolarAngle = Math.PI;
  }

  private setOutsideViewLimits() {
    // Outside view
    this.controls.minDistance = 5;
    this.controls.maxDistance = 20;
    this.controls.maxPolarAngle = Math.PI / 2;
  }

  private startRenderingLoop() {
    const render = () => {
      this.controls.update();
      if (this.camera.position.y < 0.1) this.camera.position.y = 0.1;
      this.renderer.render(this.scene, this.camera);
      this.animationId = requestAnimationFrame(render);
    };
    render();
  }

  private stopRenderingLoop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private onWindowResize = () => {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private setupMouseEvents() {
    const canvas = this.renderer.domElement;
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mousemove', this.onMouseMove);
    canvas.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    canvas.addEventListener('auxclick', this.onMiddleClick);
    // Add touch event listeners for mobile
    canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    canvas.addEventListener('touchend', this.onTouchEnd);
    canvas.style.cursor = 'default';
  }

  private removeMouseEvents() {
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('mousedown', this.onMouseDown);
    canvas.removeEventListener('mousemove', this.onMouseMove);
    canvas.removeEventListener('mouseup', this.onMouseUp);
    canvas.removeEventListener('wheel', this.onWheel);
    canvas.removeEventListener('auxclick', this.onMiddleClick);
    // Remove touch event listeners
    canvas.removeEventListener('touchstart', this.onTouchStart);
    canvas.removeEventListener('touchmove', this.onTouchMove);
    canvas.removeEventListener('touchend', this.onTouchEnd);
  }

  private onMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    this.updateMousePosition(event);

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.movableObjects, true);

    if (intersects.length > 0) {
      // Find the top-level movable object
      let object = intersects[0].object;
      while (object.parent && !this.movableObjects.includes(object)) {
        object = object.parent;
      }

      if (this.movableObjects.includes(object)) {
        this.controls.enabled = false; // Disable orbit controls while dragging
        this.controls.enableZoom = false; // Disable zoom when object is selected
        this.isDragging = true;
        this.selectedObject = object;
        this.selectedObjectDisplayName = object.userData['displayName'] || object.name;

        // Create selection box
        this.createSelectionBox(object);

        // Set up drag plane at floor level (y = object's y position)
        const planeY = object.position.y;
        this.dragPlane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(0, planeY, 0)
        );

        // Calculate offset from click point to object center
        const intersectPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint);
        if (intersectPoint) {
          this.dragOffset.subVectors(object.position, intersectPoint);
          this.updateRotationDisplay();
        }

        this.renderer.domElement.style.cursor = 'grabbing';
      }
    } else {
      // Clicked on empty space - deselect
      this.deselectObject();
    }
  };

  private onMouseMove = (event: MouseEvent) => {
    this.updateMousePosition(event);

    if (this.isDragging && this.selectedObject) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersectPoint = new THREE.Vector3();

      if (this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint)) {
        // Calculate new position with offset
        const newPosition = intersectPoint.add(this.dragOffset);
        
        // Apply the new position
        this.selectedObject.position.x = newPosition.x;
        this.selectedObject.position.z = newPosition.z;

        // Constrain object to stay within room bounds
        this.constrainObjectToRoom();

        // Update selection box
        if (this.selectionBox) {
          this.selectionBox.update();
        }
      }
    } else {
      // Change cursor on hover
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.movableObjects, true);

      if (intersects.length > 0) {
        this.renderer.domElement.style.cursor = 'grab';
      } else {
        this.renderer.domElement.style.cursor = 'default';
      }
    }
  };

  private onMouseUp = () => {
    if (this.isDragging) {
      this.isDragging = false;
      this.controls.enabled = true;
      this.triggerSave();

      if (this.selectedObject) {
        this.renderer.domElement.style.cursor = 'grab';
      } else {
        this.renderer.domElement.style.cursor = 'default';
      }
    }
  };

  private updateMousePosition(event: MouseEvent) {
    const canvas = this.renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  // Touch event handlers for mobile
  private onTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1) return; // Only handle single touch
    
    event.preventDefault();
    const touch = event.touches[0];
    
    // Update mouse position from touch
    const canvas = this.renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.movableObjects, true);

    if (intersects.length > 0) {
      // Find the top-level movable object
      let object = intersects[0].object;
      while (object.parent && !this.movableObjects.includes(object)) {
        object = object.parent;
      }

      if (this.movableObjects.includes(object)) {
        this.controls.enabled = false; // Disable orbit controls while dragging
        this.controls.enableZoom = false; // Disable zoom when object is selected
        this.isDragging = true;
        this.selectedObject = object;
        this.selectedObjectDisplayName = object.userData['displayName'] || object.name;

        // Create selection box
        this.createSelectionBox(object);

        // Set up drag plane at floor level
        const planeY = object.position.y;
        this.dragPlane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(0, planeY, 0)
        );

        // Calculate offset from touch point to object center
        const intersectPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint);
        if (intersectPoint) {
          this.dragOffset.subVectors(object.position, intersectPoint);
          this.updateRotationDisplay();
        }
      }
    } else {
      // Touched on empty space - deselect
      this.deselectObject();
    }
  };

  private onTouchMove = (event: TouchEvent) => {
    if (event.touches.length !== 1) return; // Only handle single touch
    
    const touch = event.touches[0];
    
    // Update mouse position from touch
    const canvas = this.renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

    if (this.isDragging && this.selectedObject) {
      event.preventDefault(); // Prevent scrolling/panning while dragging
      
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersectPoint = new THREE.Vector3();

      if (this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint)) {
        // Calculate new position with offset
        const newPosition = intersectPoint.add(this.dragOffset);
        
        // Apply the new position
        this.selectedObject.position.x = newPosition.x;
        this.selectedObject.position.z = newPosition.z;

        // Constrain object to stay within room bounds
        this.constrainObjectToRoom();

        // Update selection box
        if (this.selectionBox) {
          this.selectionBox.update();
        }
      }
    }
  };

  private onTouchEnd = (event: TouchEvent) => {
    if (this.isDragging) {
      this.isDragging = false;
      this.controls.enabled = true;
    }
  };

  private createSelectionBox(object: THREE.Object3D) {
    // Remove previous selection box
    if (this.selectionBox) {
      this.scene.remove(this.selectionBox);
      this.selectionBox.dispose();
    }

    // Create new selection box
    this.selectionBox = new THREE.BoxHelper(object, 0x00ff00); // Green
    this.scene.add(this.selectionBox);
  }

  private deselectObject() {
    if (this.selectionBox) {
      this.scene.remove(this.selectionBox);
      this.selectionBox.dispose();
      this.selectionBox = null;
    }
    this.selectedObject = null;
    this.selectedObjectDisplayName = '';
    this.currentRotationDegrees = 0;
    this.controls.enableZoom = true;
  }

  private onWheel = (event: WheelEvent) => {
    // Only rotate if an object is selected
    if (this.selectedObject) {
      event.preventDefault();
      
      // Determine rotation direction based on scroll
      const rotationStep = (15 * Math.PI) / 180; // 15 degrees in radians
      const direction = event.deltaY > 0 ? 1 : -1;
      
      // Apply rotation
      this.selectedObject.rotation.y += direction * rotationStep;
      
      // Update the display
      this.updateRotationDisplay();
      
      // Update selection box
      if (this.selectionBox) {
        this.selectionBox.update();
      }
      
      // Re-check bounds after rotation to keep object within room
      this.constrainObjectToRoom();
    }
  };

  private onMiddleClick = (event: MouseEvent) => {
    // Middle mouse button (button 1)
    if (event.button === 1) {
      event.preventDefault();
      this.updateMousePosition(event);

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.movableObjects, true);

      if (intersects.length > 0) {
        // Find the top-level movable object
        let object = intersects[0].object;
        while (object.parent && !this.movableObjects.includes(object)) {
          object = object.parent;
        }

        if (this.movableObjects.includes(object)) {
          // Remove from movable objects array
          const index = this.movableObjects.indexOf(object);
          if (index > -1) {
            this.movableObjects.splice(index, 1);
          }

          // If this is the selected object, deselect it first
          if (this.selectedObject === object) {
            this.deselectObject();
          }

          // Remove from scene
          this.roomGroup.remove(object);
          this.triggerSave();
        }
      }
    }
  };

  private updateRotationDisplay() {
    if (this.selectedObject) {
      // Convert radians to degrees and normalize to 0-360
      let degrees = (this.selectedObject.rotation.y * 180) / Math.PI;
      degrees = ((degrees % 360) + 360) % 360; // Normalize to 0-360
      this.currentRotationDegrees = Math.round(degrees);
    }
  }

  onRotationSliderChange(event: Event): void {
    if (!this.selectedObject) return;
    
    const target = event.target as HTMLInputElement;
    const degrees = parseInt(target.value, 10);
    
    // Convert degrees to radians and apply rotation
    this.selectedObject.rotation.y = (degrees * Math.PI) / 180;
    this.currentRotationDegrees = degrees;
    
    // Update selection box
    if (this.selectionBox) {
      this.selectionBox.update();
    }

    this.triggerSave();
  }

  deleteSelectedObject(): void {
    if (!this.selectedObject) return;

    const object = this.selectedObject;

    // Remove from movable objects array
    const index = this.movableObjects.indexOf(object);
    if (index > -1) {
      this.movableObjects.splice(index, 1);
    }

    // Deselect first
    this.deselectObject();

    // Remove from scene
    this.roomGroup.remove(object);

    this.triggerSave();
  }

  onFurnitureItemSelected(item: FurnitureItem, dropPosition?: THREE.Vector3): void {
    const spawnX = dropPosition?.x ?? 0;
    const spawnZ = dropPosition?.z ?? 0;
    const spawnY = -this.roomHeight / 2;

    // If the product model is a PLY file on S3, use PLYLoader
    if (this.PLY_PRODUCT_IDS.has(item.productId)) {
      const plyPath = item.path.replace('model.glb', 'model.ply');
      this.loadPlyWithRotation(
        plyPath,
        item.displayName,
        new THREE.Vector3(spawnX, spawnY, spawnZ),
        0,
        item
      );
      return;
    }

    const loader = new GLTFLoader();
    loader.load(
      item.path,
      (gltf: GLTF) => {
        const obj = gltf.scene;
        obj.name = item.name;
        obj.userData['displayName'] = item.displayName;
        obj.userData['productId'] = item.productId;
        obj.userData['price'] = item.price;
        obj.userData['imageUrl'] = item.imageUrl;
        obj.userData['path'] = item.path;
        obj.userData['categories'] = item.categories;
        obj.userData['loaderType'] = 'gltf';

        // Enable shadows
        obj.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        // Align bottom with floor
        obj.position.y = spawnY;

        // Set position: use drop position if provided, otherwise center
        obj.position.x = spawnX;
        obj.position.z = spawnZ;

        // Add to scene first
        this.roomGroup.add(obj);
        this.movableObjects.push(obj);

        // Constrain to room boundaries
        const prevSelected = this.selectedObject;
        this.selectedObject = obj;
        this.constrainObjectToRoom();
        this.selectedObject = prevSelected;

        this.triggerSave();
      },
      undefined,
      (err) => console.error(`Error loading ${item.displayName}:`, err)
    );
  }

  private loadFurnitureWithRotation(item: FurnitureItem, position: THREE.Vector3, rotationY: number): void {
    const loader = new GLTFLoader();
    loader.load(
      item.path,
      (gltf: GLTF) => {
        const obj = gltf.scene;
        obj.name = item.name;
        obj.userData['displayName'] = item.displayName;
        obj.userData['productId'] = item.productId;
        obj.userData['price'] = item.price;
        obj.userData['imageUrl'] = item.imageUrl;
        obj.userData['path'] = item.path;
        obj.userData['categories'] = item.categories;
        obj.userData['loaderType'] = 'gltf';

        obj.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        obj.position.set(position.x, position.y, position.z);
        obj.rotation.y = rotationY;

        this.roomGroup.add(obj);
        this.movableObjects.push(obj);
      },
      undefined,
      (err) => console.error(`Error loading saved furniture ${item.displayName}:`, err)
    );
  }

  private loadPlyWithRotation(plyPath: string, displayName: string, position: THREE.Vector3, rotationY: number, item?: FurnitureItem): void {
    const loader = new PLYLoader();
    loader.load(
      plyPath,
      (geometry) => {
        geometry.computeVertexNormals();
        const material = new THREE.MeshStandardMaterial(
          geometry.hasAttribute('color')
            ? { vertexColors: true }
            : { color: 0xaaaaaa }
        );
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Wrap in a Group so the API matches GLTF/OBJ objects
        const obj = new THREE.Group();
        obj.add(mesh);

        obj.name = item?.name || 'heater-default';
        obj.userData['displayName'] = displayName;
        obj.userData['loaderType'] = 'ply';
        obj.userData['path'] = plyPath;
        obj.userData['productId'] = item?.productId || '';
        obj.userData['price'] = item?.price || 0;
        obj.userData['imageUrl'] = item?.imageUrl || '';
        obj.userData['categories'] = item?.categories || [];

        obj.position.set(position.x, position.y, position.z);
        obj.rotation.y = rotationY;
        // obj.scale.set(0.005, 0.005, 0.005);

        this.roomGroup.add(obj);
        this.movableObjects.push(obj);

        this.triggerSave();
      },
      undefined,
      (err) => console.error(`Error loading PLY ${plyPath}:`, err)
    );
  }

  clearRoom(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);

    // Clear saved room on backend
    this.authService.clearSavedRoom().subscribe();

    // Stop rendering and tear down Three.js
    this.stopRenderingLoop();
    document.body.removeEventListener('dragover', this.handleDragOver);
    document.body.removeEventListener('drop', this.handleDrop);
    this.removeMouseEvents();
    window.removeEventListener('resize', this.onWindowResize);
    this.controls.dispose();
    this.renderer.dispose();

    // Remove canvas from DOM
    const container = this.containerRef.nativeElement;
    while (container.firstChild) container.removeChild(container.firstChild);

    // Reset state
    this.movableObjects = [];
    this.selectedObject = null;
    this.selectionBox = null;
    this.roomConfigured = false;
    this.showConfigModal = true;
  }

  private loadFromSavedRoom(savedData: string): void {
    try {
      const data = JSON.parse(savedData);

      this.roomWidth = data.width ?? this.roomWidth;
      this.roomHeight = data.height ?? this.roomHeight;
      this.roomDepth = data.depth ?? this.roomDepth;
      this.wallColor = data.wallColor ?? this.wallColor;
      this.floorTexture = data.floorTexture ?? this.floorTexture;
      this.floorColor = data.floorColor ?? this.floorColor;

      this.initializeScene();

      // Load furniture after scene is ready
      setTimeout(() => {
        if (Array.isArray(data.objects)) {
          data.objects.forEach((obj: any) => {
            const position = new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z);
            const restoredItem: FurnitureItem = {
              name: obj.name,
              displayName: obj.displayName,
              path: obj.path,
              productId: obj.productId,
              price: obj.price,
              imageUrl: obj.imageUrl,
              categories: obj.categories || []
            };
            if (obj.loaderType === 'ply') {
              this.loadPlyWithRotation(obj.path, obj.displayName || 'Object', position, obj.rotationY ?? 0, restoredItem);
            } else {
              this.loadFurnitureWithRotation(restoredItem, position, obj.rotationY ?? 0);
            }
          });
        }
      }, 100);
    } catch (e) {
      console.error('Failed to load saved room, falling back to config modal:', e);
      this.showConfigModal = true;
      this.roomConfigured = false;
    }
  }

  serializeRoom(): string {
    const objects = this.movableObjects.map(obj => ({
      name: obj.name,
      displayName: obj.userData['displayName'] || '',
      path: obj.userData['path'] || '',
      loaderType: obj.userData['loaderType'] || 'gltf',
      productId: obj.userData['productId'] || '',
      price: obj.userData['price'] || 0,
      imageUrl: obj.userData['imageUrl'] || '',
      categories: obj.userData['categories'] || [],
      position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
      rotationY: obj.rotation.y
    }));

    return JSON.stringify({
      width: this.roomWidth,
      height: this.roomHeight,
      depth: this.roomDepth,
      wallColor: this.wallColor,
      floorTexture: this.floorTexture,
      floorColor: this.floorColor,
      objects
    });
  }

  triggerSave(): void {
    if (!this.roomConfigured) return;
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.persistRoom(), 1500);
  }

  private persistRoom(): void {
    if (!this.roomConfigured) return;
    const data = this.serializeRoom();
    this.authService.saveRoom(data).subscribe();
  }

  private constrainObjectToRoom() {
    if (!this.selectedObject) return;

    // Get object's bounding box in world space
    const boundingBox = new THREE.Box3().setFromObject(this.selectedObject);
    
    // Room bounds
    const roomHalfWidth = this.roomWidth / 2;
    const roomHalfDepth = this.roomDepth / 2;
    const padding = 0.1;
    
    const minX = -roomHalfWidth + padding;
    const maxX = roomHalfWidth - padding;
    const minZ = -roomHalfDepth + padding;
    const maxZ = roomHalfDepth - padding;
    
    // Adjust position if object extends beyond room bounds
    if (boundingBox.min.x < minX) {
      this.selectedObject.position.x += (minX - boundingBox.min.x);
    }
    if (boundingBox.max.x > maxX) {
      this.selectedObject.position.x -= (boundingBox.max.x - maxX);
    }
    if (boundingBox.min.z < minZ) {
      this.selectedObject.position.z += (minZ - boundingBox.min.z);
    }
    if (boundingBox.max.z > maxZ) {
      this.selectedObject.position.z -= (boundingBox.max.z - maxZ);
    }
  }

  toggleRightPanel(): void {
    this.isRightPanelCollapsed = !this.isRightPanelCollapsed;
  }

  onSidebarToggled(isOpen: boolean): void {
    this.isMobileSidebarOpen = isOpen;
  }

  viewCart(): void {
    // Add all furniture items from scene to cart
    this.movableObjects.forEach(obj => {
      const productId = obj.userData['productId'];
      const displayName = obj.userData['displayName'] || obj.name;
      const price = obj.userData['price'] || 0;
      const imageUrl = obj.userData['imageUrl'] || '';

      if (productId) {
        this.cartService.addToCart({
          id: productId,
          name: displayName,
          price: price,
          image: imageUrl
        });
      }
    });

    // Navigate to cart page
    const shop = this.shopService.getCurrentShop();
    if (shop) {
      const shopUrl = this.shopService.titleToUrl(shop.title);
      this.router.navigate([`/${shopUrl}/cart`]);
    }
  }

  returnToStore(): void {
    // Navigate back to store page
    const shop = this.shopService.getCurrentShop();
    if (shop) {
      const shopUrl = this.shopService.titleToUrl(shop.title);
      this.router.navigate([`/${shopUrl}/`]);
    }
  }
}
