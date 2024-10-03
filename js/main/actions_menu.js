App.get_actions = (mode) => {
  let menu = App.get_setting(`${mode}_menu`)
  return menu.map(item => item.cmd) || []
}

App.create_actions_menu = (mode) => {
  App[`${mode}_actions`] = App.get_actions(mode)
  let btn = DOM.create(`div`, `actions_button button icon_button`, `${mode}_actions`)
  btn.append(App.get_svg_icon(`sun`))
  let click = App.get_cmd_name(`show_actions_menu`)
  let rclick = App.get_cmd_name(`show_browser_menu`)

  if (App.get_setting(`show_tooltips`)) {
    btn.title = `Click: ${click} (Ctrl + Right)\nRight Click: ${rclick}`
    App.trigger_title(btn, `middle_click_actions_menu`)
  }

  DOM.ev(btn, `click`, (e) => {
    App.show_actions_menu(mode, e)
  })

  DOM.ev(btn, `contextmenu`, (e) => {
    e.preventDefault()
    App.show_browser_menu(e)
  })

  DOM.ev(btn, `auxclick`, (e) => {
    if (e.button === 1) {
      let cmd = App.get_setting(`middle_click_actions_menu`)
      App.run_command({cmd, from: `actions_menu`, e})
    }
  })

  return btn
}

App.show_actions_menu = (mode, e) => {
  let global = App.get_setting(`global_menu`)

  if (global.length) {
    App.show_global_menu(e)
  }
  else {
    App.show_mode_menu(mode, e)
  }
}

App.show_global_menu = (e) => {
  let items = App.custom_menu_items({
    name: `global_menu`,
  })

  let mode = App.active_mode
  let element = DOM.el(`#${mode}_actions`)
  App.show_context({items, e, element})
}

App.show_mode_menu = (mode, e) => {
  let items = App.custom_menu_items({
    name: `${mode}_menu`,
  })

  let element = DOM.el(`#${mode}_actions`)
  App.show_context({items, e, element})
}