App.default_settings = {
  text_mode: {value: `title`, category: `basic`, version: 1},
  item_height: {value: `normal`, category: `basic`, version: 1},
  font: {value: `sans-serif`, category: `basic`, version: 1},
  font_size: {value: 16, category: `basic`, version: 1},
  lock_drag: {value: false, category: `basic`, version: 1},
  quick_star: {value: true, category: `basic`, version: 1},
  fetch_favicons: {value: true, category: `basic`, version: 1},
  show_pick_button: {value: false, category: `basic`, version: 1},
  scrollbars: {value: false, category: `basic`, version: 1},

  closed_index: {value: 4, category: `basic`, version: 1},
  width: {value: 70, category: `basic`, version: 1},
  height: {value: 80, category: `basic`, version: 1},

  background_color: {value: `rgb(36, 36, 42)`, category: `theme`, version: 1},
  text_color: {value: `rgb(222, 222, 222)`, category: `theme`, version: 1},
  background_image: {value: ``, category: `theme`, version: 1},
  grayscale_background_image: {value: false, category: `theme`, version: 1},

  pin_icon: {value: `+`, category: `icons`, version: 1},
  normal_icon: {value: ``, category: `icons`, version: 1},
  playing_icon: {value: `🔊`, category: `icons`, version: 1},
  muted_icon: {value: `🔇`, category: `icons`, version: 1},
  unloaded_icon: {value: `💤`, category: `icons`, version: 1},
  close_icon: {value: `x`, category: `icons`, version: 1},
  open_icon: {value: `🚀`, category: `icons`, version: 1},
  pick_icon: {value: `🎯`, category: `icons`, version: 1},

  warn_on_close_tabs: {value: `special`, category: `warns`, version: 1},
  warn_on_unload_tabs: {value: `special`, category: `warns`, version: 1},
  warn_on_duplicate_tabs: {value: true, category: `warns`, version: 1},
  warn_on_close_duplicate_tabs: {value: true, category: `warns`, version: 1},
  warn_on_close_normal_tabs: {value: true, category: `warns`, version: 1},
  warn_on_star: {value: true, category: `warns`, version: 1},
  warn_on_unstar: {value: true, category: `warns`, version: 1},
  warn_on_open: {value: true, category: `warns`, version: 1},
  warn_on_untitle_tabs: {value: true, category: `warns`, version: 1},

  gestures_enabled: {value: true, category: `mouse`, version: 1},
  gestures_threshold: {value: 10, category: `mouse`, version: 1},
  gesture_up: {value: `go_to_top`, category: `mouse`, version: 1},
  gesture_down: {value: `go_to_bottom`, category: `mouse`, version: 1},
  gesture_left: {value: `prev_window`, category: `mouse`, version: 1},
  gesture_right: {value: `next_window`, category: `mouse`, version: 1},
  gesture_up_and_down: {value: `show_all`, category: `mouse`, version: 1},
  gesture_left_and_right: {value: `filter_domain`, category: `mouse`, version: 1},
  double_click_tab: {value: `star_items`, category: `mouse`, version: 1},
  middle_click_main_menu: {value: `show_main`, category: `mouse`, version: 1},
  middle_click_filter_menu: {value: `show_all`, category: `mouse`, version: 1},
  middle_click_back_button: {value: `browser_back`, category: `mouse`, version: 1},
  middle_click_actions_menu: {value: `undo_close_tab`, category: `mouse`, version: 1},
  middle_click_footer: {value: `copy_item_url`, category: `mouse`, version: 1},
  middle_click_pick_button: {value: `filter_domain`, category: `mouse`, version: 1},
  middle_click_close_button: {value: `unload_tabs`, category: `mouse`, version: 1},
  middle_click_open_button: {value: `open_items`, category: `mouse`, version: 1},

  switch_to_tabs: {value: true, category: `more`, version: 1},
  clear_filter: {value: true, category: `more`, version: 1},
  show_tooltips: {value: true, category: `more`, version: 1},
  show_icons: {value: true, category: `more`, version: 1},
  show_pinline: {value: true, category: `more`, version: 1},
  show_scroller: {value: true, category: `more`, version: 1},
  show_footer: {value: true, category: `more`, version: 1},
  close_duplicate_pins: {value: true, category: `more`, version: 1},
  close_unloaded_tabs: {value: true, category: `more`, version: 1},
  single_new_tab: {value: true, category: `more`, version: 1},
  show_alt_button: {value: true, category: `more`, version: 1},
  show_view: {value: true, category: `more`, version: 1},
  autoselect: {value: true, category: `more`, version: 1},
  close_on_focus: {value: true, category: `more`, version: 1},
  close_on_open: {value: true, category: `more`, version: 1},
  tabs_index: {value: 0, category: `more`, version: 1},
  stars_index: {value: 1, category: `more`, version: 1},
  history_index: {value: 2, category: `more`, version: 1},
  bookmarks_index: {value: 3, category: `more`, version: 1},
  custom_filters: {value: [], category: `more`, version: 1},
}

