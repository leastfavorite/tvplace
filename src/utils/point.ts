export default class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  plus(p: Point): Point {
    return new Point(this.x + p.x, this.y + p.y)
  }
  minus(p: Point): Point {
    return new Point(this.x - p.x, this.y - p.y)
  }
  times(n: number): Point {
    return new Point(this.x * n, this.y * n)
  }
  over(n: number): Point {
    return new Point(this.x / n, this.y / n)
  }
  avg(p: Point): Point {
    return this.plus(p).over(2)
  }
  floor(): Point {
    return new Point(Math.floor(this.x), Math.floor(this.y))
  }
  norm(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

}
