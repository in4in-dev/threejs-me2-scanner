import Component from "../Core/Component";
import {Vector3} from "three";
import Probe from "./Probe";
import * as THREE from 'three';

export default class Probes extends Component
{

	public probes : Probe[] = [];

	protected camera : THREE.Camera;

	public constructor(camera : THREE.Camera) {
		super();

		this.camera = camera;
	}

	public launch(to : Vector3, landedCallback : () => void, destroyedCallback : () => void = () => {}){

		let offset = new THREE.Vector3(
			(Math.random() > 0.5 ? 1 : -1) * 1.5,
			(Math.random() - 0.5) * 1.0,
			0
		);

		let from = this.camera.localToWorld(offset);

		let probe = new Probe(from, to, landedCallback, destroyedCallback);

		this.probes.push(probe);

		this.add(probe);

	}

	public animate(){

		this.probes = this.probes.filter(probe => {

			if(probe.animationCompleted){
				this.remove(probe);
				return false;
			}

			probe.animate();

			return true;

		})

	}

}