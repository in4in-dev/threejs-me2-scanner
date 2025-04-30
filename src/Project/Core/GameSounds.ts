import Sound from "../../Three/Sound";

export default class GameSounds {

	private context : AudioContext;

	public probeLaunch : Sound;
	public probeLanded : Sound;
	public backgroundMusic : Sound;
	public platinum : Sound;
	public palladium : Sound;
	public iridium : Sound;
	public zeroElement : Sound;


	constructor() {

		this.context = new AudioContext();

		this.probeLaunch = new Sound(this.context);
		this.probeLanded = new Sound(this.context);

		this.backgroundMusic = new Sound(this.context);
		this.backgroundMusic.setLoop(true);

		this.iridium = new Sound(this.context);
		this.iridium.setLoop(true);

		this.palladium = new Sound(this.context);
		this.palladium.setLoop(true);

		this.platinum = new Sound(this.context);
		this.platinum.setLoop(true);

		this.zeroElement = new Sound(this.context);
		this.zeroElement.setLoop(true);

	}

	public async load(){

		return Promise.all([
			this.probeLaunch.loadFromFile('/assets/music/launch.wav'),

		])

	}

}