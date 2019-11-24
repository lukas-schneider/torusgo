import {
  OrthographicCamera,
  Color,
  Vector3,
  Vector2,
  DirectionalLight,
  PerspectiveCamera,
  Light,
  AxesHelper, PlaneGeometry, Mesh,
} from 'three';
import {IRawGame}        from '../../shared/gameLogic';
import AbstractAnimation from '../AbstractAnimation';
import Board             from './Board';
import Grid              from './Grid';
import Overlay           from './Overlay';
import Shader            from './Shader';


class TwoAnimation extends AbstractAnimation {
  /*
   * world space has domain [-a, a] for x (left to right) and [-b, b] for y (bottom to top),
   * where a and b are set so that the board is visible.
   *
   * one board field has the size of 1 (see unit)
   *
   * "board space" is offset to the bottom left so that the board's center is at (0, 0).
   * Thus, board position x, y has coordinates x, y in board space.
   *
   * grid, board and their children operate in board space, scene operates in world space
   */

  private orthographicCamera: OrthographicCamera;

  // size of a field in world space
  private unit: number;

  // mouse position in world space
  private mouse = new Vector2();

  private boardColor = new Color(0xFF6B00);

  private shaderMaterial: Shader;

  // ---- event handlers ----

  public handleResize(width: number, height: number) {
    // const padding = 500;
    //
    // const xUnit = (width - padding) / (this.rawGame.ruleSet.size.x * 2 + 1);
    // const yUnit = (height - padding) / (this.rawGame.ruleSet.size.y * 2 + 1);
    //
    // this.unit = Math.min(xUnit, yUnit);
    //
    // this.orthographicCamera.left = -width / this.unit / 2;
    // this.orthographicCamera.right = width / this.unit / 2;
    // this.orthographicCamera.top = height / this.unit / 2;
    // this.orthographicCamera.bottom = -height / this.unit / 2;
    //
    // this.orthographicCamera.updateProjectionMatrix();

    this.shaderMaterial.updateViewport(width, height);

  }

  public handleMouseMove(x: number, y: number) {
    this.mouse.x = x * this.canvas.width / this.unit / 2;
    this.mouse.y = y * this.canvas.height / this.unit / 2;
  }

  public handleGameStateChange(rawGame: IRawGame): void {
    if (rawGame.board !== this.rawGame.board) {
      this.shaderMaterial.updateBoard(rawGame.board);
    }

    if (rawGame.toMove !== this.rawGame.toMove) {

    }
    this.rawGame = rawGame;
  }

  // ---- init functions ----

  public init() {
    this.initCamera();

    this.shaderMaterial = new Shader(this.rawGame.ruleSet.size, this.rawGame.board);

    let geometry = new PlaneGeometry(200, 200, 1, 1);

    let mesh = new Mesh(geometry, this.shaderMaterial);

    this.scene.add(mesh);

    // this.scene.add(new AxesHelper(2));
  }

  private initCamera() {
    this.scene.add(this.orthographicCamera = new OrthographicCamera(
      -1, 1, 1, -1, -1, 1,
    ));

    this.camera = this.orthographicCamera;
  }

  // ---- animation functions ----

  public update(): void {

  }

  // ---- clean up functions ----

  public cleanUp() {

  }
}

export default TwoAnimation;