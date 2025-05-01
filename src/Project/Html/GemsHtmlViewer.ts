import HtmlComponent from "../Core/HtmlComponent";
import {Animation} from "../../Three/Animation";

class GemHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	public name : string;
	public code : string;
	public value : number;

	protected lastRenderedValue : number;

	protected loaderThrottler = Animation.createThrottler(1500);

	public constructor(code : string, name : string, value : number = 0) {

		super();

		this.name = name;
		this.code = code;
		this.value = value;
		this.lastRenderedValue = value;

		this.element = this.createElement(`<div class="gem">
			<span class="gem__value"></span>
			<div class="gem__progress">
				<i class="gem__progress-value"></i>
				<i class="gem__progress-loading"></i>
			</div>
			<span class="gem__name">${name}</span>
		</div>`);

	}

	protected getProgress() : number
	{
		return this.value / 100000;
	}

	public setValue(value : number)
	{
		this.value = value;
	}

	public updateView() {

		(<HTMLElement>this.element.querySelector('.gem__value')!).textContent = this.value.toFixed(0);
		(<HTMLElement>this.element.querySelector('.gem__progress-value')!).style.width = this.getProgress() * 100 + '%';

		if(this.lastRenderedValue !== this.value){

			this.lastRenderedValue = this.value;

			this.loaderThrottler(() => {

				let loader = this.element.querySelector('.gem__progress-loading')!;

				loader.classList.add('gem__progress-loading--active');

				setTimeout(function(){
					loader.classList.remove('gem__progress-loading--active');
				}, 700);

			});


		}

	}

}

export default class GemsHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	protected childrens : GemHtmlViewer[] = [];

	constructor() {

		super();

		this.element = this.createElement('<div class="gems"></div>');

	}

	public add(code : string, name : string, value : number = 0) : this
	{

		let children = new GemHtmlViewer(code, name, value);

		this.childrens.push(children);
		this.element.appendChild(children.element);

		return this;
	}

	public getValue(code : string) : number
	{

		let target = this.childrens.find(children => children.code === code);

		return target ? target.value : 0;

	}

	public setValue(code : string, value : number) : this
	{

		let target = this.childrens.find(children => children.code === code);

		if(target){
			target.setValue(value);
		}

		return this;
	}

	public updateView(){

		this.childrens.forEach(child => child.updateView());

	}


}