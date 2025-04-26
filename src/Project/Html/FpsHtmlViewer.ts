import HtmlComponent from "../Core/HtmlComponent";
import Engine from "../Core/Engine";

export default class FpsHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	protected engine : Engine;

	constructor(engine : Engine) {

		super();

		this.engine = engine;
		this.element = this.createElement('<div class="fps"></div>');

	}

	protected prepare(x : number, length : number) : string
	{

		let r = x.toString();

		for(let i = 0; i < length - x.toString().length; i++){
			r = '0' + r;
		}

		return r;

	}

	public updateView(){

		this.element.textContent = `${this.prepare(this.engine.fps, 5)} (Render: ${this.prepare(this.engine.fpsRender, 5)})`;

	}


}