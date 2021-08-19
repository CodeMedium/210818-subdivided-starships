/**
 * Subdivided Starships
 * Started: 8/18/21
 * By: Semi @SemiGenerative
 *
 * This is the first in a series to reproduce the art on the cover of "Code as Creative Medium" by Golan Levin and Tega Brain
 */

let spaceships = []
let maxShips
let shipColors = ['#fff', '#ff628c', '#FF9D00', '#fad000', '#2ca300', '#2EC4B6', '#5D37F0']
const bgColor = [0, 25, 60]

/**
 * Sketch entry point
 */
function setup () {
  maxShips = random(75, 150)
  createCanvas(windowWidth, windowHeight)
  createShips()
}

function createShips () {
  spaceships = []
  background(bgColor)
  for (let i = 0; i < maxShips; i++) {
    spaceships.push(new Spaceship())
  }
}

/**
 * "Game loop"
 */
function draw () {
  background(bgColor)

  spaceships.forEach(ship => {
    ship.update()
  })
}

/**
 * Recreate scene on mouseclick
 */
function keyPressed () {
  createShips()
}
function mouseClicked () {
  createShips()
}

/**
 * Represents a Spaceship
 */
class Spaceship {
  constructor () {
    this.width = random(30, 200)
    this.height = this.width / 3
    this.x = random(0, windowWidth)
    this.y = random(0, windowHeight)
    this.rotation = random(0, 359)
    this.children = this.subdivide()
    this.speed = this.width / 120
    
    this.dome = {
      color: this.getColor(),
      flip: random() > .5
    }
  }
  
  /**
   * Returns a color in shipColors
   */
  getColor () {
    return shipColors[Math.floor(random(shipColors.length))]
  }
  
  /**
   * Recursive method that subdivides the rectangle
   */
  subdivide (depth = 0, parent) {
    const divisions = [{}, {}, {}, {}]
    
    if (!parent) {
      parent = {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height
      }
    }
    
    // Setup properties and maybe create children
    divisions.forEach((division, i) => {
      divisions[i].isDivided = random() > (.5 + depth / 10)
      divisions[i].fill = this.getColor()
      divisions[i].width = parent.width / 2
      divisions[i].height = parent.height / 2
    })
    
    // NW
    divisions[0].x = parent.x
    divisions[0].y = parent.y
    // NE
    divisions[1].x = parent.x + parent.width / 2
    divisions[1].y = parent.y
    // SE
    divisions[2].x = parent.x + parent.width / 2
    divisions[2].y = parent.y + parent.height / 2
    // SW
    divisions[3].x = parent.x
    divisions[3].y = parent.y + parent.height / 2
    
    // Setup children
    ++depth
    divisions.forEach((division, i) => {
      if (divisions[i].isDivided && depth < 4) {
        divisions[i].children = this.subdivide(depth, divisions[i])
      }
    })
    
    return divisions
  }
  
  /**
   * Update the 
   */
  update () {
    // Setup
    rotate(this.rotation)
    strokeWeight(1)
    
    
    // Draw the dome
    fill(this.dome.color)
    if (this.dome.flip) {
      this.x += this.speed
      circle(this.x + this.width, this.y + this.height / 2, this.height)
    } else {
      this.x -= this.speed
      circle(this.x, this.y + this.height / 2, this.height)
    }

    // Wrap elements around
    this.wrap(this)

    // Draw subdivisions
    this.updateChildren(this.children)
  }
  
  /**
   * Recursively update children
   */
  updateChildren (children) {
    children.forEach(child => {
      child.x += this.dome.flip ? this.speed : -this.speed
      this.wrap(child)
      fill(child.fill)
      rect(child.x, child.y, child.width, child.height)
      
      if (child.children) {
        this.updateChildren(child.children)
      }
    })
  }

  /**
   * Wraps the ship around the window
   * @fixme Because we use rotation, the x/y isn't relative to the viewport. I have no idea how to fix this 😅
   */
  wrap (target) {
    if (target.x < -windowWidth * 2) target.x = windowWidth * 2
    if (target.x > windowWidth * 2) target.x = -windowWidth * 2
    if (target.y < -windowHeight * 2) target.y = windowHeight * 2
    if (target.y > windowHeight * 2) target.y = -windowHeight * 2
  }
}