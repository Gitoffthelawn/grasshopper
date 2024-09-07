App.jump_tabs = async (args = {}) => {
  let def_args = {
    reverse: false,
  }

  App.def_args(def_args, args)
  let unfold = App.get_setting(`jump_unfold`)
  let unloaded = App.get_setting(`jump_unloaded`)

  await App.check_on_tabs(unfold)

  if (!args.item) {
    args.item = App.get_selected(`tabs`)
  }

  if (!args.item) {
    args.item = App.get_active_tab_item()
  }

  let items = App.get_items(`tabs`)

  if (!unfold) {
    items = items.filter(it => it.visible)
  }

  let headers = [`header`, `subheader`, `headers`, `zone`]
  let zones = [...headers, `zone`]
  let h_action = App.get_setting(`header_action`)
  let index = items.indexOf(args.item)
  let matched_once = false
  let waypoint = false
  let first = undefined
  let target

  if (args.what === `tag`) {
    target = App.get_jump_target(args.info)
  }
  else if (zones.includes(args.what)) {
    if (index > 0) {
      if (h_action === `first`) {
        if (items[index - 1].header) {
          args.item = items[index - 1]
        }
      }
    }
  }

  let item_list

  if (args.reverse) {
    item_list = items.slice(0).reverse()
  }
  else {
    item_list = items
  }

  function jump(it) {
    let action
    let index_2 = items.indexOf(it)
    let diff = Math.abs(index - index_2)

    if (diff <= 1) {
      action = `jump_fast`
    }
    else {
      if (zones.includes(args.what)) {
        action = `jump_zone`
      }
      else {
        action = `jump`
      }
    }

    App.tabs_action({item: it, from: action, on_action: false})
  }

  function check_first(it) {
    if (!first) {
      first = it
    }
  }

  function check(it) {
    if (args.what === `all`) {
      return true
    }
    else if (args.what === `pin`) {
      return it.pinned
    }
    else if (args.what === `normal`) {
      return !it.pinned
    }
    else if (args.what === `tab`) {
      return !it.header
    }
    else if (args.what === `unread`) {
      return it.unread
    }
    else if (args.what === `playing`) {
      return it.playing
    }
    else if (args.what === `color`) {
      let id = App.get_color(it)
      return id && (id === args.info)
    }
    else if (args.what === `tag`) {
      let tags = App.get_tags(it)
      return tags.includes(target)
    }
    else if (args.what === `header`) {
      return App.is_header(it)
    }
    else if (args.what === `subheader`) {
      return App.is_subheader(it)
    }
    else if (args.what === `headers`) {
      return it.header
    }
    else if (args.what === `split`) {
      if (App.get_split_top(it) || App.get_split_bottom(it)) {
        if (!it.header) {
          return true
        }
      }

      return false
    }
    else if (args.what === `zone`) {
      if (it.header) {
        if (h_action === `first`) {
          return false
        }

        return true
      }
      else if (App.is_split(it)) {
        return true
      }

      return false
    }
  }

  // -------------------------

  for (let it of item_list) {
    let matched = check(it)

    if (matched) {
      matched_once = true
    }

    if (it === args.item) {
      waypoint = true
      check_first(it)
      continue
    }

    if (matched) {
      if (waypoint && it.header && (h_action === `first`)) {
        if (headers.includes(args.what)) {
          App.jump_tabs({what: `tab`, item: it})
          return
        }
      }

      if (it.unloaded && !unloaded) {
        if (it.header && headers.includes(args.what)) {
          // Allow unloaded headers
        }
        else {
          continue
        }
      }

      if (!waypoint) {
        check_first(it)
        continue
      }

      jump(it)
      return
    }
  }

  if (!matched_once) {
    if (args.what === `tag`) {
      App.alert(`To use jump give tabs the 'jump', 'jump2', or 'jump3' tags`)
    }
  }

  if (first && (first !== args.item)) {
    jump(first)
  }
}

App.get_jump_target = (num) => {
  if (num === 1) {
    return `jump`
  }
  else {
    return `jump${num}`
  }
}

App.filter_jump_tag = (mode, num) => {
  let target = App.get_jump_target(num)
  App.filter_tag({mode: mode, tag: target, from: `jump`})
}

App.wipe_jump = (num) => {
  let target = App.get_jump_target(num)
  App.do_wipe_tag(target)
}

// Jump Functions

App.jump_tabs_all = (reverse = false) => {
  App.jump_tabs({what: `all`, reverse: reverse})
}

App.jump_tabs_pin = (reverse = false) => {
  App.jump_tabs({what: `pin`, reverse: reverse})
}

App.jump_tabs_normal = (reverse = false) => {
  App.jump_tabs({what: `normal`, reverse: reverse})
}

App.jump_tabs_color = (id, reverse = false) => {
  App.jump_tabs({what: `color`, info: id, reverse: reverse})
}

App.jump_tabs_tag = (num, reverse = false) => {
  App.jump_tabs({what: `tag`, info: num, reverse: reverse})
}

App.jump_tabs_header = (reverse = false) => {
  App.jump_tabs({what: `header`, reverse: reverse})
}

App.jump_tabs_subheader = (reverse = false) => {
  App.jump_tabs({what: `subheader`, reverse: reverse})
}

App.jump_tabs_headers = (reverse = false) => {
  App.jump_tabs({what: `headers`, reverse: reverse})
}

App.jump_tabs_split = (reverse = false) => {
  App.jump_tabs({what: `split`, reverse: reverse})
}

App.jump_tabs_zone = (reverse = false) => {
  App.jump_tabs({what: `zone`, reverse: reverse})
}

App.jump_tabs_unread = (reverse = false) => {
  App.jump_tabs({what: `unread`, reverse: reverse})
}

App.jump_tabs_playing = (reverse = false) => {
  App.jump_tabs({what: `playing`, reverse: reverse})
}