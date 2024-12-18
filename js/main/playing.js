App.setup_playing = () => {
  App.check_playing_debouncer = App.create_debouncer((mode) => {
    App.do_check_playing(mode)
  }, App.check_playing_delay)
}

App.create_playing_button = (mode) => {
  let btn = DOM.create(`div`, `button icon_button playing_button hidden`, `playing_button_${mode}`)
  let rclick = App.get_cmd_name(`show_playing_tabs`)

  if (App.tooltips()) {
    App.trigger_title(btn, `click_playing_button`)
    btn.title += `\nRight Click: ${rclick}`
    App.trigger_title(btn, `middle_click_playing_button`)
    App.trigger_title(btn, `click_press_playing_button`)
    App.trigger_title(btn, `middle_click_press_playing_button`)
    App.trigger_title(btn, `wheel_up_playing_button`)
    App.trigger_title(btn, `wheel_down_playing_button`)
  }

  App.check_show_button(`playing`, btn)
  let icon = App.get_svg_icon(`speaker`)
  btn.append(icon)
  return btn
}

App.show_playing = (mode) => {
  App.playing = true
  DOM.show(`#playing_button_${mode}`)
  App.on_playing_change()
}

App.hide_playing = (mode) => {
  App.playing = false
  DOM.hide(`#playing_button_${mode}`)
  App.on_playing_change()
}

App.on_playing_change = () => {
  let tb_mode = App.get_tab_box_mode()

  if ([`playing`].includes(tb_mode)) {
    App.update_tab_box()
  }
}

App.check_playing = () => {
  App.check_playing_debouncer.call(App.active_mode)
}

App.do_check_playing = (mode = App.active_mode, force = false) => {
  let playing = App.get_playing_tabs()

  if (playing.length) {
    if (!App.playing || force) {
      App.show_playing(mode)
      App.check_tab_box_playing()
    }
  }
  else if (App.playing) {
    App.hide_playing(mode)
  }
}

App.get_playing_tabs = () => {
  return App.get_items(`tabs`).filter(x => x.playing)
}

App.playing_click = (e) => {
  let cmd = App.get_setting(`click_playing_button`)
  App.run_command({cmd, from: `playing`, e})
}

App.playing_middle_click = (e) => {
  let cmd = App.get_setting(`middle_click_playing_button`)
  App.run_command({cmd, from: `playing`, e})
}