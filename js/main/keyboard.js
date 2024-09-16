App.check_items_keyboard = (e) => {
  let mode = App.window_mode
  let item = App.get_selected(mode)
  let filter_focus = App.filter_is_focused(mode)
  let filter_filled = App.filter_has_value(mode)
  let filter_end = App.filter_at_end(mode)

  function arrow (direction, e) {
    if (!item) {
      e.preventDefault()
      return
    }

    if (!App.item_is_visible(item)) {
      App.select_item({item: item, scroll: `nearest`})
    }
    else {
      if (App.deselect({mode: mode, select: direction}) > 1) {
        e.preventDefault()
        return
      }

      App.select_up_down(mode, direction, e.altKey)
    }

    e.preventDefault()
  }

  let ran_shortcut = false

  for (let sc of App.get_setting(`keyboard_shortcuts`)) {
    if (sc.key !== e.code) {
      continue
    }

    if (sc.ctrl && !e.ctrlKey) {
      continue
    }

    if (sc.shift && !e.shiftKey) {
      continue
    }

    if (sc.alt && !e.altKey) {
      continue
    }

    if (!sc.ctrl && !sc.alt) {
      if (filter_focus) {
        continue
      }
    }

    App.run_command({cmd: sc.cmd, from: `keyboard_shortcut`})
    e.preventDefault()
    e.stopPropagation()
    ran_shortcut = true
  }

  if (ran_shortcut) {
    return
  }

  if (e.ctrlKey && !e.shiftKey) {
    if (e.key === `ArrowUp`) {
      App.move_tabs_vertically(`up`)
      e.preventDefault()
      return
    }
    else if (e.key === `ArrowDown`) {
      App.move_tabs_vertically(`down`)
      e.preventDefault()
      return
    }
    else if (e.key === `ArrowLeft`) {
      if (!filter_focus || !filter_filled) {
        App.show_main_menu(mode)
        e.preventDefault()
        return
      }
    }
    else if (e.key === `ArrowRight`) {
      if (!filter_focus || !filter_filled) {
        App.show_actions_menu(mode)
        e.preventDefault()
        return
      }
    }
    else if (e.key === `a`) {
      if (!filter_focus) {
        App.select_all(mode, true)
        e.preventDefault()
      }

      return
    }
    else if (e.key === `f`) {
      App.show_filter_menu(mode)
      e.preventDefault()
      return
    }
    else if (e.key === `.`) {
      App.jump_tabs_playing()
      e.preventDefault()
      return
    }
    else if (e.key === `,`) {
      App.go_to_previous_tab()
      e.preventDefault()
      return
    }
    else if (e.key === `Home`) {
      App.goto_top(mode, true)
      e.preventDefault()
      return
    }
    else if (e.key === `End`) {
      App.goto_bottom(mode, true)
      e.preventDefault()
      return
    }

    if (!isNaN(e.key)) {
      App.pick_active_trace(parseInt(e.key))
      e.preventDefault()
      return
    }
  }

  if (e.shiftKey && !e.ctrlKey) {
    if (e.key === `Enter`) {
      if (!item) {
        e.preventDefault()
        return
      }

      App.show_item_menu({item: item})
      e.preventDefault()
      return
    }
    else if (e.key === `Home`) {
      if (!filter_focus || !filter_filled) {
        App.select_to_edge(mode, `up`)
        e.preventDefault()
        return
      }
    }
    else if (e.key === `End`) {
      if (!filter_focus || !filter_filled) {
        App.select_to_edge(mode, `down`)
        e.preventDefault()
        return
      }
    }
    else if (e.key === `ArrowUp`) {
      App.select_next(mode, `above`)
      e.preventDefault()
      return
    }
    else if (e.key === `ArrowDown`) {
      App.select_next(mode, `below`)
      e.preventDefault()
      return
    }
    else if (e.key === `PageUp`) {
      App.scroll(mode, `up`)
      e.preventDefault()
      return
    }
    else if (e.key === `PageDown`) {
      App.scroll(mode, `down`)
      e.preventDefault()
      return
    }
    else if (e.key === `Tab`) {
      App.cycle_modes(true)
      e.preventDefault()
      return
    }
  }

  if (e.ctrlKey && e.shiftKey) {
    if (e.key === `ArrowUp`) {
      App.select_to_edge(mode, `up`)
      e.preventDefault()
      return
    }
    else if (e.key === `ArrowDown`) {
      App.select_to_edge(mode, `down`)
      e.preventDefault()
      return
    }
  }

  if (!e.ctrlKey && !e.shiftKey) {
    if (e.key === `Escape`) {
      App.step_back(mode, e)
      e.preventDefault()
      return
    }
    else if (e.key === `Enter`) {
      if (filter_focus) {
        if (App.get_setting(`filter_enter`)) {
          let current = App.get_filter(mode)
          let last = App[`last_${mode}_filter`]

          if (current !== last) {
            App.do_filter({mode: mode})
            return
          }
        }
      }

      if (!item) {
        e.preventDefault()
        return
      }

      App[`${mode}_action`]({item: item, from: `enter`})
      e.preventDefault()
      return
    }
    else if (e.key === `PageUp`) {
      if (App.get_setting(`page_scrolls`)) {
        App.scroll_page(mode, `up`)
      }
      else {
        App.scroll(mode, `up`)
      }

      e.preventDefault()
      return
    }
    else if (e.key === `PageDown`) {
      if (App.get_setting(`page_scrolls`)) {
        App.scroll_page(mode, `down`)
      }
      else {
        App.scroll(mode, `down`)
      }

      e.preventDefault()
      return
    }
    else if (e.key === `ArrowUp`) {
      arrow(`up`, e)
      e.preventDefault()
      return
    }
    else if (e.key === `ArrowDown`) {
      arrow(`down`, e)
      e.preventDefault()
      return
    }
    else if (e.key === `ArrowLeft`) {
      if (!filter_focus || !filter_filled) {
        App.cycle_modes(true)
        e.preventDefault()
        return
      }
    }
    else if (e.key === `ArrowRight`) {
      if (!filter_focus || !filter_filled) {
        App.cycle_modes(false)
        e.preventDefault()
        return
      }
    }
    else if (e.key === `Tab`) {
      App.cycle_modes(false)
      e.preventDefault()
      return
    }
    else if (e.key === `Delete`) {
      if (mode === `tabs`) {
        if (!filter_focus || !filter_filled || filter_end) {
          if (!item) {
            e.preventDefault()
            return
          }

          App.close_tabs(item)
          App.focus_filter(mode)
          e.preventDefault()
        }
      }

      return
    }
    else if (e.key === `Home`) {
      if (!filter_focus || !filter_filled) {
        App.goto_top(mode, true)
        e.preventDefault()
        return
      }
    }
    else if (e.key === `End`) {
      if (!filter_focus || !filter_filled) {
        App.goto_bottom(mode, true)
        e.preventDefault()
        return
      }
    }
  }

  if (!filter_focus) {
    let allowed = [`Backspace`]

    if (e.key.length === 1 || allowed.includes(e.key)) {
      App.focus_filter(mode)
    }
  }

  App.clear_restore()
}

