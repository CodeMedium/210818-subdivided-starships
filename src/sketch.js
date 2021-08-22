/**
 * Subdivided Starships v2
 * Started: 8/18/21
 * By: The Code Medium @thecodemedium
 *
 * This is the 2nd in a series to reproduce the art on the cover of "Code as Creative Medium" by Golan Levin and Tega Brain
 */

// Variables
let spaceships = []
const spaceshipStroke = 1

let asteroids = []
let ringworlds = []
let cityPlanets = []
let bg

/**
 * Sketch entry point
 */
function setup () {
  // Settings
  maxShips = 50//random(20, 50)
  maxAsteroids = 70//random(30, 70)
  maxRingworlds = 20//random(5, 20)
  maxCityPlanets = 10//random(7, 10)
  bgColor = [0, 25, 60]
  colors = ['#ffffff', '#ff628c', '#FF9D00', '#fad000', '#2ca300', '#2EC4B6', '#5D37F0']
    
  createCanvas(windowWidth, windowHeight)
  bg = createGraphics(windowWidth, windowHeight)
  createScene()
}

/**
 * Recreates the scene
 */
function createScene () {
  createAsteroids()
  createRingworlds()
  redrawBg()
  createShips()
  createCityPlanets()
}
function createShips () {
  spaceships = []
  for (let i = 0; i < maxShips; i++) {
    spaceships.push(new Spaceship())
  }
}
function createAsteroids () {
  asteroids = []
  for (let i = 0; i < maxAsteroids; i++) {
    asteroids.push(new Asteroid())
  }
}
function createRingworlds () {
  ringworlds = []
  for (let i = 0; i < maxRingworlds; i++) {
    ringworlds.push(new Ringworld())
  }
}
function createCityPlanets () {
  cityPlanets = []
  for (let i = 0; i < maxCityPlanets; i++) {
    cityPlanets.push(new CityPlanet())
  }
}

/**
 * Repaints the background with asteroids and planets
 */
function redrawBg () {
  bg.background(bgColor)
  asteroids.forEach(asteroid => {asteroid.update()})
  ringworlds.forEach(ringworld => {ringworld.update()})
}

/**
 * Returns a color in colors
 */
function getColor (transparent = '') {
  return colors[Math.floor(random(colors.length))] + transparent
}

/**
 * "Game loop"
 */
function draw () {
  image(bg, 0, 0)

  cityPlanets.forEach(cityPlanet => {cityPlanet.update()})
  spaceships.forEach(spaceship => {spaceship.update()})

  /**
   * Recording. This will only work locally and not on OpenProcessing
   * @see https://github.com/CodeMedium/subdivided-starships
   */
  if (typeof capturer !== 'undefined') {
    capturer.capture(canvas)
  }
}

/**
 * Recreate scene on mouseclick
 */
