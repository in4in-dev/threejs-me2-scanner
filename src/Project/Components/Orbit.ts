import * as THREE from 'three';
import {Curve, Vector3} from 'three';
import Component from "../Core/Component";
import GeometryGenerator from "../../Three/GeometryGenerator";

export default class Orbit extends Component
{

	public radius : number;

	public color : any;
	public activeColor : any;

	protected mesh : THREE.Mesh;

	constructor(radius : number, color : any = 0x2c63ab, thickness : number = 0.05, activeColor : any = 0xff0000) {

		super();

		this.radius = radius;
		this.color = color;
		this.activeColor = activeColor;

		this.mesh = this.createBody(radius, thickness, color);

		//Добавляем на сцену
		this.add(this.mesh);

	}

	public setActive(active : boolean) : void
	{

		if (active) {
			(<THREE.MeshBasicMaterial>this.mesh.material).color.set(this.activeColor);
		} else {
			(<THREE.MeshBasicMaterial>this.mesh.material).color.set(this.color);
		}

	}

	private createBody(radius : number, thickness : number, color : any) : THREE.Mesh
	{


		let mesh = new THREE.Mesh(
			GeometryGenerator.rim(radius, thickness, 200, 20),
			new THREE.MeshBasicMaterial({ color: color })
		);

		mesh.rotation.x = Math.PI / 2;

		return mesh;

	}


}