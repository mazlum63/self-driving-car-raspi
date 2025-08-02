import "./style.css";
import { Car } from "./car/car.js";
import { Terrain } from "./terrain/terrain.js";
import { Entity } from "./terrain/entity.js";
import { createEntity, lerp, saveCar } from "./utils/utils.js";
import { NeuralNetwork } from "./network/neuralnetwork.js";
import { NeuralNetworkVisualizer } from "./network/network-visualizer.js";

const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
const context = canvas!.getContext("2d") as CanvasRenderingContext2D;

const vcanvas = document.getElementById(
  "visualizerCanvas"
) as HTMLCanvasElement;
const vcontext = vcanvas!.getContext("2d") as CanvasRenderingContext2D;

const pauseBtn = document.getElementById("pause");
const deleteBtn = document.getElementById("delete");
let isRunning: boolean = true;
var animationId: number;

const terrain = new Terrain(canvas.width, canvas.height);
let cars: Car[] = [];
const userCar = new Car(500, 500, terrain, true);
cars.push(userCar);

for (let i = 0; i < 222; i++) {
  let newCar = new Car(canvas.width / 2, canvas.height / 2, terrain, false);
  const bestBrain = window.localStorage.getItem("savedCar");
  if (bestBrain) {
    newCar.brain = JSON.parse(bestBrain);
    NeuralNetwork.mutate(newCar.brain!, 0.1);
  }
  cars.push(newCar);
}

const entities: Entity[] = [];
for (let i = 0; i < 20; i++) {
  createEntity(
    lerp(terrain.width - terrain.distance, terrain.distance, Math.random()),
    lerp(terrain.height - terrain.distance, terrain.distance, Math.random()),
    terrain,
    entities
  );
}

animate();
function animate() {
  NeuralNetworkVisualizer.drawNetwork(vcontext, cars[1].brain!);
  // return;
  if (!isRunning) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  terrain.draw(context);
  cars = cars.filter((c) => !c.touched || !c.brain);
  cars.forEach((car) => {
    car.update(terrain.borders, [], entities);
    car.draw(context);
  });
  entities.forEach((f) => {
    f.update(terrain.borders, cars, []);
    f.draw(context);
  });
  animationId = requestAnimationFrame(animate);
}

canvas.addEventListener("click", function (event: MouseEvent) {
  const x = event.offsetX;
  const y = event.offsetY;
  createEntity(x, y, terrain, entities);
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

deleteBtn!.addEventListener("click", () => {
  window.localStorage.removeItem("savedCar");
});
