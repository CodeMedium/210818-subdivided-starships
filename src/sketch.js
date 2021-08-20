/**
 * Subdivided Starships v2
 * Started: 8/18/21
 * By: The Code Medium @thecodemedium
 *
 * This is the 2nd in a series to reproduce the art on the cover of "Code as Creative Medium" by Golan Levin and Tega Brain
 */

let spaceships = []
let maxShips
let shipColors = ['#fff', '#ff628c', '#FF9D00', '#fad000', '#2ca300', '#2EC4B6', '#5D37F0']
const bgColor = [0, 25, 60]

/**
 * Sketch entry point
 */
function setup () {
  maxShips = random(20, 50)
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
    
    // Draw the exhaust
    this.drawExhaust()
    
    // Draw the dome
    stroke(0)
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

  /**
   * Draws the exhaust behind a ship
   * @see https://p5js.org/examples/color-linear-gradient.html
   */
  drawExhaust () {
    let x = this.x
    let y = this.y
    let w = this.width
    let h = this.height
    let c1 = color([44, 122, 232, 90])
    let c2 = color([0, 25, 60, 0])
    
    noFill()

    // Top to bottom gradient
    let widthMod = 0
    if (this.dome.flip) {
      for (let i = x + w * 2; i > x; i--) {
        let inter = map(i, x + w, x, 0, 1)
        let c = lerpColor(c1, c2, inter)
        stroke(c)

        widthMod += .1
        line(i - w, y - widthMod, i - w, y + h + widthMod)
      }
    } else {
      for (let i = x - w; i <= x + w * 2; i++) {
        let inter = map(i, x, x + w, 0, 1)
        let c = lerpColor(c1, c2, inter)
        stroke(c)

        widthMod += .1
        line(i + w, y - widthMod, i + w, y + h + widthMod)
      }
    }
  }
}