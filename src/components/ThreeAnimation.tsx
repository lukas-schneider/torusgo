import {createStyles, WithStyles, withStyles} from '@material-ui/core';
import {boundMethod}                          from 'autobind-decorator';
import * as React                             from 'react';
import Stats                                  from 'stats.js';
import {
  BoxGeometry,
  Color,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
}                                             from 'three';
import RayCast                                from '../ThreeGraphic/RayCast';
import RayCastTorus                           from '../ThreeGraphic/RayCastTorus';
import TorusMaterialBoard                     from '../ThreeGraphic/TorusMaterialBoard';
import TorusMaterialStone                     from '../ThreeGraphic/TorusMaterialStone';
import {EColor, IRawGame}                     from '../types/game';
import {contains, EKeys, sign, TKeyState}     from '../types/utils';

// colors are const
const colorClear = new Color(0x4286f4);
const colorBoard = new Color(0xFF6B00);
const colorStoneWhite = new Color(0xe6ffff);
const colorStoneBlack = new Color(0x1a0008);
const colorStoneHover = new Color(0xFFD700);

// rainbow!
const violet = new Color(0x9400D4);
const indigo = new Color(0x4B0082);
const blue = new Color(0x0000FF);
const green = new Color(0x00FF00);
const yellow = new Color(0xFFFF00);
const orange = new Color(0xFF7F00);
const red = new Color(0xFF0000);

const box222 = new BoxGeometry(2, 2, 2);

interface IProps {
  rawGame: IRawGame,
  onHover?: (x?: number, y?: number) => void,
  onClick?: (x: number, y: number) => void,
}

