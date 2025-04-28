import Component from "../Core/Component";
import {Vector3} from "three";
import * as THREE from 'three';

export default class Probe extends Component
{

	public animationCompleted : boolean = false;
	public landed : boolean = false;

	protected progress : number = 0;
	protected curve : THREE.QuadraticBezierCurve3;
	protected tailLength : number = 120;
	protected tailPoints : THREE.Vector3[] = [];

	protected mesh : THREE.Mesh;
	protected tail : THREE.Group | null = null;

	protected landedCallback : () => void;
	protected destroyedCallback : () => void;

	public constructor(from : Vector3, to : Vector3, landedCallback : () => void, destroyedCallback : () => void = () => {}){

		super();

		// let mid = from.clone().lerp(to, 0.5);
		// mid.y += 2;

		let toNormal = to.clone().normalize();
		let mid = to.clone().add(toNormal.clone().multiplyScalar(1 * 0.5));

		this.curve = new THREE.QuadraticBezierCurve3(from, mid, to);

		this.mesh = new THREE.Mesh(
			new THREE.SphereGeometry(0.005, 8, 8),
			new THREE.MeshBasicMaterial({ color: 0xffffff })
		);

		this.landedCallback = landedCallback;
		this.destroyedCallback = destroyedCallback;

		this.add(this.mesh);

	}

	public animate(){

		if(this.animationCompleted){
			return;
		}

		if (!this.landed){

			// движение по кривой
			if(this.progress >= 0.85){
				this.progress += 0.0015;
			}else{
				this.progress += 0.003;
			}

			if (this.progress >= 1) {
				this.progress = 1;
				this.landed = true;

				this.remove(this.mesh);

				this.landedCallback();

			}else{

				let pos = this.curve.getPoint(this.progress);
				this.mesh.position.copy(pos);

				this.tailPoints.push(
					pos.clone()
				);

			}

		}


		if (this.tailPoints.length > this.tailLength || this.landed){
			this.tailPoints.shift();

			if(this.tailPoints.length < 1 && this.landed){
				this.animationCompleted = true;
				this.destroyedCallback();
			}
		}

		// удалить старый хвост
		if (this.tail) {
			this.remove(this.tail);
		}

		// отрисовка хвоста как набора линий с разной прозрачностью
		let group = new THREE.Group();
		for (let i = 1; i < this.tailPoints.length; i++) {

			let start = this.tailPoints[i - 1];
			let end = this.tailPoints[i];

			let dir = new THREE.Vector3().subVectors(end, start);
			let length = dir.length();

			let geometry = new THREE.CylinderGeometry(0.004, 0.004, length, 8); // 0.01 — радиус (толщину можешь увеличить)

			let opacity = i / this.tailPoints.length;

			let material = new THREE.MeshBasicMaterial({
				color: 0xffffff,
				transparent: true,
				opacity: opacity
			});

			let cylinder = new THREE.Mesh(geometry, material);

			// Позиция и ориентация
			cylinder.position.copy(start).add(end).multiplyScalar(0.5);
			cylinder.quaternion.setFromUnitVectors(
				new THREE.Vector3(0, 1, 0),
				dir.clone().normalize()
			);

			group.add(cylinder);
		}

		this.tail = group;

		this.add(group);

	}

}