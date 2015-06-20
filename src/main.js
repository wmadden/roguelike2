import pixi from "pixi.js";
import Game from "Game";

document.addEventListener("DOMContentLoaded", () => {
  let renderer = new pixi.WebGLRenderer(80 * 16, 40 * 16);
  let stage = new pixi.Stage();
  let game = new Game({
    pixiRenderer: renderer,
    stage: stage,
  });
  let previousTimestamp = 0;

  document.body.appendChild(renderer.view);
  game.load();

  function drawLoop(timestamp) {
    let msElapsed;
    msElapsed = timestamp - previousTimestamp;
    previousTimestamp = timestamp;
    game.draw(msElapsed);
    return requestAnimationFrame(drawLoop);
  }

  return requestAnimationFrame((timestamp) => {
    previousTimestamp = timestamp;
    return drawLoop(timestamp);
  });
});
