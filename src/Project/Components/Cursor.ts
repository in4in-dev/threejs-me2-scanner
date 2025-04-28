import Component from "../Core/Component";
import * as THREE from 'three';
import {Vector2, Vector3} from "three";
import {Animation, AnimationThrottler} from "../../Three/Animation";
import GeometryGenerator from "../../Three/GeometryGenerator";

export default class Cursor extends Component{

	public radius : number;

	protected mesh : THREE.Group;
	protected radar : THREE.Object3D;

	protected blickMesh : THREE.Object3D;
	protected blickProgress : number = 1;
	protected blickThrottler : AnimationThrottler = Animation.createThrottler(1000);

	public constructor(radius : number) {
		super();

		this.radius = radius;
		this.mesh = this.createBody(radius);

		this.blickMesh = this.createBlick();
		this.radar = this.createRadar();

		this.rotation.x = Math.PI / 2;

		this.mesh.add(this.radar);

		this.add(this.mesh, this.blickMesh);

	}

	private createRadar() : THREE.Object3D
	{
		let length = this.radius; // длина радиуса
		let thickness = 0.008; // толщина линии

		let geometry = new THREE.BoxGeometry(length, thickness, thickness);
		let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
		let line = new THREE.Mesh(geometry, material);

		let pivot = new THREE.Object3D();

		pivot.add(line);

		line.position.x = length / 2;

		return pivot;
	}

	private createBlick() : THREE.Mesh
	{
		let mesh = new THREE.Mesh(
			new THREE.CircleGeometry(0.01, 32),
			new THREE.MeshBasicMaterial({ color: '#ffffff', opacity : 1, transparent: true })
		);


		mesh.add(
			new THREE.AxesHelper()
		);

		mesh.visible = false;

		// mesh.position.x -= this.radius;

		// mesh.rotation.set(0, Math.PI * 2, 0);
		// mesh.position.y -= 0.1;

		return mesh;
	}

	private createCircle(radius : number, thickness : number, color : any){

		return new THREE.Mesh(
			// new THREE.RingGeometry(radius - thickness, radius, 32),
			GeometryGenerator.rim(radius, thickness, 64, 64),
			new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, opacity : 0.8, transparent: true })
		);

	}

	private createLine(from : Vector3, to : Vector3, thickness : number, color : any){

		let geometry = new THREE.BoxGeometry(length, thickness, thickness);
		let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
		let line = new THREE.Mesh(geometry, material);

		let pivot = new THREE.Object3D();
		pivot.add(line);

		line.position.x = length / 2;

		return pivot;
	}

	private createGlow() : THREE.Sprite
	{

		let glowSprite = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: new THREE.TextureLoader().load('/assets/glow.png'),
				color: '#8a3135', // Цвет свечения
				transparent: true,
				blending: THREE.AdditiveBlending,
				depthWrite:false,
				opacity : 0.5
			})
		);

		glowSprite.scale.set(0.6, 0.6, 0.6);
		glowSprite.position.set(0, 0, -0.1);

		return glowSprite;

	}

	private createBody(radius : number) : THREE.Group
	{

		let group = new THREE.Group();

		group.add(
			this.createCircle(radius * 0.2, 0.001, '#32b66b'),
			this.createCircle(radius * 0.5, 0.001, '#32b66b'),
			this.createCircle(radius * 0.7, 0.001, '#32b66b'),
			this.createCircle(radius, 0.005, '#d22c34'),
			// this.createLine(
			// 	new Vector3(-radius * 0.7, 0, 0),
			// 	new Vector3(radius * 0.7, 0, 0),
			// 	20, '#32b66b'
			// ),
			// this.createLine(
			// 	new Vector3(0, -radius * 0.7, 0),
			// 	new Vector3(0, radius * 0.7, 0),
			// 	20, '#32b66b'
			// ),
			// this.createLine(
			// 	new Vector3(0, -radius * 1.2, 0),
			// 	new Vector3(0, -radius * 0.8, 0),
			// 	20, '#f1747a'
			// )
		)

		group.rotation.set(-Math.PI, -Math.PI / 2, -Math.PI / 2);

		return group;

	}

	public blick(){
		this.blickThrottler(() => {
			this.blickProgress = 0;
		});
	}

	public animate(){

		if(this.blickProgress < 1){
			this.blickProgress += 0.02;
			// this.blickMesh.scale.set(1 + 12 * this.blickProgress, 1 + 12 * this.blickProgress, 1 + 12 * this.blickProgress);
		}else{
			this.blickMesh.scale.set(0, 0, 0);
		}

		this.radar.rotation.y -= 0.04;

	}

}