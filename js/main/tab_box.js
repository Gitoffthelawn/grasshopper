App.setup_tab_box = () => {
  App.update_tab_box_debouncer = App.create_debouncer((what) => {
    App.do_update_tab_box(what)
  }, App.update_tab_box_delay)
}

App.create_tab_box = () => {
  let tab_box = DOM.create(`div`, `box`, `tab_box`)
  let title = DOM.create(`div`, `box_title glow`, `tab_box_title`)
  title.title = `This is the Tab Box`

  DOM.ev(title, `click`, (e) => {
    App.tab_box_menu(e)
  })

  let pos = App.get_setting(`tab_box_position`)

  if (pos === `top`) {
    tab_box.classList.add(`box_top`)
  }

  tab_box.append(title)
  let container = DOM.create(`div`, `box_container`, `tab_box_container`)
  tab_box.append(container)
  App.setup_container_mouse(`tabs`, tab_box)
  App.tab_box_ready = false
  return tab_box
}

App.check_tab_box = () => {
  if (!App.tab_box_ready) {
    App.set_tab_box_items()
    App.tab_box_ready = true
  }
}

App.update_tab_box = (what) => {
  if (!App.tab_box_enabled()) {
    return
  }

  App.update_tab_box_debouncer.call(what)
}

App.do_update_tab_box = (what) => {
  if (!App.tab_box_enabled()) {
    return
  }

  App.check_tab_box()
  App[`update_tab_box_${what}`]()
}

App.update_tab_box_recent = () => {
  if (!App.tab_box_mode(`recent`)) {
    return
  }

  let o_items = App.get_recent_tabs({max: App.tab_box_max})
  let items = App.get_tab_box_items(o_items, `recent`)
  App.fill_tab_box(items)
}

App.update_tab_box_headers = () => {
  if (!App.tab_box_mode(`headers`)) {
    return
  }

  let o_items = App.get_header_tabs()
  let items = App.get_tab_box_items(o_items, `headers`)
  App.fill_tab_box(items, false)
}

App.update_tab_box_pins = () => {
  if (!App.tab_box_mode(`pins`)) {
    return
  }

  let o_items = App.get_pinned_tabs()
  let items = App.get_tab_box_items(o_items, `pins`)
  App.fill_tab_box(items, false)
}

App.update_tab_box_colors = () => {
  if (!App.tab_box_mode(`colors`)) {
    return
  }

  let o_items = App.get_colored_items(`tabs`)
  let items = App.get_tab_box_items(o_items, `colors`)
  App.fill_tab_box(items, false)
}

App.update_tab_box_playing = () => {
  if (!App.tab_box_mode(`playing`)) {
    return
  }

  let o_items = App.get_playing_tabs()
  let items = App.get_tab_box_items(o_items, `playing`)
  App.fill_tab_box(items, false)
}

App.get_tab_box_items = (o_items, mode) => {
  let items = []

  for (let o_item of o_items) {
    if (!o_item || !o_item.element) {
      continue
    }

    if (mode !== `headers`) {
      if (o_item.header) {
        continue
      }
    }

    let {element, ...item} = o_item
    item.tab_box = true
    App.create_item_element(item)
    items.push(item)
  }

  return items
}

App.set_tab_box_items = () => {
  let mode = App.get_setting(`tab_box_mode`)
  let title = DOM.el(`#tab_box_title`)
  title.textContent = App.capitalize(mode)
}

App.fill_tab_box = (items, scroll = true) => {
  let c = DOM.el(`#tab_box_container`)
  c.innerHTML = ``

  for (let item of items) {
    c.append(item.element)
  }

  if (scroll) {
    App.scroll_to_top(c)
  }
}

App.change_tab_box_mode = (what) => {
  App.set_setting(`tab_box_mode`, what)
  App.set_tab_box_items()
  App.update_tab_box(what)
}

App.tab_box_menu = (e) => {
  let items = []
  let mode = App.get_setting(`tab_box_mode`)

  if (mode !== `recent`) {
    items.push({
      text: `Recent`,
      icon: App.mode_icons.tabs,
      action: () => {
        App.change_tab_box_mode(`recent`)
      }
    })
  }

  if (mode !== `pins`) {
    items.push({
      text: `Pins`,
      icon: App.get_setting(`pin_icon`) || App.mode_icons.tabs,
      action: () => {
        App.change_tab_box_mode(`pins`)
      }
    })
  }

  if (mode !== `colors`) {
    items.push({
      text: `Colors`,
      icon: App.settings_icons.theme,
      action: () => {
        App.change_tab_box_mode(`colors`)
      }
    })
  }

  if (mode !== `playing`) {
    items.push({
      text: `Playing`,
      icon: App.get_setting(`playing_icon`) || App.mode_icons.tabs,
      action: () => {
        App.change_tab_box_mode(`playing`)
      }
    })
  }

  if (mode !== `headers`) {
    items.push({
      text: `Headers`,
      icon: App.zone_icon,
      action: () => {
        App.change_tab_box_mode(`headers`)
      }
    })
  }

  App.sep(items)
  let sizes = []

  for (let [i, size] of App.sizes.entries()) {
    if (App.get_setting(`tab_box`) === size.value) {
      continue
    }

    sizes.push({
      text: size.text,
      action: (e) => {
        App.set_setting(`tab_box`, size.value)
        App.apply_theme()
      },
    })
  }

  items.push({
    text: `Size`,
    items: sizes,
  })

  let positions = []
  let position = App.get_setting(`tab_box_position`)

  if (position !== `top`) {
    positions.push({
      text: `Top`,
      action: (e) => {
        App.set_setting(`tab_box_position`, `top`)
        App.clear_show()
      },
    })
  }

  if (position !== `bottom`) {
    positions.push({
      text: `Bottom`,
      action: (e) => {
        App.set_setting(`tab_box_position`, `bottom`)
        App.clear_show()
      },
    })
  }

  items.push({
    text: `Position`,
    items: positions,
  })

  items.push({
    text: `Hide`,
    action: (e) => {
      App.show_confirm({
        message: `Hide the Tab Box?`,
        confirm_action: () => {
          App.set_setting(`tab_box`, `none`)
          App.apply_theme()
        },
      })
    },
  })

  App.show_context({items: items, e: e})
}

App.refresh_tab_box = () => {
  App.update_tab_box(App.get_setting(`tab_box_mode`))
}

App.check_tab_box_item = (item, what) => {
  if (item.mode !== `tabs`) {
    return
  }

  if (App.tab_box_mode(what)) {
    App.update_tab_box(what)
  }
}

App.tab_box_mode = (what) => {
  if (App.get_setting(`tab_box`) !== `none`) {
    if (App.get_setting(`tab_box_mode`) === what) {
      return true
    }
  }

  return false
}

App.tab_box_enabled = () => {
  return App.get_setting(`tab_box`) !== `none`
}