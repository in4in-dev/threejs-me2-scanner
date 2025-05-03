import * as THREE from 'three';
import {Renderer} from "three";
import EventBus from "./EventBus";
import Engine from "./Engine";
import FpsHtmlViewer from "../Html/FpsHtmlViewer";
import TechInfoHtmlViewer from "../Html/TechInfoHtmlViewer";

type DestroyFunction = () => void;

export default abstract class Scene extends EventBus
{

	public scene : THREE.Scene;
	public audioContext : AudioContext;
	public abstract camera : THREE.Camera;

	//Настройки для отладки
	protected showAxis : boolean = false;
	protected showTimeCodes : boolean = false;
	protected showFps : boolean = true;
	protected showTechInfo : boolean = false;

	protected fpsIndicator : FpsHtmlViewer;
	protected techInfoIndicator : TechInfoHtmlViewer;

	private beforeDestroy : null | (() => void) = null;

	public constructor(engine : Engine) {

		super();

		this.scene = new THREE.Scene();
		this.audioContext = new AudioContext();

		this.fpsIndicator = new FpsHtmlViewer(engine);
		this.techInfoIndicator = new TechInfoHtmlViewer();

		if(this.showAxis){
			this.scene.add(
				new THREE.AxesHelper(20)
			);
		}

	}

	protected analyzeWrap(code : string, fn : () => void, max : number = 10) : void
	{

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

	private setListeners() : DestroyFunction
	{

		let destroyFunction = this.beforeSetListeners();

		let onClick = () => {
			this.audioContext.resume();
		}

		document.addEventListener('click', onClick);

		return () => {
			document.removeEventListener('click', onClick);
			destroyFunction();
		}

	}

	private setHtml() : DestroyFunction
	{

		let destroyFunction = this.beforeSetHtml();

		if(this.showFps){
			document.body.appendChild(this.fpsIndicator.element);
		}

		if(this.showTechInfo){
			document.body.appendChild(this.techInfoIndicator.element);
		}

		return () => {
			this.fpsIndicator.element.remove();
			this.techInfoIndicator.element.remove();

			destroyFunction();
		}

	}



	protected abstract beforeInit() : void;
	protected abstract beforeSetListeners() : DestroyFunction;
	protected abstract beforeSetHtml() : DestroyFunction;

	public abstract tick() : void;
	public abstract afterTick() : void;

	public slowTick() : void
	{
		//Вывод фпс
		this.analyzeWrap('HTML_FPS', () => this.fpsIndicator.updateView());

		//Вывод тех информации
		this.analyzeWrap('HTML_TECH_INFO', () => this.techInfoIndicator.updateView());
	}

	public init() : void
	{

		this.beforeInit();

		let destroyListenersFunction = this.setListeners();
		let destroyHtmlFunction = this.setHtml();

		this.beforeDestroy = () => {
			destroyHtmlFunction();
			destroyListenersFunction();
		}

		this.audioContext.resume();

	}

	public destroy() : void
	{

		this.beforeDestroy && this.beforeDestroy();

		this.audioContext.suspend();

	}



}