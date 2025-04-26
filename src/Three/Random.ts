import * as THREE from 'three';

export default class Random
{

	public static int(from : number, to : number) : number
	{
		return THREE.MathUtils.randInt(from, to);
	}

	public static float(from : number, to : number) : number
	{
		return THREE.MathUtils.randFloat(from, to);
	}

	public static arr<T = any>(arr : T[]) : T
	{
		return arr[Random.int(0, arr.length - 1)];
	}

}