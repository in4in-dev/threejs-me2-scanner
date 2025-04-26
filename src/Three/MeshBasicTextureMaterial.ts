import * as THREE from "three";

export default class MeshBasicTextureMaterial extends THREE.ShaderMaterial
{
	constructor(texture : THREE.Texture, brightness : number = 1, options : THREE.ShaderMaterialParameters = {}) {

		let vShader = `
			varying vec2 vUv;
			
			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`;

		let fShader = `
			uniform sampler2D uTexture;
			uniform float uBrightness;
			varying vec2 vUv;
			
			void main() {
				vec4 texColor = texture2D(uTexture, vUv);
				gl_FragColor = vec4(texColor.rgb * uBrightness, texColor.a);
			}
		`;

		super({
			uniforms: {
				uTexture: { value: texture },
				uBrightness: { value: brightness }
			},
			vertexShader: vShader,
			fragmentShader: fShader,
			...options
		});

	}

}

// export default function MeshBasicTextureMaterial(texture : THREE.Texture, brightness : number = 1)
// {
//
// 	let vShader = `
// 		varying vec2 vUv;
//
// 		void main() {
// 			vUv = uv;
// 			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
// 		}
//     `;
//
// 	let fShader = `
// 		uniform sampler2D uTexture;
// 		uniform float uBrightness;
// 		varying vec2 vUv;
//
// 		void main() {
// 			vec4 texColor = texture2D(uTexture, vUv);
// 			gl_FragColor = vec4(texColor.rgb * uBrightness, texColor.a);
// 		}
// 	`;
//
// 	return new THREE.ShaderMaterial({
// 		uniforms: {
// 			uTexture: { value: texture },
// 			uBrightness: { value: brightness }
// 		},
// 		vertexShader: vShader,
// 		fragmentShader: fShader,
// 		side: THREE.BackSide
// 	});
//
// }