App.setup_items = () => {
  App.get_mode_order()
  App.start_item_observers()
}

App.remove_selected_class = (mode) => {
  for (let el of DOM.els(`.selected`, DOM.el(`#${mode}_container`))) {
    el.classList.remove(`selected`)
  }
}

App.select_item = async (item, scroll = `nearest`, deselect = true) => {
  if (!item) {
    return
  }

  if (!item.created) {
    App.create_item_element(item)
  }

  if (item === App.get_selected(item.mode)) {
    if (App.selected_items(item.mode).length === 1) {
      return
    }
  }

  if (deselect) {
    App.deselect(item.mode)
  }

  App.toggle_selected(item, true)

  if (scroll !== `none`) {
    App.scroll_to_item(item, scroll)
  }

  App.update_footer_info(item)
}

App.select_item_above = (mode) => {
  let item = App.get_next_visible_item({mode: mode, reverse: true})

  if (item) {
    App.select_item(item, `nearest`)
  }
}

App.select_item_below = (mode) => {
  let item = App.get_next_visible_item({mode: mode})

  if (item) {
    App.select_item(item, `nearest`)
  }
}

App.select_next = (mode, dir) => {
  let waypoint = false
  let items = App.get_items(mode).slice(0)

  if (items.length === 0) {
    return
  }

  let current = App.last_highlight || App.get_selected(mode)

  if (dir === `above`) {
    items.reverse()
  }

  for (let item of items) {
    if (!item.visible) {
      continue
    }

    if (waypoint) {
      App.select_range(item)
      break
    }
    else {
      if (item === current) {
        waypoint = true
      }
    }
  }
}

App.select_to_edge = (mode, dir) => {
  let items = App.get_items(mode).slice(0)

  if (items.length === 0) {
    return
  }

  if (dir === `down`) {
    items.reverse()
  }

  App.select_range(items[0])
}

App.get_next_visible_item = (args) => {
  let def_args = {
    reverse: false,
    wrap: true,
  }

  args = Object.assign(def_args, args)
  let waypoint = false

  if (!App.get_selected(args.mode)) {
    waypoint = true
  }

  let items = App.get_items(args.mode).slice(0)
  let o_item = App.get_selected(args.mode)

  if (args.reverse) {
    items.reverse()
  }

  for (let item of items) {
    if (waypoint) {
      if (item.visible) {
        return item
      }
    }

    if (item === o_item) {
      waypoint = true
    }
  }

  if (args.wrap) {
    for (let item of items) {
      if (item.visible) {
        return item
      }
    }
  }
}

App.get_selected = (mode = App.window_mode) => {
  return App[`last_selected_${mode}`]
}

App.set_selected = (mode, item) => {
  App[`last_selected_${mode}`] = item

  if (!item) {
    App.remove_selected_class(mode)
  }
}

App.get_items = (mode, reverse = false) => {
  let item_string = `${mode}_items`

  if (App[item_string]) {
    App[item_string] = App[item_string].filter(x => x !== undefined)
  }

  let items = App[item_string] || []

  if (reverse) {
    items = items.slice(0).reverse()
  }

  return items
}

App.select_first_item = (mode, by_active = false) => {
  if (mode === `tabs` && by_active) {
    for (let item of App.get_items(mode)) {
      if (item.visible && item.active) {
        App.select_item(item, `center`)
        return
      }
    }
  }

  for (let item of App.get_items(mode)) {
    if (item.visible) {
      App.select_item(item)
      return
    }
  }
}

App.filter_item_by_id = (mode, id) => {
  id = id.toString()
  let item_string = `${mode}_items`
  App[item_string] = App[item_string].filter(x => x.id.toString() !== id)
}

App.remove_item = (item) => {
  let mode = item.mode

  if (App.get_selected(mode) === item) {
    let next_item = App.get_next_item(mode)

    if (next_item) {
      App.select_item(next_item)
    }
  }

  item.element.remove()
  App.filter_item_by_id(mode, item.id)
  App.update_footer_count(mode)
}

App.show_item = (it) => {
  it.element.classList.remove(`hidden`)
  it.visible = true
}

App.hide_item = (it) => {
  it.element.classList.add(`hidden`)
  it.visible = false
}

App.clear_items = (mode) => {
  App[`${mode}_items`] = []
}

