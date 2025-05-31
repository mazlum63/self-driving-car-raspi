import type { Coordinate } from "@models/coordinate";
import { Entity } from "../terrain/entity";
import type { Terrain } from "../terrain/terrain";
import type { Car } from "../car/car";

export function lerp(A: number, B: number, t: number) {
  return A + (B - A) * t;
}

export function getIntersection(
  A: Coordinate,
  B: Coordinate,
  C: Coordinate,
  D: Coordinate
) {
  const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
  const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

  if (bottom != 0) {
    const t = tTop / bottom;
    const u = uTop / bottom;

    if (t >= 0 && t <= 1 && u > 0 && u <= 1) {
      return {
        x: lerp(A.x, B.x, t),
        y: lerp(A.y, B.y, t),
        offset: t,
      };
    }
  }
  return null;
}

export function polysIntersect(poly1: Coordinate[], poly2: Coordinate[]) {
  for (let i = 0; i < poly1.length; i++) {
    for (let j = 0; j < poly2.length; j++) {
      const touch = getIntersection(
        poly1[i],
        poly1[(i + 1) % poly1.length],
        poly2[j],
        poly2[(j + 1) % poly2.length]
      );
      if (touch) {
        return true;
      }
    }
  }
  return false;
}

export function createEntity(
  event: MouseEvent,
  terrain: Terrain,
  entities: Entity[]
) {
  const x = event.offsetX;
  const y = event.offsetY;
  const width = Math.floor(lerp(100, 20, Math.random()));
  const height = Math.floor(lerp(100, 20, Math.random()));
  const maxSize = Math.hypot(width, height) / 2;
  const minXY = maxSize + terrain.distance;
  const maxX = terrain.width - terrain.distance - maxSize;
  const maxY = terrain.height - terrain.distance - maxSize;
  if (x > minXY && x < maxX && y > minXY && y < maxY) {
    const newEntity = new Entity(terrain, x, y, width, height);
    entities.push(newEntity);
  }
}

export function saveCar(event: PointerEvent, cars: Car[]) {
  const mouseCoordinate: Coordinate = { x: event.offsetX, y: event.offsetY };
  const baseCoordinate: Coordinate = { x: 0, y: 0 };
  for (const car of cars) {
    for (let i = 0; i < car.polygon.length; i++) {
      const touch = getIntersection(
        baseCoordinate,
        mouseCoordinate,
        car.polygon[i],
        car.polygon[(i + 1) % car.polygon.length]
      );
      if (touch) {
        localStorage.setItem("savedCar", car.x.toString());
      }
    }
  }
}
