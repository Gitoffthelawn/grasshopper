App.add_icons = (item, side) => {
  let tips = App.get_setting(`show_tooltips`)
  let what = ``
  let cls = ``

  function check_side(whats) {
    return side === App.get_setting(`${whats}_side`)
  }

  let item_cls = ` item_node hidden item_icon_unit`

  if (item.mode === `tabs`) {
    what = `active_icon`

    if (App.icon_enabled(what) && check_side(what)) {
      let icon = DOM.create(`div`, what + item_cls + cls)
      icon.textContent = App.get_setting(what)

      if (tips) {
        icon.title = `Active`
      }

      item.element.append(icon)
    }

    cls = ``
    what = `pin_icon`

    if (App.icon_enabled(what) && check_side(what)) {
      let icon = DOM.create(`div`, what + item_cls + cls)
      icon.textContent = App.get_setting(what)

      if (tips) {
        icon.title = `Pinned`
      }

      item.element.append(icon)
    }

    cls = ``
    what = `normal_icon`

    if (App.icon_enabled(what) && check_side(what)) {
      let icon = DOM.create(`div`, what + item_cls + cls)
      icon.textContent = App.get_setting(what)

      if (tips) {
        icon.title = `Normal`
      }

      item.element.append(icon)
    }

    cls = ``
    what = `loaded_icon`

    if (App.icon_enabled(what) && check_side(what)) {
      let icon = DOM.create(`div`, what + item_cls + cls)
      icon.textContent = App.get_setting(what)

      if (tips) {
        icon.title = `Loaded`
      }

      item.element.append(icon)
    }

    cls = ``
    what = `unloaded_icon`

    if (App.icon_enabled(what) && check_side(what)) {
      let icon = DOM.create(`div`, what + item_cls + cls)
      icon.textContent = App.get_setting(what)

      if (tips) {
        icon.title = `Unloaded`
      }

      item.element.append(icon)
    }

    cls = ``
    what = `playing_icon`

    if (App.get_setting(`mute_click`)) {
      cls += ` grower`
    }

    if (App.icon_enabled(what) && check_side(what)) {
      let icon = DOM.create(`div`, what + item_cls + cls)
      icon.textContent = App.get_setting(what)

      if (tips) {
        icon.title = `Playing`
      }

      item.element.append(icon)
    }

    what = `muted_icon`

    if (App.icon_enabled(what) && check_side(what)) {
      let icon = DOM.create(`div`, what + item_cls + cls)
      icon.textContent = App.get_setting(what)

      if (tips) {
        icon.title = `Muted`
      }

      item.element.append(icon)
    }

    cls = ``
    what = `unread_icon`

    if (App.icon_enabled(what) && check_side(what)) {
      let icon = DOM.create(`div`, what + item_cls + cls)
      icon.textContent = App.get_setting(what)

      if (tips) {
        icon.title = `Unread`
      }

      item.element.append(icon)
    }

    cls = ``
    what = `loading_icon`

    if (App.icon_enabled(what) && check_side(what)) {
      let icon = DOM.create(`div`, what + item_cls + cls)
      icon.textContent = App.get_setting(what)

      if (tips) {
        icon.title = `Loading`
      }

      item.element.append(icon)
    }

    cls = ``
    what = `root_icon`

    if (App.get_setting(`root_icon_click`)) {
      cls += ` grower`
    }

    if (App.icon_enabled(what) && check_side(what)) {
      let icon = DOM.create(`div`, what + item_cls + cls)
      icon.textContent = App.get_setting(what)

      if (tips) {
        icon.title = `Go to the root URL`
      }

      item.element.append(icon)
    }

    cls = ``
    what = `parent_icon`

    if (App.get_setting(`parent_icon_click`)) {
      cls += ` grower`
    }

    if (App.icon_enabled(what) && check_side(what)) {
      let icon = DOM.create(`div`, what + item_cls + cls)
      icon.textContent = App.get_setting(what)

      if (tips) {
        icon.title = `Has Parent`
      }

      item.element.append(icon)
    }

    cls = ``
    what = `node_icon`

    if (App.get_setting(`node_icon_click`)) {
      cls += ` grower`
    }

    if (App.icon_enabled(what) && check_side(what)) {
      let icon = DOM.create(`div`, what + item_cls + cls)
      icon.textContent = App.get_setting(what)

      if (tips) {
        icon.title = `Has Nodes`
      }

      item.element.append(icon)
    }
  }

  cls = ``
  what = `titled_icon`

  if (App.icon_enabled(what) && check_side(what)) {
    let icon = DOM.create(`div`, what + item_cls + cls)
    icon.textContent = App.get_setting(what)

    if (tips) {
      icon.title = `Titled`
    }

    item.element.append(icon)
  }

  cls = ``
  what = `tagged_icon`

  if (App.icon_enabled(what) && check_side(what)) {
    let icon = DOM.create(`div`, what + item_cls + cls)
    icon.textContent = App.get_setting(what)

    if (tips) {
      icon.title = `Tagged`
    }

    item.element.append(icon)
  }

  cls = ``
  what = `edited_icon`

  if (App.icon_enabled(what) && check_side(what)) {
    let icon = DOM.create(`div`, what + item_cls + cls)
    icon.textContent = App.get_setting(what)

    if (tips) {
      icon.title = `Edited`
    }

    item.element.append(icon)
  }

  cls = ``
  what = `notes_icon`

  if (App.get_setting(`notes_icon_click`)) {
    cls += ` grower`
  }

  if (App.icon_enabled(what) && check_side(what)) {
    let icon = DOM.create(`div`, what + item_cls + cls)
    icon.textContent = App.get_setting(what)

    if (tips) {
      icon.title = `Notes`
    }

    item.element.append(icon)
  }

  cls = ` color_icon_container`
  what = `color_icon`

  if (App.get_setting(`color_icon_click`)) {
    cls += ` effect`
  }

  if (App.get_setting(`color_mode`).includes(`background`)) {
    cls += ` grower`
  }

  if (check_side(what)) {
    let icon = DOM.create(`div`, what + item_cls + cls)
    item.element.append(icon)
  }

  if (App.get_setting(`hover_button`) !== `none`) {
    let btn = App.create_hover_button()
    item.element.append(btn)
  }

  if (App.get_setting(`hover_button`) !== `none`) {
    let btn = App.create_hover_button()
    item.element.append(btn)
  }

  App.add_custom_icon(item, side)
}

