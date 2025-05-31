import type { Coordinate } from "../models/coordinate.js";
import { lerp, polysIntersect } from "../utils/utils.js";
import { Terrain } from "../terrain/terrain.js";

export class Entity {
  public width: number;
  public height: number;
  public angle: number = 0;
  public x: number;
  public y: number;

  public terrain: Terrain;

  touched: boolean = false;
  polygon: Coordinate[] = this.createPolygon();
  constructor(
    terrain: Terrain,
    x: number = 0,
    y: number = 0,
    width: number = 30,
    height: number = 30,
    angle: number = Math.random()
  ) {
    (this.width = width), (this.height = height);
    this.terrain = terrain;
    this.x =
      x == 0
        ? lerp(
            this.width + this.terrain.distance,
            this.terrain.width - this.terrain.distance - this.width,
            Math.random()
          )
        : x;
    this.y =
      y == 0
        ? lerp(
            this.height + this.terrain.distance,
            this.terrain.height - this.terrain.distance - this.height,
            Math.random()
          )
        : y;
    this.angle = angle;
  }

  public update(
    terrainBorders: Coordinate[],
    cars: Entity[],
    entities: Entity[]
  ) {
    this.polygon = this.createPolygon();
    this.touched = this.assessTouch(terrainBorders, cars, entities);
  }
  protected assessTouch(
    terrainBorders: Coordinate[],
    cars: Entity[],
    entities: Entity[]
  ) {
    if (polysIntersect(this.polygon, terrainBorders)) {
      return true;
    }

    if (this.checkPolygons(cars)) {
      return true;
    }
    if (this.checkPolygons(entities)) {
      return true;
    }
    return false;
  }
  protected createPolygon(): Coordinate[] {
    const radiant = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    return [
      {
        x: this.x - Math.sin(this.angle - alpha) * radiant,
        y: this.y - Math.cos(this.angle - alpha) * radiant,
      },
      {
        x: this.x - Math.sin(this.angle + alpha) * radiant,
        y: this.y - Math.cos(this.angle + alpha) * radiant,
      },
      {
        x: this.x - Math.sin(Math.PI + this.angle - alpha) * radiant,
        y: this.y - Math.cos(Math.PI + this.angle - alpha) * radiant,
      },
      {
        x: this.x - Math.sin(Math.PI + this.angle + alpha) * radiant,
        y: this.y - Math.cos(Math.PI + this.angle + alpha) * radiant,
      },
    ];
  }

  public draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    if (this.touched) {
      context.fillStyle = "#ccc";
      context.strokeStyle = "#ccc";
    } else {
      context.fillStyle = "#000";
      context.strokeStyle = "#000";
    }
    for (let i = 0; i < this.polygon.length; i++) {
      context.rect(this.polygon[i].x - 2, this.polygon[i].y - 2, 4, 4);
      context.moveTo(this.polygon[i].x, this.polygon[i].y);
      context.lineTo(
        this.polygon[(i + 1) % this.polygon.length].x,
        this.polygon[(i + 1) % this.polygon.length].y
      );
    }

    context.stroke();
    context.fill();
  }

  private checkPolygons(entities: Entity[]): boolean {
    for (let i = 0; i < entities.length; i++) {
      if (
        polysIntersect(this.polygon, entities[i].polygon) &&
        entities[i] != this
      ) {
        return true;
      }
    }
    return false;
  }
}
