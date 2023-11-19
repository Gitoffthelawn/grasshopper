App.start_about = () => {
  if (App.check_ready(`about`)) {
    return
  }

  App.create_window({
    id: `about`,
    setup: () => {
      App.about_info_items = [
        `Up, Down, and Enter keys navigate and pick items`,
        `Type to filter or search depending on mode`,
        `Cycle modes with the top-left menu or (Shift) Tab`,
        `Cycle with Left and Right`,
        `Middle Click on tabs closes them`,
        `Esc does Step Back and closes windows`,
        `Shift + Up/Down selects multiple items`,
        `Shift + Home/End selects towards edges`,
        `Ctrl + Click selects multiple items`,
        `Shift + Click selects an item range`,
        `Right Click on items shows the context menu`,
        `Shift + Enter on items shows the context menu`,
        `Ctrl + Home goes to the top`,
        `Ctrl + End goes to the bottom`,
        `Ctrl + Left toggles the Main Menu`,
        `Ctrl + Right toggles Actions`,
        `Ctrl + Up moves tabs to the top`,
        `Ctrl + Down moves tabs to the bottom`,
        `Ctrl + F shows the filters`,
        `Ctrl + Dot goes to the playing tab`,
        `Ctrl + Comma goes to the previous tab`,
        `Delete closes selected tabs`,
        `Double click on empty tabs space opens a new tab`,
        `Command palette commands take into account selected items`,
        `To filter by title start with title:`,
        `To filter by URL start with url:`,
        `To filter with regex start with re:`,
        `To filter with regex by title start with re_title:`,
        `To filter with regex by URL start with re_url:`,
        `To filter by color start with color:`,
        `To filter by tag start with tag:`,
        `Alt + Click selects items without triggering actions`,
        `Right Click on the Main Menu button to show the palette`,
        `Right Click on the Filter Menu to show filter commands`,
        `Right Click on the Go To Playing button to filter by playing`,
        `Right Click on the Step Back button to show Recent Tabs`,
        `Right Click on the Actions button to show the Browser Menu`,
        `Right Click on the Filter to show recent filters used`,
        `In the filter, $day resolves to the current week day`,
        `In the filter, $month resolves to the current month name`,
        `In the filter, $year resolves to the year number`,
        `Context menus support filtering, just start typing something`,
      ]

      let close = DOM.el(`#about_close`)

      DOM.ev(close, `click`, () => {
        App.hide_window()
      })

      close.textContent = App.close_text

      let image = DOM.el(`#about_image`)

      DOM.ev(image, `click`, () => {
        if (image.classList.contains(`rotate_1`)) {
          image.classList.remove(`rotate_1`)
          image.classList.add(`invert`)
        }
        else if (image.classList.contains(`invert`)) {
          image.classList.remove(`invert`)

          if (image.classList.contains(`flipped`)) {
            image.classList.remove(`flipped`)
          }
          else {
            image.classList.add(`flipped`)
          }
        }
        else {
          image.classList.add(`rotate_1`)
        }
      })

      let info = DOM.el(`#about_info`)

      for (let item of App.about_info_items) {
        let el = DOM.create(`div`, `about_info_item filter_item filter_text`)
        el.textContent = item
        info.append(el)
      }

      let s = `${App.manifest.name} v${App.manifest.version}`
      DOM.el(`#about_name`).textContent = s
      let filter = DOM.el(`#about_filter`)

      DOM.ev(filter, `input`, () => {
        App.filter_about()
      })
    },
    after_show: () => {
      let filter = DOM.el(`#about_filter`)

      if (filter.value) {
        App.clear_about_filter()
      }

      DOM.el(`#about_started`).textContent = `Started: ${App.timeago(App.start_date)}`
      DOM.el(`#about_installed`).textContent = `Installed: ${App.timeago(App.first_time.date)}`
      let image = DOM.el(`#about_image`)
      image.classList.remove(`rotate_1`)
      image.classList.remove(`invert`)
      image.classList.remove(`flipped`)
      filter.focus()
    },
    colored_top: true,
  })

  App.filter_about_debouncer = App.create_debouncer(() => {
    App.do_filter_about()
  }, App.filter_delay_2)
}

App.about_filter_focused = () => {
  return document.activeElement.id === `about_filter`
}

App.clear_about_filter = () => {
  if (App.filter_has_value(`about`)) {
    App.set_filter({mode: `about`})
  }
  else {
    App.hide_window()
  }
}

App.filter_about = () => {
  App.filter_about_debouncer.call()
}

App.do_filter_about = () => {
  App.filter_about_debouncer.cancel()
  App.do_filter_2(`about`)
}

App.show_about = () => {
  App.start_about()
  App.show_window(`about`)
}