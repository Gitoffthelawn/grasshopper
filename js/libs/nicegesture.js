const NiceGesture = {}
NiceGesture.threshold = 10

NiceGesture.start = (container, actions) => {
  container.addEventListener(`mousedown`, (e) => {
    NiceGesture.reset()

    // Right Click
    if (e.button === 2) {
      NiceGesture.active = true
      NiceGesture.first_y = e.clientY
      NiceGesture.first_x = e.clientX
    }
  })

  container.addEventListener(`mousemove`, (e) => {
    if (!NiceGesture.active) {
      return
    }

    if (NiceGesture.coords.length > 1000) {
      return
    }

    let coord = {
      x: e.clientX,
      y: e.clientY,
    }

    NiceGesture.coords.push(coord)
  })

  container.addEventListener(`contextmenu`, (e) => {
    if (!NiceGesture.active) {
      return
    }

    NiceGesture.check(e, actions)
  })

  NiceGesture.reset()
}

NiceGesture.reset = () => {
  NiceGesture.active = false
  NiceGesture.first_y = 0
  NiceGesture.first_x = 0
  NiceGesture.last_y = 0
  NiceGesture.last_x = 0
  NiceGesture.coords = []
}

NiceGesture.check = (e, actions) => {
  e.preventDefault()

  let diff_y = Math.abs(e.clientY - NiceGesture.first_y)
  let diff_x = Math.abs(e.clientX - NiceGesture.first_x)

  if (diff_y > NiceGesture.threshold || diff_x > NiceGesture.threshold) {
    NiceGesture.last_x = e.clientX
    NiceGesture.last_y = e.clientY
    NiceGesture.action(e, actions)
  }
  else if (actions.default) {
    actions.default(e)
  }

  NiceGesture.reset(actions)
}

NiceGesture.action = (e, actions) => {
  let ys = NiceGesture.coords.map(c => c.y)
  let max_y = Math.max(...ys)
  let min_y = Math.min(...ys)

  let xs = NiceGesture.coords.map(c => c.x)
  let max_x = Math.max(...xs)
  let min_x = Math.min(...xs)

  let gt = NiceGesture.threshold
  let path_y, path_x

  if (min_y < NiceGesture.first_y - gt) {
    path_y = `up`
  }
  else if (max_y > NiceGesture.first_y + gt) {
    path_y = `down`
  }

  if (path_y === `up`) {
    if (NiceGesture.last_y > min_y) {
      if (Math.abs(NiceGesture.last_y - min_y) > gt) {
        path_y = `up_and_down_1`
      }
    }
  }

  if (path_y === `down`) {
    if (NiceGesture.last_y < max_y) {
      if (Math.abs(NiceGesture.last_y - max_y) > gt) {
        path_y = `up_and_down_2`
      }
    }
  }

  if (max_x > NiceGesture.first_x + gt) {
    path_x = `right`
  }
  else if (min_x < NiceGesture.first_x - gt) {
    path_x = `left`
  }

  if (path_x === `left`) {
    if (NiceGesture.last_x > min_x) {
      if (Math.abs(NiceGesture.last_x - min_x) > gt) {
        path_x = `left_and_right_1`
      }
    }
  }

  if (path_x === `right`) {
    if (NiceGesture.last_x < max_x) {
      if (Math.abs(NiceGesture.last_x - max_x) > gt) {
        path_x = `left_and_right_2`
      }
    }
  }

  let path

  if (max_y - min_y > max_x - min_x) {
    path = path_y
  }
  else {
    path = path_x
  }

  if (actions[path]) {
    actions[path](e)
  }
}