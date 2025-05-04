import * as THREE from "three";
import {Vector3} from "three";
import Sun from "../Components/Sun";
import SpaceBackground from "../Components/SpaceBackground";
import Orbit from "../Components/Orbit";
import AsteroidBelt from "../Components/AsteroidBelt";
import Border from "../Components/Border";
import {NormandyShip} from "../Components/Ships/Normandy/NormandyShip";
import PlanetWithOrbit from "../Components/PlanetWithOrbit";
import Scene from "../Core/Scene";
import Planet from "../Components/Planet";
import Random from "../../Three/Random";
import Engine from "../Core/Engine";
import BlurHtmlViewer from "../Html/BlurHtmlViewer";

export default class SpaceScene extends Scene
{

	protected shipMovingAllow : boolean = true;
	protected shipMovingActive : boolean = false;

	//Позиция мыши
	protected mousePositionX : number = 0;
	protected mousePositionY : number = 0;

	//Настройки для отладки
	protected showAxis : boolean = false;
	protected showTimeCodes : boolean = false;
	protected showFps : boolean = true;
	protected showTechInfo : boolean = false;

	public camera : THREE.PerspectiveCamera;

	protected background : SpaceBackground;
	protected ship : NormandyShip;
	protected sun : Sun;
	protected border : Border;
	protected asteroidBelt : AsteroidBelt;
	protected planets : PlanetWithOrbit[] = [];

	protected selectedPlanet : Planet | null = null;

	protected blurBackground : BlurHtmlViewer;

	constructor(engine : Engine) {

		super(engine);

		/**
		 * Генерация фона
		 */
		let background = new SpaceBackground('/assets/space_texture.jpg');

		/**
		 * Генерация солнца
		 */
		let glows = [ '#fed36a', 'blue', 'pink', '#a63737', '#d0652c'];
		let sun = new Sun(
			Random.float(0.4, 4),
			500,
			'white',
			Random.arr(glows)
		);

		/**
		 * Генерация пояса астероидов
		 */
		let asteroidBelt = new AsteroidBelt(
			Random.int(6, 20)
		);


		/**
		 * Генерация планет
		 */
		let planets = [];

		let planetNames = [
			"Меркурий",
			'Венера',
			"Земля",
			"Марс",
			"Юпитер",
			"Сатурн",
			"Уран",
			"Нептун"
		];

		let planetTextures = [
			"/assets/planets/1.png",
			"/assets/planets/3.png",
			"/assets/planets/4.png",
			"/assets/planets/5.png",
			"/assets/planets/6.png",
			"/assets/planets/8.png"
		];

		let planetsCount = Random.int(4, 8);

		for(let i = 0, orbitRadius = 0; i < planetsCount; i++){

			orbitRadius += Random.int(5, 10);

			let planetRadius = Random.float(
				0.2,
				Math.min(3, 0.5 * (i + 1))
			);

			planets.push(
				new PlanetWithOrbit(
					orbitRadius,
					new Planet(
						planetRadius,
						planetTextures[i],
						100
					),
					Math.random() * 2 * Math.PI,
				)
			);

		}

		/**
		 * Генерация границы
		 */
		let border = new Border(80, '#549b24', 0.3);


		this.camera = new THREE.PerspectiveCamera(75, engine.width / engine.height, 0.1, 1000);
		this.blurBackground = new BlurHtmlViewer();

		this.background = background;
		this.sun = sun;
		this.asteroidBelt = asteroidBelt;
		this.planets = planets;
		this.border = border;

		//Создаем корабль
		this.ship = new NormandyShip();

		this.scene.add(
			this.ship,
			this.sun,
			this.background,
			this.asteroidBelt,
			this.border,
			...this.planets
		)

		this.ship.position.set(10, 10, 0);

	}

	/**
	 * Установка обработчиков мыши и клавиатуры
	 */
	protected beforeSetListeners() : () => void{

		let onMouseDown = (event : MouseEvent) => {

			this.mousePositionX = event.clientX;
			this.mousePositionY = event.clientY;

			if(this.shipMovingAllow && (<HTMLElement>event.target).tagName !== 'BUTTON'){
				this.shipMovingActive = true;
				this.ship.startEngines();
			}

		}

		let onMouseMove = (event : MouseEvent) => {
			this.mousePositionX = event.clientX;
			this.mousePositionY = event.clientY;
		}

		let onMouseUp = (event : MouseEvent) => {

			this.mousePositionX = event.clientX;
			this.mousePositionY = event.clientY;

			if(this.shipMovingAllow) {
				this.shipMovingActive = false;
				this.ship.stopEngines();
			}

		}

		document.addEventListener('mousedown', onMouseDown);
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);