App.check_icons = (item) => {
  if (item.tab_box) {
    if (!App.get_setting(`tab_box_icons`)) {
      return
    }
  }

  if (App.icon_enabled(`notes`)) {
    let icon = DOM.el(`.notes_icon`, item.element)

    if (App.get_notes(item)) {
      DOM.show(icon)
    }
    else {
      DOM.hide(icon)
    }
  }

  if (App.icon_enabled(`titled`)) {
    if (!item.header) {
      let icon = DOM.el(`.titled_icon`, item.element)

      if (App.get_title(item)) {
        DOM.show(icon)
      }
      else {
        DOM.hide(icon)
      }
    }
  }

  if (App.icon_enabled(`tagged`)) {
    let icon = DOM.el(`.tagged_icon`, item.element)

    if (App.tagged(item)) {
      DOM.show(icon)
    }
    else {
      DOM.hide(icon)
    }
  }

  if (App.icon_enabled(`edited`)) {
    let icon = DOM.el(`.edited_icon`, item.element)

    if (App.edited(item)) {
      DOM.show(icon)
    }
    else {
      DOM.hide(icon)
    }
  }

  let custom_icon = App.get_icon(item)
  let custom_icon_el = DOM.el(`.custom_icon`, item.element)

  if (custom_icon) {
    custom_icon_el.innerHTML = custom_icon
    DOM.show(custom_icon_el)
  }
  else {
    DOM.hide(custom_icon_el)
  }

  if (item.mode !== `tabs`) {
    return
  }

  if (App.icon_enabled(`active`)) {
    let icon = DOM.el(`.active_icon`, item.element)

    if (item.active) {
      DOM.show(icon)
    }
    else {
      DOM.hide(icon)
    }
  }

  if (App.icon_enabled(`pin`)) {
    let icon = DOM.el(`.pin_icon`, item.element)

    if (item.pinned) {
      DOM.show(icon)
    }
    else {
      DOM.hide(icon)
    }
  }

  if (App.icon_enabled(`normal`)) {
    let icon = DOM.el(`.normal_icon`, item.element)

    if (!item.pinned) {
      DOM.show(icon)
    }
    else {
      DOM.hide(icon)
    }
  }

  if (App.icon_enabled(`loaded`)) {
    let icon = DOM.el(`.loaded_icon`, item.element)

    if (!item.unloaded) {
      DOM.show(icon)
    }
    else {
      DOM.hide(icon)
    }
  }

  if (App.icon_enabled(`unloaded`)) {
    let icon = DOM.el(`.unloaded_icon`, item.element)

    if (item.unloaded) {
      DOM.show(icon)
    }
    else {
      DOM.hide(icon)
    }
  }

  if (App.icon_enabled(`playing`)) {
    let icon = DOM.el(`.playing_icon`, item.element)

    if (item.playing && !item.muted) {
      DOM.show(icon)
    }
    else {
      DOM.hide(icon)
    }
  }

  if (App.icon_enabled(`muted`)) {
    let icon = DOM.el(`.muted_icon`, item.element)

    if (item.muted) {
      DOM.show(icon)
    }
    else {
      DOM.hide(icon)
    }
  }

  if (App.icon_enabled(`unread`)) {
    let icon = DOM.el(`.unread_icon`, item.element)

    if (item.unread) {
      DOM.show(icon)
    }
    else {
      DOM.hide(icon)
    }
  }

  if (App.icon_enabled(`root`)) {
    let icon = DOM.el(`.root_icon`, item.element)
    let auto = App.get_setting(`auto_root_icon`)
    let show = auto ? App.root_possible(item) : App.item_has_root(item)

    if (show) {
      DOM.show(icon)
    }
    else {
      DOM.hide(icon)
    }
  }

  if (App.icon_enabled(`parent`)) {
    let icon = DOM.el(`.parent_icon`, item.element)

    if (App.tab_has_nodes(item)) {
      DOM.show(icon)
    }
    else {
      DOM.hide(icon)
    }
  }

  if (App.icon_enabled(`node`)) {
    let icon = DOM.el(`.node_icon`, item.element)

    if (App.tab_has_parent(item)) {
      DOM.show(icon)
    }
    else {
      DOM.hide(icon)
    }
  }
}

