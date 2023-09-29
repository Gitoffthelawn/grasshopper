App.setup_tabs = () => {
  App.tabs_filter_modes = [
    {type: `pinned`, text:`Pinned`, skip: false, info: `Show pinned tabs`},
    {type: `normal`, text:`Normal`, skip: false, info: `Show normal tabs`},
    {type: `playing`, text:`Playing`, skip: false, info: `Show tabs emitting sound`},
    {type: `unloaded`, text:`Unloaded`, skip: false, info: `Show unloaded tabs`},
    {type: `duplicate`, text:`Duplicate`, skip: false, info: `Show tabs that have duplicates`},
  ]

  App.debug_tabs = false

  browser.tabs.onCreated.addListener(async (info) => {
    if (App.tabs_locked) {
      return
    }

    App.debug(`Tab Created: ID: ${info.id}`, App.debug_tabs)

    if (info.windowId === App.window_id) {
      await App.refresh_tab(info.id, false, info)
    }
  })

  browser.tabs.onUpdated.addListener(async (id, cinfo, info) => {
    if (App.tabs_locked) {
      return
    }

    App.debug(`Tab Updated: ID: ${id}`, App.debug_tabs)

    if (info.windowId === App.window_id) {
      await App.refresh_tab(id, false, info)
      App.check_playing()
    }
  })

  browser.tabs.onActivated.addListener(async (info) => {
    if (App.tabs_locked) {
      return
    }

    App.debug(`Tab Activated: ID: ${info.tabId}`, App.debug_tabs)

    if (info.windowId === App.window_id) {
      await App.on_tab_activated(info)
      App.check_playing()
    }
  })

  browser.tabs.onRemoved.addListener((id, info) => {
    if (App.tabs_locked) {
      return
    }

    App.debug(`Tab Removed: ID: ${id}`, App.debug_tabs)

    if (info.windowId === App.window_id) {
      App.remove_closed_tab(id)
      App.check_playing()
    }
  })

  browser.tabs.onMoved.addListener((id, info) => {
    if (App.tabs_locked) {
      return
    }

    App.debug(`Tab Moved: ID: ${id}`, App.debug_tabs)

    if (info.windowId === App.window_id) {
      App.move_item(`tabs`, info.fromIndex, info.toIndex)
      App.check_playing()
    }
  })

  browser.tabs.onDetached.addListener((id, info) => {
    if (App.tabs_locked) {
      return
    }

    App.debug(`Tab Detached: ID: ${id}`, App.debug_tabs)

    if (info.oldWindowId === App.window_id) {
      App.remove_closed_tab(id)
      App.check_playing()
    }
  })
}

App.start_tabs_popups = () => {
  if (App.tabs_popups) {
    return
  }

  App.tabs_popups = true

  App.create_popup({
    id: `close_tabs`,
    setup: () => {
      DOM.ev(DOM.el(`#close_tabs_button`), `click`, () => {
        App.close_tabs_action()
      })
    },
  })

  App.create_popup({
    id: `sort_tabs`,
    setup: () => {
      DOM.ev(DOM.el(`#sort_tabs_button`), `click`, () => {
        let sort_pins = DOM.el(`#sort_tabs_pins`).checked
        App.do_sort_tabs(sort_pins)
      })
    },
  })
}

App.pre_show_tabs = () => {
  App.tabs_locked = false
}

App.get_tabs = async () => {
  App.getting(`tabs`)
  let tabs

  try {
    tabs = await browser.tabs.query({currentWindow: true})
  }
  catch (err) {
    App.error(err)
    return
  }

  tabs.sort((a, b) => {
    return a.index < b.index ? -1 : 1
  })

  return tabs
}

App.focus_tab = async (args) => {
  let def_args = {
    method: `normal`,
    show_tabs: false,
  }

  args = Object.assign(def_args, args)

  if (!args.item) {
    return
  }

  App.select_item({item: args.item, scroll: args.scroll})

  if (args.item.window_id) {
    await browser.windows.update(args.item.window_id, {focused: true})
  }

  try {
    await browser.tabs.update(args.item.id, {active: true})
  }
  catch (err) {
    App.error(err)
    App.remove_closed_tab(args.item.id)
    App.check_playing()
  }

  App.after_focus(args)
}

