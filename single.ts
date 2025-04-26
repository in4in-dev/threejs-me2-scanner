import Game from "./src/Project/Core/Game";

// @ts-ignore
(async function(){

	let game = new Game();

	await game.init();

	game.run();

})();

