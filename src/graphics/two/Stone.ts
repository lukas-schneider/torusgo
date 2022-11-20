import {Mesh, Material, Matrix4, Color, SphereGeometry} from 'three';

export default class Stone extends Mesh {

  static white = new Color(0xe6ffff);
  static black = new Color(0x1a0008);

  constructor(material: Material, x?: number, y?: number) {
    super(new SphereGeometry(0.45, 32, 32), material);

    this.applyMatrix4(new Matrix4().makeTranslation(x || 0, y || 0, 0));
    this.applyMatrix4(new Matrix4().makeScale(1, 1, 0.5));
  }


}
