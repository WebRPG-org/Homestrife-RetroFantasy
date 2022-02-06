varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(){
	gl_FragColor = texture2D(uSampler, vTextureCoord);
	gl_FragColor.a = gl_FragColor.a == 0.0 ? 0.0 : 1.0;
}
