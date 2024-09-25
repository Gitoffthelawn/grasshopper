App.insert_header = async (item, full = true) => {
  let active = App.get_active_items({mode: item.mode, item})
  let first = active.at(0)
  let index = App.get_item_element_index({mode: first.mode, element: first.element})
  let tab = await App.open_new_tab({url: App.header_url, index, pinned: item.pinned, active: false})
  let header = App.get_item_by_id(item.mode, tab.id)

  if (active.length > 1) {
    for (let it of active.slice(1, -1)) {
      App.apply_edit({what: `split_top`, item: it, value: false, on_change: (value) => {
        App.custom_save(it.id, `custom_split_top`, value)
      }})

      App.apply_edit({what: `split_bottom`, item: it, value: false, on_change: (value) => {
        App.custom_save(it.id, `custom_split_bottom`, value)
      }})
    }

    let bottom = active.at(-1)

    App.apply_edit({what: `split_bottom`, item: bottom, value: true, on_change: (value) => {
      App.custom_save(bottom.id, `custom_split_bottom`, value)
    }})
  }

  if (header) {
    if (full) {
      App.edit_tab_split({item: header, which: `top`})
    }

    App.edit_title(header, false)
  }
}

App.header_group = (item) => {
  let waypoint = false
  let select = false
  let selected = []
  let items = App.get_items(item.mode)

  for (let [i, it] of items.entries()) {
    if (waypoint) {
      if (it.header) {
        select = true
        break
      }
      else if (item.pinned && !it.pinned) {
        select = true
        break
      }
      else if (App.get_split_top(it)) {
        select = true
        break
      }
      else if (App.get_split_bottom(it)) {
        selected.push(it)
        select = true
        break
      }
      else {
        selected.push(it)
      }

      if (i === (items.length - 1)) {
        select = true
      }
    }

    if (it === item) {
      selected.push(it)
      waypoint = true
      continue
    }
  }

  if (select) {
    return selected
  }
  else {
    return []
  }
}

App.select_header_group = (item) => {
  let group = App.header_group(item)

  if (group.length) {
    if ((group.at(0).selected) && (group.at(-1).selected)) {
      App.deselect({mode: item.mode, select: `selected`})
    }
    else {
      App.deselect({mode: item.mode, select: `none`})
      let first

      for (let item of group) {
        if (!first) {
          if (!item.header) {
            first = item
            continue
          }
        }

        App.toggle_selected({item, what: true})
      }

      if (first) {
        App.toggle_selected({item: first, what: true})
      }
    }
  }
}

App.get_header_tabs = () => {
  let headers = App.get_items(`tabs`).filter(x => x.header)
  return headers.filter(x => App.is_header(x))
}

App.get_subheader_tabs = () => {
  let headers = App.get_items(`tabs`).filter(x => x.header)
  return headers.filter(x => !App.is_header(x))
}

App.get_headers = () => {
  return App.get_items(`tabs`).filter(x => x.header)
}

App.close_headers = (force = false) => {
  let items = App.get_header_tabs()

  if (!items.length) {
    return
  }

  App.close_tabs_method(items, force)
}

App.close_subheaders = (force = false) => {
  let items = App.get_subheader_tabs()

  if (!items.length) {
    return
  }

  App.close_tabs_method(items, force)
}

App.set_header_text = (item) => {
  let title = App.title(item, false)
  let text_el = DOM.el(`.item_text_1`, item.element)
  text_el.textContent = title
  let h_title = `Header: ${title}`
  item.element.title = h_title
  item.header_title = h_title
}

App.is_header_url = (url) => {
  if (!url.startsWith(App.browser_protocol)) {
    return false
  }

  if (!url.includes(App.header_file)) {
    return false
  }

  return true
}

App.check_header = (item) => {
  if (item.mode !== `tabs`) {
    return
  }

  function no_header () {
    item.header = false
    item.element.classList.remove(`header_item`)
  }

  if (App.is_header_url(item.url)) {
    // The header url is now obsolete, so update it
    if (!item.url.includes(App.header_url)) {
      no_header()

      if (item.header_refresh) {
        return
      }

      item.header_refresh = true
      browser.tabs.update(item.id, {url: App.header_url})
      return
    }

    item.header = true
    item.unread = false
    item.element.classList.add(`header_item`)
  }
  else {
    no_header()
  }
}