App.make_item_order = () => {
  let item_order = DOM.el(`#settings_item_order`)
  item_order.innerHTML = ``

  for (let m of App.item_order) {
    let row = DOM.create(`div`, `item_order_row`)
    row.dataset.mode = m

    let up = DOM.create(`div`, `button item_order_button`)
    up.textContent = `Up`
    row.append(up)

    DOM.ev(up, `click`, () => {
      App.item_order_up(row)
    })

    let text = DOM.create(`div`, `item_order_item_text`)
    text.textContent = App.get_mode_name(m)
    row.append(text)

    let down = DOM.create(`div`, `button item_order_button`)
    down.textContent = `Down`
    row.append(down)

    DOM.ev(down, `click`, () => {
      App.item_order_down(row)
    })

    item_order.append(row)
  }
}

App.settings_do_action = (what) => {
  if (what === `theme`) {
    App.apply_theme()
  }
}

App.settings_setup_checkboxes = (container) => {
  let items = DOM.els(`.settings_checkbox`, container)

  for (let item of items) {
    let setting = item.dataset.setting
    let action = item.dataset.action

    let el = DOM.el(`#settings_${setting}`)
    el.checked = App.get_setting(setting)

    DOM.ev(el, `change`, () => {
      App.set_setting(setting, el.checked)
      App.settings_do_action(action)
    })

    DOM.ev(el, `contextmenu`, (e) => {
      App.reset_single_setting(e, () => {
        App.set_default_setting(setting)
        el.checked = App.get_setting(setting)
      })
    })
  }
}

App.settings_setup_text = (container) => {
  let items = DOM.els(`.settings_text`, container)
  items.push(...DOM.els(`.settings_textarea`, container))

  for (let item of items) {
    let setting = item.dataset.setting
    let action = item.dataset.action
    let el = DOM.el(`#settings_${setting}`)
    let is_textarea = item.classList.contains(`settings_textarea`)
    let value = App.get_setting(setting)

    if (is_textarea) {
      value = App.get_setting(setting).join(`\n`)
    }

    el.value = value

    DOM.ev(el, `blur`, () => {
      let value = el.value.trim()

      if (is_textarea) {
        let cleaned = App.single_linebreak(value)
        el.value = cleaned
        value = cleaned.split(`\n`).filter(x => x !== ``).map(x => x.trim())
      }
      else {
        el.value = value
      }

      App.set_setting(setting, value)
      App.settings_do_action(action)
    })

    DOM.ev(el, `contextmenu`, (e) => {
      App.reset_single_setting(e, () => {
        App.set_default_setting(setting)
        let value = App.get_setting(setting)

        if (is_textarea) {
          el.value = value.join(`\n`)
        }
        else {
          el.value = value
        }

        App.settings_do_action(action)
      })
    })
  }
}

App.settings_make_menu = (setting, opts, action = () => {}) => {
  let el = DOM.el(`#settings_${setting}`)

  DOM.ev(el, `click`, () => {
    let items = []

    for (let o of opts) {
      if (o[0] === App.separator_string) {
        items.push({separator: true})
        continue
      }

      let selected = App.get_setting(setting) === o[1]

      items.push({
        text: o[0],
        action: () => {
          el.textContent = o[0]
          App.set_setting(setting, o[1])
          action()
        },
        selected: selected
      })
    }

    NeedContext.show_on_element(el, items, true, el.clientHeight)
  })

  DOM.ev(el, `contextmenu`, (e) => {
    App.reset_single_setting(e, () => {
      App.set_default_setting(setting)
      let value = App.get_setting(setting)

      for (let o of opts) {
        if (o[1] === value) {
          el.textContent = o[0]
          break
        }
      }

      action()
    })
  })

  for (let o of opts) {
    if (App.get_setting(setting) === o[1]) {
      el.textContent = o[0]
    }
  }

  let buttons = DOM.create(`div`, `flex_row_center gap_1`)
  let prev = DOM.create(`div`, `button`)
  prev.textContent = `<`
  let next = DOM.create(`div`, `button`)
  next.textContent = `>`

  function prev_fn () {
    App.settings_menu_cycle(el, setting, `prev`, opts)
    action()
  }

  function next_fn () {
    App.settings_menu_cycle(el, setting, `next`, opts)
    action()
  }

  DOM.ev(prev, `click`, prev_fn)
  DOM.ev(next, `click`, next_fn)

  buttons.append(prev)
  buttons.append(next)
  el.after(buttons)
  prev.after(el)
}

