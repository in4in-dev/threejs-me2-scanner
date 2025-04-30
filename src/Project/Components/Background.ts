import * as THREE from 'three';
import MeshBasicTextureMaterial from "../../Three/MeshBasicTextureMaterial";
import Component from "../Core/Component";
import Random from "../../Three/Random";
import GeometryGenerator from "../../Three/GeometryGenerator";
import {Vector2, Vector3} from "three";
import Sound from "../../Three/Sound";

export default class Background extends Component
{

	protected mesh : THREE.Mesh;
	protected points : THREE.Points;
	protected sprites : THREE.Sprite[];

	protected music : Sound;

	constructor(picture : string, opacity : number = 0.3, audioContext : AudioContext) {

		super();

		this.mesh = this.createBody(picture, opacity);
		this.points = this.createPoints(1000);
		this.sprites = this.createSprites();

		this.music = new Sound(audioContext);
		this.music
			.setLoop(true)
			.setVolume(0.8)
			.loadFromFile('/assets/music/background.wav', true);

		//Добавляем на сцену
		this.add(this.mesh, this.points, ...this.sprites);

	}


	private createSmoke(path : string, color : any | null = null, opacity : number = 1) : THREE.Sprite
	{

		let smokeSprite = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: new THREE.TextureLoader().load(path),
				transparent: true,
				blending : THREE.AdditiveBlending,
				depthWrite:false,
				opacity,
				color
			})
		);

		smokeSprite.position.set(
			Random.int(-30, 30),
			Random.int(-30, 30),
			-1
		);

		smokeSprite.scale.set(
			Random.int(20, 100),
			Random.int(10, 40),
			20
		);

		return smokeSprite;

	}

	private createSprites() : THREE.Sprite[]
	{

		return [
			this.createSmoke('../../assets/smokes/1.png', '#d98911', 0.8),
			this.createSmoke('../../assets/smokes/1.png', '#887272', 0.8),
			this.createSmoke('../../assets/smokes/3.png', 'white', 0.2)
		]

	}

	private createPoints(count : number) : THREE.Points
	{

		let points =  new THREE.Points(
			GeometryGenerator.filledSphere(6, count),

			new THREE.PointsMaterial({
				map: new THREE.TextureLoader().load('../../assets/sand.png'),
				size: 0.01,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				transparent: true
			})
		);

		points.rotation.set(3, 3, 3);

		return points;

	}

	private createBody(picture : string, opacity : number) : THREE.Mesh
	{

		let spaceBackground = new THREE.Mesh(
			new THREE.SphereGeometry(10, 14, 14),
			new MeshBasicTextureMaterial(
				new THREE.TextureLoader().load(picture),
				opacity,
				{side: THREE.BackSide}
			)
		);

		// spaceBackground.rotation.set(3000, 300, 300);

		return spaceBackground;

	}

	public animate(){

		this.points.rotation.y += 0.001;

	}

}