App.process_info_list = (mode, info_list) => {
  let container = DOM.el(`#${mode}_container`)
  container.innerHTML = ``
  App[`${mode}_idx`] = 0
  App.clear_items(mode)
  let items = App.get_items(mode)
  let exclude = []

  for (let info of info_list) {
    let item = App.process_info(mode, info, exclude)

    if (!item) {
      continue
    }

    if (mode !== `tabs`) {
      exclude.push(item.url)
    }

    items.push(item)
    container.append(item.element)
  }

  App.update_footer_count(mode)
  App.check_playing()
  App.do_check_pinline()
  App.check_new_tabs()
}

App.process_info = (mode, info, exclude = [], o_item) => {
  if (!info) {
    return false
  }

  if (o_item) {
    info = Object.assign({}, o_item.original_data, info)
    o_item.original_data = info
  }

  if (info.url) {
    try {
      // Check if valid URL
      decodeURI(info.url)
    }
    catch (err) {
      return false
    }
  }

  let url = App.format_url(info.url || ``)

  if (exclude.includes(url)) {
    return false
  }

  let path = App.remove_protocol(url)
  let title = info.title || ``
  let image = App.is_image(url)
  let video = App.is_video(url)
  let audio = App.is_audio(url)
  let profile = App.get_profile(url)
  let tags = []
  let color = ``
  let custom_title = ``

  if (profile) {
    if (profile.tags) {
      tags = profile.tags
    }

    if (profile.title) {
      custom_title = profile.title
    }

    if (profile.color) {
      color = profile.color
    }
  }

  let item = {
    title: title,
    custom_title: custom_title,
    url: url,
    path: path,
    favicon: info.favIconUrl,
    mode: mode,
    window_id: info.windowId,
    session_id: info.sessionId,
    image: image,
    video: video,
    audio: audio,
    tags: tags,
    color: color,
    created: false,
  }

  if (mode === `tabs`) {
    item.active = info.active
    item.pinned = info.pinned
    item.audible = info.audible
    item.muted = info.mutedInfo.muted
    item.discarded = info.discarded
  }
  else if (mode === `history`) {
    item.last_visit = info.lastVisitTime
  }
  else if (mode === `bookmarks`) {
    item.parent_id = info.parentId
    item.date_added = info.dateAdded
  }

  if (o_item) {
    if (o_item.created) {
      item.created = true
    }

    o_item = Object.assign(o_item, item)

    if (o_item.created) {
      App.refresh_item_element(o_item)
    }

    if (App.get_selected(mode) === o_item) {
      App.update_footer_info(o_item)
    }
  }
  else {
    item.original_data = info
    item.id = info.id || App[`${mode}_idx`]
    item.visible = true
    item.selected = false
    App.create_empty_item_element(item)
    App[`${mode}_idx`] += 1
    return item
  }
}

App.create_empty_item_element = (item) => {
  item.element = DOM.create(`div`, `grasshopper_item item ${item.mode}_item empty_item`)
  item.element.dataset.id = item.id
  App[`${item.mode}_item_observer`].observe(item.element)
}

App.check_item_icon = (item) => {
  if (App.get_setting(`show_icons`)) {
    let container = DOM.el(`.item_icon_container`, item.element)
    container.innerHTML = ``
    let icon = App.get_img_icon(item)
    container.append(icon)

    if (item.color) {
      let c = App.colors[item.color]
      container.style.outline = `2px solid ${c}`
    }
    else {
      container.style.outline = `unset`
    }
  }
}

App.check_view_media = (item) => {
  let type = App.get_media_type(item)

  if (!type) {
    return
  }

  if (!App.get_setting(`${type}_icon`)) {
    return
  }

  let view_media = DOM.el(`.view_media_button`, item.element)

  if (type) {
    view_media.textContent = App.get_setting(`${type}_icon`)
    view_media.title = App.capitalize(type)
    view_media.classList.remove(`hidden`)

    if (App.get_setting(`view_${type}`) !== `never`) {
      view_media.classList.add(`action`)
    }
    else {
      view_media.classList.remove(`action`)
    }
  }
  else {
    view_media.classList.add(`hidden`)
  }
}

App.refresh_item_element = (item) => {
  App.check_tab_item(item)
  App.check_item_icon(item)
  App.check_view_media(item)
  App.set_item_text(item)
}

