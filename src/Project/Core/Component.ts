import * as THREE from 'three';

export default abstract class Component extends THREE.Group
{


	public whoNearest(objects : THREE.Object3D[], maxDistance : number = Infinity) : THREE.Object3D | null
	{

		let target = null, targetDistance = Infinity;

		for(let i = 0; i < objects.length; i++){

			let object = objects[i];

			let distance = this.position.distanceTo(object.position);

			if(
				distance <= maxDistance &&
				(!target || targetDistance > distance)
			){
				target = object;
				targetDistance = distance;
			}

		}

		return target;

	}

}