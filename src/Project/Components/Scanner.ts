import Component from "../Core/Component";
import Planet, {Gem} from "./Planet";
import Cursor from "./Cursor";
import Monitor from "./Monitor";
import * as THREE from 'three';
import {Camera, Vector2, Vector3} from "three";
import {Animation, AnimationThrottler} from "../../Three/Animation";
import Flag from "./Flag";
import Probes from "./Probes";

interface FlagData
{
	flag : Flag,
	progress : number,
	from : Vector3,
	to : Vector3
}

export default class Scanner extends Component
{

	public probes : Probes;
	public planet : Planet;
	public cursor : Cursor;
	public monitor : Monitor;

	protected cursorMousePosition : Vector2;
	protected flags : FlagData[] = [];

	protected monitorThrottler : AnimationThrottler = Animation.createThrottler(50);

	public constructor(camera : THREE.Camera, planet : Planet) {
		super();

		this.planet = planet;
		this.cursor = this.createCursor();
		this.probes = new Probes(camera);
		this.monitor = this.createMonitor();
		this.cursorMousePosition = new Vector2(0, 0);

		this.planet.add(this.cursor);

		this.add(this.planet, this.monitor);

	}

	protected createCursor() : Cursor
	{

		let cursor = new Cursor(0.15);

		cursor.position.set(0, 0, 1);
		cursor.lookAt(this.planet.position);

		return cursor;

	}

	protected createMonitor() : Monitor
	{
		let monitor = new Monitor();

		monitor.position.set(2, 0, 0);
		monitor.rotation.set(0.5, -0.5, 0.25);

		return monitor;
	}

	protected spawnFlag(point : Vector3){

		let flag = new Flag();

		let normal = new THREE.Vector3();
		normal.copy(point).normalize();

		let start = point.clone().addScaledVector(normal, -0.3);

		flag.position.copy(start);
		flag.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

		this.planet.add(flag);

		this.flags.push({
			flag,
			from : flag.position.clone(),
			to : this.cursor.position.clone(),
			progress : 0
		});

	}

	public launchProbe(cb : () => void, destroyCb: () => void) : void
	{
		let position = new Vector3();

		this.cursor.getWorldPosition(position);

		this.probes.launch(position, cb, destroyCb);
	}

	public mine() : Gem[]
	{

		this.spawnFlag(
			this.cursor.position.clone()
		);

		this.cursor.blick();

		return this.planet.mineGems(
			this.cursor.position.clone(),
			this.cursor.radius
		);

	}

	public moveCursor(addX : number, addY : number) : void
	{

		addX *= 0.0015;
		addY *= 0.0015;

		let upOffset = addY / this.planet.radius;
		let rightOffset = -addX / this.planet.radius;

		let normal = this.cursor.position.clone().normalize();
		let up = new THREE.Vector3(0, 1, 0).projectOnPlane(normal).normalize();
		// let right = new THREE.Vector3(1, 0, 0).projectOnPlane(normal).normalize();

		let right = up.clone().cross(normal).normalize();

		let newPoint = normal
			.clone()
			.applyAxisAngle(right, upOffset)
			.applyAxisAngle(up, -rightOffset)
			.multiplyScalar(this.planet.radius);



		this.cursor.position.copy(newPoint);

		this.cursor.lookAt(this.planet.position);


	}

	public rotatePlanetToCamera(camera : THREE.Camera) : void
	{

		let direction = new THREE.Vector3();
		camera.getWorldDirection(direction);

		let sphereCenter = this.planet.position.clone();
		let radius = this.planet.radius;

		let inverseMatrix = new THREE.Matrix4().extractRotation(this.planet.matrixWorld).invert();
		let correctedDirection = direction.clone().applyMatrix4(inverseMatrix);

		let pointOnSphere = sphereCenter.clone().add(correctedDirection.normalize().multiplyScalar(radius));
		let angle = this.cursor.position.clone().normalize().angleTo(pointOnSphere.clone().normalize());

		let centerNormal = pointOnSphere.clone().normalize();
		let cursorNormal = this.cursor.position.clone().normalize();

		// Векторное произведение — дает "направление отклонения"
		let cross = centerNormal.clone().cross(cursorNormal);

		// Теперь по знаку dot'а с up-вектором (например, ось Y камеры)
		let side = Math.sign(cross.dot(camera.up));

		if(angle < 2.35){

			if(side > 0){
				this.planet.rotation.y += 0.01;
			}else{
				this.planet.rotation.y -= 0.01;
			}

			let rotation = new THREE.Quaternion();
			rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), side > 0 ? -0.01 : 0.01);

			this.cursor.position.applyQuaternion(rotation);

		}

	}

	public animate(){

		this.monitorThrottler(() => {

			this.monitor.animate(
				this.planet.scanGems(
					this.cursor.position.clone(),
					this.cursor.radius
				)
			);

		});

		this.flags.filter(flag => flag.progress < 1).forEach(flag => {

			flag.progress += 0.03;
			flag.flag.position.lerpVectors(flag.from, flag.to, flag.progress);

		});

		this.probes.animate();

		this.cursor.animate();

	}



}