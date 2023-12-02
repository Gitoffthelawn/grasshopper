App.setup_recent_tabs = () => {
  App.empty_previous_tabs_debouncer = App.create_debouncer(() => {
    App.do_empty_previous_tabs()
  }, App.empty_previous_tabs_delay)
}

App.empty_previous_tabs = () => {
  App.empty_previous_tabs_debouncer.call()
}

App.do_empty_previous_tabs = () => {
  App.empty_previous_tabs_debouncer.cancel()
  App.previous_tabs = []
}

App.get_recent_tabs = (args = {}) => {
  let def_args = {
    active: true,
    max: 0,
  }

  App.def_args(def_args, args)
  let tabs = App.get_items(`tabs`).slice(0)

  tabs.sort((a, b) => {
    return a.last_accessed > b.last_accessed ? -1 : 1
  })

  if (!args.active) {
    tabs = tabs.filter(x => !x.active)
  }

  tabs = tabs.filter(x => !x.header)

  if (args.max > 0) {
    tabs = tabs.slice(0, args.max)
  }

  return tabs
}

App.get_previous_tabs = () => {
  App.previous_tabs = App.get_recent_tabs({active: false})
  App.previous_tabs_index = 0
}

App.go_to_previous_tab = () => {
  if (!App.previous_tabs.length) {
    App.get_previous_tabs()
  }

  App.empty_previous_tabs()

  if (App.previous_tabs.length <= 1) {
    return
  }

  let prev_tab = App.previous_tabs[App.previous_tabs_index]
  let item = App.get_item_by_id(`tabs`, prev_tab.id)

  if (item) {
    App.focus_tab({
      item: item,
      scroll: `center_smooth`,
      method: `previous`,
    })

    App.previous_tabs_index += 1

    if (App.previous_tabs_index > (App.previous_tabs.length - 1)) {
      App.previous_tabs_index = 0
    }
  }
}

App.show_recent_tabs = (e) => {
  let items = []
  let max = App.get_setting(`max_recent_tabs`)
  let active = App.get_setting(`recent_active`)
  let tabs = App.get_recent_tabs({max: max, active: active})
  let playing_icon = App.get_setting(`playing_icon`)

  for (let item of tabs) {
    let title = App.title(item)

    if (item.audible && playing_icon) {
      title = `${playing_icon} ${title}`
    }

    let obj = {
      image: item.favicon,
      text: title,
      action: async () => {
        await App.check_on_tabs()
        App.tabs_action(item, `recent_tabs`)
      },
      alt_action: () => {
        App.close_tabs(item)
      },
    }

    if (item.active) {
      obj.bold = true
    }

    items.push(obj)
  }

  App.show_context({items: items, e: e})
}