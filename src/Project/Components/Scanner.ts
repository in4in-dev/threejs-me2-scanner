import Component from "../Core/Component";
import Planet, {Gem} from "./Planet";
import Cursor from "./Cursor";
import Monitor from "./Monitor";
import * as THREE from 'three';
import {AudioContext, Vector3} from 'three';
import {Animation, AnimationProgress, AnimationThrottler} from "../../Three/Animation";
import Flag from "./Flag";
import Probes from "./Probes";

interface FlagData
{
	flag : Flag,
	progress : AnimationProgress,
	animated : boolean,
	from : Vector3,
	to : Vector3
}

export default class Scanner extends Component
{

	public probes : Probes;
	public planet : Planet;
	public cursor : Cursor;
	public monitor : Monitor;

	protected camera : THREE.Camera;
	protected flags : FlagData[] = [];

	protected monitorThrottler : AnimationThrottler = Animation.createThrottler(50);

	public constructor(camera : THREE.Camera, planet : Planet, audioContext : AudioContext) {
		super();

		this.planet = planet;
		this.camera = camera;
		this.probes = new Probes(camera, audioContext);
		this.cursor = this.createCursor();
		this.monitor = this.createMonitor(audioContext);

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

	protected createMonitor(audioContext : AudioContext) : Monitor
	{
		let monitor = new Monitor(audioContext);

		monitor.position.set(2, 0, 0);

		return monitor;
	}

	protected spawnFlag(point : Vector3) : void
	{

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
			progress : Animation.createProgress(500),
			animated : false
		});

	}

	private angleToThePoint(target : Vector3) : number
	{

		let direction = new THREE.Vector3();
		this.camera.getWorldDirection(direction);

		let sphereCenter = this.planet.position.clone();
		let radius = this.planet.radius;

		let inverseMatrix = new THREE.Matrix4().extractRotation(this.planet.matrixWorld).invert();
		let correctedDirection = direction.clone().applyMatrix4(inverseMatrix);

		let pointOnSphere = sphereCenter.clone().add(correctedDirection.normalize().multiplyScalar(radius));
		let angle = target.clone().normalize().angleTo(pointOnSphere.clone().normalize());

		let centerNormal = pointOnSphere.clone().normalize();
		let cursorNormal = this.cursor.position.clone().normalize();

		let cross = centerNormal.clone().cross(cursorNormal);

		let side = Math.sign(cross.dot(this.camera.up));

		return side > 0 ? angle : -angle;

	}

	public launchProbe(cb : () => void, destroyCb: () => void) : void
	{
		let position = new Vector3();

		this.cursor.getWorldPosition(position);

		this.probes.launch(this.planet, position, cb, destroyCb);
	}

	public mine() : Gem[]
	{

		this.spawnFlag(
			this.cursor.position.clone()
		);

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

		let angle = this.angleToThePoint(newPoint);

		if(Math.abs(angle) >= 2.25){

			this.cursor.position.copy(newPoint);

			this.cursor.lookAt(this.planet.position);

		}


	}

	public rotatePlanetToCamera() : void
	{

		let angle = this.angleToThePoint(this.cursor.position);

		if(Math.abs(angle) < 2.35){

			if(angle > 0){
				this.planet.rotation.y += 0.01;
			}else{
				this.planet.rotation.y -= 0.01;
			}

			let rotation = new THREE.Quaternion();
			rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle > 0 ? -0.01 : 0.01);

			this.cursor.position.applyQuaternion(rotation);
			this.cursor.lookAt(this.planet.position);

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

		this.flags.forEach(flag => {

			if(!flag.animated){

				flag.flag.position.lerpVectors(flag.from, flag.to, flag.progress.get());

				if(flag.progress.get() >= 1){
					flag.animated = true;
				}

			}

			flag.flag.animate();

		});

		this.probes.animate();

		this.cursor.animate();

	}

}