const styles = createStyles({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

class ThreeAnimation extends React.Component<IProps & WithStyles<typeof styles>> {
  private canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private scene: Scene;
  private requestId: number; // given by requestAnimationFrame

  private camera: PerspectiveCamera;
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

  // result of the CPU sided raytracing, i.e. field that is mouseovered
  private focusedField?: Vector2;

  private stats: Stats;

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

  // ---- lifecycle methods ----

  public componentDidMount() {
    this.init();

    window.addEventListener('resize', this.handleResize);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('click', this.handleMouseClick);
    this.canvas.addEventListener('keydown', this.handleKeyDown);
    this.canvas.addEventListener('keyup', this.handleKeyUp);
  }

  public componentDidUpdate(prevProps: IProps) {
    if (this.props.rawGame.ruleSet.size.x !== prevProps.rawGame.ruleSet.size.x
      || this.props.rawGame.ruleSet.size.y !== prevProps.rawGame.ruleSet.size.y) {
      this.cleanUpStones();

      this.initThickness();
      this.initStones();
    }
  }

  public componentWillUnmount() {
    this.cleanUp();

    window.removeEventListener('resize', this.handleResize);

    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('click', this.handleMouseClick);
    this.canvas.removeEventListener('keydown', this.handleKeyDown);
    this.canvas.removeEventListener('keyup', this.handleKeyUp);
  }

  public render() {
    const {classes} = this.props;
    return <canvas className={classes.root}
                   tabIndex={0}
                   width={'100%'}
                   height={'100%'}
                   ref={(canvas) => this.canvas = canvas!}/>;
  }


  // ---- event handlers ----

  @boundMethod
  private handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  @boundMethod
  private handleMouseMove(event: MouseEvent) {
    const offsetX = event.clientX;
    const offsetY = event.clientY;

    if (offsetX > 0 && offsetX < this.canvas.width
      && offsetY > 0 && offsetY < this.canvas.height) {
      this.mouse.x = 2.0 * (offsetX) / this.canvas.width - 1.0;
      this.mouse.y = -2.0 * (offsetY) / this.canvas.height + 1.0;
    }
  }

  @boundMethod
  private handleMouseClick() {
    this.triggerClick();
  }

  @boundMethod
  private handleKeyDown(event: KeyboardEvent) {
    if (contains(EKeys, event.code)) {
      this.updateKeyState(event.code as EKeys, true);
    }
  }

  @boundMethod
  private handleKeyUp(event: KeyboardEvent) {
    if (contains(EKeys, event.code)) {
      this.updateKeyState(event.code as EKeys, false);
    }
  }

  private updateKeyState(keyCode: EKeys, pressed: boolean) {
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

  // ---- event triggers ----

  private triggerHover() {
    if (this.focusedField) {
      this.props.onHover && this.props.onHover(this.focusedField.x, this.focusedField.y);
    } else {
      this.props.onHover && this.props.onHover();
    }
  }

  private triggerClick() {
    if (!this.focusedField) return;

    this.props.onClick && this.props.onClick(this.focusedField.x, this.focusedField.y);
  }

  // ---- init functions ----

  private init() {
    this.scene = new Scene();

    this.initThickness();

    this.initRenderer();
    this.initCamera();

    this.handleResize();

    this.initTwist();
    this.initMouse();
    this.initStones();
    this.initBoard();

    this.initStats();

    this.animate();
  }

  private initThickness() {
    this.thickness = this.props.rawGame.ruleSet.size.x / this.props.rawGame.ruleSet.size.y / 2;
  }

  private initRenderer() {
    this.renderer = new WebGLRenderer({canvas: this.canvas});

    this.renderer.getContext().getExtension('EXT_frag_depth');
    let supportedExtensions = this.renderer.getContext().getSupportedExtensions();
    if (supportedExtensions == null) {
      supportedExtensions = [];
    }
    if (-1 === supportedExtensions.indexOf('EXT_frag_depth')) {
      alert('EXT_frag_depth extension not supported! 3D view not available!');
    }
    this.renderer.setClearColor(colorClear, 1);
  }

  private initTwist() {
    this.twist = 0;
  }

  private initMouse() {
    this.mouse = new Vector2();
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

  private initStones() {
    this.stoneMaterialArray = [];
    this.stoneMeshArray = [];
    for (let i = 0; i < this.props.rawGame.ruleSet.size.x; i++) {
      for (let j = 0; j < this.props.rawGame.ruleSet.size.y; j++) {
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

  private initStats() {
    this.stats = new Stats();
    this.stats.dom.style.cssText = 'position:absolute;left:0;cursor:pointer;opacity:0.9;z-index:10000;';
    this.canvas.parentElement!.insertBefore(this.stats.dom, this.canvas);

    this.stats.showPanel(0);
  }

  // ---- animation functions ----

  @boundMethod
  private animate() {
    this.requestId = requestAnimationFrame(this.animate);

    this.stats.begin();

    this.updateStoneTransforms();
    this.updateTwistKeyboard();
    this.updateCameraTrackballKeyboard();

    this.updateRayCastingMatrices();

    const previousFocusField = this.focusedField;

    this.updateHover();
    if (this.focusedField !== previousFocusField) {
      this.triggerHover();
    }

    this.updateUniforms();

    this.renderer.render(this.scene, this.camera);

    this.stats.end();
  }

  private updateStoneTransforms() {
    const x = this.props.rawGame.ruleSet.size.x;
    const y = this.props.rawGame.ruleSet.size.y;

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
    this.inverseProjectionMatrix = new Matrix4().getInverse(this.camera.projectionMatrix);
    this.inverseModelMatrixBoard = new Matrix4().getInverse(this.boardMesh.matrixWorld);
  }

  private updateHover() {
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
      this.focusedField = undefined;
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
    let i = Math.round(phi / (2.0 * Math.PI / this.props.rawGame.ruleSet.size.x));
    let j = Math.round(theta / (2.0 * Math.PI / this.props.rawGame.ruleSet.size.y));

    if (i === this.props.rawGame.ruleSet.size.x) {
      i = 0;
    }
    if (j === this.props.rawGame.ruleSet.size.y) {
      j = 0;
    }

    this.focusedField = new Vector2(i, j);
  }

  private updateUniforms() {
    const x = this.props.rawGame.ruleSet.size.x;
    const y = this.props.rawGame.ruleSet.size.y;

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
    this.boardMaterial.uniforms.torusColor.value = colorBoard;

    // now for all the stones
    for (let i = 0; i < x * y; i++) {
      const mesh = this.stoneMeshArray[i];
      const material = this.stoneMaterialArray[i];
      const state = this.props.rawGame.board[i];

      mesh.updateMatrixWorld(true);

      const inverseModelMatrix = new Matrix4().getInverse(mesh.matrixWorld);
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
          case 3: {
            mesh.visible = true;
            material.uniforms.stoneColor.value = blue;
            break;
          }
          case 4: {
            mesh.visible = true;
            material.uniforms.stoneColor.value = green;
            break;
          }
          case 5: {
            mesh.visible = true;
            material.uniforms.stoneColor.value = yellow;
            break;
          }
          case 6: {
            mesh.visible = true;
            material.uniforms.stoneColor.value = orange;
            break;
          }
          case 7: {
            mesh.visible = true;
            material.uniforms.stoneColor.value = red;
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
            material.uniforms.stoneColor.value = colorStoneBlack;
            break;
          }
          case EColor.White: {
            mesh.visible = true;
            material.uniforms.stoneColor.value = colorStoneWhite;
            break;
          }
        }
      }

      if (this.focusedField && i === this.focusedField.y + y * this.focusedField.x) {
        mesh.visible = true;
        material.uniforms.stoneColor.value = colorStoneHover;
      }
    }
  }

  // ---- clean up functions ----

  private cleanUp() {
    this.renderer.dispose();
    this.cleanUpStones();
    box222.dispose(); // this one kinda special
    this.cleanUpBoard();

    this.cleanUpStats();

    cancelAnimationFrame(this.requestId);
  }

  private cleanUpBoard() {
    this.scene.remove(this.boardMesh);
    this.boardGeometry.dispose();
    this.boardMaterial.dispose();
  }

  private cleanUpStats() {
    this.stats.dom.remove();
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

export default withStyles(styles)(ThreeAnimation);
