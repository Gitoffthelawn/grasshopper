App.setup_items = () => {
  App.check_selected_debouncer = App.create_debouncer((mode) => {
    App.do_check_selected(mode)
  }, App.check_selected_delay)
}

App.remove_selected_class = (mode) => {
  for (let el of DOM.els(`.selected`, DOM.el(`#${mode}_container`))) {
    el.classList.remove(`selected`)
  }
}

App.select_item = (args = {}) => {
  let def_args = {
    deselect: true,
    scroll: `center`,
  }

  App.def_args(def_args, args)

  if (!args.item) {
    return
  }

  if (args.item.mode !== App.active_mode) {
    return
  }

  let prev = App.get_selected(args.item.mode)

  if (args.deselect) {
    App.deselect(args.item.mode)
  }

  App.toggle_selected(args.item, true)

  if (prev) {
    App.scroll_to_item({item: args.item, scroll: args.scroll})
  }
  else {
    App.scroll_to_item({item: args.item, scroll: args.scroll})
  }
}

App.select_up_down = (mode, direction = `down`) => {
  let no_header

  if (App.is_filtered(mode)) {
    no_header = false
  }
  else {
    no_header = true
  }

  let up = direction === `up`
  let item = App.get_other_item({mode: mode, no_header: no_header}, up)

  if (item) {
    App.select_item({item: item, scroll: `nearest`})
  }
}

App.select_next = (mode, dir) => {
  let waypoint = false
  let items = App.get_items(mode).slice(0)

  if (!items.length) {
    return
  }

  let current = App.get_selected(mode)

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

  if (!items.length) {
    return
  }

  if (dir === `down`) {
    items.reverse()
  }

  App.select_range(items[0])
}

