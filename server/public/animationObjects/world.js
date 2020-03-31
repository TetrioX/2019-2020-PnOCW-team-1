let World = class {
  constructor(dim) {
    this.dimensions = dim
    this.objects = {};
    this.deadObjects = {};
    this.Id = 0;
  }

  addSnake(snake, Id = this.Id) {
    this.objects[Id] = snake;
  }

  killSnake(snakeId) {
    this.deadObjects[snakeId] = this.objects[snakeId];
    delete this.objects[snakeId];
  }

  checkCollision() {
    let colObj = []
    for (let snakeId in this.objects)
      for (let otherId in this.objects) {
        if (collision.snakeOutOfBounds(this.objects[snakeId], this.dimensions)
          || snakeId == otherId && collision.snakeCollidesWithItself(this.objects[snakeId])
          || snakeId != otherId && collision.snakeCollidesWithOther(this.objects[snakeId], this.objects[otherId]))
            colObj.push(snakeId)
       }
    return colObj
  }

  updateWorld(vel) {
    for (let snakeId in this.objects)
      this.objects[snakeId].updateSnake(vel, this.dimensions)
    let collided = this.checkCollision();
    for (let snakeId of collided)
      this.killSnake(snakeId)
  }
}