App.open_new_tab = async (url) => {
  try {
    await browser.tabs.create({url: url, active: true})
  }
  catch (err) {
    App.error(err)
  }
}

App.new_tab = async () => {
  await App.open_new_tab()
  App.after_focus({show_tabs: true})
}

App.get_tab_info = async (id) => {
  try {
    let info = await browser.tabs.get(id)
    return info
  }
  catch (err) {
    App.error(err)
    return
  }
}

App.refresh_tab = async (id, select, info) => {
  if (!info) {
    try {
      info = await App.get_tab_info(id)
    }
    catch (err) {
      App.check_pinline()
      return
    }
  }

  if (!info) {
    return
  }

  if (App.get_setting(`single_new_tab`)) {
    if (App.is_new_tab(info.url)) {
      App.close_other_new_tabs(info.id)
    }
  }

  let item = App.get_item_by_id(`tabs`, id)

  if (item) {
    if (item.pinned !== info.pinned) {
      App.check_pinline()
    }

    App.update_item(`tabs`, item.id, info)
  }
  else {
    item = App.insert_item(`tabs`, info)
    App.check_pinline()
  }

  if (select) {
    if (App.get_selected(`tabs`) !== item) {
      App.select_item({item: item, scroll: `nearest`})
    }
  }
}

App.mute_tab = async (id) => {
  try {
    await browser.tabs.update(id, {muted: true})
  }
  catch (err) {
    App.error(err)
  }
}

App.unmute_tab = async (id) => {
  try {
    await browser.tabs.update(id, {muted: false})
  }
  catch (err) {
    App.error(err)
  }
}

App.get_pinned_tabs = () => {
  return App.get_items(`tabs`).filter(x => x.pinned)
}

App.get_normal_tabs = () => {
  return App.get_items(`tabs`).filter(x => !x.pinned)
}

App.get_muted_tabs = () => {
  return App.get_items(`tabs`).filter(x => x.muted)
}

App.get_unloaded_tabs = () => {
  return App.get_items(`tabs`).filter(x => x.discarded)
}

App.remove_closed_tab = (id) => {
  let item = App.get_item_by_id(`tabs`, id)

  if (item) {
    App.remove_item(item)
    App.check_pinline()
  }
}

App.tabs_action = async (item) => {
  App.on_action(`tabs`)
  App.do_empty_previous_tabs()
  await App.focus_tab({item: item, scroll: `nearest`})
}

App.duplicate_tab = async (item) => {
  try {
    await browser.tabs.duplicate(item.id)
  }
  catch (err) {
    App.error(err)
  }
}

App.duplicate_tabs = (item) => {
  let items = App.get_active_items(`tabs`, item)
  let force = App.check_force(`warn_on_duplicate_tabs`, items.length, true)

  App.show_confirm(`Duplicate tabs? (${items.length})`, () => {
    for (let it of items) {
      App.duplicate_tab(it)
    }
  }, undefined, force)
}

App.pin_tab = async (id) => {
  try {
    await browser.tabs.update(id, {pinned: true})
  }
  catch (err) {
    App.error(err)
  }
}

App.unpin_tab = async (id) => {
  try {
    await browser.tabs.update(id, {pinned: false})
  }
  catch (err) {
    App.error(err)
  }
}

App.pin_tabs = (item) => {
  let ids = []

  for (let it of App.get_active_items(`tabs`, item)) {
    if (it.pinned || it.discarded) {
      continue
    }

    ids.push(it.id)
  }

  if (!ids.length) {
    return
  }

  let force = App.check_force(`warn_on_pin_tabs`, ids.length, true)

  App.show_confirm(`Pin items? (${ids.length})`, async () => {
    for (let id of ids) {
      App.pin_tab(id)
    }
  }, undefined, force)
}

