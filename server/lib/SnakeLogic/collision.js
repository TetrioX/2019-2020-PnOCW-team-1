const snake = require('./snake.js')  // asserting pre-conditions

/*
 * CollisionDetection.
 */
const snakeOutOfBounds = function(snake, dimensions) {
  pos = snake.headPos
  return pos.x < 0 || pos.y < 0 || pos.x > dimensions.x || pos.y > dimensions.y
}

const snakeCollidesWithItself = function(snake){
  return snake.parts.length > 5 && snakeCollidesWith(snake.parts[0], snake.parts.slice(5, snake.length))
}

const snakeCollidesWithOther = function(snake, otherSnake) {
  return snakeCollidesWith(snake.parts[0], otherSnake.parts)
}

const snakeCollidesWith = function(object, snakeParts) {
  for (let part of snakeParts)
    if (collidesWith(part, object))
      return true;
  return false;
}

const collidesWith = function(A, B) {
  return distanceBetween(A.pos, B.pos) <= A.size/2 + B.size/2
}

const distanceBetween = function(pos1, pos2) {
  return Math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2)
}


module.exports = {
  snakeOutOfBounds: snakeOutOfBounds,
  snakeCollidesWithItself: snakeCollidesWithItself,
  snakeCollidesWithOther: snakeCollidesWithOther
}