App.get_other_item = (args = {}, reverse = false) => {
  let def_args = {
    only_visible: true,
    no_selected: false,
    no_discarded: false,
    no_header: true,
    wrap: true,
  }

  App.def_args(def_args, args)
  let waypoint = false

  if (!App.get_selected(args.mode)) {
    waypoint = true
  }

  if (!args.item) {
    args.item = App.get_selected(args.mode)
  }

  let items = App.get_items(args.mode).slice(0)

  if (reverse) {
    items.reverse()
  }

  for (let item of items) {
    if (waypoint) {
      if (args.no_header) {
        if (item.header) {
          continue
        }
      }

      if (args.only_visible) {
        if (!item.visible) {
          continue
        }
      }

      if (args.no_selected) {
        if (item.selected) {
          continue
        }
      }

      if (args.no_discarded) {
        if (item.discarded) {
          continue
        }
      }

      return item
    }

    if (item === args.item) {
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

App.set_selected = (item) => {
  if (!item) {
    App.remove_selected_class(item.mode)
    return
  }

  App[`last_selected_${item.mode}`] = item
  App.update_footer_info(item)
}

App.clear_selected = (mode) => {
  App[`last_selected_${mode}`] = undefined

  for (let item of App.get_items(mode)) {
    if (item.selected) {
      App.toggle_selected(item, false, false)
    }
  }
}

App.get_items = (mode) => {
  let item_string = `${mode}_items`

  if (App[item_string]) {
    App[item_string] = App[item_string].filter(x => x !== undefined)
  }

  return App[item_string] || []
}

App.select_first_item = (mode, by_active = false, scroll = `center`) => {
  if (mode === `tabs` && by_active) {
    for (let item of App.get_items(mode)) {
      if (item.visible && item.active) {
        App.select_item({item: item, scroll: scroll})
        return
      }
    }
  }

  for (let item of App.get_items(mode)) {
    if (item.visible) {
      App.select_item({item: item})
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
      App.select_item({item: next_item, scroll: `nearest`})
    }
  }

  item.element.remove()
  item.removed = true
  App.filter_item_by_id(mode, item.id)
  App.update_footer_count(mode)

  if (mode === `tabs`) {
    App.refresh_active_history()
    App.check_tab_box_item(item)
  }
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
  let c = DOM.el(`#${mode}_container`)

  if (c) {
    DOM.el(`#${mode}_container`).innerHTML = ``
  }
}

App.clear_all_items = () => {
  for (let mode of App.modes) {
    App.clear_items(mode)
  }
}

App.refresh_item_element = (item) => {
  App.check_tab_loading(item)
  App.check_item_icon(item)
  App.check_icons(item)
  App.check_tab_colors(item)
  App.check_view_media(item)
  App.set_item_text(item)
  App.apply_color_mode(item)
  App.check_taglist(item)
  App.apply_splits(item)
  App.check_header(item)
}

App.create_item_element = (item) => {
  item.element = DOM.create(`div`, `grasshopper_item item ${item.mode}_item`)
  item.element.dataset.id = item.id
  App.check_header(item)
  App.add_close_button(item, `left`)
  let trace = App.create_active_trace()
  item.element.append(trace)

  if (App.get_setting(`item_icon`) !== `none`) {
    let icon_container = DOM.create(`div`, `item_icon_container item_node`)
    item.element.append(icon_container)
    App.check_item_icon(item)
  }

  App.get_color_icon(item)
  App.get_notes_icon(item)

  if (item.mode === `tabs`) {
    App.add_tab_icons(item)
  }

  item.element.draggable = true
  App.check_icons(item)
  App.apply_color_mode(item)
  App.apply_splits(item)
  let view_media = DOM.create(`div`, `view_media_button hidden`)
  item.element.append(view_media)
  App.check_view_media(item)
  let content = DOM.create(`div`, `item_content`)
  let text = DOM.create(`div`, `item_text`)
  let text_1 = DOM.create(`div`, `item_text_line item_text_1`)
  let text_2 = DOM.create(`div`, `item_text_line item_text_2 hidden`)
  let taglist_pos = App.get_setting(`taglist`)
  let taglist

  if (taglist_pos !== `none`) {
    taglist = App.create_taglist()
  }

  if (taglist_pos === `above`) {
    content.append(taglist)
  }

  text.append(text_1)
  text.append(text_2)
  content.append(text)

  if (taglist_pos !== `none` && taglist_pos !== `above`) {
    content.append(taglist)
  }

  item.element.append(content)
  App.set_item_text(item)
  App.check_taglist(item)

  if (item.mode === `tabs`) {
    App.add_close_button(item, `right`)
    App.check_tab_loading(item)
    App.check_tab_colors(item)
  }

  if (item.selected) {
    item.element.classList.add(`selected`)
  }
  else {
    item.element.classList.remove(`selected`)
  }
}

App.set_item_text = (item) => {
  if (item.header) {
    App.set_header_text(item)
    return
  }

  let lines = []
  let url

  if (App.get_setting(`show_protocol`)) {
    url = item.decoded_url
  }
  else {
    url = item.path
  }

  let text_mode = App.get_setting(`text_mode`)
  let title = App.get_title(item)

  if (text_mode === `title`) {
    lines.push(title || url)
    item.footer = url || title
  }
  else if (text_mode === `url`) {
    lines.push(url || title)
    item.footer = title || url
  }
  else if (text_mode === `title_url`) {
    lines.push(title)
    lines.push(url)
    item.footer = url || title
  }
  else if (text_mode === `url_title`) {
    lines.push(url)
    lines.push(title)
    item.footer = title || url
  }

  if (App.get_setting(`show_tooltips`)) {
    let tips = []
    tips.push(`Title: ${title}`)
    tips.push(`URL: ${url}`)

    if (item.last_visit) {
      tips.push(`Last Visit: ${App.nice_date(item.last_visit)}`)
    }

    if (item.date_added) {
      tips.push(`Date Added: ${App.nice_date(item.date_added)}`)
    }

    if (App.tagged(item)) {
      let tags = App.get_tags(item)
      tips.push(`Tags: ${tags.join(`, `)}`)
    }

    item.element.title = tips.join(`\n`)
  }

  for (let [i, line] of lines.entries()) {
    if (!line) {
      line = `Empty`
    }

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

App.setup_item_window = (mode) => {
  if (App.check_ready(mode)) {
    return
  }

  let args = {}
  args.id = mode
  args.close_button = false
  args.align_top = `left`
  args.cls = `mode`

  args.setup = () => {
    App.build_item_window(mode)
  }
  args.after_show = () => {
    App.fill_favorites_bar(mode)
  }

  App.create_window(args)
}

App.focus_or_open_item = async (item) => {
  for (let tab of App.get_items(`tabs`)) {
    if (App.urls_equal(tab.url, item.url)) {
      await App.focus_tab({item: tab})
      return `focused`
    }
  }

  App.open_tab(item)
  App.after_open()
  return `opened`
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
  return App.get_items(mode).filter(x => x.visible)
}

App.update_item = (mode, id, info) => {
  for (let item of App.get_items(mode)) {
    if (item.id === id) {
      App.process_info({mode: mode, info: info, o_item: item})
      App.check_filter(mode)
      App.refresh_active_history()
      break
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
  let selected = App.get_selected(item.mode)

  if (item === selected) {
    App.select_item({item: item, scroll: `nearest`})
    return
  }

  let items = App.get_items(item.mode).slice(0)
  let index_1 = items.indexOf(item)
  let index_2 = items.indexOf(selected)

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

    App.set_selected(next_item)
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

  App.scroll_to_item({item: item, scroll: `nearest`})
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
    App.select_item({item: next_item, scroll: `nearest`, deselect: false})
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
    App.set_selected(item)
  }
  else {
    if (items.length === 1 && select) {
      return
    }

    item.element.classList.remove(`selected`)
  }

  item.selected = selected

  if (select && !selected) {
    if (items.length && App.get_selected(item.mode) === item) {
      for (let it of items) {
        if (it === item) {
          continue
        }

        App.set_selected(it)
        break
      }
    }
  }

  App.update_footer_count(item.mode)
  App.check_selected(item.mode)
}

App.check_selected = (mode) => {
  App.check_selected_debouncer.call(mode)
}

App.do_check_selected = (mode) => {
  App.check_selected_debouncer.cancel()
  let num = App.selected_items(mode).length
  let c = DOM.el(`#${mode}_container`)

  if (num > 1) {
    c.classList.add(`multiple_selected`)
  }
  else {
    c.classList.remove(`multiple_selected`)
  }
}

App.selected_items = (mode = App.window_mode) => {
  return App.get_items(mode).filter(x => x.selected)
}

App.after_focus = (args = {}) => {
  let def_args = {
    method: `normal`,
  }

  App.def_args(def_args, args)

  if (args.method === `load`) {
    return
  }

  if (args.method === `normal`) {
    if (App.get_setting(`close_on_focus`)) {
      App.close_window()
    }
  }

  if (args.show_tabs) {
    if (App.active_mode !== `tabs`) {
      App.do_show_mode({mode: `tabs`})
    }
  }

  App.check_restore()
}

App.after_open = (shift = false) => {
  if (shift) {
    return
  }

  if (App.get_setting(`close_on_open`)) {
    App.close_window()
  }

  App.check_restore()
}

App.open_items = (item, shift, multiple = true) => {
  let mode = item.mode
  let items

  if (multiple) {
    items = App.get_active_items({mode: mode, item: item})
  }
  else {
    items = [item]
  }

  if (items.length === 1) {
    App.open_tab(items[0])
    App.after_open(shift)
  }
  else {
    let force = App.check_force(`warn_on_open`, items)

    App.show_confirm({
      message: `Open these items ${items.length}?`,
      confirm_action: () => {
        for (let item of items) {
          App.open_tab(item)
        }

        App.deselect(mode, `selected`)
        App.after_open(shift)
      },
      cancel_action: () => {
        App.deselect(mode, `selected`)
      },
      force: force,
    })
  }
}

App.goto_top = (mode = App.window_mode, select = false) => {
  if (select) {
    App.select_item({item: App.get_visible(mode).at(0), scroll: `nearest`})
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
    App.select_item({item: App.get_visible(mode).at(-1), scroll: `nearest`})
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

App.select_all = (mode = App.window_mode, toggle = false) => {
  let items = App.get_items(mode)

  if (toggle) {
    let all_selected = true

    for (let item of items) {
      if (!item.selected) {
        all_selected = false
        break
      }
    }

    if (all_selected) {
      App.deselect(mode, `selected`)
      return
    }
  }

  let first

  for (let item of items) {
    if (!first) {
      first = item
    }

    App.toggle_selected(item, true, false)
  }

  if (first) {
    App.set_selected(first)
  }
}

App.get_active_items = (args = {}) => {
  let def_args = {
    multiple: true,
  }

  App.def_args(def_args, args)

  if (!args.multiple) {
    if (args.item) {
      return [args.item]
    }
    else {
      return []
    }
  }

  let selected = App.selected_items(args.mode)

  if (selected.length === 0) {
    if (args.item) {
      return [args.item]
    }
    else {
      return []
    }
  }
  else if (selected.length === 1) {
    if (args.item) {
      return [args.item]
    }
    else {
      return [App.get_selected(args.mode)]
    }
  }
  else {
    if (args.item && !selected.includes(args.item)) {
      selected.push(args.item)
    }

    return selected
  }
}

App.insert_item = (mode, info) => {
  let item = App.process_info({mode: mode, info: info})
  let container = DOM.el(`#${mode}_container`)

  if (mode === `tabs`) {
    App.get_items(mode).splice(info.index, 0, item)
    container.append(item.element)
    App.move_item_element(`tabs`, item.element, info.index)
    App.check_tab_box_item(item)
  }
  else {
    let old = App.get_item_by_url(mode, item.url)

    if (old) {
      App.remove_item(old)
    }

    App.get_items(mode).unshift(item)
    container.prepend(item.element)
  }

  App.update_footer_count(mode)
  App.check_filter(mode)
  return item
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

App.get_next_item = (mode, args = {}) => {
  let def_args = {
    mode: mode,
    wrap: false,
  }

  App.def_args(def_args, args)
  return App.get_other_item(args) || App.get_other_item(args, true)
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

App.pick = (item) => {
  if (item.selected) {
    App.toggle_selected(item, false)
  }
  else {
    App.select_item({item: item, scroll: `nearest`, deselect: false})
  }
}

App.get_persistent_items = () => {
  let items = []

  for (let mode of App.persistent_modes) {
    items.push(...App.get_items(mode))
  }

  return items
}

App.clear_show = async () => {
  App.clear_all_items()
  App.rebuild_items()
  App.clear_active_history()
  App.show_primary_mode()
}

App.select_item_by_id = (mode, id) => {
  let item = App.get_item_by_id(mode, id)

  if (item) {
    App.select_item({item: item, scroll: `center`})
  }
}

App.item_is_visible = (item) => {
  let container_rect = item.element.parentElement.getBoundingClientRect()
  let rect = item.element.getBoundingClientRect()
  let top = container_rect.top

  if (App.get_setting(`show_scroller`)) {
    let scroller = DOM.el(`#${item.mode}_scroller`)

    if (!scroller.classList.contains(`hidden`)) {
      top += scroller.clientHeight
    }
  }

  let extra = 2
  let top_visible = rect.top >= (top - extra)
  let bottom_visible = rect.bottom <= (container_rect.bottom + extra)
  return top_visible && bottom_visible
}

App.build_item_window = (mode) => {
  let top = DOM.el(`#window_top_${mode}`)
  let maintop = DOM.create(`div`, `item_main_top`)
  top.append(maintop)
  let content = DOM.el(`#window_content_${mode}`)
  let container = DOM.create(`div`, `item_container`, `${mode}_container`)
  container.tabIndex = 1
  content.append(container)
  let tab_box_pos = App.get_setting(`tab_box_position`)
  let tab_box

  if (mode === `tabs`) {
    if (App.get_setting(`tab_box`) !== `none`) {
      tab_box = App.create_tab_box()
    }
  }

  let btns = DOM.create(`div`, `item_top_buttons`)
  let bar = DOM.create(`div`, `item_top_bar hidden`, `item_top_bar_${mode}`)
  maintop.append(btns)
  maintop.append(bar)

  if (tab_box && tab_box_pos === `top`) {
    maintop.append(tab_box)
  }

  let favmode = App.get_setting(`favorites_mode`)

  if (favmode === `bar`) {
    let favorites = App.create_favorites_bar(mode)
    bar.append(favorites)
  }

  let scroller, footer

  if (App.get_setting(`show_scroller`)) {
    scroller = App.create_scroller(mode)
  }

  if (App.get_setting(`show_footer`)) {
    footer = App.create_footer(mode)
  }

  if (scroller) {
    content.append(scroller)
  }

  content.append(container)

  if (tab_box && tab_box_pos === `bottom`) {
    content.append(tab_box)
  }

  if (footer) {
    content.append(footer)
  }

  App.setup_window_mouse(mode)
  let main_menu = App.create_main_menu(mode)
  let filter = App.create_filter(mode)
  let filter_menu = App.create_filter_menu(mode)
  let playing = App.create_playing_icon(mode)
  let back = App.create_step_back_button(mode)
  let actions_menu = App.create_actions_menu(mode)
  App.setup_drag(mode, container)
  let left_btns = DOM.create(`div`, `item_top_left`)
  let right_btns = DOM.create(`div`, `item_top_right`)
  left_btns.append(main_menu)
  left_btns.append(filter_menu)
  left_btns.append(filter)
  right_btns.append(playing)
  right_btns.append(back)

  if (actions_menu) {
    right_btns.append(actions_menu)
  }

  if (favmode === `button`) {
    let fav_button = App.create_favorites_button(mode)
    right_btns.append(fav_button)
  }

  btns.append(left_btns)
  btns.append(right_btns)

  DOM.ev(container, `scroll`, () => {
    App.check_scroller(mode)
  })
}

App.rebuild_items = () => {
  for (let mode of App.modes) {
    if (App[`${mode}_ready`]) {
      App.windows[mode].clear()
      App.build_item_window(mode)
    }
  }
}

App.focus_items = (mode) => {
  DOM.el(`#${mode}_container`).focus()
}

App.make_item_first = (item) => {
  let c = DOM.el(`#${item.mode}_container`)
  let first = DOM.el(`.item`, c)

  if (item.element === first) {
    return
  }

  c.insertBefore(item.element, first)
  let items = App.get_items(item.mode)
  let index = items.indexOf(item)

  if (index > 0) {
    items.splice(index, 1)
    items.unshift(item)
  }
}

App.auto_blur = () => {
  if (App.get_setting(`auto_blur`)) {
    DOM.el(`#main`).classList.add(`auto_blur`)
  }
}

App.remove_auto_blur = () => {
  if (App.get_setting(`auto_blur`)) {
    DOM.el(`#main`).classList.remove(`auto_blur`)
  }
}