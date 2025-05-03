import Asteroid from "./Asteroid";
import Component from "../Core/Component";
import Belt from "./Belt";
import Random from "../../Three/Random";

export default class AsteroidBelt extends Component
{

	public radius : number;

	public asteroids : Asteroid[];
	public belt : Belt;

	constructor(radius : number) {

		super();

		this.radius = radius;

		this.belt = this.createBelt(radius, Random.float(0.4, 3));
		this.asteroids = this.createAsteroids(radius * 50);

		//Добавляем объекты на сцену
		this.add(this.belt, ...this.asteroids);

	}

	private createAsteroid() : Asteroid
	{

		let templates = [
			{t : '/assets/asteroids/simple1.obj', m : '/assets/asteroids/simple1.mtl'},
			{t : '/assets/asteroids/simple2.obj', m : '/assets/asteroids/simple2.mtl'},
		];

		let template = Random.arr(templates);

		let asteroid = new Asteroid(template.t, template.m);

		//Случайная позиция в поясе
		let angle = Math.random() * 2 * Math.PI;

		asteroid.position.set(
			Random.int(this.radius - 1, this.radius + 1) * Math.cos(angle),
			Random.int(this.radius - 1, this.radius + 1) * Math.sin(angle),
			Random.int(-1, 1)
		);

		return asteroid;

	}


	private createAsteroids(count : number) : Asteroid[]
	{

		let asteroids = [];

		for(let i = 0; i < count; i++){

			asteroids.push(
				this.createAsteroid()
			);

		}

		return asteroids;

	}

	private createBelt(radius : number, thickness : number) : Belt
	{
		return new Belt(radius, thickness);
	}


}