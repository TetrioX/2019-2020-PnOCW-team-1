let Snake = class {
  constructor(size, partSize, headPos, colors) {
    for (let i = 0; i < size; i++) {
      let pos = {x: headPos.x - partSize / 3 * i, y: headPos.y}
      let part;
      if (i > size - size / 10) part = new SnakePart(this, i, pos, (size - i + 1) * partSize / (size / 10 + 1), 0, partSize)
      else part = new SnakePart(this, i, pos, partSize, 0, partSize)
      this.parts.push(part)
    }
    this.colors = colors;
    this.headPos = headPos;
  }

  parts = []

  changeDirection(newDir) {
    console.log("ye")
    for (let part of this.parts)
      part.cacheNewDirection(newDir, {x: this.parts[0].pos.x, y: this.parts[0].pos.y})
  }

  nextSlave;
  changeDirectionOnPosition(newDir, pos, nextSlave) {
    // console.log("det:", newDir, pos, nextSlave)
    this.nextSlave = nextSlave;
    for (let part of this.parts)
      part.cacheNewDirection(newDir, pos)
  }

  update(dt) {
    let res = false;
    for (let part of this.parts){
      let changed = part.updatePosition(dt)
      if (changed) res = true;
      if (part.name == 0) this.headPos = part.pos
      part.headPos = this.headPos
    }
    return res;
  }

  draw(ctx) {
    // Draw each segment of the snake.
    for (let part of this.parts)
      part.drawSnakePart(ctx, this.colors)
  }
}

let SnakePart = class {
  constructor(snake, name, startPosition, size, direction, originalSize) {
      this.pos = startPosition;
      this.size = size;
      this.name = name;
      this.dir = direction;
      this.devMax = originalSize / 5;
      this.deviation = 0;
      this.devSide = 1;
      this.cycleTime = 1000 / originalSize;
      this.headPos = this.Pos;
      this.vel = 20 / 1000;
  }

  newDir = [];
  startPos = [];
  newDirCached = false;
  cacheNewDirection(newDir, startPos) {
    this.newDir.push(newDir);
    this.startPos.push(startPos);
    this.newDirCached = true;
  }

  changeDirection() {
    this.dir = this.newDir[0];
    // console.log('changed')
    this.newDir.shift()
    this.startPos.shift()
    if (this.newDir.length < 1) this.newDirCached = false;
    return true;
  }

  checkStartPosPassed(pos) {
    // console.log("check", this.name, " ", this.dir, " ", this.pos, " ", this.startPos)
    if (this.dir >= 0 && this.dir < Math.PI / 2 && pos.x >= this.startPos[0].x && pos.y >= this.startPos[0].y)
      return true;
    else if (this.dir >= Math.PI / 2 && this.dir <= Math.PI && pos.x <= this.startPos[0].x && pos.y >= this.startPos[0].y)
      return true;
    else if (this.dir >= - Math.PI / 2 && this.dir < 0 && pos.x >= this.startPos[0].x && pos.y <= this.startPos[0].y)
      return true;
    else if (this.dir >= - Math.PI && this.dir < - Math.PI / 2 && pos.x <= this.startPos[0].x && pos.y <= this.startPos[0].y)
      return true;
    else return false;
  }

  // 30 fps
  timePassed = 0;
  updatePosition(dt) {
    let changed = false;
    this.updateDeviation();
    let posX = this.pos.x + this.vel * dt * Math.cos(this.dir);
    let posY = this.pos.y + this.vel * dt * Math.sin(this.dir);
    if (! this.newDirCached || this.newDirCached && ! this.checkStartPosPassed({x: posX, y: posY}))
      this.pos = {x: posX, y: posY}
    else {
      let r = Math.sqrt((this.pos.x - this.startPos[0].x)**2 + (this.pos.y - this.startPos[0].y)**2)
      this.pos.x += r * Math.cos(this.dir);
      this.pos.y += r * Math.sin(this.dir);
      changed = this.changeDirection()
      this.pos.x += (this.vel*dt-r) * Math.cos(this.dir);
      this.pos.y += (this.vel*dt-r) * Math.sin(this.dir);
    }
    this.timePassed++;
    if (this.name == 0) return changed
  }

  cycleTime = 40;
  updateDeviation() {
    this.deviation = this.devMax * Math.sin((this.timePassed - this.name) * 2 * Math.PI / this.cycleTime)
    if (Math.abs(this.deviation) >= this.devMax) this.devSide *= -1;
  }

  drawSnakePart(ctx, colors) {
    // Color the segments of the snake.
    if (this.name % 2 == 1 || this.name == 0) ctx.fillStyle = colors.light;
    else ctx.fillStyle = colors.dark;

    // Draw the given snake segment.
    ctx.beginPath();
    ctx.arc(this.pos.x + this.deviation * Math.sin(this.dir) ,
                this.pos.y + this.deviation * Math.cos(this.dir),
                this.size / 2, 0, 2 * Math.PI);
    ctx.fill();

    // The snake's head isn't whole without eyes. Draw them on the first segment.
    if (this.name == 0) {
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(this.pos.x + this.size / 4 * Math.sin(this.dir) + this.deviation * Math.sin(this.dir),
                  this.pos.y + this.size / 4 * Math.cos(this.dir) + this.deviation * Math.cos(this.dir),
                  this.size / 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.pos.x - this.size / 4 * Math.sin(this.dir) + this.deviation * Math.sin(this.dir),
                  this.pos.y - this.size / 4 * Math.cos(this.dir) + this.deviation * Math.cos(this.dir),
                  this.size / 6, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}