App.unpin_tabs = (item) => {
  let ids = []

  for (let it of App.get_active_items(`tabs`, item)) {
    if (!it.pinned || it.discarded) {
      continue
    }

    ids.push(it.id)
  }

  if (!ids.length) {
    return
  }

  let force = App.check_force(`warn_on_unpin_tabs`, ids.length, true)

  App.show_confirm(`Unpin items? (${ids.length})`, async () => {
    for (let id of ids) {
      App.unpin_tab(id)
    }
  }, undefined, force)
}

App.unload_tabs = (item, multiple = true) => {
  let items = []
  let active = false

  for (let it of App.get_active_items(`tabs`, item, multiple)) {
    if (it.discarded || App.is_new_tab(it.url)) {
      continue
    }

    if (it.active) {
      active = true
    }

    items.push(it)
  }

  if (!items.length) {
    return
  }

  let force = App.check_tab_force(`warn_on_unload_tabs`, items)
  let ids = items.map(x => x.id)

  App.show_confirm(`Unload items? (${ids.length})`, async () => {
    if (active) {
      let next

      if (ids.length > 1) {
        next = App.get_next_item(`tabs`, {mode: `tabs`, no_selected: true, no_discarded: true})
      }
      else {
        next = App.get_next_item(`tabs`, {mode: `tabs`, no_discarded: true, item: item})
      }

      if (next) {
        await App.focus_tab({item: next, scroll: `nearest`, method: `unload`})
      }
      else {
        await App.open_new_tab(`about:blank`)
      }
    }

    App.do_unload_tabs(ids)
  }, undefined, force)
}

App.do_unload_tabs = async (ids) => {
  try {
    await browser.tabs.discard(ids)
  }
  catch (err) {
    App.error(err)
  }
}

App.check_tab_force = (warn_setting, items) => {
  if (items.length >= App.max_warn_limit) {
    return false
  }

  let warn_on_action = App.get_setting(warn_setting)

  if (warn_on_action === `always`) {
    return false
  }
  else if (warn_on_action === `never`) {
    return true
  }

  for (let item of items) {
    if (item.pinned || item.audible) {
      if (warn_on_action === `special`) {
        return false
      }
    }
  }

  return true
}

App.mute_tabs = (item) => {
  let ids = []

  for (let it of App.get_active_items(`tabs`, item)) {
    if (!it.muted) {
      ids.push(it.id)
    }
  }

  if (!ids.length) {
    return
  }

  let force = App.check_force(`warn_on_mute_tabs`, ids.length, true)

  App.show_confirm(`Mute items? (${ids.length})`, async () => {
    for (let id of ids) {
      App.mute_tab(id)
    }
  }, undefined, force)
}

App.unmute_tabs = (item) => {
  let ids = []

  for (let it of App.get_active_items(`tabs`, item)) {
    if (it.muted) {
      ids.push(it.id)
    }
  }

  if (!ids.length) {
    return
  }

  let force = App.check_force(`warn_on_unmute_tabs`, ids.length, true)

  App.show_confirm(`Unmute items? (${ids.length})`, async () => {
    for (let id of ids) {
      App.unmute_tab(id)
    }
  }, undefined, force)
}

App.show_tabs_info = () => {
  let all = App.get_items(`tabs`).length
  let pins = App.get_pinned_tabs().length
  let normal = App.get_normal_tabs().length
  let playing = App.get_playing_tabs().length
  let muted = App.get_muted_tabs().length
  let unloaded = App.get_unloaded_tabs().length

  let s = ``
  s += `All: ${all}\n`
  s += `Pins: ${pins}\n`
  s += `Normal: ${normal}\n`
  s += `Playing: ${playing}\n`
  s += `Muted: ${muted}\n`
  s += `Unloaded: ${unloaded}`

  App.show_alert(s)
}

App.show_urls = () => {
  let urls = []

  for (let item of App.get_items(`tabs`)) {
    urls.push(item.url)
  }

  urls = App.to_set(urls)
  let s = urls.join(`\n`)
  App.show_textarea(`All Open Tabs (${urls.length})`, s)
}