App.create_item_element = (item) => {
  item.element.innerHTML = ``

  if (App.get_setting(`show_icons`)) {
    let icon_container = DOM.create(`div`, `item_icon_container`)
    item.element.append(icon_container)
    App.check_item_icon(item)
  }

  let view_media = DOM.create(`div`, `view_media_button hidden`)
  item.element.append(view_media)
  App.check_view_media(item)

  let status = DOM.create(`div`, `item_status hidden`)
  item.element.append(status)

  let text = DOM.create(`div`, `item_text`)
  let text_1 = DOM.create(`div`, `item_text_1`)
  let text_2 = DOM.create(`div`, `item_text_2 hidden`)
  text.append(text_1)
  text.append(text_2)
  item.element.append(text)
  App.set_item_text(item)

  if (item.mode === `tabs`) {
    item.element.draggable = true

    if (App.get_setting(`pin_icon`)) {
      let pin_icon = DOM.create(`div`, `item_info item_info_pin`)
      pin_icon.textContent = App.get_setting(`pin_icon`)
      item.element.append(pin_icon)
    }

    if (App.get_setting(`normal_icon`)) {
      let normal_icon = DOM.create(`div`, `item_info item_info_normal`)
      normal_icon.textContent = App.get_setting(`normal_icon`)
      item.element.append(normal_icon)
    }

    App.check_tab_item(item)
  }

  if (item.selected) {
    item.element.classList.add(`selected`)
  }
  else {
    item.element.classList.remove(`selected`)
  }

  if (App.get_setting(`pick_icon`)) {
    let pick = DOM.create(`div`, `item_pick item_button item_button_left`)
    pick.textContent = App.get_setting(`pick_icon`)
    pick.title = `Pick`
    pick.draggable = true
    item.element.append(pick)
  }

  if (item.mode === `tabs`) {
    if (App.get_setting(`close_icon`)) {
      let btn = DOM.create(`div`, `item_button item_button_right item_button_close`)
      btn.textContent = App.get_setting(`close_icon`)
      btn.title = `Close`
      btn.draggable = true
      item.element.append(btn)
    }
  }
  else {
    if (App.get_setting(`open_icon`)) {
      let btn = DOM.create(`div`, `item_button item_button_right item_button_open`)
      btn.textContent = App.get_setting(`open_icon`)
      btn.title = `Open`
      btn.draggable = true
      item.element.append(btn)
    }
  }

  item.created = true
  item.element.classList.remove(`empty_item`)
  App.log(`Item created in ${item.mode}`)
}

App.get_img_icon = (item) => {
  let icon = DOM.create(`img`, `item_icon`)
  icon.loading = `lazy`
  icon.width = App.icon_size
  icon.height = App.icon_size

  if (App.get_setting(`fetch_favicons`)) {
    if (!item.favicon && App.no_favicons.includes(item.mode)) {
      if (App.is_url(item.url)) {
        item.favicon = App.get_favicon_url(item.url)
      }
    }
  }

  DOM.ev(icon, `error`, () => {
    let icon_2 = App.get_jdenticon(item.url)
    icon.replaceWith(icon_2)
  })

  icon.src = item.favicon
  return icon
}

App.get_jdenticon = (url) => {
  let hostname = App.get_hostname(url) || `hostname`
  let icon = DOM.create(`canvas`, `item_icon`)
  icon.width = App.icon_size
  icon.height = App.icon_size
  jdenticon.update(icon, hostname)
  return icon
}

