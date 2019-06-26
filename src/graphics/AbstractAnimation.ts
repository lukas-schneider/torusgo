import {Scene, Vector2, Camera} from 'three';
import {IRawGame}               from '../shared/gameLogic';
import {EKeys}                  from './three/ThreeAnimation';

export default abstract class AbstractAnimation {
  public scene: Scene = new Scene();
  public camera: Camera = new Camera();
  public selectedField?: Vector2;

  public constructor(
    protected rawGame: IRawGame,
    protected canvas: HTMLCanvasElement,
    public allowInput: boolean,
  ) {
  }

  // ---- required APIs ----

  public abstract init(): void;

  public abstract update(): void;

  public abstract cleanUp(): void;

  public abstract handleGameStateChange(rawGame: IRawGame): void;

  public abstract handleResize(width: number, height: number): void;

  public abstract handleMouseMove(x: number, y: number): void;

  // ---- optional APIs ----

  public handleKeyStateChange(keyCode: EKeys, pressed: boolean): void {
  };

}