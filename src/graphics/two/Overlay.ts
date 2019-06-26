import {Group, MeshBasicMaterial, Mesh, Shape, ShapeBufferGeometry} from 'three';
import {ISize}                                                      from '../../shared/gameLogic';

export default class Overlay extends Group {
  private readonly size: ISize;

  private readonly material = new MeshBasicMaterial({
    transparent: true,
    opacity: 0.2,
    color: 0xFF6B00,
  });

  private readonly mesh: Mesh;

  constructor(size: ISize) {
    super();
    this.size = size;
    const {x, y} = size;

    const shape = new Shape();

    shape.moveTo(-0.5, -0.5);
    shape.lineTo(x - 0.5, -0.5);
    shape.lineTo(x - 0.5, y - 0.5);
    shape.lineTo(-0.5, y - 0.5);
    shape.lineTo(-0.5, -0.5);

    this.add(this.mesh = new Mesh(new ShapeBufferGeometry(shape), this.material));
  }

  public dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}