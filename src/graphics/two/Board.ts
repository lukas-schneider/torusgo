import {Group, MeshPhongMaterial, Vector2}             from 'three';
import {TGameBoard, ISize, EColor, indexToX, indexToY} from '../../shared/gameLogic';
import MultiStone                                      from './MultiStone';
import Stone                                           from './Stone';

export default class Board extends Group {
  private readonly solidMaterial = {
    [EColor.White]: new MeshPhongMaterial({
      color: 0xe6ffff,
      shininess: 50,
    }),
    [EColor.Black]: new MeshPhongMaterial({
      color: 0x0a0008,
      shininess: 50,
    }),
  };

  private readonly transparentMaterial = {
    [EColor.White]: new MeshPhongMaterial({
      color: 0xe6ffff,
      shininess: 50,
      transparent: true,
      opacity: 0.4,
    }),
    [EColor.Black]: new MeshPhongMaterial({
      color: 0x0a0008,
      shininess: 50,
      transparent: true,
      opacity: 0.4,
    }),
  };

  private readonly size: ISize;

  private board: TGameBoard;

  private readonly stones: (MultiStone | null)[];

  public readonly hoverStone: Stone;

  constructor(size: ISize, board?: TGameBoard) {
    super();
    this.size = size;
    this.stones = new Array(size.x * size.y).fill(null);
    this.board = new Array(size.x * size.y).fill(0);

    board && this.setBoard(board);

    this.add(this.hoverStone = new Stone(this.transparentMaterial[EColor.Black]));
    this.hoverStone.visible = false;
  }

  public setBoard(board: TGameBoard) {
    for (let i = 0; i < board.length; i++) {
      if (board[i] === this.board[i]) continue;

      if (this.stones[i]) {
        this.removeMultiStone(i);
      }

      if (board[i] !== 0) {
        this.addMultiStone(board[i], i);
      }
    }

    this.board = board;
  }

  public setHoverColor(color: EColor) {
    this.hoverStone.material = this.transparentMaterial[color];
  }

  private addMultiStone(color: EColor, index: number) {
    const stone = new MultiStone(
      this.solidMaterial[color],
      this.size,
      indexToX(this.size, index),
      indexToY(this.size, index),
    );

    this.stones[index] = stone;

    this.add(stone);
  }

  private removeMultiStone(index: number) {
    const stone = this.stones[index];
    if (!stone) return;

    stone.dispose();
    this.remove(stone);
    this.stones[index] = null;
  }

  public updateHover(mouse: Vector2, visible: boolean) {
    const x = Math.round(mouse.x);
    // noinspection JSSuspiciousNameCombination
    const y = Math.round(mouse.y);

    if (x < 0 || x >= this.size.x || y < 0 || y >= this.size.y) {
      this.hoverStone.visible = false;
      return;
    }

    this.hoverStone.position.x = x;
    this.hoverStone.position.y = y;
    this.hoverStone.visible = visible;

    return new Vector2(x, y);
  }

  public dispose() {
    this.hoverStone.geometry.dispose();

    this.solidMaterial[EColor.Black].dispose();
    this.solidMaterial[EColor.White].dispose();
    this.transparentMaterial[EColor.Black].dispose();
    this.transparentMaterial[EColor.White].dispose();
  }
}