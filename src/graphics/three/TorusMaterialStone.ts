import {DoubleSide, Matrix4, ShaderMaterial, Uniform, Vector2, Vector3} from 'three';

const vertexShader = `

void main()
{
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
  
`;

const fragmentShader = `
// these are supplied by three js
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;

// these are custom
uniform vec2 viewPort;
uniform mat4 inverseViewMatrix;
uniform mat4 inverseProjectionMatrix;
uniform mat4 inverseModelMatrix;
uniform mat4 transposedInverseModelMatrix;
uniform vec3 stoneColor;
uniform float alpha;


float iSphere(in vec3 ro, in vec3 rd) {
  float b = 2.0 * dot(ro, rd);
  float c = dot(ro, ro) - 1.0;
  float under_root = b*b - 4.0 * c;
  if (under_root < 0.0) {discard;}
  return (-b-sqrt(under_root))/2.0;
}

void main() {
  // set up in world coords
  vec4 camera_wc   = inverseViewMatrix * vec4(0.0,0.0,0.0,1.0);
  vec4 imgplane_wc = inverseViewMatrix * inverseProjectionMatrix
    * vec4((2.0*gl_FragCoord.xy - viewPort)/viewPort,1.0,1.0);
  imgplane_wc /= imgplane_wc.w;
  vec4 ray_wc = normalize(imgplane_wc - camera_wc);
    
  // set up in object coords
  vec4 camera_oc   = inverseModelMatrix * camera_wc;
  vec4 imgplane_oc = inverseModelMatrix * imgplane_wc;
  vec4 ray_oc = normalize(imgplane_oc - camera_oc);

	// getting correct distance (and discard non-intersects)
  float t_oc = iSphere(camera_oc.xyz, ray_oc.xyz);
  float t_wc = t_oc*length(modelMatrix*ray_oc);
  
	// lighting
	vec3 col = stoneColor;
	vec4 nor_oc = normalize(vec4(camera_oc.xyz + t_oc*ray_oc.xyz, 0.0));
	vec4 nor_wc = vec4(normalize((transposedInverseModelMatrix * nor_oc).xyz), 0.0);
	
	float angle_to_eye = dot(-ray_wc, nor_wc);
	
	float dif = angle_to_eye;
	float amb = 0.1;
	col *= amb + dif;
	
	// specular highlights
	col += 0.3*vec3(1.0,1.0,1.0) * pow(angle_to_eye, 10.0);
	col += 0.3*vec3(1.0,1.0,1.0) * pow(angle_to_eye, 100.0);
  
	gl_FragColor = vec4( col, alpha );

  gl_FragDepthEXT = t_wc/10.0;
}

`;

export default class TorusMaterialStone extends ShaderMaterial {
  constructor() {
    const parameters = {
      side: DoubleSide,
      uniforms: {
        viewPort: new Uniform(new Vector2()),
        inverseViewMatrix: new Uniform(new Matrix4()),
        inverseProjectionMatrix: new Uniform(new Matrix4()),
        inverseModelMatrix: new Uniform(new Matrix4()),
        transposedInverseModelMatrix: new Uniform(new Matrix4()),
        stoneColor: new Uniform(new Vector3(1, 1, 1)),
        alpha: new Uniform( 1.0),
      },
      vertexShader: vertexShader.concat(),
      fragmentShader: fragmentShader.concat(),
    };
    super(parameters);
  }
}
