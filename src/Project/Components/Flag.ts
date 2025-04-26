import * as THREE from 'three';
import ModelLoader from "../../Three/ModelLoader";
import Component from "../Core/Component";
import Random from "../../Three/Random";

export default class Flag extends Component
{

	protected mesh : THREE.Object3D;

	constructor() {

		super();

		this.mesh = this.createBody();

		//Добавляем на сцену
		this.add(this.mesh);

	}

	private createBody() : THREE.Object3D
	{

		let flag = new ModelLoader('../../assets/models/flag/flag.obj', '../../assets/models/flag/flag.mtl').loadInBackground();

		this.scale.set(0.0015,0.0015,0.0015);

		return flag;

	}

}