import * as THREE from 'three';
import Component from "../../../Core/Component";
import Random from "../../../../Three/Random";

export default class NormandyEngine extends Component
{

	protected length : number;
	protected speed : number;

	protected mesh : THREE.Points;
	protected glow : THREE.Sprite;

	protected positions : number[];

	constructor(
		color : any = 'white',
		glowColor : any = '#fed36a',
		speed : number = 1,
		length : number = 10
	) {
		super();

		this.speed = speed;
		this.length = length;

		this.positions = this.generatePositions();

		this.mesh = this.createBody(color);
		this.glow = this.createGlow(glowColor);

		//Добавляем на сцену
		this.mesh.add(this.glow);

		this.add(this.mesh);
	}

	public setLength(x : number): this
	{
		this.length = x;
		return this;
	}

	public setSpeed(x : number): this
	{
		this.speed = x;
		return this;
	}

	private generatePositions() : number[]
	{

		let positions = [];

		for (let i = 0; i < this.length * 30; i++) {

			let radius = 1;

			let r = radius * Math.sqrt(Math.random());
			let theta = Math.random() * 2 * Math.PI;

			let x = r * Math.cos(theta);
			let y = r * Math.sin(theta);
			let z = 0;

			positions[i * 3] = x;
			positions[i * 3 + 1] = y;
			positions[i * 3 + 2] = z;
		}

		return positions;

	}

	private getGeometry() : THREE.BufferGeometry
	{

		let pointsGeometry = new THREE.BufferGeometry();

		pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));

		return pointsGeometry;

	}

	private createGlow(color : any) : THREE.Sprite
	{

		let glowSprite = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: new THREE.TextureLoader().load('/assets/glow.png'),
				color: color,
				transparent: true,
				blending: THREE.AdditiveBlending,
				depthWrite:false
			})
		);

		glowSprite.scale.set(20, 10, 10);

		return glowSprite;

	}

	private createBody(color : any) : THREE.Points
	{

		let points = new THREE.Points(
			this.getGeometry(),
			new THREE.PointsMaterial({
				// color: color,
				map : new THREE.TextureLoader().load('/assets/glow.png'),
				size: 0.1,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				transparent: true,
				opacity: 0.7
			})
		);

		points.rotation.x = Math.PI / 2;
		points.position.y = -2;
		points.position.z = -4;

		return points;


	}

	public animate()
	{

		let positions = [];

		for(let i = 0; i < this.positions.length;i+=3){

			let max = Random.float(0.8, 1);

			positions[i] = this.positions[i];

			if(this.positions[i+1] < -this.length * max){
				positions[i+1] = 0;
			}else{
				positions[i+1] = this.positions[i+1] - Random.float(0.1 * this.speed, this.speed);
			}

			positions[i+2] = this.positions[i+2];
		}

		this.positions = positions;

		this.mesh.geometry.copy(
			this.getGeometry()
		);


	}


}