App.toggle_pin = (item) => {
  if (item.pinned) {
    App.unpin_tab(item.id)
  }
  else {
    App.pin_tab(item.id)
  }
}

App.toggle_pin_tabs = (item) => {
  let ids = []
  let action

  for (let it of App.get_active_items(`tabs`, item)) {
    if (!action) {
      if (it.pinned) {
        action = `unpin`
      }
      else {
        action = `pin`
      }
    }

    if (action === `pin`) {
      if (it.pinned) {
        continue
      }
    }
    else if (action === `unpin`) {
      if (!it.pinned) {
        continue
      }
    }

    ids.push(it.id)
  }

  if (!ids.length) {
    return
  }

  for (let id of ids) {
    if (action === `pin`) {
      App.pin_tab(id)
    }
    else {
      App.unpin_tab(id)
    }
  }
}

App.toggle_mute_tabs = (item) => {
  let ids = []
  let action

  for (let it of App.get_active_items(`tabs`, item)) {
    if (!action) {
      if (it.muted) {
        action = `unmute`
      }
      else {
        action = `mute`
      }
    }

    if (action === `mute`) {
      if (it.muted) {
        continue
      }
    }
    else if (action === `unmute`) {
      if (!it.muted) {
        continue
      }
    }

    ids.push(it.id)
  }

  if (!ids.length) {
    return
  }

  for (let id of ids) {
    if (action === `mute`) {
      App.mute_tab(id)
    }
    else {
      App.unmute_tab(id)
    }
  }
}

App.open_tab = async (item) => {
  try {
    let tab = await browser.tabs.create({url: item.url})
    return tab
  }
  catch (err) {
    App.error(err)
  }
}

App.update_tabs_index = async (items) => {
  let info = await App.get_tab_info(items[0].id)

  if (!info) {
    return
  }

  let first_index = App.get_item_element_index(`tabs`, items[0].element)
  let direction

  if (first_index < info.index) {
    direction = `up`
  }
  else if (first_index > info.index) {
    direction = `down`
  }
  else {
    return
  }

  if (direction === `down`) {
    items = items.slice(0).reverse()
  }

  for (let item of items) {
    let index = App.get_item_element_index(`tabs`, item.element)
    await App.do_move_tab_index(item.id, index)
  }
}

App.do_move_tab_index = async (id, index) => {
  let ans

  try {
    ans = await browser.tabs.move(id, {index: index})
  }
  catch (err) {
    App.error(err)
  }

  return ans
}

App.on_tab_activated = async (info) => {
  for (let item of App.get_items(`tabs`)) {
    item.active = item.id === info.tabId

    if (item.active) {
      exit = true
    }
  }

  let select = true

  if (App.is_filtered(`tabs`)) {
    select = false
  }

  await App.refresh_tab(info.tabId, select)
}

App.move_tabs = async (item, window_id) => {
  for (let it of App.get_active_items(`tabs`, item)) {
    let index = it.pinned ? 0 : -1

    try {
      await browser.tabs.move(it.id, {index: index, windowId: window_id})
    }
    catch (err) {
      App.error(err)
    }
  }
}

App.detach_tab = async (item) => {
  try {
    await browser.windows.create({tabId: item.id, focused: false})
  }
  catch (err) {
    App.error(err)
  }
}

App.detach_tabs = async (item) => {
  if (App.get_active_items(`tabs`, item).length === 1) {
    await App.detach_tab(item)
  }
  else {
    let info = await browser.windows.create({focused: false})

    setTimeout(() => {
      App.move_tabs(item, info.id)
    }, 250)
  }
}

App.empty_previous_tabs_debouncer = App.create_debouncer(() => {
  App.do_empty_previous_tabs()
}, App.empty_previous_tabs_delay)

App.empty_previous_tabs = () => {
  App.empty_previous_tabs_debouncer.call()
}

App.do_empty_previous_tabs = () => {
  App.previous_tabs = []
}

