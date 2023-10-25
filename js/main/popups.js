App.create_popup = (args) => {
  let p = {}
  p.setup_done = false
  let popup = DOM.create(`div`, `popup_main hidden`, `popup_${args.id}`)
  let container = DOM.create(`div`, `popup_container`, `popup_${args.id}_container`)
  container.tabIndex = 0

  if (args.element) {
    container.innerHTML = ``
    container.append(args.element)
  }
  else {
    container.innerHTML = App.get_template(args.id)
  }

  popup.append(container)

  DOM.ev(popup, `click`, (e) => {
    if (e.target.isConnected && !e.target.closest(`.popup_container`)) {
      p.dismiss()
    }
  })

  DOM.el(`#main`).append(popup)
  p.element = popup

  p.setup = () => {
    if (args.setup && !p.setup_done) {
      args.setup()
      p.setup_done = true
      App.debug(`Popup Setup: ${args.id}`)
    }
  }

  p.show = () => {
    p.setup()
    p.element.classList.remove(`hidden`)
    container.focus()
    p.open = true
  }

  p.hide = (bypass = false) => {
    if (!p.open) {
      return
    }

    if (!bypass && args.on_hide) {
      args.on_hide(args.id)
    }
    else {
      p.element.classList.add(`hidden`)
      p.open = false

      if (args.after_hide) {
        args.after_hide(args.id)
      }
    }
  }

  p.dismiss = () => {
    App.popups[args.id].hide()

    if (args.on_dismiss) {
      args.on_dismiss()
    }
  }

  App.popups[args.id] = p
}

App.show_popup = (id) => {
  clearTimeout(App.alert_timeout)
  App.popups[id].show()
  App.popups[id].show_date = App.now()
  let open = App.open_popups()

  open.sort((a, b) => {
    return a.show_date < b.show_date ? -1 : 1
  })

  let zindex = 999

  for (let popup of open) {
    popup.element.style.zIndex = zindex
    zindex += 1
  }
}

App.setup_popup = (id) => {
  App.popups[id].setup()
}

App.start_popups = () => {
  if (App.check_ready(`popups`)) {
    return
  }

  App.create_popup({
    id: `alert`,
  })

  App.create_popup({
    id: `textarea`,
    setup: () => {
      DOM.ev(DOM.el(`#textarea_copy`), `click`, () => {
        App.textarea_copy()
      })
    },
  })

  App.create_popup({
    id: `input`,
    setup: () => {
      DOM.ev(DOM.el(`#input_submit`), `click`, () => {
        App.input_enter()
      })
    },
  })

  App.create_popup({
    id: `dialog`,
    on_dismiss: () => {
      if (App.dialog_on_dismiss) {
        App.dialog_on_dismiss()
      }
    },
  })

  App.create_popup({
    id: `prompt`,
    setup: () => {
      App.setup_prompt()
    },
  })
}

App.hide_all_popups = () => {
  clearTimeout(App.alert_timeout)

  for (let id of App.open_popup_list()) {
    App.popups[id].hide()
  }
}

App.hide_popup = (id, bypass = false) => {
  App.popups[id].hide(bypass)
}

App.open_popup_list = () => {
  let open = []

  for (let id in App.popups) {
    if (App.popups[id].open) {
      open.push(id)
    }
  }

  return open
}

App.popup_is_open = (id, exact = true) => {
  for (let pid of App.open_popup_list()) {
    if (exact) {
      if (pid === id) {
        return true
      }
    }
    else {
      if (pid.startsWith(id)) {
        return true
      }
    }
  }

  return false
}

App.popup_open = () => {
  for (let key in App.popups) {
    if (App.popups[key].open) {
      return true
    }
  }

  return false
}

App.open_popups = () => {
  let open = []

  for (let popup in App.popups) {
    if (App.popups[popup].open) {
      open.push(App.popups[popup])
    }
  }

  return open
}

App.dismiss_popup = (id) => {
  App.popups[id].dismiss()
}

App.popup_mode = () => {
  let highest_z = 0
  let pmode

  for (let popup of App.open_popup_list()) {
    let z = parseInt(App.popups[popup].element.style.zIndex)

    if (z > highest_z) {
      highest_z = z
      pmode = popup
    }
  }

  return pmode
}