App.check_item_icon = (item) => {
  if (App.get_setting(`item_icon`) !== `none`) {
    let ans = App.make_item_icon(item)

    if (!ans.add) {
      return
    }

    let container = DOM.el(`.item_icon_container`, item.element)

    if (ans.icon) {
      container.innerHTML = ``
      container.append(ans.icon)
      DOM.show(container)
    }
    else {
      DOM.hide(container)
    }
  }
}

App.make_item_icon = (item, normal = true) => {
  let icon, text_icon, svg_icon

  if (item.tab_box) {
    normal = false
  }

  if (!text_icon && item.header) {
    if (App.is_header(item)) {
      text_icon = App.get_setting(`header_icon`)
    }
    else {
      text_icon = App.get_setting(`subheader_icon`)
    }

    if (!text_icon) {
      svg_icon = `arrow_down`
    }
  }

  let no_favicon = App.no_favicons.includes(item.mode)
  let fetch = no_favicon && App.get_setting(`fetch_favicons`)

  if (svg_icon) {
    icon = App.get_svg_icon(svg_icon, `item_icon`)

    if (normal) {
      item.svg_icon_used = svg_icon
      item.text_icon_used = undefined
      item.favicon_used = undefined
      item.generated_icon = undefined
    }
  }
  else if (text_icon) {
    if (normal) {
      if (item.text_icon_used === text_icon) {
        return {add: false}
      }
    }

    icon = App.get_text_icon(text_icon)

    if (normal) {
      item.text_icon_used = text_icon
      item.favicon_used = undefined
      item.generated_icon = undefined
      item.svg_icon = undefined
    }
  }
  else if (item.favicon || fetch) {
    if (!item.favicon) {
      item.favicon = App.fetch_favicon_url(item)
    }

    if (normal) {
      if (item.favicon_used === item.favicon) {
        return {add: false}
      }
    }

    icon = App.make_favicon(item)

    if (normal) {
      item.favicon_used = item.favicon
      item.generated_icon = undefined
      item.text_icon_used = undefined
      item.svg_icon = undefined
    }
  }
  else if (App.get_setting(`generate_icons`)) {
    if (normal) {
      if (item.generated_icon === item.hostname) {
        return {add: false}
      }
    }

    icon = App.generate_icon(item.hostname)

    if (normal) {
      item.generated_icon = item.hostname
      item.favicon_used = undefined
      item.text_icon_used = undefined
      item.svg_icon = undefined
    }
  }
  else {
    let src = `img/favicon.jpg`
    icon = App.make_favicon(item, src)

    if (normal) {
      item.favicon_used = icon
      item.generated_icon = undefined
      item.text_icon_used = undefined
      item.svg_icon = undefined
    }
  }

  return {
    add: true,
    icon,
  }
}

