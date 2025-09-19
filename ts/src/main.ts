import "./style.css";
import { Car } from "./car/car.js";
import { Terrain } from "./terrain/terrain.js";
import { Entity } from "./terrain/entity.js";
import { createEntity, getIntersection, lerp, saveCar } from "./utils/utils.js";
import { NeuralNetwork } from "./network/neuralnetwork.js";
import type { Coordinate } from "@models/coordinate.js";

const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
const context = canvas!.getContext("2d") as CanvasRenderingContext2D;

const isSingle: boolean = false;

const pauseBtn = document.getElementById("pause");
const deleteBtn = document.getElementById("delete");
let isRunning: boolean = true;
var animationId: number;

const terrain = new Terrain(canvas.width, canvas.height);
let cars: Car[] = [];
const userCar = new Car(500, 500, terrain, true);
cars.push(userCar);

for (let i = 0; i < (isSingle ? 1 : 100); i++) {
  let newCar = new Car(canvas.width / 2, canvas.height / 2, terrain, false);
  const bestBrain = window.localStorage.getItem("savedCar");
  if (bestBrain) {
    newCar.brain = JSON.parse(bestBrain);
    if (!isSingle) {
      NeuralNetwork.mutate(newCar.brain!, 0.05);
    }
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

// Use this, and comment out the `sensor.update` line in `car.ts` (inside the `update` function),
// if you want your car to decide and move on its own for a while.

// animate();
// async function animate() {
//   while (true) {
//     await new Promise((r) => setTimeout(r, 150));

//     cars.forEach((car) => {
//         car.sensor.update(terrain.borders, [], entities);
//       });

//     const moveStart = performance.now();
//     let lastTime = moveStart;
//     while (performance.now() - moveStart < 1000) {
//       cars = cars.filter((c) => !c.touched || !c.brain);
//       const now = performance.now();
//       const deltaTime = (now - lastTime) / 1000;

//       context.clearRect(0, 0, canvas.width, canvas.height);
//       terrain.draw(context);

//       cars.forEach((car) => {
//         car.update(terrain.borders, [], entities);
//         car.draw(context);
//       });

//       entities.forEach((f) => {
//         f.update(terrain.borders, cars, []);
//         f.draw(context);
//       });

//       lastTime = now;
//       await new Promise((r) => requestAnimationFrame(r));
//     }
//   }
// }

canvas.addEventListener("click", function (event: MouseEvent) {
  // const x = event.offsetX;
  // const y = event.offsetY;
  // createEntity(x, y, terrain, entities);

  const mouseCoordinate: Coordinate = { x: event.offsetX, y: event.offsetY };
  const baseCoordinate: Coordinate = {
    x: event.offsetX - 30,
    y: event.offsetY - 30,
  };
  for (const car of cars) {
    for (let i = 0; i < car.polygon.length; i++) {
      const touch = getIntersection(
        baseCoordinate,
        mouseCoordinate,
        car.polygon[i],
        car.polygon[(i + 1) % car.polygon.length]
      );
      if (touch) {
        cars = cars.filter((c) => c != car);
      }
    }
  }
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