function keyPressed () {
  keypressFn.forEach(fn => fn())
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
    this.speed = this.width / 120
    this.bg = createGraphics(this.width, this.height)
    
    this.dome = {
      color: getColor(),
      flip: random() > .5
    }
    this.children = this.subdivide()

    this.draw()
  }

  /**
   * Draw once
   */
  draw () {
    // Setup
    // this.bg.rotate(this.rotation)
    this.bg.strokeWeight(spaceshipStroke)
    
    // Draw the exhaust
    this.drawExhaust()
    
    // Draw the dome
    this.bg.stroke(0)
    this.bg.fill(this.dome.color)
    if (this.dome.flip) {
      this.bg.circle(this.width - this.height / 2 - spaceshipStroke * 2, this.height / 2, this.height - spaceshipStroke)
    } else {
      this.bg.circle(this.height / 2 + spaceshipStroke * 2, this.height / 2, this.height - spaceshipStroke)
    }

    // Draw subdivisions
    this.updateChildren(this.children)
  }
  
  /**
   * Draw it on the canvas
   */
   update () {
    if (this.dome.flip) {
      this.x += this.speed
    } else {
      this.x -= this.speed
    }

    // Wrap elements around
    this.wrap(this)
    
    rotate(this.rotation)
    image(this.bg, this.x, this.y)
  }
  
  /**
   * Recursive method that subdivides the rectangle
   */
  subdivide (depth = 0, parent) {
    const divisions = [{}, {}, {}, {}]
    
    if (!parent) {
      let x

      if (this.dome.flip) {
        x = 0
      } else {
        x = this.height / 2
      }

      parent = {
        x,
        y: 0,
        width: this.width - this.height / 2 - spaceshipStroke,
        height: this.height - spaceshipStroke
      }
    }
    
    // Setup properties and maybe create children
    divisions.forEach((division, i) => {
      divisions[i].isDivided = random() > (.5 + depth / 10)
      divisions[i].fill = getColor()
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
   * Recursively update children
   */
  updateChildren (children) {
    children.forEach(child => {
      this.wrap(child)
      this.bg.fill(child.fill)
      this.bg.rect(child.x, child.y, child.width, child.height)
      
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
    
    this.bg.noFill()

    // Top to bottom gradient
    let widthMod = 0
    if (this.dome.flip) {
      for (let i = x + w * 2; i > x; i--) {
        let inter = map(i, x + w, x, 0, 1)
        let c = lerpColor(c1, c2, inter)
        this.bg.stroke(c)

        widthMod += .1
        this.bg.line(i - w, y - widthMod, i - w, y + h + widthMod)
      }
    } else {
      for (let i = x - w; i <= x + w * 2; i++) {
        let inter = map(i, x, x + w, 0, 1)
        let c = lerpColor(c1, c2, inter)
        this.bg.stroke(c)

        widthMod += .1
        this.bg.line(i + w, y - widthMod, i + w, y + h + widthMod)
      }
    }
  }
}

/**
 * Represents an asteroid (litle donuts)
 */
class Asteroid {
  constructor () {
    this.x = random(0, windowWidth)
    this.y = random(0, windowWidth)
    this.size = random(3, 10)
    this.thickness = random(1, this.size)
    this.color = getColor()
    this.center = {
      hasCenter: random() > .5,
      color: getColor()
    }
  }

  update () {
    if (this.center.hasCenter) {
      bg.fill(this.center.color)
    } else {
      bg.noFill()
    }
    bg.rotate(0)
    bg.strokeWeight(this.thickness)
    bg.stroke(this.color)
    bg.circle(this.x, this.y, this.size)
  }
}


/**
 * Represents a ringworld
 */
class Ringworld {
  constructor () {
    this.x = random(0, windowWidth)
    this.y = random(0, windowWidth)
    this.size = random(3, 10)
    this.thickness = random(1, this.size)
    this.color = getColor()
    this.ring = {
      size: random(this.size + 20, this.size + 80),
      color: getColor()
    }
    this.center = {
      hasCenter: random() > .5,
      color: getColor()
    }
  }

  update () {
    if (this.center.hasCenter) {
      bg.fill(this.center.color)
    } else {
      bg.noFill()
    }

    // Center
    bg.rotate(0)
    bg.strokeWeight(this.thickness)
    bg.stroke(this.color)
    bg.circle(this.x, this.y, this.size)

    // Ring
    bg.strokeWeight(1)
    bg.stroke(this.ring.color)
    bg.noFill()
    bg.circle(this.x, this.y, this.ring.size)
  }
}

/**
 * Represents a planet with towers
 */
class CityPlanet {
  constructor () {
    this.x = random(0, windowWidth)
    this.y = random(0, windowWidth)
    this.size = random(10, 50)
    this.thickness = random(this.size - 10, this.size)
    this.color = getColor('aa')
    this.ring = {
      size: random(this.size + 20, this.size + 80),
      color: getColor('aa')
    }
    this.extraRotation = 0
    this.extraRotationDir = random() > .5 ? 1 : -1

    // Create cities
    this.cities = []
    for (let i = 0; i < random(30, 60); i++) {
      const city = {
        maxHeight: random(10, 60),
        rotate: random(PI * 2),
        direction: random() > .5 ? 1 : -1,
        thickness: random(2, 8),
        color: getColor('aa')
      }
      city.height = random(1, city.maxHeight - 1)
      
      this.cities.push(city)
    }
  }

  update () {
    this.extraRotation += 0.0025
    
    // Center
    noFill()
    rotate(0)
    strokeWeight(this.thickness)
    stroke(this.color)
    circle(this.x, this.y, this.size)

    // Ring
    strokeWeight(this.ring.size - this.size - this.thickness)
    stroke(this.ring.color)
    circle(this.x, this.y, this.ring.size)

    // City
    strokeWeight(0)
    fill(this.ring.color)
    this.cities.forEach(city => {
      city.height += .5 * city.direction
      if (city.height < 1) city.direction = 1
      if (city.height > city.maxHeight) city.direction = -1
      
      push()
      fill(city.color)
      translate(this.x, this.y)
      rotate(city.rotate + this.extraRotation * this.extraRotationDir)
      translate(0, this.ring.size - this.thickness - (this.size - this.thickness) / 2)
      rect(-city.thickness / 2, 0, city.thickness / 2, city.height)
      pop()
    })
  }
}

















/**
 * Split keypressed into multiple functions
 * - On my localhost I have another file to record the canvas into a video,
 *   but on OpenProcessing.org this file is not. Locally, the other file
 *   adds another function that starts recording if space is pressed
 * 
 * @see https://github.com/CodeMedium/subdivided-starships
 */
 const keypressFn = [function () {
  switch (keyCode) {
    case 32:
      break
    case 49:
      createScene()
      break
    case 50:
      createShips()
      redrawBg()
      break
    case 51:
      createAsteroids()
      redrawBg()
      break
    case 52:
      createRingworlds()
      redrawBg()
      break
    case 53:
      createCityPlanets()
      redrawBg()
      break
  }
}]