App.add_settings_filter = (category) => {
  let container = DOM.el(`#settings_${category}_container`)
  let filter = DOM.create(`input`, `settings_filter text`, `settings_${category}_filter`)
  filter.type = `text`
  filter.autocomplete = `off`
  filter.spellcheck = false
  filter.placeholder = `Filter`
  container.prepend(filter)
}

App.do_settings_filter = () => {
  let category = App.get_setting_category()
  let value = DOM.el(`#settings_${category}_filter`).value.toLowerCase().trim()
  let container = DOM.el(`#settings_${category}_container`)
  let items = DOM.els(`.settings_column`, container)

  for (let item of items) {
    let label = DOM.el(`.settings_label`, item)
    let text = label.textContent.toLowerCase().trim()

    if (text.includes(value)) {
      item.classList.remove(`hidden`)
    }
    else {
      item.classList.add(`hidden`)
    }
  }
}

App.clear_settings_filter = () => {
  let category = App.get_setting_category()
  DOM.el(`#settings_${category}_filter`).value = ``
  App.do_settings_filter()
}

App.setup_settings = () => {
  App.settings_categories = [`basic`, `theme`, `icons`, `mouse`, `warns`, `more`]

  let common = {
    persistent: false,
    colored_top: true,
    after_show: () => {
      let category = App.get_setting_category()
      DOM.el(`#settings_${category}_filter`).focus()
    },
    after_hide: () => {
      App.apply_theme()
    },
  }

  function prepare (category) {
    let container = DOM.el(`#settings_${category}_container`)
    App.settings_setup_checkboxes(container)
    App.settings_setup_text(container)
    App.add_settings_switchers(category)
    App.add_settings_filter(category)
  }

  App.create_window(Object.assign({}, common, {id: `settings_basic`, setup: () => {
    prepare(`basic`)
    App.settings_make_menu(`text_mode`, [[`Title`, `title`], [`URL`, `url`]])

    App.settings_make_menu(`font`, [
      [`Sans`, `sans-serif`],
      [`Serif`, `serif`],
      [`Mono`, `monospace`],
    ], () => {
      App.apply_theme()
    })

    App.settings_make_menu(`font_size`, App.get_font_size_options(), () => {
      App.apply_theme()
    })

    App.settings_make_menu(`item_height`, [
      [`Compact`, `compact`],
      [`Normal`, `normal`],
      [`Bigger`, `bigger`],
    ])

    App.settings_make_menu(`width`, App.get_size_options(), () => {
      App.apply_theme()
    })

    App.settings_make_menu(`height`, App.get_size_options(), () => {
      App.apply_theme()
    })
  }}))

  App.create_window(Object.assign({}, common, {id: `settings_theme`, setup: () => {
    App.start_theme_settings()
    prepare(`theme`)
  }}))

  App.create_window(Object.assign({}, common, {id: `settings_icons`, setup: () => {
    prepare(`icons`)
  }}))

  App.create_window(Object.assign({}, common, {id: `settings_warns`, setup: () => {
    prepare(`warns`)
    App.settings_make_menu(`warn_on_close_tabs`, App.tab_warn_opts)
    App.settings_make_menu(`warn_on_unload_tabs`, App.tab_warn_opts)
  }}))

  App.create_window(Object.assign({}, common, {id: `settings_more`, setup: () => {
    prepare(`more`)
    App.make_item_order()
  }}))

  App.create_window(Object.assign({}, common, {id: `settings_mouse`, setup: () => {
    prepare(`mouse`)

    DOM.ev(DOM.el(`#settings_gestures_enabled`), `change`, () => {
      App.refresh_gestures()
    })

    App.settings_make_menu(`gestures_threshold`, [
      [`Normal`, 10],
      [`Less Sensitive`, 100],
    ], () => {
      App.refresh_gestures()
    })

    let opts = App.settings_commands()

    for (let gesture of App.gestures) {
      App.settings_make_menu(`gesture_${gesture}`, opts.slice(0))
    }

    App.settings_make_menu(`double_click_tab`, opts.slice(0))
    App.settings_make_menu(`middle_click_main_menu`, opts.slice(0))
    App.settings_make_menu(`middle_click_filter_menu`, opts.slice(0))
    App.settings_make_menu(`middle_click_back_button`, opts.slice(0))
    App.settings_make_menu(`middle_click_actions_menu`, opts.slice(0))
    App.settings_make_menu(`middle_click_footer`, opts.slice(0))
    App.settings_make_menu(`middle_click_pick_button`, opts.slice(0))
    App.settings_make_menu(`middle_click_close_button`, opts.slice(0))
    App.settings_make_menu(`middle_click_open_button`, opts.slice(0))
  }}))
}