App.get_svg_icon = (name, cls = `svg_icon`) => {
  let icon = document.createElementNS(`http://www.w3.org/2000/svg`, `svg`)
  icon.classList.add(cls)
  let icon_use = document.createElementNS(`http://www.w3.org/2000/svg`, `use`)
  icon_use.href.baseVal = `#${name}_icon`
  icon.append(icon_use)
  return icon
}

App.get_text_icon = (text_icon) => {
  let icon = DOM.create(`div`, `item_icon`)
  icon.textContent = text_icon
  return icon
}

App.make_favicon = (item, src = ``) => {
  let icon = DOM.create(`img`, `item_icon`)
  icon.loading = `lazy`

  DOM.ev(icon, `error`, () => {
    if (App.get_setting(`generate_icons`)) {
      let icon_2 = App.generate_icon(item.hostname)
      icon.replaceWith(icon_2)
    }
  })

  icon.src = src || item.favicon
  return icon
}

App.generate_icon = (hostname) => {
  let icon = DOM.create(`canvas`, `item_icon`)
  icon.width = App.icon_size
  icon.height = App.icon_size
  jdenticon.update(icon, hostname || `hostname`)
  return icon
}

App.edit_tab_icon = (args = {}) => {
  let def_args = {
    icon: ``,
  }

  App.def_args(def_args, args)
  let active = App.get_active_items({mode: args.item.mode, item: args.item})
  let s = args.icon ? `Edit icon?` : `Remove icon?`
  let force = App.check_force(`warn_on_edit_tabs`, active)

  App.show_confirm({
    message: `${s} (${active.length})`,
    confirm_action: () => {
      for (let it of active) {
        App.apply_edit({what: `icon`, item: it, value: args.icon, on_change: (value) => {
          App.custom_save(it.id, `icon`, value)
          App.push_to_icon_history([value])
        }})
      }
    },
    force,
  })
}

App.edit_icon = (item) => {
  App.edit_prompt({what: `icon`, item})
}

App.get_all_icons = (include_rules = true) => {
  let icons = []

  for (let icon of App.icon_history) {
    if (!icons.includes(icon)) {
      icons.push(icon)
    }
  }

  for (let item of App.get_items(`tabs`)) {
    if (item.custom_icon) {
      if (!icons.includes(item.custom_icon)) {
        icons.push(item.custom_icon)
      }
    }

    if (include_rules) {
      if (item.rule_icon) {
        if (!icons.includes(item.rule_icon)) {
          icons.push(item.rule_icon)
        }
      }
    }
  }

  return icons
}

App.push_to_icon_history = (icons) => {
  if (!icons.length) {
    return
  }

  for (let icon of icons) {
    if (!icon) {
      continue
    }

    App.icon_history = App.icon_history.filter(x => x !== icon)
    App.icon_history.unshift(icon)
    App.icon_history = App.icon_history.slice(0, App.icon_history_max)
  }

  App.stor_save_icon_history()
}

