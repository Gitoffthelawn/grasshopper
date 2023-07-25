App.pinline_debouncer = App.create_debouncer(() => {
  App.do_check_pinline()
}, App.pinline_delay)

App.check_pinline = () => {
  if (App.get_setting(`show_pinline`)) {
    App.pinline_debouncer.call()
  }
}

App.do_check_pinline = () => {
  App.pinline_debouncer.cancel()

  if (App.window_mode !== `tabs`) {
    return
  }

  if (!App.get_setting(`show_pinline`)) {
    return
  }

  App.log(`Checking pinline`)
  App.remove_pinline()
  let last_pinned

  for (let item of App.get_items(`tabs`)) {
    if (!item.visible) {
      continue
    }

    if (item.pinned) {
      last_pinned = item
    }
    else {
      if (!last_pinned) {
        return
      }
      else {
        let pinline = DOM.create(`div`, `pinline action`)
        pinline.textContent = `Normal Tabs`

        DOM.ev(pinline, `click`, (e) => {
          App.toggle_normal_tabs()
        })

        DOM.ev(pinline, `mouseup`, (e) => {
          if (e.button !== 1) {
            return
          }

          let cmd = App.get_setting(`middle_click_pinline`)

          if (cmd !== `none`) {
            App.run_command({cmd: cmd, item: item, from: `pinline`})
          }
        })

        last_pinned.element.after(pinline)
        return
      }
    }
  }
}

App.remove_pinline = () => {
  for (let el of DOM.els(`.pinline`, DOM.el(`#tabs_container`))) {
    el.remove()
  }
}