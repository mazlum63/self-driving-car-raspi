import type { Coordinate } from "@models/coordinate";

export class Terrain {
  distance: number = 30;
  width: number;
  height: number;
  borders: Coordinate[];
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.borders = [
      { x: this.distance, y: this.distance },
      { x: this.width - this.distance, y: this.distance },
      { x: this.width - this.distance, y: this.height - this.distance },
      { x: this.distance, y: this.height - this.distance },
    ];
  }
  draw(context: CanvasRenderingContext2D) {
    for (let i = 0; i < this.borders.length; i++) {
      this.drawLine(
        this.borders[i],
        this.borders[(i + 1) % this.borders.length],
        context
      );
    }
  }

  drawLine(A: Coordinate, B: Coordinate, context: CanvasRenderingContext2D) {
    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = "black";
    context.moveTo(A.x, A.y);
    context.lineTo(B.x, B.y);
    context.stroke();
  }
}
