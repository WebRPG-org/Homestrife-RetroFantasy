uniform sampler2D paletteTex;
uniform float hues;
uniform float brightLevels;
uniform float hueTarget;
uniform float hueOffset;
uniform float brightOffset;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(){
	gl_FragColor = texture2D(uSampler, vTextureCoord);
	gl_FragColor.a = inputColor.a == 0.0 ? 0.0 : 1.0;
}
