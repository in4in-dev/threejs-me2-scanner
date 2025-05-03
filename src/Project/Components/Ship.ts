import * as THREE from 'three';
import {Vector3} from 'three';
import Component from "../Core/Component";

export default class Ship extends Component
{

	public speed : number;

	constructor(speed : number = 0.1) {

		super();

		this.speed = speed;

	}

	public setSpeed(speed : number){
		this.speed = speed;
	}

	public rotateTo(cords : Vector3){

		let direction = new THREE.Vector3().subVectors(cords, this.position);

		// Вычислить угол поворота
		let angle = Math.atan2(direction.y, direction.x);

		this.rotation.z = angle + Math.PI / 2;

	}

	public moveTo(cords : Vector3){

		cords = cords.clone().setZ(0);

		let direction = new THREE.Vector3().subVectors(cords, this.position);

		if (direction.length() > 0.1) {

			direction.normalize();

			this.position.add(
				direction.multiplyScalar(this.speed)
			);

			this.rotateTo(cords);

		}

	}

}