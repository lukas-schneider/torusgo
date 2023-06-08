import {BoxGeometry, Color, Matrix4, Mesh, PerspectiveCamera, Vector2, Vector3} from 'three';
import {
  IRawGame,
  EColor,
}                                                                               from '../../shared/gameLogic';
import {sign}                                                                   from '../../shared/utils';
import AbstractAnimation
                                                                                from '../AbstractAnimation';
import RayCast                                                                  from './RayCast';
import RayCastTorus
                                                                                from './RayCastTorus';
import TorusMaterialBoard
                                                                                from './TorusMaterialBoard';
import TorusMaterialStone
                                                                                from './TorusMaterialStone';

// rainbow!
const violet = new Color(0x9400D4);
const indigo = new Color(0x4B0082);
const _blue = new Color(0x0000FF);
const _green = new Color(0x00FF00);
const _yellow = new Color(0xFFFF00);
const _orange = new Color(0xFF7F00);
const _red = new Color(0xFF0000);

const box222 = new BoxGeometry(2, 2, 2);

export enum EKeys {
  Up       = 'KeyW',
  Down     = 'KeyS',
  Left     = 'KeyA',
  Right    = 'KeyD',
  TwistIn  = 'KeyQ',
  TwistOut = 'KeyE',
}

export type TKeyState = {
  [key in EKeys]: boolean;
};

class ThreeAnimation extends AbstractAnimation {
  public camera: PerspectiveCamera;

  private twist: number;

  private boardGeometry: BoxGeometry; // torus cannot be scaled to box222?
  private boardMaterial: TorusMaterialBoard;
  private boardMesh: Mesh;
  private stoneMaterialArray: TorusMaterialStone[];
  private stoneMeshArray: Mesh[];

  private mouse: Vector2; // current mouse pos in canvas, domain: [[-1,-1],[1,1]]

  // these are needed for CPU and GPU sided raytracing.
  private inverseViewMatrix: Matrix4;
  private inverseProjectionMatrix: Matrix4;
  private inverseModelMatrixBoard: Matrix4;

  private keyState: TKeyState = {
    KeyA: false,
    KeyD: false,
    KeyE: false,
    KeyQ: false,
    KeyS: false,
    KeyW: false,
  };

  private cameraDelta: Vector2;
  private twistDelta: number = 0;

  private radius: number = 1;
  private thickness: number;
  private stoneSize: number = 0.05;

  private cameraSpeed: number = 0.3;
  private twistSpeed: number = 0.05;
  // for party
  private partyMode = false;

  private colorBoard = new Color(0xFF6B00);
  private colorStoneWhite = new Color(0xe6ffff);
  private colorStoneBlack = new Color(0x1a0008);
  private colorStoneHover = new Color(0xFFD700);

  // ---- event handlers ----

  public handleGameStateChange(rawGame: IRawGame): void {
    this.rawGame = rawGame;
  }

  public handleResize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  public handleMouseMove(x: number, y: number) {
    this.mouse.set(x, y);
  }

  public handleKeyStateChange(keyCode: EKeys, pressed: boolean) {
    if (this.keyState[keyCode] === pressed) return;

    this.keyState[keyCode] = pressed;

    this.cameraDelta.set(
      sign(this.keyState[EKeys.Up], this.keyState[EKeys.Down]),
      sign(this.keyState[EKeys.Right], this.keyState[EKeys.Left]),
    ).multiplyScalar(this.cameraSpeed);

    this.twistDelta = sign(
      this.keyState[EKeys.TwistIn],
      this.keyState[EKeys.TwistOut],
    ) * this.twistSpeed;
  }

  // ---- init functions ----

  public init() {
    this.initThickness();
    this.initCamera();
    this.initTwist();
    this.initMouse();
    this.initStones();
    this.initBoard();
  }

  private initThickness() {
    this.thickness = this.rawGame.ruleSet.size.x / this.rawGame.ruleSet.size.y / 2;
  }

  private initCamera() {
    this.camera = new PerspectiveCamera(
      45, 1, 0.1, 100,
    );
    this.camera.up.set(0, 1, 0);
    this.camera.position.set(0, 0, this.radius * 4.0);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);

