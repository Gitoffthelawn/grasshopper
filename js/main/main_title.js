App.start_main_title = () => {
  App.start_main_title_intervals()
}

App.reset_main_title = () => {
  App.refresh_main_title()
  App.start_main_title_intervals()
}

App.start_main_title_intervals = () => {
  clearInterval(App.main_title_date_interval)
  clearTimeout(App.main_title_scroll_timeout)

  // Date

  let delay = App.check_main_title_date_delay

  if (!delay || (delay < App.SECOND)) {
    App.error(`Main title date delay is invalid`)
    return
  }

  App.main_title_date_interval = setInterval(() => {
    App.check_main_title_date()
  }, delay)
}

App.main_title_scroll_do_timeout = () => {
  if (App.main_title_scroll_pause) {
    clearTimeout(App.main_title_scroll_timeout)
    let delay = App.main_title_scroll_pause_delay
    App.main_title_scroll_pause = false

    App.main_title_scroll_timeout = setTimeout(() => {
      App.main_title_scroll_do_timeout()
    }, delay)
  }
  else {
    let delay = App.get_setting(`main_title_scroll_delay`)

    if (!delay || (delay < 1)) {
      App.error(`Title auto-scroll delay is invalid`)
      return
    }

    App.main_title_scroll_timeout = setTimeout(() => {
      App.main_title_auto_scroll()
      App.main_title_scroll_do_timeout()
    }, delay)
  }
}

App.create_main_title = (mode) => {
  let el = DOM.create(`div`, `main_title`)
  let inner = DOM.create(`div`, `main_title_inner`, `main_title_inner_${mode}`)
  el.append(inner)

  let title = App.get_setting(`main_title`)
  inner.textContent = title

  let rclick = App.get_cmd_name(`show_main_title_menu`)

  if (App.get_setting(`show_tooltips`)) {
    el.title = `Right Click: ${rclick}`
    App.trigger_title(el, `middle_click_main_title`)
    App.trigger_title(el, `double_click_main_title`)
  }

  App.main_title_tooltip = el.title
  App.update_main_title_tooltips(el)
  App.last_main_title = ``

  DOM.ev(el, `click`, (e) => {
    App.main_title_click(e)

    App.check_double_click(`main_title`, e, () => {
      App.main_title_double_click(e)
    })
  })

  DOM.ev(el, `contextmenu`, (e) => {
    App.show_main_title_menu(e)
  })

  DOM.ev(el, `auxclick`, (e) => {
    if (e.button === 1) {
      App.main_title_middle_click(e)
    }
  })

  return el
}

App.check_main_title = () => {
  let title

  if (App.get_setting(`main_title_date`)) {
    title = App.get_main_title_date()
  }
  else {
    title = App.get_setting(`main_title`)
  }

  if (!title) {
    title = `No Title`
  }

  if (App.last_main_title !== undefined) {
    if (App.last_main_title === title) {
      return
    }
  }

  App.last_main_title = title
  App.set_main_title_text(title)
  App.refresh_main_title()
}

App.set_main_title_text = (text) => {
  let els = DOM.els(`.main_title_inner`)

  for (let el of els) {
    el.textContent = text
    App.update_main_title_tooltips(el)
    el.scrollLeft = 0
  }

  App.main_title_pause()
}

App.update_main_title_tooltips = (el) => {
  if (!App.get_setting(`show_tooltips`)) {
    return
  }

  let text = App.last_main_title

  if (!text) {
    return
  }

  el.title = `${text}\n${App.main_title_tooltip}`
}

App.edit_main_title = () => {
  App.show_prompt({
    value: App.get_setting(`main_title`),
    placeholder: `Title`,
    on_submit: (ans) => {
      App.set_main_title(ans.trim())
    },
  })
}

App.set_main_title = (title) => {
  App.set_setting({setting: `main_title`, value: title})
  App.set_setting({setting: `main_title_date`, value: false})
  App.check_main_title()
}

App.copy_main_title = () => {
  App.copy_to_clipboard(App.get_setting(`main_title`))
}

App.show_main_title_menu = (e) => {
  e.preventDefault()

  let items = App.custom_menu_items({
    name: `main_title_menu`,
  })

  App.show_context({items: items, e: e})
}

App.main_title_double_click = (e) => {
  let cmd = App.get_setting(`double_click_main_title`)
  let command = App.get_command(cmd)

  if (command) {
    let args = {
      cmd: command.cmd,
      e: e,
    }

    App.run_command(args)
  }
}

App.main_title_click = (e) => {
  let cmd = App.get_setting(`click_main_title`)
  App.run_command({cmd: cmd, from: `main_title`, e: e})
}

App.main_title_middle_click = (e) => {
  let cmd = App.get_setting(`middle_click_main_title`)
  App.run_command({cmd: cmd, from: `main_title`, e: e})
}

App.color_main_title = (what) => {
  let bg_color = ``

  if (what === `red`) {
    bg_color = App.red_title
  }
  else if (what === `green`) {
    bg_color = App.green_title
  }
  else if (what === `blue`) {
    bg_color = App.blue_title
  }

  let text = `white`
  let bg = bg_color
  App.set_main_title_color(text, bg)
}

