import type { Coordinate } from "@models/coordinate.js";
import { getIntersection, lerp } from "../utils/utils.js";
import { Car } from "./car.js";
import type { Reading } from "@models/reading.js";
import type { Entity } from "../terrain/entity.js";

export class Sensor {
  showSensor = true;
  showAfterIntersec = false;
  car: Car;
  rayCount: number = 3;
  rayLength: number = 200;
  raySpread: number = Math.PI / 3;
  rays: Coordinate[][] = [];
  readings: Array<Reading | null> = [];
  constructor(car: Car) {
    this.car = car;
  }

  public update(terrainBorders: Coordinate[], cars: Car[], entities: Entity[]) {
    this.readings = [];
    this.castRays();
    this.rays.forEach((r: Coordinate[]) => {
      this.readings.push(this.getReadings(r, terrainBorders, cars, entities));
    });
  }

  private getReadings(
    ray: Coordinate[],
    terrainBorders: Coordinate[],
    cars: Car[],
    entities: Entity[]
  ): Reading | null {
    let intersections: Array<Reading | null> = [];
    intersections.push(
      ...this.handleRayIntersection(ray, terrainBorders, null)
    );
    intersections.push(...this.handleRayEntityIntersection(ray, cars));
    intersections.push(...this.handleRayEntityIntersection(ray, entities));
    if (intersections.length == 0) {
      return null;
    } else {
      const offsets = intersections.map((i) => i!.offset);
      const minOffset = Math.min(...offsets);
      return intersections.find(
        (i) => i!.offset == minOffset
      ) as Reading | null;
    }
  }

  public draw(context: CanvasRenderingContext2D) {
    for (let i = 0; i < this.rayCount; i++) {
      let endPoint: Coordinate | Reading | null = this.rays[i][1];
      if (this.readings[i]) {
        endPoint = this.readings[i];
      }

      if (this.showSensor) {
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = "yellow";
        context.moveTo(this.rays[i][0].x, this.rays[i][0].y);
        context.lineTo(endPoint!.x, endPoint!.y);
        context.stroke();
      }

      context.beginPath();
      context.arc(endPoint!.x, endPoint!.y, 1, 0, Math.PI * 2);
      context.strokeStyle = "#7CFC00";
      context.stroke();

      if (this.showAfterIntersec) {
        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = "black";
        context.moveTo(this.rays[i][1].x, this.rays[i][1].y);
        context.lineTo(endPoint!.x, endPoint!.y);
        context.stroke();
      }
    }
  }

  private castRays() {
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++) {
      let rayAngle =
        lerp(this.raySpread / 2, -this.raySpread / 2, i / (this.rayCount - 1)) +
        this.car.angle;
      /*      if (i == 0) {
        rayAngle += Math.PI;
      }
      if (i == this.rayCount - 1) {
        rayAngle += -Math.PI;
      } */

      const start = { x: this.car.x, y: this.car.y };
      const end = {
        x: this.car.x - Math.sin(rayAngle) * this.rayLength,
        y: this.car.y - Math.cos(rayAngle) * this.rayLength,
      };

      this.rays.push([start, end]);
    }
  }

  private handleRayEntityIntersection(
    ray: Coordinate[],
    entities: Entity[]
  ): Array<Reading | null> {
    let intersections: Array<Reading | null> = [];
    for (let i = 0; i < entities.length; i++) {
      intersections.push(
        ...this.handleRayIntersection(ray, entities[i].polygon, entities[i])
      );
    }

    return intersections;
  }

  private handleRayIntersection(
    ray: Coordinate[],
    coordinates: Coordinate[],
    entity: Entity | null
  ): Array<Reading | null> {
    let intersections: Array<Reading | null> = [];
    for (let i = 0; i < coordinates.length; i++) {
      const intersection: Reading | null = getIntersection(
        ray[0],
        ray[1],
        coordinates[i],
        coordinates[(i + 1) % coordinates.length]
      );
      if (intersection && entity != this.car) {
        intersections.push(intersection);
      }
    }
    return intersections;
  }
}
