import * as THREE from 'three';
import ModelLoader from "../../Three/ModelLoader";
import Component from "../Core/Component";
import Random from "../../Three/Random";

export default class Asteroid extends Component
{

	protected mesh : THREE.Object3D;

	constructor(texture : string, material : string) {

		super();

		this.mesh = this.createBody(texture, material);

		//Добавляем на сцену
		this.add(this.mesh);

	}

	private createBody(texture : string, material : string) : THREE.Object3D
	{

		let asteroid = new ModelLoader(texture, material).loadInBackground();

		let scale = Random.float(0.0001, 0.03);

		asteroid.scale.set(scale, scale, scale);

		asteroid.rotation.x = Math.PI * Random.float(-2, 2);
		asteroid.rotation.y = Math.PI * Random.float(-2, 2);
		asteroid.rotation.z = Math.PI * Random.float(-2, 2);

		return asteroid;

	}

}