import * as THREE from 'three';
import ModelLoader from "../../Three/ModelLoader";
import Component from "../Core/Component";

export default class Flag extends Component
{

	protected mesh : THREE.Object3D;
	protected glow : THREE.Sprite;

	constructor() {

		super();

		this.mesh = this.createBody();
		this.glow = this.createGlow();

		this.add(this.mesh, this.glow);

	}

	private createGlow() : THREE.Sprite
	{
		let glowSprite = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: new THREE.TextureLoader().load('/assets/glow.png'),
				color: '#e53636',
				transparent: true,
				blending: THREE.AdditiveBlending,
				depthWrite:false,
				opacity : 0.5
			})
		);

		glowSprite.scale.set(0.1, 0.1, 0.1);
		glowSprite.position.set(0, 0.08, 0);

		return glowSprite;
	}

	private createBody() : THREE.Object3D
	{

		let flag = new ModelLoader('/assets/models/flag3/present_76_fan_low.fbx').loadInBackground();

		flag.scale.set(0.00004,0.00004,0.00004);
		flag.rotation.set(0, Math.PI / 2, 0);

		return flag;

	}

	public animate(){


	}

}