App.get_setting_title = (category) => {
  let name

  if (category === `warns`) {
    name = `Warn`
  }
  else if (category === `icons`) {
    name = `Icon`
  }
  else {
    name = App.capitalize(category)
  }

  return `${name} Settings`
}

App.add_settings_switchers = (category) => {
  let buttons = DOM.el(`#window_top_settings_${category}`)
  let title = DOM.el(`.settings_title`, buttons)
  title.textContent = App.get_setting_title(category)

  let prev = DOM.create(`div`, `button arrow_prev`)
  prev.textContent = `<`
  title.before(prev)

  DOM.ev(prev, `click`, () => {
    App.show_prev_settings()
  })

  let next = DOM.create(`div`, `button arrow_next`)
  next.textContent = `>`

  DOM.ev(next, `click`, () => {
    App.show_next_settings()
  })

  DOM.ev(title, `click`, () => {
    App.show_settings_menu(category, title)
  })

  DOM.ev(title.closest(`.window_top`), `wheel`, (e) => {
    App.settings_wheel.call(e)
  })

  title.after(next)
}

App.start_theme_settings = () => {
  function start_color_picker (name) {
    let el = DOM.el(`#settings_${name}_color_picker`)

    App[`${name}_color_picker`] = AColorPicker.createPicker(el, {
      showAlpha: false,
      showHSL: false,
      showHEX: false,
      showRGB: true,
      color: App.get_setting(`${name}_color`)
    })

    App[`${name}_color_picker`].on(`change`, (picker, color) => {
      App.change_color(name, color)
    })
  }

  start_color_picker(`background`)
  start_color_picker(`text`)
}

App.settings_menu_cycle = (el, setting, dir, items) => {
  let cycle = true

  if (setting === `font_size` || setting === `width` || setting === `height`) {
    cycle = false
  }

  let waypoint = false
  items = items.slice(0)

  if (dir === `prev`) {
    items.reverse()
  }

  let s_item

  if (cycle) {
    s_item = items[0]
  }

  for (let item of items) {
    if (item[0] === App.separator_string) {
      continue
    }

    if (waypoint) {
      s_item = item
      break
    }

    if (item[1] === App.get_setting(setting)) {
      waypoint = true
    }
  }

  if (s_item) {
    el.textContent = s_item[0]
    App.set_setting(setting, s_item[1])
  }
}

App.settings_default_category = (category) => {
  for (let setting in App.default_settings) {
    let item = App.default_settings[setting]

    if (item.category === category) {
      App.set_default_setting(setting)
    }
  }
}

App.set_default_setting = (setting) => {
  App.set_setting(setting, App.default_setting_string)
}

App.reset_settings = (category) => {
  App.show_confirm(`Reset settings? (${App.capitalize(category)})`, () => {
    App.settings_default_category(category)

    if (category === `basic`) {
      App.get_item_order()
      App.make_item_order()
    }
    else if (category === `mouse`) {
      App.refresh_gestures()
    }

    App.apply_theme()
    App.show_window(`settings_${category}`)
  })
}

App.reset_all_settings = () => {
  App.show_confirm(`Reset all settings?`, () => {
    for (let setting in App.default_settings) {
      App.set_default_setting(setting)
    }

    App.restart_settings()
  })
}

App.get_font_size_options = () => {
  let opts = []

  for (let i=12; i<=22; i++) {
    opts.push([`${i} px`, i])
  }

  return opts
}

App.get_size_options = () => {
  let opts = []

  for (let i=50; i<=100; i+=5) {
    opts.push([`${i}%`, i])
  }

  return opts
}

App.show_settings = () => {
  App.show_window(`settings_basic`)
}

App.show_settings_window = (category) => {
  App.show_window(`settings_${category}`)
}

App.show_prev_settings = () => {
  let index = App.settings_index()
  index -= 1

  if (index < 0) {
    index = App.settings_categories.length - 1
  }

  App.show_settings_window(App.settings_categories[index])
}

App.show_next_settings = () => {
  let index = App.settings_index()
  index += 1

  if (index >= App.settings_categories.length) {
    index = 0
  }

  App.show_settings_window(App.settings_categories[index])
}

