import * as THREE from 'three';
import Sparks from "./Sparks";
import Component from "../Core/Component";

export default class Sun extends Component
{

	public color : any;
	public glowColor : any;
	public intensity : number;
	public radius : number;

	protected mesh : THREE.Mesh;
	protected glow : THREE.Sprite;
	protected light : THREE.Light;
	protected sparks : Sparks;

	constructor(radius : number = 2, intensity : number = 500, color : any = 'white', glowColor : any = '#fed36a') {

		super();

		this.intensity = intensity;
		this.color = color;
		this.glowColor = glowColor;
		this.radius = radius;

		this.mesh = this.createBody();
		this.light = this.createLight();
		this.glow = this.createGlow();
		this.sparks = this.createSparks();

		//Добавляем на сцену
		this.add(this.mesh, this.light, this.sparks, this.glow);

	}

	public getSunMesh() : THREE.Mesh
	{
		return this.mesh;
	}


	private createGlow() : THREE.Sprite
	{

		let glowSprite = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: new THREE.TextureLoader().load('../../assets/glow.png'),
				color: this.glowColor, // Цвет свечения
				transparent: true,
				blending: THREE.AdditiveBlending,
				depthWrite:false
			})
		);

		glowSprite.scale.set(20, 10, 10);

		return glowSprite;

	}

	private createBody() : THREE.Mesh
	{

		return new THREE.Mesh(
			new THREE.IcosahedronGeometry(this.radius, 64),
			new THREE.MeshBasicMaterial({color: 'white'})
		);

	}

	private createLight() : THREE.Light
	{
		return new THREE.PointLight('white', 2, 10000, 0.02);
	}

	private createSparks() : Sparks
	{
		return new Sparks(this.radius, this.color);
	}

	public animate(){
		this.sparks.animate();
	}

}