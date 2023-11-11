App.insert_header = async (item) => {
  let active = App.get_active_items({mode: item.mode, item: item})
  let first = active.at(0)
  let index = App.get_item_element_index(first.mode, first.element)
  let tab = await App.open_new_tab({url: App.header_file, index: index, pinned: item.pinned, active: false})
  let header = App.get_item_by_id(item.mode, tab.id)

  if (active.length > 1) {
    for (let it of active.slice(1, -1)) {
      if (App.apply_edit(`split_top`, it, false)) {
        App.custom_save(it.id, `custom_split_top`, false)
      }

      if (App.apply_edit(`split_bottom`, it, false)) {
        App.custom_save(it.id, `custom_split_bottom`, false)
      }
    }

    let bottom = active.at(-1)
    let next = App.get_other_item({mode: item.mode, item: bottom, wrap: false})
    let save_bottom = true

    if (!next) {
      save_bottom = false
    }

    if (bottom.pinned && !next.pinned) {
      save_bottom = false
    }

    if (App.is_header(next)) {
      save_bottom = false
    }

    if (App.get_split(next, `top`)) {
      save_bottom = false
    }

    if (App.get_split(next, `bottom`)) {
      save_bottom = false
    }

    if (save_bottom) {
      if (App.apply_edit(`split_bottom`, bottom, true)) {
        App.custom_save(bottom.id, `custom_split_bottom`, true)
      }
    }
  }

  if (header) {
    App.edit_title(header)
  }
}

App.header_group = (item) => {
  let waypoint = false
  let select = false
  let selected = []
  let items = App.get_items(item.mode)

  for (let [i, it] of items.entries()) {
    if (waypoint) {
      if (App.is_header(it)) {
        select = true
        break
      }
      else if (item.pinned && !it.pinned) {
        select = true
        break
      }
      else if (App.get_split(it, `top`)) {
        select = true
        break
      }
      else if (App.get_split(it, `bottom`)) {
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
      App.deselect(item.mode, `up`)
    }
    else {
      App.deselect(item.mode, `none`)

      for (let item of group) {
        App.toggle_selected(item, true)
      }
    }
  }
}

App.get_header_tabs = () => {
  return App.get_items(`tabs`).filter(x => App.is_header(x))
}

App.remove_all_headers = () => {
  let items = App.get_header_tabs()

  if (!items.length) {
    return
  }

  App.close_tabs_method(items)
}

App.is_header = (item) => {
  if (item.mode !== `tabs`) {
    return false
  }

  if (!item.url.startsWith(App.browser_protocol)) {
    return false
  }

  if (!item.url.endsWith(App.header_file)) {
    return false
  }

  if (!App.tab_ready(item)) {
    return false
  }

  return true
}

App.set_header_text = (item) => {
  let title = App.get_title(item, false) || `Give me a title`
  let text_el = DOM.el(`.item_text_1`, item.element)
  text_el.textContent = title
  item.header_title = title
  let tips = []
  tips.push(`This is a Header Tab`)
  tips.push(`Double Click to select group`)
  item.element.title = tips.join(`\n`)
}

App.check_header = (item) => {
  if (App.is_header(item)) {
    item.element.classList.add(`header_item`)
    item.unread = false
  }
  else {
    item.element.classList.remove(`header_item`)
  }
}