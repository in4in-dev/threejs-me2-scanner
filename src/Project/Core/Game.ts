import Engine from "./Engine";
import * as THREE from "three";
import Sun from "../Components/Sun";
import Background from "../Components/Background";
import Random from "../../Three/Random";
import FpsHtmlViewer from "../Html/FpsHtmlViewer";
import TechInfoHtmlViewer from "../Html/TechInfoHtmlViewer";
import Scanner from "../Components/Scanner";
import Planet from "../Components/Planet";
import GemsHtmlViewer from "../Html/GemsHtmlViewer";

export default class Game extends Engine
{

	protected cursorMovingAllow : boolean = true;
	protected planetRotateAllow : boolean = true;
	protected probeLaunchAllow : boolean = true;

	//Настройки для отладки
	protected showAxis : boolean = false;
	protected showTimeCodes : boolean = false;
	protected showFps : boolean = true;
	protected showTechInfo : boolean = false;

	protected light : THREE.Light;
	protected scanner : Scanner;
	protected background : Background;

	//HTML-интерфейс
	protected fpsIndicator : FpsHtmlViewer;
	protected techInfoIndicator : TechInfoHtmlViewer;
	protected gemsIndicator : GemsHtmlViewer;

	protected audioContext : AudioContext;

	constructor() {

		super(document.body);

		this.fpsIndicator = new FpsHtmlViewer(this);
		this.techInfoIndicator = new TechInfoHtmlViewer()
			.addParam('None', () => 'None');

		this.gemsIndicator = new GemsHtmlViewer()
			.add('zero', 'Нулевой элемент')
			.add('iridium', 'Иридий')
			.add('platinum', 'Платина')
			.add('palladium', 'Палладий');


		/////
		this.audioContext = new AudioContext();

		/////
		this.background = new Background('../../../assets/space_texture.png', 0.3, this.audioContext);

		this.scanner = this.createScanner();
		this.light = this.createLight();

	}

	private createLight(){

		let light = new THREE.PointLight('white', 2, 10000, 0.05);

		light.position.set(0.6, 1, 2.8);

		return light;

	}

	private createScanner(){

		let planetTextures = [
			"../../../assets/planets/1.png",
			"../../../assets/planets/3.png",
			"../../../assets/planets/4.png",
			"../../../assets/planets/5.png",
			"../../../assets/planets/6.png",
			"../../../assets/planets/8.png"
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

	/**
	 * Инициализация игры
	 */
	public init(){

		this.initScene();
		this.initHtml();
		this.initListeners();

	}

	/**
	 * Установка обработчиков мыши и клавиатуры
	 */
	protected initListeners(){

		document.body.addEventListener('click', () => {
			document.body.requestPointerLock();

			this.audioContext.resume();
		});

		document.addEventListener('pointerlockchange', () => {

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

			let onMouseUp = (event : MouseEvent) => {

			}

			if (document.pointerLockElement === document.body) {
				document.addEventListener('mousedown', onMouseDown);
				document.addEventListener('mousemove', onMouseMove);
				document.addEventListener('mouseup', onMouseUp);
			} else {
				document.removeEventListener('mouseup', onMouseUp);
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mousedown', onMouseDown);
			}

		});

	}

	protected launchProbe(){

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
	 * Добавление в DOM HTML-интерфейса
	 */
	protected initHtml(){

		if(this.showFps){
			document.body.appendChild(this.fpsIndicator.element);
		}

		if(this.showTechInfo){
			document.body.appendChild(this.techInfoIndicator.element);
		}

		document.body.appendChild(this.gemsIndicator.element);

	}

	/**
	 * Инициализация сцены
	 */
	protected initScene(){

		this.scene.add(
			this.scanner,
			this.scanner.probes,
			this.background,
			this.light
		)

		if(this.showAxis){
			this.showAxisHelper();
		}

		this.camera.position.set(0, 0, 3);

	}

	/**
	 * Показать оси X,Y,Z
	 */
	protected showAxisHelper() : void
	{
		this.scene.add(
			new THREE.AxesHelper(20)
		);
	}

	protected analyzeWrap(code : string, fn : () => void, max : number = 10){

		let start = Date.now();

		fn();

		let end = Date.now(),
			time = (end - start);

		if(this.showTimeCodes){
			console.log('Время выполнения '  + code + ': ' + time + ' мс');
		}

		if(time > max){
			console.log('%c Долгое выполнение ' + code + ': ' + time + ' мс', 'color: orange');
		}


	}

	/**
	 * То, что нужно обновлять по реже
	 */
	protected slowTick(){

		//Вывод фпс
		this.analyzeWrap('HTML_FPS', () => this.fpsIndicator.updateView());

		//Вывод тех информации
		this.analyzeWrap('HTML_TECH_INFO', () => this.techInfoIndicator.updateView());

		//Вывод инфы о гемах
		this.analyzeWrap('HTML_GEMS', () => this.gemsIndicator.updateView());

	}

	/**
	 * Главная функция анимации
	 */
	protected tick(){


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

	public afterTick(){
	}

}