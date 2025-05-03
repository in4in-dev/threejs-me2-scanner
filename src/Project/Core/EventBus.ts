type EventFunction = (...args: any[]) => void;

export default class EventBus {

	private events : Record<string, EventFunction[]> = {};

	public on(event : string, callback : EventFunction) : void
	{

		if(!(event in this.events)){
			this.events[event] = [];
		}

		this.events[event].push(callback);

	}

	public off(event : string, callback? : EventFunction) : void
	{

		if(event in this.events){

			if(callback) {

				let index = this.events[event].indexOf(callback);

				if (index >= -1) {
					this.events[event].splice(index, 1);
				}

			}else{
				this.events[event] = [];
			}

		}

	}

	public emit(event : string, ...args : any[]) : void
	{

		if(event in this.events){
			this.events[event].forEach(fn => fn(...args));
		}

	}

}