App.check_header_first = (item) => {
  if (!item) {
    return false
  }

  if (item.header) {
    return false
  }

  if (App.get_split_top(item)) {
    return false
  }

  return true
}

App.focus_header_first = (item, from, scroll = `nearest_smooth`) => {
  let next = App.get_other_item({mode: item.mode, item, wrap: false})

  if (App.check_header_first(next)) {
    App.tabs_action({item: next, from, scroll})
  }
}

App.is_header = (item) => {
  return item.header && App.get_split_top(item)
}

App.is_subheader = (item) => {
  return item.header && !App.get_split_top(item)
}

App.is_split = (item) => {
  return App.get_split_top(item) || App.get_split_bottom(item)
}

App.edit_tab_split = (args = {}) => {
  let def_args = {
    which: `top`,
    prompt_title: true,
  }

  App.def_args(def_args, args)
  let active = App.get_active_items({mode: args.item.mode, item: args.item})

  if (!active.length) {
    return
  }

  let force = App.check_force(`warn_on_edit_tabs`, active)

  if (args.which === `top` || args.which === `bottom`) {
    let other = args.which === `top` ? `bottom` : `top`

    App.show_confirm({
      message: `Add splits (${active.length})`,
      confirm_action: () => {
        for (let it of active) {
          App.apply_edit({what: `split_${args.which}`, item: it, value: true, on_change: (value) => {
            App.custom_save(it.id, `custom_split_${args.which}`, value)
          }})

          App.apply_edit({what: `split_${other}`, item: it, value: false, on_change: (value) => {
            App.custom_save(it.id, `custom_split_${other}`, value)
          }})
        }
      },
      force,
    })
  }
  else if (args.which === `both`) {
    if (active.length < 2) {
      App.alert(`Multiple tabs are required to do this`)
      return
    }

    for (let it of active.slice(1, -1)) {
      App.apply_edit({what: `split_top`, item: it, value: false, on_change: (value) => {
        App.custom_save(it.id, `custom_split_top`, value)
      }})

      App.apply_edit({what: `split_bottom`, item: it, value: false, on_change: (value) => {
        App.custom_save(it.id, `custom_split_bottom`, value)
      }})
    }

    let top = active.at(0)
    let bottom = active.at(-1)

    App.apply_edit({what: `split_top`, item: top, value: true, on_change: (value) => {
      App.custom_save(top.id, `custom_split_top`, value)
    }})

    App.apply_edit({what: `split_bottom`, item: bottom, value: true, on_change: (value) => {
      App.custom_save(bottom.id, `custom_split_bottom`, value)
    }})
  }
}

App.remove_item_split = (item) => {
  let active = App.get_active_items({mode: item.mode, item})

  if (active.length === 1) {
    if (item.rule_split_top || item.rule_split_bottom) {
      App.domain_rule_message()
    }
  }

  App.remove_edits({what: [`split_top`, `split_bottom`], items: active, text: `splits`})
}

App.remove_all_splits = (force = false) => {
  App.remove_edits({what: [`split_top`, `split_bottom`], force, text: `splits`})
}

App.apply_splits = (item) => {
  if (item.mode !== `tabs`) {
    return
  }

  let has_split = false

  for (let what of [`top`, `bottom`]) {
    if (App.get_split(item, what)) {
      item.element.classList.add(`split_${what}`)
      has_split = true
    }
    else {
      item.element.classList.remove(`split_${what}`)
    }
  }

  if (has_split) {
    item.element.classList.add(`split`)
  }
  else {
    item.element.classList.remove(`split`)
  }
}

App.remove_all_zones = () => {
  App.show_confirm({
    message: `Remove all zones?`,
    confirm_action: () => {
      App.close_headers(true)
      App.close_subheaders(true)
      App.remove_all_splits(true)
    },
  })
}