uniform sampler2D paletteTex;
uniform float hues;
uniform float brightLevels;
uniform float hueTarget;
uniform float hueOffset;
uniform float brightOffset;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(){
	vec4 inputColor = texture2D(uSampler, vTextureCoord);
	
	bool colorFound = false;
	vec2 paletteCoord = vec2(0.0, 0.0);
	float pIncX = 1.0 / (hues + 1.0);
	float pIncY = 1.0 / brightLevels;
	float pHalfIncX = pIncX / 2.0;
	float pHalfIncY = pIncY / 2.0;
	
	for(int y = 0; y < %%PALETTE_HEIGHT%%; y++) {
		paletteCoord.y = pIncY * float(y) + pHalfIncY;
		for(int x = 0; x < %%PALETTE_WIDTH%%; x++) {
			paletteCoord.x = pIncX * float(x) + pHalfIncX;
			vec4 paletteColor = texture2D(paletteTex, paletteCoord);
			if(inputColor.r == paletteColor.r && inputColor.g == paletteColor.g && inputColor.b == paletteColor.b) {
				colorFound = true;
				break;
			}
		}
		if(colorFound) {
			break;
		}
	}
	
	paletteCoord.y += brightOffset * pIncY;
	float brightMax = (brightLevels - 1.0) * pIncY + pHalfIncY;
	paletteCoord.y = paletteCoord.y < pHalfIncY ? pHalfIncY : (paletteCoord.y > brightMax ? brightMax : paletteCoord.y);
	gl_FragColor = texture2D(paletteTex, paletteCoord);
	gl_FragColor.a = inputColor.a == 0.0 ? 0.0 : 1.0;
}
