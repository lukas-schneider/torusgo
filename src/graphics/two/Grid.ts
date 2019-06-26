import {
  Group,
  LineBasicMaterial,
  Line,
  Color,
  Material,
  BufferGeometry,
  Float32BufferAttribute,
}              from 'three';
import {ISize} from '../../shared/gameLogic';

export default class Grid extends Group {
  private readonly size: ISize;

  private readonly material: Material;

  private readonly lines: Line[] = [];

  constructor(size: ISize, color: Color) {
    super();
    this.size = size;
    this.material = new LineBasicMaterial({
      color: color,
      linewidth: 1.0,
    });

    const x = this.size.x;
    const y = this.size.y;

    const xMin = -Math.floor((x + 1) / 2);
    const xMax = x + Math.ceil(x / 2);

    const yMin = -Math.floor((y + 1) / 2);
    const yMax = y + Math.ceil(y / 2);

    for (let i = xMin; i < xMax; i++) {
      this.addLine(i, yMin - 0.5, i, yMax - 0.5);
    }

    for (let j = yMin; j < yMax; j++) {
      this.addLine(xMin - 0.5, j, xMax - 0.5, j);
    }

    this.add(...this.lines);
  }

  private addLine(x1: number, y1: number, x2: number, y2: number) {
    const geometry = new BufferGeometry();

    geometry.addAttribute('position', new Float32BufferAttribute([
      x1, y1, 0, // v1
      x2, y2, 0, // v2
    ], 3));

    this.lines.push(new Line(geometry, this.material));
  }

  public dispose() {
    for (let line of this.lines) {
      line.geometry.dispose();
    }

    this.material.dispose();
  }
}