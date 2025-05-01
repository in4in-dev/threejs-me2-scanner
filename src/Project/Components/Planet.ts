import * as THREE from 'three';
import Component from "../Core/Component";
import Random from "../../Three/Random";

export interface Gem
{
	position : THREE.Vector3,
	value : {
		zero : number,
		iridium : number,
		platinum : number,
		palladium : number
	}
}

export default class Planet extends Component
{

	public texture : string;
	public radius : number;
	public gems : Gem[];

	protected mesh : THREE.Mesh;

	public constructor(
		radius : number,
		texture : string,
		gemsCount : number
	) {
		super();

		this.radius = radius;
		this.texture = texture;

		this.mesh = this.createBody();
		this.gems = this.generateGems(gemsCount);

		this.add(this.mesh);

	}

	private generateGem() : Gem
	{

		let u = Math.random();
		let v = Math.random();
		let theta = 2 * Math.PI * u;
		let phi = Math.acos(2 * v - 1);

		let x = this.radius * Math.sin(phi) * Math.cos(theta);
		let y = this.radius * Math.sin(phi) * Math.sin(theta);
		let z = this.radius * Math.cos(phi);

		return {
			position : new THREE.Vector3(x, y, z),
			value : {
				platinum : Random.int(0, 1) ? Math.random() : 0,
				iridium : Random.int(0, 1) ? Math.random() : 0,
				palladium : Random.int(0, 1) ? Math.random() : 0,
				zero : Random.int(0, 1) ? Math.random() : 0
			}
		}

	}

	private generateGems(count : number) : Gem[]
	{

		let gems : Gem[] = [];
		for(let i = 0; i < count; i++){
			gems.push(this.generateGem());
		}

		return gems;

	}

	public scanGems(position : THREE.Vector3, radius : number) : Gem[]
	{

		return this.gems.filter(gem => {
			return position.distanceTo(gem.position) <= radius;
		});

	}

	public mineGems(position : THREE.Vector3, radius : number) : Gem[]
	{

		let gems = this.scanGems(position, radius);

		this.gems = this.gems.filter(gem => {
			return gems.indexOf(gem) === -1;
		});

		return gems;

	}

	public getPlanetMesh() : THREE.Mesh
	{
		return this.mesh;
	}

	private createBody() : THREE.Mesh
	{

		return new THREE.Mesh(
			new THREE.SphereGeometry(this.radius, 200, 200),
			new THREE.MeshLambertMaterial({
				map: new THREE.TextureLoader().load(this.texture)
			})
		);

	}

}