App.setup_keyboard = () => {
  DOM.ev(document, `keydown`, (e) => {
    if (App.locust_swarm_on) {
      return
    }

    if (App.screen_locked) {
      return
    }

    if (e.repeat) {
      let ok = (e.key === `ArrowUp`) || (e.key === `ArrowDown`)

      if (!ok) {
        return
      }
    }

    let mode = App.window_mode

    if (e.key === `Control` || e.key === `Shift`) {
      App.start_press_timeout()

      if (App.pressed_key === e.key) {
        if (App.now() - App.double_key_date < App.get_setting(`double_key_delay`)) {
          App.double_key_action(e.key)
          return
        }
      }

      App.pressed_key = e.key
      App.double_key_date = App.now()
      e.preventDefault()
    }
    else {
      App.reset_triggers()
    }

    if (App.context_open()) {
      if (e.shiftKey && (e.key === `Enter`)) {
        App.hide_context()
        e.preventDefault()
      }
      else if (e.ctrlKey && (e.key === `ArrowLeft`)) {
        App.hide_context()
        e.preventDefault()
      }
      else if (e.ctrlKey && (e.key === `ArrowDown`)) {
        App.hide_context()
        e.preventDefault()
      }
      else if (e.ctrlKey && (e.key === `ArrowRight`)) {
        App.hide_context()
        e.preventDefault()
      }
    }
    else if (App.popup_open()) {
      let pmode = App.popup_mode()

      if (pmode === `dialog`) {
        if (e.key === `Escape`) {
          App.dismiss_popup(`dialog`)
          e.preventDefault()
          return
        }
        else if (e.key === `ArrowLeft`) {
          App.dialog_left()
          e.preventDefault()
          return
        }
        else if (e.key === `ArrowRight`) {
          App.dialog_right()
          e.preventDefault()
          return
        }
      }
      else if (pmode === `input`) {
        if (e.key === `Escape`) {
          App.dismiss_popup(`input`)
          e.preventDefault()
          return
        }
      }
      else if (pmode === `palette`) {
        if (e.key === `Escape`) {
          if (App.palette_filter_focused()) {
            App.clear_palette_filter()
            e.preventDefault()
          }
          else {
            App.hide_all_popups()
            e.preventDefault()
          }

          return
        }
        else if (e.key === `ArrowUp`) {
          App.palette_next(true)
          e.preventDefault()
          return
        }
        else if (e.key === `ArrowDown`) {
          App.palette_next()
          e.preventDefault()
          return
        }
      }
      else if (pmode === `close_tabs`) {
        if (e.key === `ArrowLeft`) {
          App.close_tabs_next(true)
          e.preventDefault()
          return
        }
        else if (e.key === `ArrowRight`) {
          App.close_tabs_next()
          e.preventDefault()
          return
        }
      }
      else if (Addlist.on_addlist()) {
        if (e.key === `Enter`) {
          Addlist.enter()
          e.preventDefault()
          return
        }
        else if (e.key === `Escape`) {
          Addlist.hide(true, `escape`)
          e.preventDefault()
          return
        }
        else if (e.key === `ArrowLeft`) {
          if (!App.text_with_value_focused()) {
            Addlist.left()
            e.preventDefault()
            return
          }
        }
        else if (e.key === `ArrowRight`) {
          if (!App.text_with_value_focused()) {
            Addlist.right()
            e.preventDefault()
            return
          }
        }
      }

      if (e.key === `Escape`) {
        App.hide_all_popups()
        e.preventDefault()
        return
      }
    }
    else if (App.on_items()) {
      App.check_items_keyboard(e)
    }
    else if (App.on_settings()) {
      if (e.key === `Escape`) {
        if (App.settings_filter_focused()) {
          App.clear_settings_filter()
          e.preventDefault()
        }
        else {
          App.hide_window()
          e.preventDefault()
        }

        return
      }
      else if (e.key === `ArrowLeft`) {
        if (!App.text_with_value_focused()) {
          App.settings_wheel.call(undefined, `up`)
          e.preventDefault()
          return
        }
      }
      else if (e.key === `ArrowRight`) {
        if (!App.text_with_value_focused()) {
          App.settings_wheel.call(undefined, `down`)
          e.preventDefault()
          return
        }
      }
    }
    else if (App.on_media()) {
      if (e.key === `Escape`) {
        App.hide_window()
        e.preventDefault()
        return
      }
      else if (e.key === `ArrowLeft`) {
        App.media_prev()
        e.preventDefault()
        return
      }
      else if (e.key === `ArrowRight`) {
        App.media_next()
        e.preventDefault()
        return
      }
      else if (e.key === `ArrowUp`) {
        App.scroll_media_up()
        e.preventDefault()
        return
      }
      else if (e.key === `ArrowDown`) {
        App.scroll_media_down()
        e.preventDefault()
        return
      }
      else if (e.key === `Enter`) {
        if (e.shiftKey) {
          App.show_media_menu(mode)
        }
        else {
          App.open_media()
        }

        e.preventDefault()
        return
      }
    }
    else if (mode === `about`) {
      if (e.key === `Escape`) {
        if (App.about_filter_focused()) {
          App.clear_about_filter()
          e.preventDefault()
        }
        else {
          App.hide_window()
          e.preventDefault()
        }

        return
      }
    }
    else if (mode === `signals`) {
      if (e.key === `Escape`) {
        App.hide_window()
        e.preventDefault()
        return
      }
    }
  })

  DOM.ev(document, `keyup`, (e) => {
    if (App.locust_swarm_on) {
      App.stop_locust_swarm()
      return
    }

    if (App.screen_locked) {
      if (App.popup_mode() === `prompt`) {
        if (e.key === `Enter`) {
          App.prompt_submit()
          e.preventDefault()
        }
      }

      return
    }

    App.stop_press_timeout()

    if (App.popup_open()) {
      let pmode = App.popup_mode()

      if (pmode === `dialog`) {
        if (e.key === `Enter`) {
          App.dialog_enter()
          e.preventDefault()
          return
        }
      }
      else if (pmode === `input`) {
        if (e.key === `Enter`) {
          if (e.ctrlKey) {
            App.input_enter()
            e.preventDefault()
          }

          return
        }
      }
      else if (pmode === `palette`) {
        if (e.key === `Enter`) {
          App.palette_enter()
          e.preventDefault()
          return
        }
      }
      else if (pmode === `prompt`) {
        if (e.key === `Enter`) {
          App.prompt_submit()
          e.preventDefault()
          return
        }
      }
      else if (pmode === `close_tabs`) {
        if (e.key === `Enter`) {
          App.close_tabs_action()
          e.preventDefault()
          return
        }
      }
      else if (pmode === `sort_tabs`) {
        if (e.key === `Enter`) {
          App.sort_tabs_action()
          e.preventDefault()
          return
        }
      }
    }
  })
}

App.reset_keyboard = () => {
  App.stop_press_timeout()
  App.pressed_key = undefined
  App.double_key_date = 0
}

App.start_press_timeout = () => {
  App.stop_press_timeout()

  App.press_timeout = setTimeout(() => {
    App.press_action()
  }, App.get_setting(`key_press_delay`))
}

App.stop_press_timeout = () => {
  clearTimeout(App.press_timeout)
}

App.press_action = () => {
  if (App.pressed_key === `Control`) {
    let cmd = App.get_setting(`ctrl_press_command`)
    App.run_command({cmd: cmd, from: `ctrl_press`})
  }
  else if (App.pressed_key === `Shift`) {
    let cmd = App.get_setting(`shift_press_command`)
    App.run_command({cmd: cmd, from: `shift_press`})
  }

  App.reset_triggers()
}

App.double_key_action = (key) => {
  if (key === `Control`) {
    let cmd = App.get_setting(`double_ctrl_command`)
    App.run_command({cmd: cmd, from: `double_ctrl`})
  }
  else if (key === `Shift`) {
    let cmd = App.get_setting(`double_shift_command`)
    App.run_command({cmd: cmd, from: `double_shift`})
  }

  App.reset_triggers()
}