App.set_item_text = (item) => {
  if (item.mode === `tabs`) {
    let icons = []

    if (item.discarded && App.get_setting(`unloaded_icon`)) {
      icons.push(`unloaded`)
    }

    if (!item.muted && item.audible && App.get_setting(`playing_icon`)) {
      icons.push(`playing`)
    }

    if (item.muted && App.get_setting(`muted_icon`)) {
      icons.push(`muted`)
    }

    let status = DOM.el(`.item_status`, item.element)
    status.innerHTML = ``

    if (icons.length > 0) {
      for (let icon of icons) {
        let cls = ``

        if (icon === `playing` || icon === `muted`) {
          if (App.get_setting(`mute_click`)) {
            cls = ` action`
          }
        }

        let el = DOM.create(`div`, `item_status_icon item_status_${icon}${cls}`)
        el.textContent = App.get_setting(`${icon}_icon`)
        status.append(el)
      }

      status.classList.remove(`hidden`)
    }
    else {
      status.classList.add(`hidden`)
    }
  }

  let content
  let path = decodeURI(item.path)
  let text_mode = App.get_setting(`text_mode`)
  let title = App.get_title(item)

  if (text_mode === `title`) {
    content = title || path
    item.footer = path || title
  }
  else if (text_mode === `url`) {
    content = path || title
    item.footer = title || path
  }
  else if (text_mode === `title_url`) {
    content = title

    if (content) {
      content += `\n`
    }

    content += path
    item.footer = path || title
  }
  else if (text_mode === `url_title`) {
    content = path

    if (content) {
      content += `\n`
    }

    content += title
    item.footer = title || path
  }

  if (App.get_setting(`show_tooltips`)) {
    if (content === item.footer || text_mode.includes(`_`)) {
      item.element.title = content
    }
    else {
      item.element.title = `${content}\n${item.footer}`
    }

    if (item.last_visit) {
      item.element.title += `\nLast Visit: ${App.nice_date(item.last_visit)}`
    }

    if (item.date_added) {
      item.element.title += `\nDate Added: ${App.nice_date(item.date_added)}`
    }
  }

  let lines = content.split(`\n`)

  for (let [i, line] of lines.entries()) {
    let text = line.substring(0, App.max_text_length).trim()
    let text_el = DOM.el(`.item_text_${i + 1}`, item.element)
    text_el.classList.remove(`hidden`)
    text_el.textContent = text
  }
}

App.get_item_by_id = (mode, id) => {
  id = id.toString()

  for (let item of App.get_items(mode)) {
    if (item.id.toString() === id) {
      return item
    }
  }
}

App.get_item_by_url = (mode, url) => {
  for (let item of App.get_items(mode)) {
    if (item.url) {
      if (App.urls_equal(item.url, url)) {
        return item
      }
    }
  }
}

App.start_item_observers = () => {
  for (let mode of App.mode_order) {
    let options = {
      root: DOM.el(`#${mode}_container`),
      rootMargin: `0px`,
      threshold: 0.1,
    }

    App.intersection_observer(mode, options)
  }
}

App.intersection_observer = (mode, options) => {
  App[`${mode}_item_observer`] = new IntersectionObserver((entries) => {
    for (let entry of entries) {
      if (!entry.isIntersecting) {
        continue
      }

      if (!entry.target.classList.contains(`item`)) {
        return
      }

      let item = App.get_item_by_id(mode, entry.target.dataset.id)

      if (!item) {
        continue
      }

      if (!item.created && item.visible) {
        App.create_item_element(item)
      }
    }
  }, options)
}

App.get_last_window_value = (cycle) => {
  let last_mode = App.window_mode

  if (!App.on_items(last_mode)) {
    last_mode = `tabs`
  }

  let value = ``

  if (cycle) {
    value = App.get_filter(last_mode)
  }

  return value
}

App.show_mode = async (mode, cycle = false) => {
  App.active_mode = mode
  let value = App.get_last_window_value(cycle)
  App.windows[mode].show()
  App.empty_footer_info()
  App.cancel_filter()

  // Unload inactive items
  for (let m of App.modes) {
    App.clear_items(m)
    let c = DOM.el(`#${m}_container`)

    if (c) {
      c.innerHTML = ``
    }
  }

  let container = DOM.el(`#${mode}_container`)
  App.set_filter(mode, value, false)
  let m = App.filter_modes(mode)[0]
  App.set_filter_mode(mode, m[0], false)
  App[`${mode}_filter_mode`] = m[0]
  App[`last_${mode}_query`] = undefined
  let maxed = App.maxed_items.includes(mode)
  let items

  if (maxed && value) {
    items = []
  }
  else {
    items = await App[`get_${mode}`]()
  }

  if (mode !== App.active_mode) {
    return
  }

  if (mode === `tabs`) {
    if (App.get_setting(`pin_icon`)) {
      container.classList.add(`has_pin_icon`)
    }
    else {
      container.classList.remove(`has_pin_icon`)
    }

    if (App.get_setting(`normal_icon`)) {
      container.classList.add(`has_normal_icon`)
    }
    else {
      container.classList.remove(`has_normal_icon`)
    }
  }

  if (maxed && value) {
    // Filter will search
  }
  else {
    App.process_info_list(mode, items)
  }

  if (value) {
    App.do_filter(mode, true)
  }
  else {
    App.select_first_item(mode, true)
  }

  App.focus_filter(mode)
  App.do_check_scroller(mode)
}

