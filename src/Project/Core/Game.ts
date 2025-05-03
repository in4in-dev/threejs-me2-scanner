import Engine from "./Engine";
import ScannerScene from "../Scenes/ScannerScene";
import SpaceScene from "../Scenes/SpaceScene";
import Border from "../Components/Border";
import PlanetWithOrbit from "../Components/PlanetWithOrbit";
import Planet from "../Components/Planet";
import AsteroidBelt from "../Components/AsteroidBelt";
import Random from "../../Three/Random";
import Sun from "../Components/Sun";
import SpaceBackground from "../Components/SpaceBackground";

export default class Game extends Engine
{

	protected scannerScene : ScannerScene;
	protected spaceScene : SpaceScene;

	public constructor() {

		super(document.body);

		this.scannerScene = new ScannerScene(this);
		this.spaceScene = new SpaceScene(this);

		this.spaceScene.on('planet', planet => {

			let scanPlanet = planet.clone();

			scanPlanet.position.set(0, 0, 0);

			this.scannerScene.setPlanet(
				scanPlanet
			);

			this.setScene(this.scannerScene);
		});

		this.scannerScene.on('exit', () => {
			this.setScene(this.spaceScene);
		});

	}

	public init(){
		this.setScene(this.spaceScene);
	}




}