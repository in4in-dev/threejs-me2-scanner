import HtmlComponent from "../Core/HtmlComponent";


class TechParamHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	protected name : string;
	protected value : () => any;

	constructor(name : string, value : () => any) {

		super();

		this.name = name;
		this.value = value;

		this.element = this.createElement('<div class="tech-info__row"></div>');

	}

	public updateView() {
		this.element.textContent = this.name + ': ' + this.value().toString();
	}

}

export default class TechInfoHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	protected params : TechParamHtmlViewer[] = [];

	constructor() {

		super();

		this.element = this.createElement(`<div class="tech-info"></div>`);

	}

	public addParam(name : string, value : () => any) : this
	{

		let param = new TechParamHtmlViewer(name, value);

		this.params.push(param);

		this.element.appendChild(param.element);

		return this;

	}

	public updateView(){

		this.params.forEach(param => param.updateView());

	}


}