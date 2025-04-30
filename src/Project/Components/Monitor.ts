import Component from "../Core/Component";
import * as THREE from 'three';
import {Gem} from "./Planet";
import {AudioContext, LineBasicMaterial, Vector3} from "three";
import Sound from "../../Three/Sound";

interface MonitorLine
{
	line : THREE.Line,
	colors : number[],
	colorAttribute : THREE.BufferAttribute
}

interface GemsValues{
	zero : number,
	platinum : number,
	iridium : number,
	palladium : number
}

export default class Monitor extends Component
{

	protected body : THREE.Group;
	protected background : THREE.Group;

	protected lines : MonitorLine[] = [];
	protected lastChartPoints : number[] = [];

	protected soundIridium : Sound;
	protected soundPlatinum : Sound;
	protected soundPalladium : Sound;
	protected soundZero : Sound;

	public constructor(audioContext : AudioContext) {

		super();

		this.body = this.createBody();
		this.background = this.createBackground();

		this.add(this.body, this.background);

		this.soundIridium = new Sound(audioContext);
		this.soundIridium
			.setLoop(true)
			.setVolume(0)
			.loadFromFile('/assets/music/iridium.wav', true);

		this.soundPlatinum = new Sound(audioContext);
		this.soundPlatinum
			.setLoop(true)
			.setVolume(0)
			.loadFromFile('/assets/music/platinum.wav', true);

		this.soundPalladium = new Sound(audioContext);
		this.soundPalladium
			.setLoop(true)
			.setVolume(0)
			.loadFromFile('/assets/music/palladium.wav', true);

		this.soundZero = new Sound(audioContext);
		this.soundZero
			.setLoop(true)
			.setVolume(0)
			.loadFromFile('/assets/music/zero-element.wav', true);


	}

	private createBody() : THREE.Group
	{
		let group = new THREE.Group();

		group.rotation.set(0.5, -0.5, 0.25);

		return group;
	}


	private createBackground() : THREE.Group
	{

		let background = new THREE.Group();

		function createLine(start : Vector3, end : Vector3){

			let dir = new THREE.Vector3().subVectors(end, start);
			let length = dir.length();
			let angle = Math.atan2(dir.y, dir.x);

			let geometry = new THREE.PlaneGeometry(length, 0.005);
			let material = new THREE.MeshBasicMaterial({
				color: 0x00ff00,
				side: THREE.DoubleSide,
				opacity : 0.3,
				transparent : true,
			});
			let rect = new THREE.Mesh(geometry, material);

			rect.position.copy(start).add(dir.clone().multiplyScalar(0.5));
			rect.rotation.z = angle;

			return rect;

		}

		for(let i = 0; i < 1; i+=0.2){
			background.add(
				createLine(
					new Vector3(i, 0, 0),
					new Vector3(i, 1.2, 0),
				),
				createLine(
					new Vector3(i + 0.15, 0, 0),
					new Vector3(i + 0.15, 1.2, 0),
				)
			)

			for(let b = 0; b < 1.3; b+=0.15){

				background.add(
					createLine(
						new Vector3(i, b, 0),
						new Vector3(i + 0.15, b, 0),
					)
				);

			}

		}

		background.rotation.set(-1,-0.3,-0.45);

		return background;


	}

	private noise() : number
	{
		return Math.random() * 0.1 - 0.05;
	}

	private generateChartPoints(values : GemsValues) : number[]
	{

		let points = [
			...this.generateBetweenChartPoints(values.zero * 0.5, values.zero, 5),
			values.zero,
			...this.generateBetweenChartPoints(values.iridium, values.iridium, 5),
			values.platinum,
			...this.generateBetweenChartPoints(values.platinum, values.platinum, 5),
			values.palladium,
			...this.generateBetweenChartPoints(values.palladium * 0.5, values.palladium, 5),
		];

		return points.map(value => Math.min(value, 1));

	}