    this.cameraDelta = new Vector2();
  }

  private initTwist() {
    this.twist = 0;
  }

  private initMouse() {
    this.mouse = new Vector2();
  }

  private initStones() {
    this.stoneMaterialArray = [];
    this.stoneMeshArray = [];
    for (let i = 0; i < this.rawGame.ruleSet.size.x; i++) {
      for (let j = 0; j < this.rawGame.ruleSet.size.y; j++) {
        const material = new TorusMaterialStone();
        const mesh = new Mesh(box222, material);
        this.stoneMaterialArray.push(material);
        this.stoneMeshArray.push(mesh);
        this.scene.add(mesh);
      }
    }
  }

  private initBoard() {
    this.boardGeometry = new BoxGeometry(
      2.0 * (this.radius + this.thickness),
      2.0 * (this.radius + this.thickness),
      2.0 * this.thickness,
    );
    this.boardMaterial = new TorusMaterialBoard();
    this.boardMesh = new Mesh(this.boardGeometry, this.boardMaterial);
    this.scene.add(this.boardMesh);
  }

  // ---- animation functions ----

  public update() {
    this.updateStoneTransforms();
    this.updateTwistKeyboard();
    this.updateCameraTrackballKeyboard();
    this.updateRayCastingMatrices();
    this.updateHover();
    this.updateUniforms();
  }

  private updateStoneTransforms() {
    const {x, y} = this.rawGame.ruleSet.size;

    const scaleX = (this.thickness + this.stoneSize)
      * Math.PI / x * 0.9; // the 0.9 enables a small gap
    let scaleY; // to be determined for each iRad
    const scaleZ = this.stoneSize;

    let stoneId = 0;
    const xAxis = new Vector3(1, 0, 0);
    const zAxis = new Vector3(0, 0, 1);
    for (let i = 0; i < x; i++) {
      const iRad = i / x * 2 * Math.PI + this.twist;
      const offset = new Vector3(
        (this.thickness + scaleZ) * Math.sin(iRad),
        0,
        (this.thickness + scaleZ) * Math.cos(iRad),
      );

      const innerRingRadius = this.radius + (this.thickness + scaleZ) * Math.cos(iRad - Math.PI / 2.0);
      scaleY = innerRingRadius * Math.PI / y * 0.9; // the 0.9 enables a small gap

      for (let j = 0; j < y; j++) {
        const jRad = j / y * 2 * Math.PI;


        const mesh = this.stoneMeshArray[stoneId];

        mesh.setRotationFromMatrix(
          new Matrix4().makeRotationZ(jRad)
            .multiply(new Matrix4().makeRotationY(iRad)));

        mesh.scale.set(scaleX, scaleY, scaleZ);
        mesh.position.copy(offset);
        mesh.position.addScaledVector(xAxis, this.radius);
        mesh.position.applyAxisAngle(zAxis, jRad);

        stoneId++;
      }
    }
  }

  private updateTwistKeyboard() {
    this.twist += this.twistDelta;
    while (this.twist < 0) {
      this.twist += 2.0 * Math.PI;
    }
    while (this.twist > 2.0 * Math.PI) {
      this.twist -= 2.0 * Math.PI;
    }
  }

  private updateCameraTrackballKeyboard() {
    const cameraAxisY = new Vector3().crossVectors(this.camera.up, this.camera.position)
      .normalize();

    this.camera.position.addScaledVector(this.camera.up, this.cameraDelta.x);
    this.camera.position.addScaledVector(cameraAxisY, this.cameraDelta.y);
    this.camera.position.normalize();

    cameraAxisY.crossVectors(this.camera.up, this.camera.position);
    this.camera.up.crossVectors(this.camera.position, cameraAxisY);

    this.camera.position.multiplyScalar(this.radius * 4);
    this.camera.lookAt(new Vector3(0, 0, 0));
  }

  private updateRayCastingMatrices() {
    this.inverseViewMatrix = this.camera.matrixWorld;
    this.inverseProjectionMatrix = new Matrix4().copy(this.camera.projectionMatrix).invert();
    this.inverseModelMatrixBoard = new Matrix4().copy(this.boardMesh.matrixWorld).invert();
  }

  private updateHover() {
    const {x, y} = this.rawGame.ruleSet.size;

    const [cameraPosOC, rayDirectionOC] = RayCast(
      this.mouse,
      this.camera.position,
      this.inverseProjectionMatrix,
      this.inverseViewMatrix,
      this.inverseModelMatrixBoard,
    );

    const distance = RayCastTorus(
      cameraPosOC,
      rayDirectionOC,
      new Vector2(this.radius, this.thickness),
    );

    // check if torus is hit
    if (distance < 0) {
      this.selectedField = undefined;
      return;
    }

    // now compute which field is hit with trigonometry... yeah!
    const hitPosOC = cameraPosOC.addScaledVector(rayDirectionOC, distance);

    let theta = Math.atan2(hitPosOC.y, hitPosOC.x);
    if (theta < 0) {
      theta += 2.0 * Math.PI;
    }

    // we have to roatate back
    const rotationMat = new Matrix4().makeRotationZ(-theta);
    hitPosOC.applyMatrix4(rotationMat);
    hitPosOC.x -= this.radius;

    // noinspection JSSuspiciousNameCombination
    let phi = Math.atan2(hitPosOC.x, hitPosOC.z);
    if (phi < 0) {
      phi += 2.0 * Math.PI;
    }

    // sub twist and renormalize
    phi -= this.twist;
    while (phi < 0) {
      phi += 2.0 * Math.PI;
    }
    while (phi > 2.0 * Math.PI) {
      phi -= 2.0 * Math.PI;
    }

    // calculate the indices on a 2d-array
    let i = Math.round(phi / (2.0 * Math.PI / x));
    let j = Math.round(theta / (2.0 * Math.PI / y));

    if (i === x) {
      i = 0;
    }
    if (j === y) {
      j = 0;
    }

    this.selectedField = new Vector2(i, j);
  }

  private updateUniforms() {
    const {x, y} = this.rawGame.ruleSet.size;

    this.camera.updateMatrixWorld(true);
    this.camera.updateProjectionMatrix();
    this.boardMesh.updateMatrixWorld(true);

    // Viewport, View and Projection matrix is the same for all objects
    const viewPort = new Vector2(this.canvas.width, this.canvas.height);

    // now just for the board
    const transposedInverseModelMatrixBoard = this.inverseModelMatrixBoard.clone().transpose();

    this.boardMaterial.uniforms.viewPort.value = viewPort;
    this.boardMaterial.uniforms.inverseViewMatrix.value = this.inverseViewMatrix;
    this.boardMaterial.uniforms.inverseProjectionMatrix.value = this.inverseProjectionMatrix;
    this.boardMaterial.uniforms.inverseModelMatrix.value = this.inverseModelMatrixBoard;
    this.boardMaterial.uniforms.transposedInverseModelMatrix.value = transposedInverseModelMatrixBoard;
    this.boardMaterial.uniforms.boardSizeX.value = x;
    this.boardMaterial.uniforms.boardSizeY.value = y;
    this.boardMaterial.uniforms.radius.value = this.radius;
    this.boardMaterial.uniforms.thickness.value = this.thickness;
    this.boardMaterial.uniforms.twist.value = this.twist;
    this.boardMaterial.uniforms.torusColor.value = this.colorBoard;

    // now for all the stones
    for (let i = 0; i < x * y; i++) {
      const mesh = this.stoneMeshArray[i];
      const material = this.stoneMaterialArray[i];
      const state = this.rawGame.board[i];

      mesh.updateMatrixWorld(true);

      const inverseModelMatrix = mesh.matrixWorld.clone().invert()
      const transposedInverseModelMatrix = inverseModelMatrix.clone().transpose();

      material.uniforms.viewPort.value = viewPort;
      material.uniforms.inverseViewMatrix.value = this.inverseViewMatrix;
      material.uniforms.inverseProjectionMatrix.value = this.inverseProjectionMatrix;
      material.uniforms.inverseModelMatrix.value = inverseModelMatrix;
      material.uniforms.transposedInverseModelMatrix.value = transposedInverseModelMatrix;

      if (this.partyMode) {
        switch (state) {
          case 0: {
            mesh.visible = false;
            break;
          }
          case 1: {
            mesh.visible = true;
            material.uniforms.stoneColor.value = violet;
            break;
          }
          case 2: {
            mesh.visible = true;
            material.uniforms.stoneColor.value = indigo;
            break;
          }
        }

      } else {
        switch (state) {
          case 0: {
            mesh.visible = false;
            break;
          }
          case EColor.Black: {
            mesh.visible = true;
            material.uniforms.stoneColor.value = this.colorStoneBlack;
            break;
          }
          case EColor.White: {
            mesh.visible = true;
            material.uniforms.stoneColor.value = this.colorStoneWhite;
            break;
          }
        }
      }

      if (this.allowInput && this.selectedField && i === this.selectedField.y + y * this.selectedField.x) {
        mesh.visible = true;
        material.uniforms.stoneColor.value = this.colorStoneHover;
      }
    }
  }

  // ---- clean up functions ----

  public cleanUp() {
    this.cleanUpStones();
    box222.dispose(); // this one kinda special
    this.cleanUpBoard();
  }

  private cleanUpBoard() {
    this.scene.remove(this.boardMesh);
    this.boardGeometry.dispose();
    this.boardMaterial.dispose();
  }

  private cleanUpStones() {
    for (const mesh of this.stoneMeshArray) {
      this.scene.remove(mesh);
    }
    for (const material of this.stoneMaterialArray) {
      material.dispose();
    }
    this.stoneMeshArray = [];
    this.stoneMaterialArray = [];
  }
}

export default ThreeAnimation;
