import Component from "../Core/Component";
import * as THREE from "three";
import {Vector3} from "three";
import Planet from "./Planet";
import {Animation, AnimationProgress} from "../../Three/Animation";

type LandedCallback = () => void;
type DestroyedCallback = () => void;

export default class Probe extends Component
{

	public animationCompleted : boolean = false;
	public landed : boolean = false;

	protected from : Vector3;
	protected to : Vector3;

	protected curve : THREE.QuadraticBezierCurve3;
	protected tailLength : number = 120;
	protected tailPoints : THREE.Vector3[] = [];

	protected progress : AnimationProgress = Animation.createProgress(2500);

	protected planet : Planet;
	protected mesh : THREE.Mesh;
	protected tail : THREE.Group | null = null;

	protected landedCallback : LandedCallback | null = null;
	protected destroyedCallback : DestroyedCallback | null = null;

	public constructor(
		planet : Planet,
		from : Vector3,
		to : Vector3
	){

		super();

		this.planet = planet;
		this.from = from;
		this.to = to;

		this.curve = this.createCurve();
		this.mesh = this.createBody();

		this.add(this.mesh);

	}

	public setLandedCallback(callback : LandedCallback) : this
	{
		this.landedCallback = callback;

		return this;
	}

	public setDestroyedCallback(callback : DestroyedCallback) : this
	{
		this.destroyedCallback = callback;

		return this;
	}

	private createCurve() : THREE.QuadraticBezierCurve3
	{

		let toNormal = this.to.clone().normalize();
		let mid = this.to.clone().add(toNormal.clone().multiplyScalar(this.planet.radius * 0.5));

		return new THREE.QuadraticBezierCurve3(this.from, mid, this.to);

	}

	private createBody() : THREE.Mesh
	{
		return new THREE.Mesh(
			new THREE.SphereGeometry(0.005, 8, 8),
			new THREE.MeshBasicMaterial({ color: 0xffffff })
		);
	}

	public animate(){

		if(this.animationCompleted){
			return;
		}

		let progress = this.progress.get();

		if (!this.landed){

			let pos = this.curve.getPoint(progress);

			this.mesh.position.copy(pos);

			this.tailPoints.push(
				pos.clone()
			);

			if (progress >= 1) {

				this.landed = true;

				this.remove(this.mesh);

				this.landedCallback && this.landedCallback();

			}

		}


		if (this.tailPoints.length > this.tailLength || this.landed){
			this.tailPoints.shift();

			if(this.tailPoints.length < 1 && this.landed){
				this.animationCompleted = true;
				this.destroyedCallback && this.destroyedCallback();
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