App.settings_index = () => {
  return App.settings_categories.indexOf(App.get_setting_category())
}

App.show_settings_menu = (category, btn) => {
  let items = []

  items.push({
    text: `Jump`,
    get_items: () => {
      return App.settings_menu_items()
    }
  })

  items.push({
    text: `Reset`,
    get_items: () => {
      return App.settings_reset_items(category)
    }
  })

  items.push({
    text: `Data`,
    get_items: () => {
      return App.settings_data_items()
    }
  })

  items.push({
    text: `Close`,
    action: () => {
      App.hide_current_window()
    }
  })

  NeedContext.show_on_element(btn, items)
}

App.export_settings = () => {
  App.export_data(App.settings)
}

App.import_settings = () => {
  App.import_data((json) => {
    App.settings = json
    App.check_settings()
    App.stor_save_settings()
    App.restart_settings()
  })
}

App.restart_settings = () => {
  App.get_item_order()
  App.make_item_order()
  App.apply_theme()
  App.refresh_gestures()
  App.show_settings()
}

App.settings_reset_items = (category) => {
  let items = []

  items.push({
    text: `Reset ${App.capitalize(category)}`,
    action: () => {
      App.reset_settings(category)
    }
  })

  items.push({
    text: `Reset All`,
    action: () => {
      App.reset_all_settings()
    }
  })

  return items
}

App.settings_data_items = () => {
  let items = []

  items.push({
    text: `Export`,
    action: () => {
      App.export_settings()
    }
  })

  items.push({
    text: `Import`,
    action: () => {
      App.import_settings()
    }
  })

  return items
}

App.reset_single_setting = (e, action) => {
  let items = []

  items.push({
    text: `Reset`,
    action: action,
  })

  NeedContext.show(e.clientX, e.clientY, items)
  e.preventDefault()
}

App.settings_wheel = App.create_debouncer((e) => {
  let direction = App.wheel_direction(e)

  if (direction === `down`) {
    App.show_next_settings()
  }
  else if (direction === `up`) {
    App.show_prev_settings()
  }
}, App.wheel_delay)

App.get_setting = (setting) => {
  let value = App.settings[setting].value

  if (value === App.default_setting_string) {
    if (value === App.default_setting_string) {
      value = App.get_default_setting(setting)
    }
  }

  return value
}

App.set_setting = (setting, value) => {
  App.settings[setting].value = value
  App.save_settings_debouncer.call()
}

App.get_default_setting = (setting) => {
  return App.default_settings[setting].value
}

App.save_settings_debouncer = App.create_debouncer(() => {
  App.stor_save_settings()
}, App.settings_save_delay)

App.check_settings = () => {
  let changed = false

  function set_default (setting) {
    App.settings[setting].value = App.default_setting_string
    App.settings[setting].version = App.default_settings[setting].version
  }

  for (let setting in App.default_settings) {
    // Fill defaults
    if (App.settings[setting] === undefined ||
      App.settings[setting].value === undefined ||
      App.settings[setting].version === undefined)
    {
      App.log(`Stor: Adding setting: ${setting}`)
      App.settings[setting] = {}
      set_default(setting)
      changed = true
    }
  }

  for (let setting in App.settings) {
    // Remove unused settings
    if (App.default_settings[setting] === undefined) {
      App.log(`Stor: Deleting setting: ${setting}`)
      delete App.settings[setting]
      changed = true
    }
    // Check new version
    else if (App.settings[setting].version !== App.default_settings[setting].version) {
      App.log(`Stor: Upgrading setting: ${setting}`)
      set_default(setting)
      changed = true
    }
  }

  if (changed) {
    App.stor_save_settings()
  }
}

App.on_settings = () => {
  return App.window_mode.startsWith(`settings_`)
}

App.settings_commands = () => {
  let items = [
    [`Do Nothing`, `none`],
    [App.separator_string],
  ]

  for (let cmd of App.commands) {
    if (cmd.name === App.separator_string) {
      items.push([App.separator_string])
    }
    else {
      items.push([cmd.name, cmd.cmd])
    }
  }

  return items
}

App.tab_warn_opts = [
  [`Always`, `always`],
  [`Special`, `special`],
  [`Never`, `never`],
]

App.get_setting_category = () => {
  return App.window_mode.replace(`settings_`, ``)
}

App.settings_menu_items = () => {
  let items = []
  let current = App.get_setting_category()

  for (let c of App.settings_categories) {
    let selected = c === current

    items.push({
      text: App.capitalize(c),
      action: () => {
        App.show_settings_window(c)
      },
      selected: selected,
    })
  }

  return items
}