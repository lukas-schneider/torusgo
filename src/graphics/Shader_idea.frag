const float PI = 3.1415926535897932384626433832795;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    float field_size = 50.0 + 25.0 * cos(iTime);


    int boardState[9] = int[9](0,0,0,
                               1,1,0,
                               0,2,0);
    vec2 centered = fragCoord - iResolution.xy / 2.0;
    centered.y *= -1.0;
    vec2 normalized = centered / field_size;
    vec2 offset = mod(centered, field_size) - vec2(field_size/2.0);
    float mod_x = mod(normalized.x, 3.0);
    float mod_y = mod(normalized.y, 3.0);

    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    int u = int(mod_x);
    int v = int(mod_y);

    int state = boardState[u + v * 3];

    float offsetl = length(offset);
    float offsetln = offsetl / field_size / 2.0;
    if (state == 0 || offsetl > field_size/2.0 - field_size*0.05) {
       fragColor = vec4(1.0, 0.5, 0.0,1.0);
	   fragColor *= min(1.0, min(abs(offset.x),abs(offset.y)) / field_size * 20.0);
    } else {

      vec3 normal = vec3(offset.xy/field_size/2.0, cos(offsetln*2.0*PI));
      vec3 lightdir = vec3(1.0,1.0,-1.0);
      float lightfactor = pow(max(0.0,dot(-normal, lightdir)),3.0);
      if (state == 1) {
        fragColor = vec4(0.8,0.8,0.8,1.0)+0.2*vec4(1.0,1.0,1.0,1.0)*lightfactor;
      } else {
        fragColor = vec4(0.1,0.1,0.1,1.0)+0.5*vec4(1.0,1.0,1.0,1.0)*lightfactor;
      }
    }

}