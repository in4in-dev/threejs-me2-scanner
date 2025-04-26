import Component from "../Core/Component";
import {Vector3} from "three";
import * as THREE from 'three';

export default class Probe extends Component
{

	public animationCompleted : boolean = false;
	public landed : boolean = false;

	protected progress : number = 0;
	protected tailLength : number = 30;
	protected tailPoints : THREE.Vector3[] = [];
	protected tailCurve : THREE.QuadraticBezierCurve3;

	protected mesh : THREE.Mesh;
	protected tail : THREE.Group | null = null;

	protected callback : () => void;

	public constructor(from : Vector3, to : Vector3, cb : () => void){

		super();

		let mid = from.clone().lerp(to, 0.5);
		mid.y += 2;

		this.tailCurve = new THREE.QuadraticBezierCurve3(from, mid, to);

		this.mesh = new THREE.Mesh(
			new THREE.SphereGeometry(0.005, 8, 8),
			new THREE.MeshBasicMaterial({ color: 0xffffff })
		);

		this.callback = cb;

		this.add(this.mesh);

	}

	public animate(){

		if (!this.landed){

			// движение по кривой
			this.progress += 0.005;

			if (this.progress >= 1) {
				this.progress = 1;
				this.landed = true;

				this.remove(this.mesh);

				this.callback();
			}else{
				let pos = this.tailCurve.getPoint(this.progress);
				this.mesh.position.copy(pos);

				// let next = probe.tailCurve.getPoint(Math.min(probe.t + 0.01, 1));
				// let dir = next.clone().sub(pos).normalize();
				// probe.mesh.lookAt(pos.clone().add(dir));

				// хвост — точки
				this.tailPoints.push(
					pos.clone()
				);

			}

		}


		if (this.tailPoints.length > this.tailLength || this.landed){
			this.tailPoints.shift();

			if(this.tailPoints.length < 1){
				this.animationCompleted = true;
			}
		}

		// удалить старый хвост
		if (this.tail) {
			this.remove(this.tail);
		}

		// отрисовка хвоста как набора линий с разной прозрачностью
		let group = new THREE.Group();
		for (let i = 1; i < this.tailPoints.length; i++) {

			let geometry = new THREE.BufferGeometry().setFromPoints([
				this.tailPoints[i - 1],
				this.tailPoints[i],
			]);

			let opacity = i / this.tailPoints.length;

			let material = new THREE.LineBasicMaterial({
				color: 0xffffff,
				transparent: true,
				opacity: opacity,
			});

			let segment = new THREE.Line(geometry, material);

			group.add(segment);
		}

		this.tail = group;

		this.add(group);

	}

}