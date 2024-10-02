App.pin_tab = async (id) => {
  try {
    await browser.tabs.update(id, {pinned: true})
  }
  catch (err) {
    App.error(err)
  }
}

App.unpin_tab = async (id) => {
  try {
    await browser.tabs.update(id, {pinned: false})
  }
  catch (err) {
    App.error(err)
  }
}

App.pin_tabs = (item) => {
  let items = []

  for (let it of App.get_active_items({mode: `tabs`, item})) {
    if (it.pinned) {
      continue
    }

    items.push(it)
  }

  if (!items.length) {
    return
  }

  let force = App.check_force(`warn_on_pin_tabs`, items)
  let ids = items.map(x => x.id)

  App.show_confirm({
    message: `Pin items? (${ids.length})`,
    confirm_action: async () => {
      for (let id of ids) {
        App.pin_tab(id)
      }
    },
    force,
  })
}

App.unpin_tabs = (item) => {
  let items = []

  for (let it of App.get_active_items({mode: `tabs`, item})) {
    if (!it.pinned) {
      continue
    }

    items.push(it)
  }

  if (!items.length) {
    return
  }

  let force = App.check_force(`warn_on_unpin_tabs`, items)
  let ids = items.map(x => x.id)

  App.show_confirm({
    message: `Unpin items? (${ids.length})`,
    confirm_action: async () => {
      for (let id of ids) {
        App.unpin_tab(id)
      }
    },
    force,
  })
}

App.toggle_pin = (item) => {
  if (item.pinned) {
    App.unpin_tab(item.id)
  }
  else {
    App.pin_tab(item.id)
  }
}

App.toggle_pin_tabs = (item) => {
  let items = []
  let action

  for (let it of App.get_active_items({mode: `tabs`, item})) {
    if (!action) {
      if (it.pinned) {
        action = `unpin`
      }
      else {
        action = `pin`
      }
    }

    if (action === `pin`) {
      if (it.pinned) {
        continue
      }
    }
    else if (action === `unpin`) {
      if (!it.pinned) {
        continue
      }
    }

    items.push(it)
  }

  if (!items.length) {
    return
  }

  let force = App.check_force(`warn_on_pin_tabs`, items)
  let ids = items.map(x => x.id)
  let msg = ``

  if (action === `pin`) {
    msg = `Pin items?`
  }
  else {
    msg = `Unpin items?`
  }

  msg += ` (${ids.length})`

  App.show_confirm({
    message: msg,
    confirm_action: async () => {
      for (let id of ids) {
        if (action === `pin`) {
          App.pin_tab(id)
        }
        else {
          App.unpin_tab(id)
        }
      }
    },
    force,
  })
}

App.get_last_pin_index = () => {
  let i = -1

  for (let item of App.get_items(`tabs`)) {
    if (item.pinned) {
      i += 1
    }
    else {
      return i
    }
  }

  return i
}

App.check_pins = (item, force = false) => {
  if (App.get_setting(`hide_pins`) && !item.tab_box) {
    if (!force && item.pinned) {
      App.hide_pin(item)
    }
    else {
      App.show_pin(item)
    }
  }
}

App.hide_pin = (item) => {
  DOM.hide(item.element, 2)
  item.visible = false
}

App.show_pin = (item) => {
  DOM.show(item.element, 2)
  item.visible = true
}

App.show_all_pins = () => {
  for (let item of App.get_items(`tabs`)) {
    App.show_pin(item)
  }
}

App.new_pin_tab = () => {
  App.open_new_tab({pinned: true})
}

App.toggle_show_pins = () => {
  let hide = App.get_setting(`hide_pins`)
  App.set_setting({setting: `hide_pins`, value: !hide})
  App.check_refresh_settings()

  if (hide) {
    App.show_all_pins()
  }

  App.do_filter({mode: App.active_mode})
}

App.first_pinned_tab = () => {
  let items = App.get_items(`tabs`)
  let first = items.find(x => x.pinned)

  if (first) {
    App.tabs_action({item: first})
  }
}

App.last_pinned_tab = () => {
  let items = App.get_items(`tabs`)
  let last = items.slice(0).reverse().find(x => x.pinned)

  if (last) {
    App.tabs_action({item: last})
  }
}