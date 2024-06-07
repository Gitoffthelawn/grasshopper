App.edit_tab_title = (args = {}) => {
  let def_args = {
    title: ``,
  }

  App.def_args(def_args, args)
  let active = App.get_active_items({mode: args.item.mode, item: args.item})
  let s = args.title ? `Edit title?` : `Remove title?`
  let force = App.check_force(`warn_on_edit_tabs`, active)

  App.show_confirm({
    message: `${s} (${active.length})`,
    confirm_action: () => {
      for (let it of active) {
        App.apply_edit({what: `title`, item: it, value: args.title, on_change: (value) => {
          App.custom_save(it.id, `custom_title`, value)
          App.push_to_title_history([value])
        }})
      }
    },
    force: force,
  })
}

App.edit_title = (item, add_value = true) => {
  let value = ``
  let highlight = false

  if (add_value) {
    let auto = App.get_setting(`edit_title_auto`)
    highlight = auto ? true : false
    value = auto ? App.title(item) : ``
  }

  App.edit_prompt({what: `title`, item: item,
    fill: item.title, value: value, highlight: highlight})
}

App.push_to_title_history = (titles) => {
  if (!titles.length) {
    return
  }

  for (let title of titles) {
    if (!title) {
      continue
    }

    App.title_history = App.title_history.filter(x => x !== title)
    App.title_history.unshift(title)
    App.title_history = App.title_history.slice(0, App.title_history_max)
  }

  App.stor_save_title_history()
}

App.get_all_titles = (include_rules = true) => {
  let titles = []

  for (let title of App.title_history) {
    if (!titles.includes(title)) {
      titles.push(title)
    }
  }

  for (let item of App.get_items(`tabs`)) {
    if (item.custom_title) {
      if (!titles.includes(item.custom_title)) {
        titles.push(item.custom_title)
      }
    }

    if (include_rules) {
      if (item.rule_title) {
        if (!titles.includes(item.rule_title)) {
          titles.push(item.rule_title)
        }
      }
    }
  }

  return titles
}

App.remove_item_title = (item) => {
  let active = App.get_active_items({mode: item.mode, item: item})

  if (active.length === 1) {
    let it = active[0]

    if (it.rule_title && !it.custom_title) {
      App.domain_rule_message()
      return
    }
  }

  App.remove_edits({what: [`title`], items: active})
}