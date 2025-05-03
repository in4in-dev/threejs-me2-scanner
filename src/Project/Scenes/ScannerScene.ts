import * as THREE from "three";
import Background from "../Components/ScannerBackground";
import Random from "../../Three/Random";
import Scanner from "../Components/Scanner";
import Planet from "../Components/Planet";
import GemsHtmlViewer from "../Html/GemsHtmlViewer";
import Scene from "../Core/Scene";
import Engine from "../Core/Engine";
import ScannerBackground from "../Components/ScannerBackground";

export default class ScannerScene extends Scene
{

	protected cursorMovingAllow : boolean = true;
	protected planetRotateAllow : boolean = true;
	protected probeLaunchAllow : boolean = true;

	public camera : THREE.PerspectiveCamera;

	protected light : THREE.Light;
	protected scanner : Scanner;
	protected background : Background;

	//HTML-интерфейс
	protected gemsIndicator : GemsHtmlViewer;

	public constructor(engine : Engine) {

		super(engine);

		this.camera = new THREE.PerspectiveCamera(60, engine.width / engine.height, 0.1, 1000);

		this.gemsIndicator = new GemsHtmlViewer()
			.add('zero', 'Нулевой элемент')
			.add('iridium', 'Иридий')
			.add('platinum', 'Платина')
			.add('palladium', 'Палладий');

		/////
		this.background = new ScannerBackground('/assets/space_texture.png', 0.3, this.audioContext);

		this.scanner = this.createScanner();
		this.light = this.createLight();

		this.scene.add(
			this.scanner,
			this.scanner.probes,
			this.background,
			this.light
		);

	}

	private createLight() : THREE.PointLight
	{

		let light = new THREE.PointLight('white', 2, 10000, 0.05);

		light.position.set(0.6, 1, 2.8);

		return light;

	}

	private createScanner() : Scanner
	{

		let planetTextures = [
			"/assets/planets/1.png",
			"/assets/planets/3.png",
			"/assets/planets/4.png",
			"/assets/planets/5.png",
			"/assets/planets/6.png",
			"/assets/planets/8.png"
		];


		return new Scanner(
			this.camera,
			new Planet(
				1,
				Random.arr(planetTextures),
				100
			),
			this.audioContext
		);


	}

	public setPlanet(planet : Planet) : void
	{
		this.scanner.setPlanet(planet);
	}

	protected launchProbe() : void
	{

		this.planetRotateAllow = false;
		this.cursorMovingAllow = false;
		this.probeLaunchAllow = false;

		this.scanner.launchProbe(() => {

			let gems = this.scanner.mine();

			gems.forEach(gem => {

				for(let i in gem.value){

					let value = (<any>gem).value[i] * 1000;

					this.gemsIndicator.setValue(i, this.gemsIndicator.getValue(i) + value);
				}

			});

		}, () => {

			this.planetRotateAllow = true;
			this.cursorMovingAllow = true;
			this.probeLaunchAllow = true;

		});

	}

	/**
	 * Установка обработчиков мыши и клавиатуры
	 */
	protected beforeSetListeners() : () => void
	{

		let onClick = () => {
			document.body.requestPointerLock();
		}

		let onMouseMove = (event : MouseEvent) => {

			if(this.cursorMovingAllow){

				this.scanner.moveCursor(
					event.movementX,
					event.movementY
				);

			}

		};

		let onMouseDown = (event : MouseEvent) => {


			if((<HTMLElement>event.target).tagName !== 'BUTTON'){

				event.preventDefault();

				if(this.probeLaunchAllow){
					this.launchProbe();
				}

			}

		}

		let onPointLockChange = () => {

			if (document.pointerLockElement === document.body) {
				document.addEventListener('mousedown', onMouseDown);
				document.addEventListener('mousemove', onMouseMove);
			} else {
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mousedown', onMouseDown);
			}

		}

		document.addEventListener('click', onClick);
		document.addEventListener('pointerlockchange',onPointLockChange);

		return () => {
			document.removeEventListener('click', onClick);
			document.removeEventListener('pointerlockchange',onPointLockChange);
		}

	}


	/**
	 * Добавление в DOM HTML-интерфейса
	 */
	protected beforeSetHtml()
	{

		document.body.appendChild(this.gemsIndicator.element);

		return () => {
			this.gemsIndicator.element.remove();
		}

	}

	/**
	 * Инициализация сцены
	 */
	protected beforeInit() : void
	{
		this.camera.position.set(0, 0, 3);
	}


	/**
	 * То, что нужно обновлять по реже
	 */
	public slowTick() : void
	{

		this.analyzeWrap('HTML_GEMS', () => this.gemsIndicator.updateView());

	}

	/**
	 * Главная функция анимации
	 */
	public tick() : void
	{

		this.analyzeWrap('SCANNER_MOVEMENT', () => {

			if(this.planetRotateAllow){
				this.scanner.rotatePlanetToCamera();
			}

		});

		this.analyzeWrap('SCANNER_ANIMATE', () => {
			this.scanner.animate();
		});

		this.analyzeWrap('BACKGROUND ANIMATE', () => {
			this.background.animate();
		});

		this.analyzeWrap('PROBES ANIMATE', () => {
			this.scanner.animate();
		});

	}

	public afterTick(): void
	{

	}

}