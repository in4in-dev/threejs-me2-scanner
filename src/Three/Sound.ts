export default class Sound {

	private context : AudioContext;
	private gain : GainNode;

	private buffer : AudioBuffer | null = null;
	private source : AudioBufferSourceNode | null = null;

	private playing : boolean = false;
	private loop : boolean = false;

	constructor(context : AudioContext) {
		this.context = context;
		this.gain = context.createGain();
	}

	public static create(context : AudioContext) : Sound
	{
		return new Sound(context);
	}

	public loadFromBuffer(audioBuffer: AudioBuffer) : this
	{
		this.buffer = audioBuffer;

		return this;
	}

	public loadFromFile(src : string, startAfterLoad : boolean = false) : this
	{

		fetch(src)
			.then(file => file.arrayBuffer())
			.then(buffer => this.context.decodeAudioData(buffer))
			.then(audioData => {

				this.loadFromBuffer(audioData);

				if(startAfterLoad){
					this.start();
				}

			});

		return this;

	}

	public setVolume(value : number) : this
	{

		this.gain.gain.value = value;

		return this;

	}

	public getVolume() : number
	{
		return this.gain.gain.value;
	}

	public setLoop(value : boolean) : this
	{
		this.loop = value;

		return this;
	}

	public getLoop() : boolean
	{
		return this.loop;
	}

	public start() : this
	{

		if(this.playing){
			this.stop();
		}

		this.playing = true;

		this.source = this.context.createBufferSource();
		this.source.buffer = this.buffer;
		this.source.start(0);
		this.source.loop = this.loop;

		this.source.onended = () => {
			this.playing = false;
			this.source = null;
		};

		this.source.connect(this.gain).connect(this.context.destination);

		return this;
	}

	public stop() : this
	{
		if(this.source){
			this.source.stop();

			this.playing = false;
			this.source = null;
		}

		return this;
	}

}