App.remove_item_icon = (item) => {
  let active = App.get_active_items({mode: item.mode, item})

  if (active.length === 1) {
    let it = active[0]

    if (it.rule_icon && !it.custom_icon) {
      App.domain_rule_message()
      return
    }
  }

  App.remove_edits({what: [`icon`], items: active, text: `icons`})
}

App.fetch_favicon_url = (item) => {
  return `https://www.google.com/s2/favicons?sz=64&domain=${item.hostname}`
}

App.add_custom_icon = (item, side) => {
  let icon_side = App.get_setting(`custom_icon_side`)

  if (side !== icon_side) {
    return
  }

  let cls = `custom_icon item_node hidden item_icon_unit`

  if (App.get_setting(`custom_icon_click`)) {
    cls += ` grower`
  }

  let icon = DOM.create(`div`, cls)

  if (App.get_setting(`show_tooltips`)) {
    icon.title = `Custom Icon`
  }

  item.element.append(icon)
}

App.get_icon_items = (mode, show = false) => {
  function icon_sort(a, b) {
    let ai = App.icon_history.indexOf(a)
    let bi = App.icon_history.indexOf(b)

    if (ai === -1) {
      ai = App.icon_history.length
    }

    if (bi === -1) {
      bi = App.icon_history.length
    }

    return ai - bi
  }

  let items = []
  let icons = []

  for (let tab of App.get_items(`tabs`)) {
    let icon = App.get_icon(tab)

    if (icon) {
      if (!icons.includes(icon)) {
        icons.push(icon)
      }
    }
  }

  if (icons.length) {
    icons.sort(icon_sort)

    if (!show) {
      items.push({
        text: `All`,
        action: () => {
          App.filter_icon({mode, icon: `all`})
        },
        middle_action: () => {
          App.filter_icon({mode, icon: `all`, from: App.refine_string})
        },
      })
    }

    for (let icon of icons.slice(0, App.max_icon_picks)) {
      items.push({
        text: icon,
        action: (e) => {
          if (show) {
            App.show_tab_list(`icon_${icon}`, e)
          }
          else {
            App.filter_icon({mode, icon})
          }
        },
        middle_action: (e) => {
          if (show) {
            //
          }
          else {
            App.filter_icon({mode, icon, from: App.refine_string})
          }
        },
      })
    }
  }
  else {
    items.push({
      text: `No icons in use`,
      action: () => {
        App.alert(`You can add icons to tabs`)
      },
    })
  }

  return items
}

App.filter_by_icon = (item) => {
  let icon = App.get_icon(item)

  if (icon) {
    App.filter_icon({mode: item.mode, icon})
  }
}

App.custom_icon_menu_items = (item) => {
  let items = []

  items.push({
    text: `Filter`,
    action: () => {
      App.filter_by_icon(item)
    },
  })

  if (item.mode !== `tabs`) {
    return items
  }

  items.push({
    text: `Change`,
    action: () => {
      App.change_icon(item)
    },
  })

  if (item.custom_icon) {
    items.push({
      text: `Remove`,
      action: () => {
        App.remove_item_icon(item)
      },
    })
  }

  return items
}

App.custom_icon_menu = (item, e) => {
  let items = App.custom_icon_menu_items(item)
  App.show_context({items, e})
}

App.change_icon = (item) => {
  App.edit_prompt({what: `icon`, item})
}

App.show_filter_icon_menu = (mode, e, show = false) => {
  let items = App.get_icon_items(mode, show)
  App.show_context({items, e, title: `Icons`})
}

App.get_iconed_items = (mode) => {
  let items = []

  for (let item of App.get_items(mode)) {
    if (App.get_icon(item)) {
      items.push(item)
    }
  }

  return items
}

App.get_icon_tabs = (icon) => {
  let tabs = []

  for (let item of App.get_items(`tabs`)) {
    let item_icon = App.get_icon(item)

    if (item_icon) {
      if (item_icon === icon) {
        tabs.push(item)
      }
    }
  }

  return tabs
}

App.icon_enabled = (what) => {
  if (what.endsWith(`_icon`)) {
    what = what.split(`_icon`)[0]
  }

  let icon = App.get_setting(`${what}_icon`)
  let side = App.get_setting(`${what}_icon_side`)
  return icon && [`left`, `right`].includes(side)
}