App.show_main_mode = () => {
  App.show_mode(App.mode_order[0])
}

App.setup_item_window = (mode) => {
  let args = {}
  args.id = mode
  args.close_button = false
  args.align_top = `left`

  args.setup = () => {
    let win = DOM.el(`#window_content_${mode}`)
    let footer = App.create_footer(mode)
    DOM.el(`#window_${mode}`).append(footer)

    let top = DOM.create(`div`, `item_top_container`, `${mode}_top_container`)
    DOM.el(`#window_top_${mode}`).append(top)

    let container = DOM.create(`div`, `container`, `${mode}_container`)
    let scroller = App.create_scroller(mode)

    DOM.ev(container, `scroll`, () => {
      App.check_scroller(mode)
    })

    win.append(scroller)
    win.append(container)
    App.setup_window_mouse(mode)
    let main_menu = App.create_main_menu(mode)
    let filter = App.create_filter(mode)
    let filter_modes = App.create_filter_menu(mode)
    let playing

    if (mode === `tabs`) {
      playing = App.create_playing_icon()
    }

    let back = App.create_step_back_button(mode)
    let actions_menu = App.create_actions_menu(mode)
    App.setup_drag(mode, container)
    let left_top = DOM.create(`div`, `item_top_left`)
    let right_top = DOM.create(`div`, `item_top_right`)
    left_top.append(main_menu)
    left_top.append(filter_modes)
    left_top.append(filter)

    if (playing) {
      right_top.append(playing)
    }

    right_top.append(back)

    if (actions_menu) {
      right_top.append(actions_menu)
    }

    top.append(left_top)
    top.append(right_top)
  }

  App.create_window(args)
}

App.cycle_modes_debouncer = App.create_debouncer((reverse, cycle) => {
  App.do_cycle_modes(reverse, cycle)
}, App.wheel_delay, true)

App.cycle_modes = (reverse = false, cycle = false) => {
  App.cycle_modes_debouncer.call(reverse, cycle)
}

App.do_cycle_modes = (reverse, cycle) => {
  let modes = App.mode_order
  let index = modes.indexOf(App.window_mode)
  let new_mode

  if (index === -1) {
    return
  }

  if (reverse) {
    if (index === 0) {
      new_mode = modes.slice(-1)[0]
    }
    else {
      new_mode = modes[index - 1]
    }
  }
  else {
    if (index === modes.length - 1) {
      new_mode = modes[0]
    }
    else {
      new_mode = modes[index + 1]
    }
  }

  App.show_mode(new_mode, cycle)
}

App.update_mode_order = () => {
  let boxes = DOM.els(`.mode_order_row`, DOM.el(`#settings_mode_order`))
  let modes = boxes.map(x => x.dataset.mode)

  for (let [i, mode] of modes.entries()) {
    App.set_setting(`${mode}_index`, i)
  }

  App.get_mode_order()
}

App.mode_order_up = (el) => {
  let prev = el.previousElementSibling

  if (prev) {
    el.parentNode.insertBefore(el, prev)
    App.update_mode_order()
  }
}

App.mode_order_down = (el) => {
  let next = el.nextElementSibling

  if (next) {
    el.parentNode.insertBefore(next, el)
    App.update_mode_order()
  }
}

App.show_first_window = () => {
  App.show_mode(App.mode_order[0])
}

App.focus_or_open_item = async (item) => {
  let tabs = await App.get_tabs()

  for (let tab of tabs) {
    if (App.urls_equal(tab.url, item.url)) {
      let o = {
        id: tab.id,
        window_id: tab.windowId
      }

      await App.focus_tab(o)
      return `focused`
    }
  }

  App.open_tab(item)
  App.after_open()
  return `opened`
}

App.get_mode_order = () => {
  let imodes = []

  for (let mode of App.modes) {
    imodes.push({mode: mode, index: App.get_setting(`${mode}_index`)})
  }

  imodes.sort((a, b) => (a.index > b.index) ? 1 : -1)
  App.mode_order = imodes.map(x => x.mode)
}

App.any_item_visible = (mode) => {
  for (let item of App.get_items(mode)) {
    if (item.visible) {
      return true
    }
  }

  return false
}

App.get_visible = (mode) => {
  let items = []

  for (let item of App.get_items(mode)) {
    if (item.visible) {
      items.push(item)
    }
  }

  return items
}

