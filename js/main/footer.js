App.setup_footer = () => {
  App.footer_count_debouncer = App.create_debouncer(() => {
    App.do_update_footer_count()
  }, App.footer_delay)

  App.update_footer_info_debouncer = App.create_debouncer((item) => {
    App.do_update_footer_info(item)
  }, App.footer_delay)
}

App.update_footer_info = (item) => {
  App.update_footer_info_debouncer.call(item)
}

App.do_update_footer_info = (item) => {
  App.update_footer_info_debouncer.cancel()

  if (App.footer_showing_message) {
    return
  }

  if (!App.get_setting(`show_footer`)) {
    return
  }

  if (item) {
    let info

    if (item.header) {
      info = item.header_title
    }
    else {
      info = item.footer
    }

    App.set_footer_info(item.mode, info, item)
  }
  else {
    App.empty_footer_info()
  }
}

App.empty_footer_info = () => {
  App.set_footer_info(App.window_mode, ``)
}

App.set_footer_info = (mode, text, item) => {
  let footer = App.get_footer(mode)

  if (footer) {
    let info = DOM.el(`#footer_info`)

    if (item) {
      if (mode === `bookmarks`) {
        let length = App.get_setting(`bookmarks_footer_folder`)

        if (length > 0) {
          let title = App.get_bookmark_folder_title(item.parent_id)

          if (title) {
            title = title.substring(0, length).trim()
            text = `${title} | ${text}`
          }
        }
      }
    }

    info.textContent = text
  }
}

App.get_footer = (mode) => {
  return DOM.el(`#footer`)
}

App.create_footer = () => {
  let footer = DOM.create(`div`, ``, `footer`)
  let tab_box_btn = DOM.create(`div`, `pointer`, `footer_tab_box`)
  tab_box_btn.append(App.get_svg_icon(`arrow_up`))

  if (App.get_setting(`show_tooltips`)) {
    let click = App.get_cmd_name(`toggle_tab_box`)
    tab_box_btn.title = `Click: ${click}`
    App.trigger_title(tab_box_btn, `middle_click_footer`)
  }

  DOM.ev(tab_box_btn, `click`, () => {
    App.toggle_tab_box()
  })

  footer.append(tab_box_btn)

  let tips = App.get_setting(`show_tooltips`)
  let footer_content = DOM.create(`div`, `glow`, `footer_content`)
  let footer_count = DOM.create(`div`, ``, `footer_count`)

  if (tips) {
    let click = App.get_cmd_name(`select_all_items`)
    footer_count.title = `Number of items\nClick: ${click}`
    App.trigger_title(footer_count, `middle_click_footer`)
  }

  footer_content.append(footer_count)
  let footer_info = DOM.create(`div`, ``, `footer_info`)

  if (tips) {
    App.trigger_title(footer_info, `click_footer`)
    App.trigger_title(footer_info, `middle_click_footer`)
  }

  footer_content.append(footer_info)

  DOM.ev(footer_count, `click`, (e) => {
    if (e.shiftKey || e.ctrlKey) {
      return
    }

    App.select_all(App.active_mode, true)
  })

  DOM.ev(footer_info, `click`, (e) => {
    if (e.shiftKey || e.ctrlKey) {
      return
    }

    let cmd = App.get_setting(`click_footer`)
    App.run_command({cmd, from: `footer`, e})
  })

  DOM.ev(footer, `contextmenu`, (e) => {
    e.preventDefault()
    App.show_footer_menu(e)
  })

  DOM.ev(footer, `auxclick`, (e) => {
    if (e.button === 1) {
      let cmd = App.get_setting(`middle_click_footer`)
      App.run_command({cmd, from: `footer`, e})
    }
  })

  footer.append(footer_content)
  return footer
}

App.update_footer_count = () => {
  App.footer_count_debouncer.call()
}

App.do_update_footer_count = () => {
  App.footer_count_debouncer.cancel()

  if (!App.get_setting(`show_footer`)) {
    return
  }

  let el = DOM.el(`#footer_count`)

  if (App.get_setting(`show_footer_count`)) {
    DOM.show(el)
  }
  else {
    DOM.hide(el)
    return
  }

  let mode = App.active_mode
  let n1 = App.selected_items(mode).length
  let n2 = App.get_visible(mode).length
  let count

  if (n1 > 1) {
    count = `(${n1}/${n2})`
  }
  else {
    count = `(${n2})`
  }

  el.textContent = count
}

App.set_show_footer = (what) => {
  App.set_setting({setting: `show_footer`, value: what})
  App.check_refresh_settings()
}

App.init_footer = () => {
  if (App.get_setting(`show_footer`)) {
    App.show_footer()
  }
  else {
    App.hide_footer()
  }
}

App.refresh_footer = () => {
  App.update_footer_count(App.window_mode)
  App.update_footer_info(App.get_selected(App.window_mode))
}

App.show_footer = (refresh = false, set = false) => {
  App.main_add(`show_footer`)

  if (refresh) {
    App.refresh_footer()
  }

  if (set) {
    App.set_show_footer(true)
  }
}

App.hide_footer = (set = false) => {
  App.main_remove(`show_footer`)

  if (set) {
    App.set_show_footer(false)
  }
}

App.toggle_footer = () => {
  if (App.get_setting(`show_footer`)) {
    App.hide_footer(true)
  }
  else {
    App.show_footer(true, true)
  }
}

App.footer_message = (msg) => {
  clearTimeout(App.footer_message_timeout)
  App.set_footer_info(App.active_mode, msg)
  App.footer_showing_message = true

  App.footer_message_timeout = setTimeout(() => {
    App.footer_showing_message = false
    App.restore_footer_info()
  }, App.footer_message_delay)
}

App.restore_footer_info = () => {
  App.update_footer_info(App.get_selected())
}

App.show_footer_menu = (e) => {
  let items = App.custom_menu_items({
    name: `footer_menu`,
  })

  App.show_context({items, e})
}