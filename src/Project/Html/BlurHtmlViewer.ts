import HtmlComponent from "../Core/HtmlComponent";
import Engine from "../Core/Engine";

export default class BlurHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;


	constructor() {

		super();

		this.element = this.createElement('<div class="blur"></div>');
		this.hide();

	}

	public show(){
		this.element.style.opacity = '1';
	}

	public hide(){
		this.element.style.opacity = '0';
	}

	public updateView(){



	}


}