uniform vec3 palette[%%PALETTE_ARRAY_SIZE%%];
uniform int hues;
uniform int brightLevels;
uniform int hueOffset;
uniform int brightOffset;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

vec3 getColorFromPalette(int id) {
    for (int i=0; i<%%PALETTE_ARRAY_SIZE%%; i++) {
        if (i == id) return palette[i];
    }
}

void main(){
	vec4 inputColor = texture2D(uSampler, vTextureCoord);
	if(brightOffset == 0 || (inputColor.r == 0.0 && inputColor.g == 0.0 && inputColor.b == 0.0)) {
		inputColor.a = 1.0;
		gl_FragColor = inputColor;
	} else {
		bool colorFound = false;
		int colorIndex = 0;
		for(int i = 0; i < %%PALETTE_ARRAY_SIZE%%; i++) {
			if(!colorFound && palette[i].r == inputColor.r && palette[i].g == inputColor.g && palette[i].b == inputColor.b) {
				colorIndex = i;
				colorFound = true;
			}
		}
		int totalHues = hues+1;
		int brightLevel = colorIndex / totalHues;
		int newBrightLevel = brightLevel + brightOffset;
		newBrightLevel = newBrightLevel > brightLevels - 1 ? brightLevels - 1 : (newBrightLevel < 0 ? 0 : newBrightLevel);
		int newIndex = newBrightLevel * totalHues + (colorIndex - (totalHues * brightLevel));
		vec3 newColor = getColorFromPalette(newIndex);
		gl_FragColor = vec4(newColor.r, newColor.g, newColor.b, 1.0);
	}
}