App.update_item = (mode, id, info) => {
  for (let item of App.get_items(mode)) {
    if (item.id === id) {
      App.process_info(mode, info, [], item)
      break
    }
  }
}

App.show_actions_menu = (mode) => {
  if (App[`${mode}_actions`].length === 0) {
    return
  }

  let items = []

  for (let item of App[`${mode}_actions`]) {
    if (item.text === App.separator_string) {
      items.push({separator: true})
      continue
    }

    if (item.conditional) {
      items.push(item.conditional())
    }
    else if (item.action) {
      items.push({text: item.text, action: () => {
        item.action()
      }})
    }
    else if (item.items) {
      items.push({text: item.text, items: item.items})
    }
    else if (item.get_items) {
      items.push({text: item.text, get_items: item.get_items})
    }
  }

  let btn = DOM.el(`#${mode}_actions`)
  NeedContext.show_on_element(btn, items, true, btn.clientHeight)
}

App.get_mode_index = (mode) => {
  for (let [i, it] of App.mode_order.entries()) {
    if (it === mode) {
      return i
    }
  }
}

App.get_item_element_index = (mode, el) => {
  return DOM.els(`.${mode}_item`).indexOf(el)
}

App.move_item = (mode, from_index, to_index) => {
  let item = App.get_items(mode).splice(from_index, 1)[0]
  App.get_items(mode).splice(to_index, 0, item)
  App.move_item_element(mode, item.element, to_index)

  if (App.get_selected(mode) === item) {
    App.scroll_to_item(App.get_selected(mode), `center_smooth`)
  }
}

App.move_item_element = (mode, el, to_index) => {
  let container = DOM.el(`#${mode}_container`)
  let items = DOM.els(`.${mode}_item`)
  let from_index = items.indexOf(el)

  if (from_index === to_index) {
    return
  }

  if (to_index === 0) {
    container.prepend(el)
  }
  else {
    if (from_index < to_index) {
      container.insertBefore(el, items[to_index + 1])
    }
    else {
      container.insertBefore(el, items[to_index])
    }
  }
}

App.select_range = (item) => {
  if (App.last_highlight === item) {
    App.deselect(item.mode)
    App.select_item(item, `nearest_instant`, false)
    return
  }

  if (!App.last_highlight || !App.last_highlight.selected) {
    App.last_highlight = App.get_selected(item.mode)
    App.toggle_selected(App.last_highlight, true)
  }

  if (item === App.last_highlight) {
    return
  }

  let items = App.get_items(item.mode).slice(0)
  let index_1 = items.indexOf(item)
  let index_2 = items.indexOf(App.last_highlight)

  if (item.selected) {
    let reverse = index_1 < index_2

    for (let [i, it] of items.entries()) {
      if (!it.visible || !it.selected) {
        continue
      }

      let unselect = false

      if (index_1 < index_2) {
        if (i > index_1) {
          unselect = true
        }
      }
      else {
        if (i < index_1) {
          unselect = true
        }
      }

      if (unselect) {
        App.toggle_selected(it, false)
      }
    }

    let selected = App.selected_items(item.mode)
    let next_item

    if (reverse) {
      next_item = selected.at(-1)
    }
    else {
      next_item = selected.at(0)
    }

    App.select_item(next_item, `none`, false)
  }
  else {
    let slice

    if (index_1 < index_2) {
      slice = items.slice(index_1, index_2 + 1)
    }
    else {
      slice = items.slice(index_2 + 1, index_1 + 1)
    }

    if (index_1 < index_2) {
      slice.reverse()
    }

    for (let it of slice) {
      if (!it.visible || it.selected) {
        continue
      }

      App.toggle_selected(it, true)
    }
  }
}

App.deselect = (mode = App.window_mode, select = `none`) => {
  let num = 0
  let first, last

  for (let item of App.selected_items(mode)) {
    App.toggle_selected(item, false, false)

    if (!first) {
      first = item
    }

    last = item
    num += 1
  }

  App.last_highlight = undefined
  let next_item

  if (select === `up`) {
    if (first) {
      next_item = first
    }
  }
  else if (select === `down`) {
    if (last) {
      next_item = last
    }
  }
  else if (select === `selected`) {
    let selected = App.get_selected(mode)

    if (selected) {
      next_item = selected
    }
  }

  if (next_item) {
    App.select_item(next_item, `nearest_smooth`, false)
  }

  return num
}

