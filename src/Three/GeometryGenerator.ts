import * as THREE from "three";
import Random from "./Random";
import {BufferGeometry, Curve, Vector3} from "three";

export default class GeometryGenerator
{

	public static rim(radius : number, thickness : number, tubeSegments : number, radialSegments : number) : BufferGeometry
	{

		// Создание кривой эллипса для орбиты
		let curve = new THREE.EllipseCurve(
			0, 0,
			radius, radius,
			0, 2 * Math.PI,
			false,
			0
		);

		// Получение точек из кривой
		let points = curve.getPoints(64);

		// Создание кривой из точек
		let curvePath = new THREE.CurvePath();

		curvePath.add(new THREE.CatmullRomCurve3(
			points.map(point => new THREE.Vector3(point.x, 0, point.y)))
		);

		// Создание трубчатой геометрии
		return new THREE.TubeGeometry(<Curve<Vector3>>curvePath, tubeSegments, thickness, radialSegments, true);

	}

	public static emptySphere(radius : number, pointsCount : number) : THREE.BufferGeometry
	{

		let points = [];

		for (let i = 0; i < pointsCount; i++) {
			let phi = Math.acos(2 * Math.random() - 1);
			let theta = 2 * Math.PI * Math.random();
			let x = radius * Math.sin(phi) * Math.cos(theta);
			let y = radius * Math.sin(phi) * Math.sin(theta);
			let z = radius * Math.cos(phi);

			points.push(new THREE.Vector3(x, y, z));
		}

		return new THREE.BufferGeometry().setFromPoints(points);

	}

	public static filledSphere(radius : number, pointsCount : number) : THREE.BufferGeometry
	{

		let positions = [];

		for (let i = 0; i < pointsCount; i++) {

			let phi = Math.acos(2 * Math.random() - 1);
			let theta = 2 * Math.PI * Math.random();

			let x = Random.int(0, radius) * Math.sin(phi) * Math.cos(theta);
			let y = Random.int(0, radius) * Math.sin(phi) * Math.sin(theta);
			let z = Random.int(0, radius) * Math.abs(Math.cos(phi));

			positions.push(x, y, z);

		}

		let particleGeometry = new THREE.BufferGeometry();

		particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

		return particleGeometry;

	}

}