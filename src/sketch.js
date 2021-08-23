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

let ringworlds = []
let cityPlanets = []
let cityConnections = {}
let cityCurId = 0
let bg

bgColor = [0, 25, 60]
colors = ['#ffffff', '#ff628c', '#FF9D00', '#fad000', '#2ca300', '#2EC4B6', '#5D37F0']

/**
 * Sketch entry point
 */
function setup () {
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
  maxShips = random(50, 100)
  spaceships = []
  for (let i = 0; i < maxShips; i++) {
    spaceships.push(new Spaceship())
  }
}
function createAsteroids () {
  maxAsteroids = random(30, 70)
  asteroids = []
  for (let i = 0; i < maxAsteroids; i++) {
    asteroids.push(new Asteroid())
  }
}
function createRingworlds () {
  maxRingworlds = random(5, 20)
  ringworlds = []
  for (let i = 0; i < maxRingworlds; i++) {
    ringworlds.push(new Ringworld())
  }
}
function createCityPlanets () {
  maxCityPlanets = random(3, 8)
  cityPlanets = []
  cityConnections = {}
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

  connectCities()
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
    this.x = random(windowWidth * -1.5, windowWidth * 1.5)
    this.y = random(windowWidth * -1.5, windowHeight * 1.5)
    this.rotation = random(-PI)
    this.speed = this.width / 120
    this.bg = createGraphics(this.width * 2, this.height * 2)
    
    this.domeColor =  getColor()
    this.children = this.subdivide()

    this.draw()
  }

  /**
   * Draw once
   */
  draw () {
    // Setup
    this.bg.strokeWeight(spaceshipStroke)
    
    // Draw the exhaust
    this.drawExhaust()
    
    // Draw the dome
    this.bg.stroke(0)
    this.bg.fill(this.domeColor)
    this.bg.circle(this.height / 2 + spaceshipStroke * 2, this.height, this.height - spaceshipStroke)

    // Draw subdivisions
    this.updateChildren(this.children)
  }
  
  /**
   * Draw it on the canvas
   */
   update () {
    this.x -= this.speed

    // Wrap elements around
    this.wrap(this)
    
    push()
    rotate(this.rotation)
    image(this.bg, this.x, this.y)
    pop()
  }
  
  /**
   * Recursive method that subdivides the rectangle
   */
  subdivide (depth = 0, parent) {
    const divisions = [{}, {}, {}, {}]
    
    if (!parent) {
      let x

      x = this.height / 2

      parent = {
        x,
        y: this.height / 2,
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
    if (target.x < -windowWidth * 1.5) {
      target.x = windowWidth * 1.5 
      target.rotation = random(PI * 2)
      this.newColor(target)
    }
    if (target.x > windowWidth * 1.5) {
      target.x = -windowWidth * 1.5
      target.rotation = random(PI * 2)
      this.newColor(target)
    }
    if (target.y < -windowHeight * 1.5) {
      target.y = windowHeight * 1.5
      target.rotation = random(PI * 2)
      this.newColor(target)
    }
    if (target.y > windowHeight * 1.5) {
      target.y = -windowHeight * 1.5
      target.rotation = random(PI * 2)
      this.newColor(target)
    }
  }

  newColor (target) {
    target.color = getColor()
    target.children && target.children.forEach(child => {
      this.newColor(child)
    })
  }

  /**
   * Draws the exhaust behind a ship
   * @see https://p5js.org/examples/color-linear-gradient.html
   */
  drawExhaust () {
    let c1 = color([44, 122, 232, 90])
    let c2 = color([0, 25, 60, 0])
    
    this.bg.noFill()

    // Top to bottom gradient
    let widthMod = 0
    for (let i = 0; i <= this.width * 2; i++) {
      let inter = map(i, 0, this.width * 2, 0, 1)
      let c = lerpColor(c1, c2, inter)
      this.bg.stroke(c)

      widthMod += .1
      this.bg.line(this.height / 2 + i, this.height / 2 - widthMod, this.height / 2 + i, this.height * 1.5 + widthMod)
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
    this.id = ++cityCurId
    
    this.x = random(windowWidth - windowWidth * 1.15, windowWidth * 1.15)
    this.y = random(windowHeight - windowHeight * 1.15, windowHeight * 1.15)

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

    setTimeout(() => {
      this.connectCities()
    }, 0)
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

  /**
   * Connects the star to all other stars
   */
  connectCities () {
    cityPlanets.forEach(planet => {
      cityPlanets.forEach(city => {
        if (random() < .5) {
          let maxId = max(planet.id, city.id)
          let minId = max(planet.id, city.id)
          cityConnections[maxId + '-' + minId] = {
            from: planet,
            to: city,
            color: getColor(hex(random(20), 2))
          }
        }
      })
    })
  }
}

/**
 * Connect all cities
 */
function connectCities () {
  Object.keys(cityConnections).forEach(key => {
    const road = cityConnections[key]
    stroke(road.color)
    strokeWeight(1)
    line(road.from.x, road.from.y, road.to.x, road.to.y)
  })
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
