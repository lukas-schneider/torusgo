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
uniform float boardSizeX;
uniform float boardSizeY;
uniform float radius;
uniform float thickness;
uniform float twist;
uniform vec3  torusColor;

#extension GL_EXT_frag_depth : enable
#define PI 3.1415926535897932384626433832795
#define EPS 0.000000001

float iTorus( in vec3 ro, in vec3 rd, in vec2 torus )
{
	float Ra2 = torus.x*torus.x;
	float ra2 = torus.y*torus.y;
	
	float m = dot(ro,ro);
	float n = dot(ro,rd);
		
	float k = (m - ra2 - Ra2)/2.0;
	float a = n;
	float b = n*n + Ra2*rd.z*rd.z + k;
	float c = k*n + Ra2*ro.z*rd.z;
	float d = k*k + Ra2*ro.z*ro.z - Ra2*ra2;
	
    //----------------------------------

	float p = -3.0*a*a     + 2.0*b;
	float q =  2.0*a*a*a   - 2.0*a*b   + 2.0*c;
	float r = -3.0*a*a*a*a + 4.0*a*a*b - 8.0*a*c + 4.0*d;
	p /= 3.0;
	r /= 3.0;
	float Q = p*p + r;
	float R = 3.0*r*p - p*p*p - q*q;
	
	float h = R*R - Q*Q*Q;
	float z = 0.0;
	if( h < 0.0 )
	{
		float sQ = sqrt(Q);
		z = 2.0*sQ*cos( acos(R/(sQ*Q)) / 3.0 );
	}
	else
	{
		float sQ = pow( sqrt(h) + abs(R), 1.0/3.0 );
		z = sign(R)*abs( sQ + Q/sQ );

	}
	
	z = p - z;
	
    //----------------------------------
	
	float d1 = z   - 3.0*p;
	float d2 = z*z - 3.0*r;

	if( abs(d1)<1.0e-4 )
	{
		if( d2<0.0 ) return -1.0;
		d2 = sqrt(d2);
	}
	else
	{
		if( d1<0.0 ) return -1.0;
		d1 = sqrt( d1/2.0 );
		d2 = q/d1;
	}

    //----------------------------------
	
	float result = 1e20;

	h = d1*d1 - z + d2;
	if( h>0.0 )
	{
		h = sqrt(h);
		float t1 = -d1 - h - a;
		float t2 = -d1 + h - a;
		     if( t1>0.0 ) result=t1;
		else if( t2>0.0 ) result=t2;
	}

	h = d1*d1 - z - d2;
	if( h>0.0 )
	{
		h = sqrt(h);
		float t1 = d1 - h - a;
		float t2 = d1 + h - a;
		     if( t1>0.0 ) result=min(result,t1);
		else if( t2>0.0 ) result=min(result,t2);
	}

  
	return result;
}

float sdTorus(in vec3 p, in vec2 t)
{
  vec2 q = vec2(length(p.xy)-t.x,p.z);
  return length(q)-t.y;
}

vec3 nTorus( in vec3 pos, in vec2 tor )
{
  return normalize( pos*(dot(pos,pos)- tor.y*tor.y - tor.x*tor.x*vec3(1.0,1.0,-1.0)));
}

float with_polish(in vec3 ro, in vec3 rd, in vec2 torus)
{
  float t = iTorus(ro, rd, torus);

  if (t < 0.0 || t > 100.0) {discard;}

  for (int i = 0; i < 10; i ++)
  {
    vec3 p = ro + rd*t;
    vec3 n = nTorus(p, torus);
    float d = sdTorus(p, torus);
    t -= dot(rd, n)*d;
  }

  return t;
}

mat3 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
              oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
              oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c         );
}

float atan2(in float y, in float x)
{
 return x == 0.0 ? sign(y)*PI/2.0 : atan(y, x);
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
	vec2 torus = vec2(radius, thickness);
  float t_oc = with_polish(camera_oc.xyz, ray_oc.xyz, torus);
  float t_wc = t_oc*length(modelMatrix*ray_oc);

	// lighting
	vec3 col = torusColor;
	vec3 pos_oc = camera_oc.xyz + t_oc*ray_oc.xyz;
	vec4 nor_oc = vec4(nTorus( pos_oc, torus ), 0.0);
	vec4 nor_wc = vec4(normalize((transposedInverseModelMatrix * nor_oc).xyz),0.0);
	float dif = clamp( dot(-nor_wc,ray_wc), 0.0, 1.0 );
	float amb = 0.5;
	col *= amb + dif;

	// lines
	float theta = atan2(pos_oc.y, pos_oc.x);
	mat3 rotMat = rotationMatrix(vec3(0.0,0.0,1.0), theta);
	vec3 pos_oc_rot = rotMat * pos_oc - vec3(torus.x,0.0,0.0);
	
	float mod_x_pos = mod(+atan2(pos_oc.y, pos_oc.x), 2.0*PI/boardSizeY);
	float mod_x_neg = mod(-atan2(pos_oc.y, pos_oc.x), 2.0*PI/boardSizeY);
	float mod_y_pos = mod(-twist+atan2(pos_oc_rot.x, pos_oc_rot.z), 2.0*PI/boardSizeX);
	float mod_y_neg = mod(+twist-atan2(pos_oc_rot.x, pos_oc_rot.z), 2.0*PI/boardSizeX);
	col *= pow(abs(mod_x_pos * mod_x_neg * mod_y_pos * mod_y_neg), 0.1);	
	
	gl_FragColor = vec4( col, 1.0 );

  gl_FragDepthEXT = t_wc/10.0;
}

`;

export default class TorusMaterialBoard extends ShaderMaterial {
  constructor() {
    const parameters = {
      side: DoubleSide,
      uniforms: {
        viewPort: new Uniform(new Vector2()),
        inverseViewMatrix: new Uniform(new Matrix4()),
        inverseProjectionMatrix: new Uniform(new Matrix4()),
        inverseModelMatrix: new Uniform(new Matrix4()),
        transposedInverseModelMatrix: new Uniform(new Matrix4()),
        boardSizeX: new Uniform(9),
        boardSizeY: new Uniform(9),
        radius: new Uniform(1),
        thickness: new Uniform(0.5),
        twist: new Uniform(0),
        torusColor: new Uniform(new Vector3(1, 1, 1)),
      },
      vertexShader: vertexShader.concat(),
      fragmentShader: fragmentShader.concat(),
    };
    super(parameters);
  }
}
