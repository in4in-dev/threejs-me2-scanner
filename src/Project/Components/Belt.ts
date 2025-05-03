import * as THREE from 'three';
import Component from "../Core/Component";

export default class Belt extends Component
{

	protected mesh : THREE.Points;

	constructor(radius : number, thickness : number) {

		super();

		this.mesh = this.createBody(radius, thickness);

		//Добавляем на сцену
		this.add(this.mesh);

	}

	private generateGeometry(radius : number, thickness : number) : THREE.BufferGeometry
	{

		let particleCount = radius * 2000;

		let particles = new Float32Array(particleCount * 3);

		for (let i = 0; i < particleCount; i++) {
			let angle = Math.random() * Math.PI * 2;
			let tubeAngle = Math.random() * Math.PI * 2;

			let t = thickness * Math.random();

			let x = (radius + t * Math.cos(tubeAngle)) * Math.cos(angle);
			let y = (radius + t * Math.cos(tubeAngle)) * Math.sin(angle);
			let z = t * Math.sin(tubeAngle);

			particles[i * 3] = x;
			particles[i * 3 + 1] = y;
			particles[i * 3 + 2] = z;
		}

		// Создание буферной геометрии и добавление частиц
		let particleGeometry = new THREE.BufferGeometry();

		particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));

		return particleGeometry;

	}

	private createBody(radius : number, thickness : number) : THREE.Points
	{

		let material = new THREE.PointsMaterial({
			map: new THREE.TextureLoader().load('/assets/sand.png'),
			size: 0.1, // Размер частиц
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true
		});

		return new THREE.Points(
			this.generateGeometry(radius, thickness),
			material
		);

	}


}