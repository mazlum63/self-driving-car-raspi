import type { Coordinate } from "@models/coordinate.js";
import { Movement } from "./movement.js";
import { Sensor } from "./sensor.js";
import { Terrain } from "../terrain/terrain.js";
import { Entity } from "../terrain/entity.js";
import { NeuralNetwork } from "../network/neuralnetwork.js";

export class Car extends Entity {
  angle = 0;
  leftSpeed = 0;
  rightSpeed = 0;
  maxSpeed = 2;
  wheelBase = this.width;

  speed: number = 0;
  sensor: Sensor;
  brain?: NeuralNetwork;
  movement: Movement;
  constructor(x: number, y: number, terrain: Terrain, isUser: boolean = false) {
    super(terrain, x, y, 15, 20, 0);
    this.sensor = new Sensor(this);
    if (!isUser) {
      this.brain = new NeuralNetwork([this.sensor.rayCount + 6, 16, 8, 4]);
    }
    this.movement = new Movement(isUser);
    this.terrain = terrain;
  }

  override update(
    terrainBorders: Coordinate[],
    cars: Car[],
    entities: Entity[]
  ) {
    this.move();
    this.sensor.update(terrainBorders, cars, entities);
    let offset = this.sensor.readings.map((r) =>
      r == null ? 0 : 1 - r.offset
    );

    if (this.brain) {
      const lastLevel = this.brain.levels.length - 1;
      const lastMovement: number[] = [
        this.brain.levels[lastLevel].outputs[0],
        this.brain.levels[lastLevel].outputs[1],
        this.brain.levels[lastLevel].outputs[2],
        this.brain.levels[lastLevel].outputs[3],
      ];
      const outputs = NeuralNetwork.feedForward(
        [
          ...offset,
          ...lastMovement,
          this.leftSpeed / this.maxSpeed,
          this.rightSpeed / this.maxSpeed,
        ],
        this.brain
      );
      this.movement.forward = outputs[0];
      this.movement.left = outputs[1];
      this.movement.right = outputs[2];
      this.movement.reverse = outputs[3];

      if (outputs[0] && !outputs[1]) {
        this.movement.leftWheel = true;
      } else if (!outputs[0] && outputs[1]) {
        this.movement.leftWheel = false;
      } else {
        this.movement.leftWheel = null;
      }


      
      if (outputs[2] && !outputs[3]) {
        this.movement.rightWheel = true;
      } else if (!outputs[2] && outputs[2]) {
        this.movement.rightWheel = false;
      } else {
        this.movement.rightWheel = null;
      }
    }
    super.update(terrainBorders, cars, entities);
  }

  private move() {
    this.leftSpeed = 0;
    this.rightSpeed = 0;

    // if (this.movement.forward) {
    //   this.leftSpeed = -this.maxSpeed;
    //   this.rightSpeed = -this.maxSpeed;
    // }

    // if (this.movement.reverse) {
    //   this.leftSpeed = this.maxSpeed;
    //   this.rightSpeed = this.maxSpeed;
    // }

    // if (this.movement.left) {
    //   this.leftSpeed = 0;
    //   this.rightSpeed = this.maxSpeed;
    // }

    // if (this.movement.right) {
    //   this.leftSpeed = this.maxSpeed;
    //   this.rightSpeed = 0;
    // }

    if (this.movement.leftWheel == true) {
      this.leftSpeed = -this.maxSpeed;
    } else if (this.movement.leftWheel == false) {
      this.leftSpeed = -this.maxSpeed;
    } else {
      this.leftSpeed = 0;
    }

    if (this.movement.rightWheel == true) {
      this.rightSpeed = -this.maxSpeed;
    } else if (this.movement.rightWheel == false) {
      this.rightSpeed = -this.maxSpeed;
    } else {
      this.rightSpeed = 0;
    }

    const speed = (this.leftSpeed + this.rightSpeed) / 2;
    const rotation = (this.rightSpeed - this.leftSpeed) / this.wheelBase;

    this.angle += rotation;

    const newX = this.x + Math.sin(this.angle) * speed;
    const newY = this.y + Math.cos(this.angle) * speed;
    if (
      newX >= 0 + this.terrain.distance &&
      newX <= this.terrain.width - this.terrain.distance &&
      newY >= 0 + this.terrain.distance &&
      newY <= this.terrain.height - this.terrain.distance
    ) {
      this.x = newX;
      this.y = newY;
    }
  }
  override draw(context: CanvasRenderingContext2D) {
    this.sensor.draw(context);
    super.draw(context);
  }
}