App.set_main_title_color = (text, bg) => {
  App.set_setting({setting: `main_title_colors`, value: true})
  App.set_setting({setting: `main_title_text_color`, value: text})
  App.set_setting({setting: `main_title_background_color`, value: bg})
  App.check_refresh_settings()
  App.apply_theme()
}

App.uncolor_main_title = () => {
  App.set_setting({setting: `main_title_colors`, value: false})
  App.check_refresh_settings()
  App.apply_theme()
}

App.check_main_title_date = () => {
  if (!App.main_title_enabled()) {
    return
  }

  if (App.get_setting(`main_title_date`)) {
    App.check_main_title()
  }
}

App.get_main_title_date = () => {
  let format = App.get_setting(`main_title_date_format`)
  return dateFormat(App.now(), format)
}

App.toggle_main_title_date = () => {
  let show_date = !App.get_setting(`main_title_date`)
  App.set_setting({setting: `main_title_date`, value: show_date})
  App.check_refresh_settings()
  App.check_main_title()
}

App.previous_main_title_color = () => {
  let enabled = App.get_setting(`main_title_colors`)
  let current = App.get_setting(`main_title_background_color`)

  if (enabled && (current === App.blue_title)) {
    App.color_main_title(`green`)
  }
  else if (enabled && (current === App.green_title)) {
    App.color_main_title(`red`)
  }
  else if (enabled && (current === App.red_title)) {
    App.uncolor_main_title()
  }
  else {
    App.color_main_title(`blue`)
  }
}

App.next_main_title_color = () => {
  let enabled = App.get_setting(`main_title_colors`)
  let current = App.get_setting(`main_title_background_color`)

  if (enabled && (current === App.red_title)) {
    App.color_main_title(`green`)
  }
  else if (enabled && (current === App.green_title)) {
    App.color_main_title(`blue`)
  }
  else if (enabled && (current === App.blue_title)) {
    App.uncolor_main_title()
  }
  else {
    App.color_main_title(`red`)
  }
}

App.main_title_enabled = () => {
  if (!App.get_setting(`show_main_title`)) {
    return false
  }

  if (App.fullscreen) {
    return false
  }

  if (App.screen_locked) {
    return false
  }

  return true
}

App.main_title_signal_text = (signal, text) => {
  if (!App.main_title_enabled()) {
    return
  }

  if (App.get_setting(`main_title_date`)) {
    return
  }

  if (App.get_setting(`main_title_signal_icon`)) {
    if (signal.icon) {
      text = `${signal.icon} ${text}`
    }
  }

  App.set_main_title(text)
}

App.toggle_main_title = () => {
  let new_value = !App.get_setting(`show_main_title`)
  App.set_setting({setting: `show_main_title`, value: new_value, action: true})
  App.refresh_main_title()
  App.apply_theme()
}

App.refresh_main_title = () => {
  for (let el of DOM.els(`.main_title`)) {
    if (App.get_setting(`show_main_title`)) {
      DOM.show(el)
    }
    else {
      DOM.hide(el)
    }
  }
}

App.scroll_main_title = (dir, manual = true) => {
  let mode = App.active_mode
  let el = DOM.el(`#main_title_inner_${mode}`)
  let amount

  if (manual) {
    amount = 20
  }
  else {
    amount = App.get_setting(`main_title_scroll_amount`)
  }

  if (dir === `left`) {
    el.scrollLeft -= amount
  }
  else if (dir === `right`) {
    el.scrollLeft += amount
  }

  if (manual) {
    App.main_title_pause()
  }
}

App.main_title_auto_scroll = () => {
  if (!App.main_title_enabled()) {
    return
  }

  if (!App.get_setting(`main_title_auto_scroll`)) {
    return
  }

  if (App.get_setting(`wrap_main_title`)) {
    return
  }

  let mode = App.active_mode
  let el = DOM.el(`#main_title_inner_${mode}`)
  let dir = App.main_title_scroll_direction
  let overflow = el.scrollWidth - el.clientWidth

  if (overflow < App.main_title_min_overflow) {
    return
  }

  if ((dir === `left`) && App.at_left(el)) {
    dir = `right`
  }
  else if ((dir === `right`) && App.at_right(el)) {
    dir = `left`
  }

  App.main_title_set_dir(dir)

  if (dir === `right`) {
    App.main_title_right(el)
  }
  else if (dir === `left`) {
    App.main_title_left(el)
  }
}

App.main_title_set_dir = (dir) => {
  App.main_title_scroll_direction = dir
}

App.main_title_left = (el) => {
  App.scroll_main_title(`left`, false)

  if (App.at_left(el)) {
    App.main_title_set_dir(`right`)
    App.main_title_pause()
  }
}

App.main_title_right = (el) => {
  App.scroll_main_title(`right`, false)

  if (App.at_right(el)) {
    App.main_title_set_dir(`left`)
    App.main_title_pause()
  }
}

App.main_title_pause = () => {
  App.main_title_scroll_pause = true
}

App.dark_main_title = () => {
  let text = App.colorlib.get_light_color()
  let bg = App.colorlib.get_dark_color()
  App.set_main_title_color(text, bg)
}

App.light_main_title = () => {
  let text = App.colorlib.get_dark_color()
  let bg = App.colorlib.get_light_color()
  App.set_main_title_color(text, bg)
}