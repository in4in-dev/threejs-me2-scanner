interface AnimationThrottler{
	(p: () => void) : void,
	getDelay() : number,
	getBeforeCall() : number,
	getAfterCall() : number
}

interface AnimationLoop{
	stop() : void
}

interface AnimationProgress{
	get() : number,
	restart() : AnimationProgress
}

class Animation
{

	public static createProgress(ms : number) : AnimationProgress
	{

		let time = Date.now();

		return {
			get(){
				return Math.min(1, (Date.now() - time) / ms);
			},
			restart() : AnimationProgress
			{
				time = Date.now();

				return this;
			}
		}

	}

	public static loop(n : number, callback : (...args : any[]) => any)
	{

		let active = true;

		let animate = () => {

			if(active) {
				n > 0 ? setTimeout(animate, n) : requestAnimationFrame(animate);
				callback();
			}

		}

		animate();

		return {
			stop(){
				active = false;
			}
		}

	}

	public static createThrottler(n : number, lastTime : number = 0) : AnimationThrottler
	{

		let fn = (fn : () => void) => {

			let now = Date.now();

			if(now - lastTime > n){
				lastTime = now;
				fn();
			}

		}

		Object.assign(fn, {
			getDelay(){
				return n;
			},
			getBeforeCall(){
				return Math.max(0, lastTime + n - Date.now());
			},
			getAfterCall(){
				return Date.now() - lastTime;
			}
		})

		return <AnimationThrottler>fn;

	}

}

export {Animation};
export type { AnimationThrottler, AnimationLoop, AnimationProgress };
