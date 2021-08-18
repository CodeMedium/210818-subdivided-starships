const spaceships = []

/**
 * Sketch entry point
 */
function setup () {
	createCanvas(windowWidth, windowHeight)
	background(0, 25, 60)

  for (let i = 0; i < random(30, 100); i++) {
    new Spaceship()
  }
}

/**
 * "Game loop"
 */
function draw () {
}

/**
 * Represents a Spaceship
 */
class Spaceship {
  constructor () {
    this.size = random(30, 200)
    this.x = random(0, windowWidth)
    this.y = random(0, windowHeight)
    this.rotation = random(0, PI * 2)

    this.draw()
  }

  draw () {
    draw()
    rotate(this.rotation)
    rect(this.x, this.y, this.size, this.size / 3)
  }
}