import "./style.css";
import { Car } from "./car/car.js";
import { Terrain } from "./terrain/terrain.js";
import { Entity } from "./terrain/entity.js";
import { createEntity, saveCar } from "./utils/utils.js";

const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
const context = canvas!.getContext("2d") as CanvasRenderingContext2D;
const pauseBtn = document.getElementById("pause");
let isRunning: boolean = true;
var animationId: number;

const terrain = new Terrain(canvas.width, canvas.height);
let cars: Car[] = [];
const car = new Car(500, 500, terrain, true);
//const car2 = new Car(500, 500, terrain, false);
cars.push(car);
//cars.push(car2);

const entities: Entity[] = [];
for (let i = 0; i < 10; i++) {
  const newEntity = new Entity(terrain);
  entities.push(newEntity);
}
animate();

function animate() {
  if (!isRunning) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  terrain.draw(context);
  //cars = cars.filter((c) => !c.touched);
  cars.forEach((a) => {
    a.update(terrain.borders, cars, entities);
    a.draw(context);
  });
  entities.forEach((f) => {
    f.update(terrain.borders, cars, []);
    f.draw(context);
  });
  animationId = requestAnimationFrame(animate);
}

canvas.addEventListener("click", function (event: MouseEvent) {
  createEntity(event, terrain, entities);
});

canvas.addEventListener("contextmenu", function (event: PointerEvent) {
  event.preventDefault();
  saveCar(event, cars);
});

pauseBtn!.addEventListener("click", () => {
  isRunning = !isRunning;
  if (isRunning) {
    pauseBtn!.innerHTML = "⏸️";
    animationId = requestAnimationFrame(animate);
  } else {
    pauseBtn!.innerHTML = "▶️";
  }
});