App.get_previous_tabs = () => {
  App.previous_tabs = App.get_items(`tabs`).slice(0)
  App.previous_tabs = App.previous_tabs.filter(x => !x.active)

  App.previous_tabs.sort((a, b) => {
    return a.last_accessed > b.last_accessed ? -1 : 1
  })

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
    App.focus_tab({item: item, scroll: `center`, method: `previous`})
    App.previous_tabs_index += 1

    if (App.previous_tabs_index > (App.previous_tabs.length - 1)) {
      App.previous_tabs_index = 0
    }
  }
}

App.get_active_tab = async () => {
  try {
    let tabs = await browser.tabs.query({active: true, currentWindow: true})
    return tabs[0]
  }
  catch (err) {
    App.error(err)
  }
}

App.get_active_tab_item = () => {
  for (let item of App.get_items(`tabs`)) {
    if (item.active) {
      return item
    }
  }
}

App.get_active_tab_item = () => {
  for (let item of App.get_items(`tabs`)) {
    if (item.active) {
      return item
    }
  }
}

App.focus_current_tab = async (scroll = `nearest`) => {
  let item = await App.get_active_tab_item()

  if (item) {
    App.select_item({item: item, scroll: scroll})
  }
}

App.move_tabs_vertically = (direction, item) => {
  if (!item) {
    item = App.get_selected(`tabs`)
  }

  if (!item) {
    return
  }

  let items = App.get_active_items(item.mode, item)

  if (items[0].pinned) {
    for (let item of items) {
      if (!item.pinned) {
        return
      }
    }
  }
  else {
    for (let item of items) {
      if (item.pinned) {
        return
      }
    }
  }

  let first, last
  let els = items.map(x => x.element)

  if (direction === `top`) {
    if (item.pinned) {
      first = 0
    }
    else {
      first = App.get_first_normal_index()
    }

    App.get_items(`tabs`)[first].element.before(...els)
  }
  else if (direction === `bottom`) {
    if (item.pinned) {
      last = App.get_last_pin_index()
    }
    else {
      last = App.get_items(`tabs`).length - 1
    }

    App.get_items(`tabs`)[last].element.after(...els)
  }

  App.update_tabs_index(items)
}

App.get_first_normal_index = () => {
  let i = -1

  for (let item of App.get_items(`tabs`)) {
    i += 1

    if (!item.pinned) {
      return i
    }
  }

  return i
}

App.get_last_pin_index = () => {
  let i = -1

  for (let item of App.get_items(`tabs`)) {

    if (item.pinned) {
      i += 1
    }
    else {
      return i
    }
  }

  return i
}

App.browser_reload = (id) => {
  if (id !== undefined) {
    browser.tabs.reload(id)
  }
  else {
    browser.tabs.reload()
  }
}

App.browser_back = () => {
  browser.tabs.goBack()
}

App.browser_forward = () => {
  browser.tabs.goForward()
}

App.check_tab_item = (item) => {
  if (item.mode === `tabs`) {
    App.check_tab_pinned(item)
  }
}

App.check_tab_pinned = (item) => {
  if (App.get_setting(`pin_icon`)) {
    if (item.pinned) {
      item.element.classList.add(`pin_item`)
    }
    else {
      item.element.classList.remove(`pin_item`)
    }
  }

  if (App.get_setting(`normal_icon`)) {
    if (item.pinned) {
      item.element.classList.remove(`normal_item`)
    }
    else {
      item.element.classList.add(`normal_item`)
    }
  }
}

App.check_new_tabs = () => {
  if (!App.get_setting(`single_new_tab`)) {
    return
  }

  let items = App.get_items(`tabs`)
  let first = false
  let ids = []

  for (let item of items) {
    if (App.is_new_tab(item.url)) {
      if (first) {
        ids.push(item.id)
      }
      else {
        first = true
      }
    }
  }

  if (ids.length) {
    App.close_tab_or_tabs(ids)
  }
}

