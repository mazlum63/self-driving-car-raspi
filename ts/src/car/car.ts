import type { Coordinate } from "@models/coordinate.js";
import { Movement } from "./movement.js";
import { Sensor } from "./sensor.js";
import { Terrain } from "../terrain/terrain.js";
import { Entity } from "../terrain/entity.js";

export class Car extends Entity {
  angle = 0;
  leftSpeed = 0;
  rightSpeed = 0;
  maxSpeed = 3;
  acceleration = 0.2;
  friction = 0.05;
  turnFactor = 0.1;
  wheelBase = this.width;

  speed: number = 0;
  sensor: Sensor;
  movement: Movement;
  constructor(x: number, y: number, terrain: Terrain, isUser: boolean = false) {
    super(terrain, x, y, 30, 30, 0);
    this.sensor = new Sensor(this);

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
    super.update(terrainBorders, cars, entities);
  }

  private move() {
    let leftPower = 0;
    let rightPower = 0;

    if (this.movement.forward) {
      leftPower -= this.acceleration;
      rightPower -= this.acceleration;
    }

    if (this.movement.reverse) {
      leftPower += this.acceleration;
      rightPower += this.acceleration;
    }

    if (this.movement.left) {
      leftPower -= this.turnFactor;
      rightPower += this.turnFactor;
    }

    if (this.movement.right) {
      leftPower += this.turnFactor;
      rightPower -= this.turnFactor;
    }

    this.leftSpeed += leftPower;
    this.rightSpeed += rightPower;

    this.leftSpeed *= 1 - this.friction;
    this.rightSpeed *= 1 - this.friction;

    this.leftSpeed = Math.max(
      -this.maxSpeed,
      Math.min(this.maxSpeed, this.leftSpeed)
    );
    this.rightSpeed = Math.max(
      -this.maxSpeed,
      Math.min(this.maxSpeed, this.rightSpeed)
    );

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
