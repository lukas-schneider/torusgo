import {
  OrthographicCamera,
  Color,
  Vector3,
  Vector2,
  DirectionalLight,
  PerspectiveCamera,
  Light,
  AxesHelper,
}                        from 'three';
import {IRawGame}        from '../../shared/gameLogic';
import AbstractAnimation from '../AbstractAnimation';
import Board             from './Board';
import Grid              from './Grid';
import Overlay           from './Overlay';


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
  private perspectiveCamera: PerspectiveCamera;

  private light: Light;

  // size of a field in world space
  private unit: number;

  // mouse position in world space
  private mouse = new Vector2();

  // offset of the bottom left board corner from the origin
  private offset: Vector2;

  // draws the board's stones and the hover indicator stone
  private board: Board;

  private overlay: Overlay;

  // draws the board's grid
  private grid: Grid;

  private boardColor = new Color(0xFF6B00);

  // ---- event handlers ----

  public handleResize(width: number, height: number) {
    const padding = 100;

    const xUnit = (width - padding) / (this.rawGame.ruleSet.size.x * 2 + 1);
    const yUnit = (height - padding) / (this.rawGame.ruleSet.size.y * 2 + 1);

    this.unit = Math.min(xUnit, yUnit);

    this.orthographicCamera.left = -width / this.unit / 2;
    this.orthographicCamera.right = width / this.unit / 2;
    this.orthographicCamera.top = height / this.unit / 2;
    this.orthographicCamera.bottom = -height / this.unit / 2;

    this.orthographicCamera.updateProjectionMatrix();

    this.perspectiveCamera.aspect = width / height;
    this.perspectiveCamera.updateProjectionMatrix();
  }

  public handleMouseMove(x: number, y: number) {
    this.mouse.x = x * this.canvas.width / this.unit / 2;
    this.mouse.y = y * this.canvas.height / this.unit / 2;
  }

  public handleGameStateChange(rawGame: IRawGame): void {
    if (rawGame.board !== this.rawGame.board) {
      this.board.setBoard(rawGame.board);
    }

    if (rawGame.toMove !== this.rawGame.toMove) {
      this.board.setHoverColor(rawGame.toMove);
    }
    this.rawGame = rawGame;
  }

  // ---- init functions ----

  public init() {
    this.initCamera();
    this.initLight();
    this.initBoard();
    this.scene.add(new AxesHelper(2));
  }

  private initCamera() {
    this.scene.add(this.orthographicCamera = new OrthographicCamera(
      -1, 1, 1, -1, 50, 0,
    ));

    this.scene.add(this.perspectiveCamera = new PerspectiveCamera(
      40, 1, 100, 0,
    ));

    this.perspectiveCamera.position.set(0, 30, 15);
    this.perspectiveCamera.up.set(0, 0, 1);
    this.perspectiveCamera.lookAt(new Vector3(0, 0, 0));

    this.camera = this.orthographicCamera;
  }

  private initLight() {
    this.scene.add(this.light = new DirectionalLight(0xffffff, 1));

    this.light.position.set(0, 0, 1);

    this.light.updateMatrix();
  }

  private initBoard() {
    const size = this.rawGame.ruleSet.size;
    this.offset = new Vector2(
      -(size.x - 1) / 2,
      -(size.y - 1) / 2,
    );

    this.scene.add(this.grid = new Grid(size, new Color(this.boardColor)));
    this.grid.position.set(this.offset.x, this.offset.y, 0);

    this.scene.add(this.board = new Board(size, this.rawGame.board));
    this.board.position.set(this.offset.x, this.offset.y, -0.25);
    this.board.setHoverColor(this.rawGame.toMove);

    this.scene.add(this.overlay = new Overlay(size));
    this.overlay.position.set(this.offset.x, this.offset.y, 0);
  }

  // ---- animation functions ----

  public update(): void {
    this.selectedField = this.board.updateHover(
      new Vector2().subVectors(this.mouse, this.offset),
      this.allowInput,
    );
  }

  // ---- clean up functions ----

  public cleanUp() {
    this.grid.dispose();
    this.board.dispose();
    this.overlay.dispose();
  }
}

export default TwoAnimation;