App.divide_tabs = (filter) => {
  let pinned = []
  let normal = []
  let pinned_f = []
  let normal_f = []

  for (let item of App.get_items(`tabs`)) {
    if (item.pinned) {
      pinned.push(item)
    }
    else {
      normal.push(item)
    }
  }

  if (filter) {
    pinned_f = pinned.filter(x => x[filter])
    normal_f = normal.filter(x => x[filter])
  }

  return {
    pinned: pinned,
    normal: normal,
    pinned_f: pinned_f,
    normal_f: normal_f,
  }
}

App.select_tabs = (type = `pins`) => {
  let first

  for (let item of App.get_items(`tabs`)) {
    let valid

    if (type === `pins`) {
      valid = item.pinned
    }
    else if (type === `normal`) {
      valid = !item.pinned
    }

    if (item.visible && valid) {
      if (!first) {
        first = item
      }

      if (!item.selected) {
        App.toggle_selected(item, true, false)
      }
    }
    else {
      if (item.selected) {
        App.toggle_selected(item, false, false)
      }
    }
  }

  if (first) {
    App.set_selected(first)
  }
}

App.is_new_tab = (url) => {
  return App.new_tab_urls.includes(url)
}

App.sort_tabs = () => {
  App.start_tabs_popups()
  App.show_popup(`sort_tabs`)
  DOM.el(`#sort_tabs_pins`).checked = false
  DOM.el(`#sort_tabs_reverse`).checked = false
}

App.do_sort_tabs = () => {
  function sort (list, reverse) {
    list.sort((a, b) => {
      if (a.hostname !== b.hostname) {
        if (reverse) {
          return a.hostname < b.hostname ? 1 : -1
        }
        else {
          return a.hostname > b.hostname ? 1 : -1
        }
      }

      return a.title < b.title ? -1 : 1
    })
  }

  App.show_confirm(`Sort tabs?`, async () => {
    let items = App.get_items(`tabs`).slice(0)

    if (!items.length) {
      return
    }

    let include_pins = DOM.el(`#sort_tabs_pins`).checked
    let reverse = DOM.el(`#sort_tabs_reverse`).checked
    let normal = items.filter(x => !x.pinned)
    let pins = items.filter(x => x.pinned)
    sort(normal, reverse)

    if (include_pins) {
      sort(pins, reverse)
    }

    let all = [...pins, ...normal]
    App.tabs_locked = true

    for (let [i, item] of all.entries()) {
      await App.do_move_tab_index(item.id, i)
    }

    App.tabs_locked = false
    App.hide_all_popups()
    App.clear_all_items()
    await App.dodo__show_mode({mode: `tabs`})
  })
}

App.open_urls = () => {
  App.show_input(`Open URLs`, `Open`, (text) => {
    let urls = text.split(`\n`).map(x => x.trim()).filter(x => x !== ``)
    let to_open = []

    if (urls.length) {
      for (let url of urls) {
        if (App.is_url(url)) {
          if (App.get_item_by_url(`tabs`, url)) {
            continue
          }

          to_open.push(url)
        }
      }
    }

    if (to_open.length) {
      App.show_confirm(`Open URLs? (${to_open.length})`, () => {
        for (let url of to_open) {
          App.open_tab({url: url})
        }
      })
    }

    return true
  })
}

App.load_tabs = (item) => {
  let items = []

  for (let it of App.get_active_items(`tabs`, item)) {
    if (!it.discarded) {
      continue
    }

    items.push(it)
  }

  if (!items.length) {
    return
  }

  let force = App.check_force(`warn_on_load_tabs`, items.length, true)

  App.show_confirm(`Load items? (${items.length})`, async () => {
    for (let it of items) {
      App.focus_tab({item: it, scroll: `none`, method: `load`})
    }
  }, undefined, force)
}

App.prev_tabs = (e) => {
  let items = []
  App.get_previous_tabs()
  let max = App.get_setting(`max_prev_tabs`)

  for (let item of App.previous_tabs.slice(0, max)) {
    items.push({
      image: item.favicon,
      text: App.get_title(item),
      action: () => {
        App.focus_tab({item: item, scroll: `nearest`, show_tabs: true})
      },
    })
  }

  App.show_center_context(items, e)
}