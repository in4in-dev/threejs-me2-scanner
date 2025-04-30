import * as THREE from 'three';
import ModelLoader from "../../Three/ModelLoader";
import Component from "../Core/Component";
import Random from "../../Three/Random";
import {AnimationMixer} from "three";

export default class Flag extends Component
{

	protected mesh : THREE.Object3D;

	private mixer : null | THREE.AnimationMixer = null;
	private clock : THREE.Clock;

	constructor() {

		super();

		this.mesh = this.createBody();
		this.clock = new THREE.Clock()

		//Добавляем на сцену
		this.add(this.mesh);

	}

	private createBody() : THREE.Object3D
	{

		let flag = new ModelLoader('../../assets/models/flag3/present_76_fan_low.fbx').loadInBackground(obj => {

			let mixer = new THREE.AnimationMixer(obj);

			if (obj.animations.length > 0) {

				let action = mixer.clipAction(obj.animations[0]);

				action.setLoop(THREE.LoopRepeat, Infinity);
				action.play();

			}

			this.mixer = mixer;

			return obj;

		});

		flag.scale.set(0.00004,0.00004,0.00004);
		flag.rotation.set(0, Math.PI / 2, 0);

		return flag;

	}

	public animate(){

		let delta = this.clock.getDelta();

		if (this.mixer){
			this.mixer.update(delta);
		}

	}

}