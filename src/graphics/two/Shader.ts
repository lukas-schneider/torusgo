import {ShaderMaterial, DoubleSide, Uniform, Vector2, Matrix4, Vector3} from 'three';
import {ISize, TGameBoard}                                              from '../../shared/gameLogic';

const vertexShader = `

void main()
{
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
  
`;

function fragmentShader(size: ISize) {
   return `
   
   const float PI = 3.1415926535897932384626433832795;
   const int size_x = ${size.x};
   const int size_y = ${size.y};
   
uniform float field_size;
uniform int board_state[${size.x * size.y}]; 
uniform vec2 viewport;

void main()
{
    vec2 centered = gl_FragCoord.xy - viewport.xy / 2.0;
    centered.y *= -1.0;
    vec2 normalized = centered / field_size;
    vec2 offset = mod(centered, field_size) - vec2(field_size/2.0);
    float mod_x = mod(normalized.x, float(size_x));
    float mod_y = mod(normalized.y, float(size_y));

    int u = int(mod_x);
    int v = int(mod_y);

    int state;
    for (int k = 0; k < ${size.x * size.y}; ++k) {
      if (k == v + u * size_y) {
        state = board_state[k];
      }
     }

    float offsetl = length(offset);
    float offsetln = offsetl / field_size / 2.0;
    if (state == 0 || offsetl > field_size/2.0 - field_size*0.05) {
       gl_FragColor = vec4(1.0, 0.5, 0.0,1.0);
       gl_FragColor *= min(1.0, min(abs(offset.x),abs(offset.y)) / field_size * 20.0);
    } else {

      vec3 normal = vec3(offset.xy/field_size/2.0, cos(offsetln*2.0*PI));
      vec3 lightdir = vec3(1.0,1.0,-1.0);
      float lightfactor = pow(max(0.0,dot(-normal, lightdir)),3.0);
      if (state == 1) {
        gl_FragColor = vec4(0.8,0.8,0.8,1.0)+0.2*vec4(1.0,1.0,1.0,1.0)*lightfactor;
      } else {
        gl_FragColor = vec4(0.1,0.1,0.1,1.0)+0.5*vec4(1.0,1.0,1.0,1.0)*lightfactor;
      }
    }
    
    

}
`
}

export default class Shader extends ShaderMaterial {

  constructor(size: ISize, board: TGameBoard) {
    super({
      side: DoubleSide,
      uniforms: {
        viewport: new Uniform(new Vector2()),
        field_size: new Uniform(50),
        board_state: new Uniform(board),
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader(size),
    })
  }

  updateBoard(board: TGameBoard) {
    this.uniforms.board_state = new Uniform(board);
  }

  updateViewport(x: number, y: number) {
    this.uniforms.viewport = new Uniform(new Vector2(x, y));
  }
}