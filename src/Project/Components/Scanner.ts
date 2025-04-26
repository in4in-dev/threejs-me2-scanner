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
		this.cursor = new Cursor(0.15);
		this.probes = new Probes(camera);
		this.monitor = this.createMonitor();
		this.cursorMousePosition = new Vector2(0, 0);

		this.planet.add(this.cursor);

		this.add(this.planet, this.monitor);

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

	public launchProbe(cb : () => void) : void
	{
		let position = new Vector3();

		this.cursor.getWorldPosition(position);

		this.probes.launch(position, cb);
	}

	public mine() : Gem[]
	{

		this.spawnFlag(this.cursor.position);

		this.cursor.blick();

		return this.planet.mineGems(
			this.cursor.position.clone(),
			this.cursor.radius
		);

	}

	public moveCursorTo(mouseX : number, mouseY : number, camera : THREE.Camera) : void
	{

		let x = (mouseX / window.innerWidth) * 2 - 1;
		let y = -(mouseY / window.innerHeight) * 2 + 1;

		let raycaster = new THREE.Raycaster();
		let mouse = new THREE.Vector2(x, y);

		raycaster.setFromCamera(mouse, camera);

		let intersects = raycaster.intersectObject(this.planet);

		if (intersects.length > 0) {

			let point = intersects[0].point.clone().normalize().multiplyScalar(this.planet.radius + 0.001);

			this.cursor.position.copy(
				this.planet.worldToLocal(point)
			);

			this.cursor.lookAt(this.planet.position);

		}

		this.cursorMousePosition = new Vector2(x, y);

	}

	public rotatePlanetToCamera(camera : THREE.Camera) : void
	{

		let raycaster = new THREE.Raycaster();

		let cameraDir = new THREE.Vector3();

		camera.getWorldDirection(cameraDir);

		raycaster.setFromCamera(this.cursorMousePosition, camera);

		let intersects = raycaster.intersectObject(this.planet);

		if (intersects.length > 0) {

			let hit = intersects[0].point.clone().normalize();

			// Угол между камерой и точкой
			const angleDeg = THREE.MathUtils.radToDeg(cameraDir.angleTo(hit));

			// Угол только в XZ-плоскости
			const cameraXZ = cameraDir.clone().setY(0).normalize();
			const hitXZ = hit.clone().setY(0).normalize();
			const angleXZ = THREE.MathUtils.radToDeg(cameraXZ.angleTo(hitXZ));

			if (angleDeg < 140 && angleXZ < 140) {

				const cross = new THREE.Vector3().crossVectors(cameraXZ, hitXZ);

				if(cross.y > 0){
					this.planet.rotation.y += 0.01;
				}else{
					this.planet.rotation.y -= 0.01;
				}


			}
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