import {Mesh, Material, Matrix4, Color, SphereBufferGeometry} from 'three';

export default class Stone extends Mesh {

  static white = new Color(0xe6ffff);
  static black = new Color(0x1a0008);

  constructor(material: Material, x?: number, y?: number) {
    super(new SphereBufferGeometry(0.45, 32, 32), material);

    this.applyMatrix(new Matrix4().makeTranslation(x || 0, y || 0, 0));
    this.applyMatrix(new Matrix4().makeScale(1, 1, 0.5));
  }


}