App.toggle_selected = (item, what, select = true) => {
  let items = App.selected_items(item.mode)
  let selected

  if (what !== undefined) {
    selected = what
  }
  else {
    selected = !item.selected
  }

  if (!item.visible) {
    selected = false
  }

  if (selected) {
    item.element.classList.add(`selected`)
    App.set_selected(item.mode, item)
    App.last_highlight = item
  }
  else {
    if (items.length === 1 && select) {
      App.last_highlight = items[0]
      return
    }

    item.element.classList.remove(`selected`)

    if (App.last_highlight === item) {
      App.last_highlight = undefined
    }
  }

  item.selected = selected

  if (select && !selected) {
    if (items.length && App.get_selected(item.mode) === item) {
      for (let it of items) {
        if (it === item) {
          continue
        }

        App.select_item(it, `none`, false)
        break
      }
    }
  }

  App.update_footer_count(item.mode)
}

App.selected_items = (mode = App.window_mode) => {
  let ans = []

  for (let item of App.get_items(mode)) {
    if (item.selected) {
      ans.push(item)
    }
  }

  return ans
}

App.after_open = (shift = false) => {
  if (shift) {
    return
  }

  App.check_close_on_open()
  App.switch_to_tabs()
}

App.open_items = (item, shift, multiple = true) => {
  let mode = item.mode
  let items

  if (multiple) {
    items = App.get_active_items(mode, item)
  }
  else {
    items = [item]
  }

  if (items.length === 1) {
    App.open_tab(items[0])
    App.after_open(shift)
  }
  else {
    let force = App.check_force(`warn_on_open`, items.length)

    App.show_confirm(`Open these items ${items.length}?`, () => {
      for (let item of items) {
        App.open_tab(item)
      }

      App.deselect(mode)
      App.after_open(shift)
    }, () => {
      App.deselect(mode)
    }, force)
  }
}

App.goto_top = (mode = App.window_mode, select = false) => {
  if (select) {
    App.select_item(App.get_items(mode).at(0), `nearest_instant`)
  }
  else {
    let el = DOM.el(`#${mode}_container`)

    el.scrollTo({
      top: 0,
      behavior: `instant`,
    })
  }

  App.do_check_scroller(mode)
}

App.goto_bottom = (mode = App.window_mode, select = false) => {
  if (select) {
    App.select_item(App.get_items(mode).at(-1), `nearest_instant`)
  }
  else {
    let el = DOM.el(`#${mode}_container`)

    el.scrollTo({
      top: el.scrollHeight,
      behavior: `instant`,
    })
  }

  App.do_check_scroller(mode)
}

App.scroll = (mode, direction, fast = false) => {
  let el = DOM.el(`#${mode}_container`)
  let amount

  if (fast) {
    amount = Math.floor(el.scrollHeight * (App.fast_scroll_percent / 100))
  }
  else {
    amount = App.normal_scroll_pixels
  }

  let top

  if (direction === `up`) {
    top = el.scrollTop - amount
  }
  else if (direction === `down`) {
    top = el.scrollTop + amount
  }

  el.scrollTo({
    top: top,
    behavior: `instant`,
  })
}

App.select_all = (mode = App.window_mode) => {
  for (let item of App.get_items(mode, true)) {
    App.toggle_selected(item, true, false)
  }
}

App.create_icon = (name, type = 1) => {
  let icon = document.createElementNS(`http://www.w3.org/2000/svg`, `svg`)
  icon.classList.add(`icon_${type}`)
  let icon_use = document.createElementNS(`http://www.w3.org/2000/svg`, `use`)
  icon_use.href.baseVal = `#${name}_icon`
  icon.append(icon_use)
  return icon
}

App.get_active_items = (mode, item) => {
  let selected = App.selected_items(mode)

  if (selected.length === 1) {
    if (item) {
      return [item]
    }
    else {
      return [App.get_selected(mode)]
    }
  }
  else {
    if (!selected.includes(item)) {
      selected.push(item)
    }

    return selected
  }
}