	private generateBetweenChartPoints(from : number, to : number, count : number) : number[]
	{

		let result = [];

		for(let i = 0; i < count / 2; i++){

			let delta = to - from * 0.1 * i;

			result.push(from + delta);

		}

		return result;

	}

	private gemsToValues(gems : Gem[]) : GemsValues
	{

		let gemsValues : GemsValues = {
			zero : 0,
			iridium : 0,
			palladium : 0,
			platinum : 0
		}

		gems.forEach(gem => {
			gemsValues.zero += gem.value.zero;
			gemsValues.platinum += gem.value.platinum;
			gemsValues.iridium += gem.value.iridium;
			gemsValues.palladium += gem.value.palladium;
		});

		return gemsValues;

	}

	private optimizeChartPoints(points : number[]) : number[]
	{

		if(!this.lastChartPoints.length){
			return points;
		}

		return points.map((value, i) => {

			let size = (value - this.lastChartPoints[i]);
			let step = Math.max(0.2, size * 0.3);

			if(size > 0){
				size = Math.min(size, step);
			}else{
				size = Math.max(size, -step);
			}

			return this.lastChartPoints[i] + size;

		});

	}

	private getColor(v : number) : THREE.Color
	{
		if (v > 0.8) return new THREE.Color(0xffffff);
		if (v > 0.7) return new THREE.Color(0xffbb66).lerp(new THREE.Color(0xffffff), (v - 0.7) / 0.1);
		if (v > 0.5) return new THREE.Color(0xffa500); // оранжевый
		if (v > 0.4) return new THREE.Color(0xff0000); // красный
		if (v > 0.2) return new THREE.Color(0x800000); // темно-красный
		return new THREE.Color(0x800000); // чёрный или любой фоновый
	}

	private createMonitorLine(points : number[]) : MonitorLine
	{

		let positions : number[] = [],
			colors : number[] = [],
			whiteColors : number[] = [];

		points.forEach((value, i)  => {

			let x = 0.06 * i;
			let y = value * 0.7 + this.noise();
			let z = 0;

			let color = this.getColor(value);

			positions.push(x, y, z);
			colors.push(color.r, color.g, color.b);
			whiteColors.push(1, 1, 1);

		});

		let geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

		let colorAttribute = new THREE.Float32BufferAttribute(whiteColors, 3);

		geometry.setAttribute('color', colorAttribute);

		let material = new THREE.LineBasicMaterial({ vertexColors: true });
		let line = new THREE.Line(geometry, material);

		return {
			line,
			colors,
			colorAttribute
		}

	}

	public animate(gems : Gem[]){

		let values = this.gemsToValues(gems);

		this.soundZero.setVolume(
			Math.min(values.zero / 2, 1)
		);

		this.soundPalladium.setVolume(
			Math.min(values.palladium / 2, 1)
		);

		this.soundIridium.setVolume(
			Math.min(values.iridium / 2, 1)
		);

		this.soundPlatinum.setVolume(
			Math.min(values.platinum / 2, 1)
		);

		let points = this.optimizeChartPoints(
			this.generateChartPoints(values)
		);

		this.lastChartPoints = points;

		this.lines.forEach((monitorLine, i) => {

			monitorLine.line.position.z -= 0.02;
			monitorLine.line.position.y += 0.02;
			(<LineBasicMaterial>monitorLine.line.material).transparent = true;
			(<LineBasicMaterial>monitorLine.line.material).opacity = 0.8 - (0.05 * (this.lines.length - i));
			(<LineBasicMaterial>monitorLine.line.material).needsUpdate = true;

		});

		if(this.lines.length){
			let lastLine = this.lines[this.lines.length - 1];

			lastLine.colorAttribute.copyArray(lastLine.colors);
			lastLine.colorAttribute.needsUpdate = true;
		}

		let newLine = this.createMonitorLine(points);

		this.lines.push(newLine);
		this.body.add(newLine.line);

		if(this.lines.length > 20){

			let firstLine = this.lines.shift();

			this.body.remove(firstLine!.line);

		}


	}

}