import Orbit from "./Orbit";
import Planet from "./Planet";
import Component from "../Core/Component";

export default class PlanetWithOrbit extends Component
{

	public orbitRadius : number;
	public planetAngle : number;

	public orbit : Orbit;
	public planet : Planet;

	constructor(orbitRadius : number, planet : Planet, planetAngle : number) {

		super();

		this.orbitRadius = orbitRadius;
		this.planetAngle = planetAngle;

		this.planet = planet;
		this.orbit = this.createOrbit();

		this.setPlanetPosition(planetAngle);

		//Добавляем на сцену
		this.add(this.orbit, this.planet);

	}


	public setPlanetPosition(angle : number)
	{

		this.planetAngle = angle;

		//Ставим позицию планете
		this.planet.position.set(
			this.orbitRadius * Math.cos(this.planetAngle),
			this.orbitRadius * Math.sin(this.planetAngle),
			0
		);

	}

	private createOrbit() : Orbit
	{
		return new Orbit(this.orbitRadius, '#a2a2a2', 0.008);
	}

}