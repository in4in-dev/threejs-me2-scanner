import Component from "../Core/Component";
import * as THREE from 'three';
import GeometryGenerator from "../../Three/GeometryGenerator";
import {Animation, AnimationThrottler} from "../../Three/Animation";

export default class Cursor extends Component{

	public radius : number;

	protected mesh : THREE.Group;
	protected radar : THREE.Object3D;

	protected rotateThrottler : AnimationThrottler = Animation.createThrottler(2);

	public constructor(radius : number) {

		super();

		this.radius = radius;

		this.mesh = this.createBody(radius);
		this.radar = this.createRadar();

		this.rotation.x = Math.PI / 2;

		this.mesh.add(this.radar);

		this.add(this.mesh);

	}

	private createRadar() : THREE.Object3D
	{
		let thickness = 0.008;

		let geometry = new THREE.BoxGeometry(this.radius, thickness, thickness);
		let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
		let line = new THREE.Mesh(geometry, material);

		let pivot = new THREE.Object3D();

		pivot.add(line);

		line.position.x = this.radius / 2;

		return pivot;
	}

	private createBodyCircle(radius : number, thickness : number, color : any) : THREE.Mesh
	{

		return new THREE.Mesh(
			GeometryGenerator.rim(radius, thickness, 64, 64),
			new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, opacity : 0.8, transparent: true })
		);

	}

	private createBody(radius : number) : THREE.Group
	{

		let group = new THREE.Group();

		group.add(
			this.createBodyCircle(radius * 0.2, 0.001, '#32b66b'),
			this.createBodyCircle(radius * 0.5, 0.001, '#32b66b'),
			this.createBodyCircle(radius * 0.7, 0.001, '#32b66b'),
			this.createBodyCircle(radius, 0.005, '#d22c34'),
		)

		group.rotation.set(-Math.PI, -Math.PI / 2, -Math.PI / 2);

		return group;

	}

	public animate(){

		this.rotateThrottler(() => {
			this.radar.rotation.y -= 0.02;
		});

	}

}