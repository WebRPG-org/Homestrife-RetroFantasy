uniform vec3 palette[%%PALETTE_ARRAY_SIZE%%];

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(){
	vec4 inputColor = texture2D(uSampler, vTextureCoord);
	vec4 outputColor = inputColor;
	float outputColorDistance = -1.0;
	bool matchNotFound = true;
	for(int i = 0; i < %%PALETTE_ARRAY_SIZE%%; i++) {
		if(matchNotFound && palette[i].r == inputColor.r && palette[i].g == inputColor.g && palette[i].b == inputColor.b) {
			outputColor = inputColor;
			matchNotFound = false;
		}
		if(matchNotFound) {
			float newColorDistance = sqrt(pow(palette[i].r - inputColor.r, 2.0) + pow(palette[i].g - inputColor.g, 2.0) + pow(palette[i].b - inputColor.b, 2.0));
			if(outputColorDistance == -1.0 || newColorDistance < outputColorDistance) {
				outputColorDistance = newColorDistance;
				outputColor.r = palette[i].r;
				outputColor.g = palette[i].g;
				outputColor.b = palette[i].b;
			}
		}
	}
	outputColor.a = 1.0;
	gl_FragColor = outputColor;
}