		return () => {
			document.removeEventListener('mousedown', onMouseDown);
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}

	}


	protected beforeSetHtml() : () => void {

		document.body.appendChild(this.blurBackground.element);

		return () => {
			this.blurBackground.element.remove();
		}

	}

	/**
	 * Инициализация сцены
	 */
	protected beforeInit(){
		this.moveCameraToShip();
	}

	/**
	 * Проверяем нахождение на орбите
	 */
	protected checkProximityToOrbit(orbit : Orbit, proximityDistance : number)  : boolean
	{

		let distanceToOrbit = this.ship.position.distanceTo(new THREE.Vector3(0, 0, 0));

		return Math.abs(distanceToOrbit - orbit.radius) < proximityDistance;

	}

	/**
	 * Проверяем нахождение на планете
	 */
	protected checkProximityToPlanet(planet : PlanetWithOrbit, proximityDistance : number) : boolean
	{

		let distance = this.ship.position.distanceTo(planet.planet.position);

		return distance < proximityDistance;

	}

	/**
	 * Двигаем камеру за кораблем
	 */
	protected moveCameraToShip(){

		this.camera.position.x = this.ship.position.x;
		this.camera.position.y = this.ship.position.y - 15;
		this.camera.position.z = this.ship.position.z + 10;
		this.camera.lookAt(
			this.ship.position.clone().setZ(0)
		);

	}

	/**
	 * Обновляем позицию корабля
	 */
	protected updateShipPosition(){

		// Обновление координат мыши
		let mouse = new THREE.Vector2(
			(this.mousePositionX / window.innerWidth) * 2 - 1,
			-(this.mousePositionY / window.innerHeight) * 2 + 1
		);

		// Обновление raycaster и нахождение пересечения с плоскостью
		let raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, this.camera);

		// Ограничение перемещения корабля в плоскости XY
		let plane = new THREE.Plane(new THREE.Vector3(0,0,1), 0);
		let intersection = new THREE.Vector3(0, 0, 0);
		raycaster.ray.intersectPlane(plane, intersection);

		let distance = intersection.distanceTo(
			new Vector3(0, 0, 0)
		);

		if (distance > this.border.radius) {
			intersection.normalize().multiplyScalar(this.border.radius);
		}

		this.ship.moveTo(intersection);

	}


	/**
	 * Главная функция анимации
	 */
	public tick(){

		//Обновление позиции для движения корабля
		this.analyzeWrap('SHIP_MOVING', () => {

			if (this.shipMovingAllow && this.shipMovingActive) {
				this.updateShipPosition();
				this.moveCameraToShip();
			}

		});

		this.analyzeWrap('PLANET_CAMERA_ANIMATE', () => {

			if(this.selectedPlanet){

				let planetPosition = new Vector3();
				this.selectedPlanet.getWorldPosition(planetPosition);

				let target = new Vector3().copy(this.camera.position).sub(planetPosition).setLength(5).add(planetPosition);

				let direction = target.clone().sub(this.camera.position);

				if(direction.length() > 0.01){

					this.camera.position.add(
						direction.normalize().multiplyScalar(0.1)
					)

				}

			}

		});

		//Отображаем название активной планеты
		this.analyzeWrap('PLANETS_ACTIVITY', () => {

			this.planets.forEach((planet : PlanetWithOrbit) => {

				planet.orbit.setActive(
					this.checkProximityToOrbit(planet.orbit!,  1.2)
				);

				let planetActive = this.checkProximityToPlanet(planet, 1.5);

				planet.planet.setActive(planetActive);

				if(planetActive && !this.selectedPlanet){
					this.selectedPlanet = planet.planet;
					this.shipMovingAllow = false;
					this.blurBackground.show();

					setTimeout(() => {
						this.emit('planet', planet.planet);
					}, 700);
				}

			});

		});

		//Анимируем солнце
		this.analyzeWrap('SUN_ANIMATION', () => this.sun.animate());

		//Анимируем двигатели корабля
		this.analyzeWrap('SHIP_ANIMATION', () => this.ship.animate());

	}

	public afterTick(): void {

	}

	public slowTick() {

		super.slowTick();


	}


}