App.insert_item = (mode, info) => {
  let item = App.process_info(mode, info)

  if (mode === `tabs`) {
    App.get_items(mode).splice(info.index, 0, item)
    DOM.el(`#${mode}_container`).append(item.element)
    App.move_item_element(`tabs`, item.element, info.index)
  }
  else {
    let old = App.get_item_by_url(mode, item.url)

    if (old) {
      App.remove_item(old)
    }

    App.get_items(mode).unshift(item)
    DOM.el(`#${mode}_container`).prepend(item.element)
  }

  App.update_footer_count(mode)
  return item
}

App.get_mode_name = (mode) => {
  if (mode === `bookmarks`) {
    return `BMarks`
  }

  return App.capitalize(mode)
}

App.show_all = (mode = App.window_mode) => {
  if (App.is_filtered(mode)) {
    App.set_filter_mode(mode, `all`, false)
    App.set_filter(mode, ``)
  }
}

App.container_is_scrolled = (mode) => {
  let container = DOM.el(`#${mode}_container`)
  return container.scrollHeight > container.clientHeight
}

App.scroll_to_item = (item, scroll = `nearest`) => {
  let behavior

  if (scroll === `nearest_instant`) {
    scroll = `nearest`
    behavior = `instant`
  }
  else if (scroll === `center_instant`) {
    scroll = `center`
    behavior = `instant`
  }
  else if (scroll === `nearest_smooth`) {
    scroll = `nearest`
    behavior = `smooth`
  }
  else if (scroll === `center_smooth`) {
    scroll = `center`
    behavior = `smooth`
  }
  else {
    behavior = `instant`
  }

  let index = App.get_item_element_index(item.mode, item.element)

  if (index === 0) {
    App.hide_scroller(item.mode)
  }

  if (behavior === `smooth`) {
    // Check how far an item is going to be scrolled
    let top = item.element.getBoundingClientRect().top
    let diff

    if (top < 0) {
      diff = Math.abs(top)
    }
    else {
      let container = DOM.el(`#${item.mode}_container`)
      let height = container.clientHeight

      if (top > height) {
        diff = top - height
      }
      else {
        diff = 0
      }
    }

    // If distance is too big then make it instant
    if (diff > App.max_smooth_scroll) {
      behavior = `instant`
    }
  }

  item.element.scrollIntoView({
    block: scroll,
    behavior: behavior,
  })
}

App.copy_url = (item) => {
  App.copy_to_clipboard(item.url, `URL`)
}

App.copy_title = (item) => {
  let title = App.get_title(item)
  App.copy_to_clipboard(title, `Title`)
}

App.on_items = (mode = App.window_mode, check_popups = false) => {
  let on_items = App.modes.includes(mode)

  if (on_items && check_popups) {
    on_items = !App.popup_open()
  }

  return on_items
}

App.get_next_item = (mode) => {
  return App.get_next_visible_item({mode: mode, wrap: false}) ||
  App.get_next_visible_item({mode: mode, reverse: true, wrap: false})
}

App.multiple_selected = (mode) => {
  let n = 0

  for (let item of App.get_items(mode)) {
    if (item.selected) {
      n += 1

      if (n >= 2) {
        return true
      }
    }
  }

  return false
}

App.soft_copy_item = (o_item) => {
  let item = {}

  for (let key in o_item) {
    if (key === `element`) {
      continue
    }

    item[key] = o_item[key]
  }

  return item
}

App.get_title = (item) => {
  if (item.custom_title) {
    return item.custom_title
  }
  else {
    return item.title
  }
}

App.pick_item = (item, e) => {
  if (item.selected) {
    App.toggle_selected(item, false)
  }
  else {
    let selected = App.get_selected(item.mode)
    let unselect = false

    if (App.get_setting(`smart_pick`) && !e.ctrlKey) {
      if (selected !== item && !item.selected) {
        if (!App.multiple_selected(item.mode)) {
          let i = App.get_item_element_index(item.mode, selected.element)
          let ii = App.get_item_element_index(item.mode, item.element)
          let ind = Math.abs(i - ii) > 1
          let p = false

          if (App.get_setting(`show_pinline`)) {
            p = selected.pinned !== item.pinned
          }

          unselect = ind || p
        }
      }
    }

    App.select_item(item, `none`, false)

    if (unselect) {
      App.toggle_selected(selected, false)
    }
  }
}

App.remove_duplicates = (items) => {
  let objs = []
  let urls = []

  for (let item of items) {
    if (!urls.includes(item.url)) {
      objs.push(item)
      urls.push(item.url)
    }
  }

  return objs
}