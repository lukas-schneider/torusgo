import {Group, Material} from 'three';
import {ISize}           from '../../shared/gameLogic';
import Stone             from './Stone';

export default class MultiStone extends Group {
  public readonly x: number;
  public readonly y: number;
  public readonly size: ISize;

  private readonly material: Material;

  constructor(material: Material, size: ISize, x: number, y: number) {
    super();

    this.x = x;
    this.y = y;
    this.size = size;
    this.material = material;

    this.addStone(x + size.x, y + size.y);
    this.addStone(x, y + size.y);
    this.addStone(x - size.x, y + size.y);

    this.addStone(x + size.x, y);
    this.addStone(x, y); // real stone
    this.addStone(x - size.x, y);

    this.addStone(x + size.x, y - size.y);
    this.addStone(x, y - size.y);
    this.addStone(x - size.x, y - size.y);

    console.log(x, y);
  }

  private addStone(x: number, y: number) {
    const xHalf = Math.ceil(this.size.x / 2);
    const yHalf = Math.ceil(this.size.y / 2);

    // 0.5 is a safety margin
    if ((-xHalf - 0.5) < x && x < (this.size.x + xHalf - 0.5)
      && (-yHalf - 0.5) < y && y < (this.size.y + yHalf - 0.5)) {
      this.add(new Stone(this.material, x, y));
    }
  }

  public dispose() {
    for (let s of this.children) {
      (s as Stone).geometry.dispose();
    }
    this.remove(...this.children);
  }
}