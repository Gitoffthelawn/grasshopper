App.setup_modes = () => {
  for (let mode of App.modes) {
    App[`${mode}_changed`] = false
  }
}

App.show_mode_debouncer = App.create_debouncer((mode, reuse_filter) => {
  App.do_show_mode(mode, reuse_filter)
}, App.show_mode_delay)

App.show_mode = (mode, reuse_filter) => {
  App.show_mode_debouncer.call(mode, reuse_filter)
}

App.do_show_mode = async (mode, reuse_filter = false, force = false) => {
  if (!App.get_setting(`reuse_filter`)) {
    reuse_filter = false
  }

  let pre_show = App[`pre_show_${mode}`]

  if (pre_show) {
    pre_show()
  }

  App.windows[mode].show()
  let was_filtered = App.was_filtered(mode)

  if (!force) {
    if ((App.active_mode === mode) &&
    (App[`${mode}_items`].length) &&
    !was_filtered && !App[`${mode}_changed`]) {
      App.select_first_item(mode, true)
      return
    }
  }

  let value = App.get_last_filter_value(reuse_filter)
  App.active_mode = mode
  App.empty_footer_info()
  App.cancel_filter()
  let container = DOM.el(`#${mode}_container`)
  App.set_filter(mode, value, false)
  let m = App.filter_modes(mode)[0]
  App.set_filter_mode(mode, m[0], false)
  App[`${mode}_filter_mode`] = m[0]
  App[`last_${mode}_query`] = undefined
  let persistent = App.persistent_modes.includes(mode)
  let search = App.search_modes.includes(mode)
  let items_ready = false
  let items

  if (persistent) {
    if (App[`${mode}_items`].length) {
      items = App[`${mode}_items`]
      items_ready = true
    }
  }

  // Clear inactive items
  for (let m of App.modes) {
    if (App.persistent_modes.includes(m)) {
      if (App[`${m}_items`].length) {
        continue
      }
    }

    App.clear_items(m)
  }

  if (search && value) {
    items = []
  }
  else if (!items_ready) {
    items = await App[`get_${mode}`]()
    was_filtered = false
  }

  if (!persistent) {
    if (mode !== App.active_mode) {
      return
    }
  }

  if (mode === `tabs`) {
    if (App.get_setting(`pin_icon`)) {
      container.classList.add(`has_pin_icon`)
    }
    else {
      container.classList.remove(`has_pin_icon`)
    }

    if (App.get_setting(`normal_icon`)) {
      container.classList.add(`has_normal_icon`)
    }
    else {
      container.classList.remove(`has_normal_icon`)
    }
  }

  if (search && value) {
    // Filter will search
  }
  else if (!items_ready) {
    App.process_info_list(mode, items)
  }
  else {
    App.update_footer_info(App.get_selected(mode))
  }

  if (value || was_filtered) {
    App.do_filter(mode, true)
  }
  else {
    App.select_first_item(mode, true, `center_instant`)
  }

  App[`${mode}_changed`] = false
  App.check_item_theme()
  App.check_playing(mode)
}

App.mode_order_up = (el) => {
  let prev = el.previousElementSibling

  if (prev) {
    el.parentNode.insertBefore(el, prev)
    App.update_mode_order()
  }
}

App.mode_order_down = (el) => {
  let next = el.nextElementSibling

  if (next) {
    el.parentNode.insertBefore(next, el)
    App.update_mode_order()
  }
}

App.get_mode_order = () => {
  App.mode_order = App.get_setting(`mode_order`).map(x => x.mode)
}

App.get_mode_index = (mode) => {
  for (let [i, it] of App.mode_order.entries()) {
    if (it === mode) {
      return i
    }
  }
}

App.get_mode_name = (mode) => {
  for (let m of App.get_setting(`mode_order`)) {
    if (m.mode === mode) {
      return m.name
    }
  }
}

App.show_main_mode = () => {
  App.do_show_mode(App.mode_order[0])
}

App.cycle_modes = (reverse, reuse_filter = true) => {
  let modes = App.mode_order
  let index = modes.indexOf(App.window_mode)
  let new_mode

  if (index === -1) {
    return
  }

  if (reverse) {
    if (index === 0) {
      new_mode = modes.slice(-1)[0]
    }
    else {
      new_mode = modes[index - 1]
    }
  }
  else {
    if (index === modes.length - 1) {
      new_mode = modes[0]
    }
    else {
      new_mode = modes[index + 1]
    }
  }

  App.show_mode(new_mode, reuse_filter)
}

App.update_mode_order = () => {
  let boxes = DOM.els(`.mode_order_row`, DOM.el(`#settings_mode_order`))
  let modes = boxes.map(x => x.dataset.mode)

  for (let [i, mode] of modes.entries()) {
    App.set_setting(`${mode}_index`, i)
  }

  App.get_mode_order()
}

App.show_first_mode = (allow_same = true) => {
  let mode = App.mode_order[0]

  if (!allow_same) {
    if (App.active_mode === mode) {
      return
    }
  }

  App.do_show_mode(mode)
}

App.first_mode = () => {
  return App.mode_order[0]
}

App.getting = (mode, force = false) => {
  let icon = App.mode_icons[mode]
  let name = App.capitalize(mode)
  App.debug(`${icon} Getting ${name}`, force)
}

App.on_action = (mode) => {
  App.update_filter_history(mode)
}