App.jump_action = (item) => {
  App.tabs_action(item, `jump`)
}

App.jump_first = (item, first) => {
  if (first && (first !== item)) {
    App.jump_action(first)
  }
}

App.jump_vars = (item) => {
  let items = App.get_items(`tabs`)
  let skip_unloaded = !App.get_setting(`jump_unloaded`)
  return {items, skip_unloaded}
}

App.jump_tabs_color = (id, reverse = false) => {
  let item = App.get_active_tab_item()
  let {items, skip_unloaded} = App.jump_vars(item)
  let waypoint = false
  let first = undefined

  if (reverse) {
    items = items.slice(0).reverse()
  }

  function check_first(it) {
    if (!first) {
      first = it
    }
  }

  for (let item_ of items) {
    if (item_ === item) {
      waypoint = true
      check_first(item_)
      continue
    }

    let id_ = App.get_color(item_)

    if (!id_) {
      continue
    }

    // Check
    if (id_ === id) {
      if (item_.unloaded && skip_unloaded) {
        continue
      }

      if (!waypoint) {
        check_first(item_)
        continue
      }

      App.jump_action(item_)
      return
    }
  }

  App.jump_first(item, first)
}

App.jump_tabs_tag = (num, reverse = false) => {
  let item = App.get_active_tab_item()
  let {items, skip_unloaded} = App.jump_vars(item)
  let waypoint = false
  let first = undefined
  let has_tag = false
  let target

  if (num === 1) {
    target = `jump`
  }
  else {
    target = `jump${num}`
  }

  if (reverse) {
    items = items.slice(0).reverse()
  }

  function check_first(it) {
    if (!first) {
      first = it
    }
  }

  for (let item_ of items) {
    if (item_ === item) {
      waypoint = true
      check_first(item_)
      continue
    }

    let tags = App.get_tags(item_)

    // Check
    if (tags.includes(target)) {
      has_tag = true

      if (item_.unloaded && skip_unloaded) {
        continue
      }

      if (!waypoint) {
        check_first(item_)
        continue
      }

      App.jump_action(item_)
      return
    }
  }

  if (!has_tag) {
    App.alert(`To use jump give tabs the 'jump', 'jump2', or 'jump3' tags`)
  }

  App.jump_first(item, first)
}