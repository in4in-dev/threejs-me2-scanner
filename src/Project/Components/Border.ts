import * as THREE from 'three';
import {Curve, Vector3} from 'three';
import Component from "../Core/Component";
import GeometryGenerator from "../../Three/GeometryGenerator";

export default class Border extends Component
{

	public  radius : number;
	public  color : any;
	public  thickness : number;

	protected mesh : THREE.Mesh;

	constructor(radius : number, color : any = 0x2c63ab, thickness : number = 0.05) {

		super();

		this.radius = radius;
		this.color = color;
		this.thickness = thickness;

		this.mesh = this.createBody(radius, thickness, color);

		//Добавляем на сцену
		this.add(this.mesh);

	}

	private createBody(radius : number, thickness : number, color: any) : THREE.Mesh
	{

		let mesh = new THREE.Mesh(
			GeometryGenerator.rim(radius, thickness, 400, 8),
			new THREE.MeshBasicMaterial({ color: color })
		);

		mesh.rotation.x = Math.PI / 2;

		return mesh;

	}

}