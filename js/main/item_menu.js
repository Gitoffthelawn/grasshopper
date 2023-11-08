App.show_item_menu = async (args = {}) => {
  if (!args.item) {
    return
  }

  App.command_item = args.item
  App.item_menu_args = args
  let active = App.get_active_items({mode: args.item.mode, item: args.item})
  let multiple = active.length > 1
  let items = []

  if (App.get_setting(`extra_menu_mode`) === `total`) {
    items = App.custom_menu_items(`extra_menu`)
  }
  else {
    if (args.item.mode === `tabs`) {
      let some_pinned = false
      let some_unpinned = false
      let some_muted = false
      let some_unmuted = false
      let some_loaded = false
      let some_unloaded = false
      let some_split_top = false
      let some_not_split_top = false
      let some_split_bottom = false
      let some_not_split_bottom = false

      for (let it of active) {
        if (it.pinned) {
          some_pinned = true
        }
        else {
          some_unpinned = true
        }

        if (it.muted) {
          some_muted = true
        }
        else {
          some_unmuted = true
        }

        if (it.discarded) {
          some_unloaded = true
        }
        else {
          some_loaded = true
        }

        if (it.custom_split_top) {
          some_split_top = true
        }
        else {
          some_not_split_top = true
        }

        if (it.custom_split_bottom) {
          some_split_bottom = true
        }
        else {
          some_not_split_bottom = true
        }
      }

      if (some_unloaded) {
        items.push(App.item_menu_item({cmd: `load_tabs`, item: args.item}))
      }

      if (some_unpinned && some_loaded) {
        items.push(App.item_menu_item({cmd: `pin_tabs`, item: args.item}))
      }

      if (some_pinned && some_loaded) {
        items.push(App.item_menu_item({cmd: `unpin_tabs`, item: args.item}))
      }

      items.push(App.item_menu_item({cmd: `show_color_menu`, item: args.item}))
      items.push(App.item_menu_item({cmd: `edit_title`, item: args.item}))

      items.push({
        icon: App.tag_icon,
        text: `Tags`,
        get_items: () => {
          return [
            App.item_menu_item({cmd: `edit_tags`, item: args.item, short: false}),
            App.item_menu_item({cmd: `add_tags`, item: args.item, short: false}),
          ]
        }
      })

      items.push(App.item_menu_item({cmd: `edit_notes`, item: args.item}))

      let common_obj = {
        o_items: items,
        item: args.item,
        multiple: multiple,
      }

      App.common_menu_items(common_obj)
      App.extra_menu_items(items)

      let more_obj = {
        o_items: items,
        item: args.item,
        multiple: multiple,
        some_loaded: some_loaded,
        some_unmuted: some_unmuted,
        some_muted: some_muted,
        some_split_top: some_split_top,
        some_not_split_top: some_not_split_top,
        some_split_bottom: some_split_bottom,
        some_not_split_bottom: some_not_split_bottom,
      }

      App.more_menu_items(more_obj)
      App.sep(items)
      items.push(App.item_menu_item({cmd: `close_tabs`, item: args.item}))
    }
    else {
      items.push(App.item_menu_item({cmd: `open_items`, item: args.item}))

      let common_obj = {
        o_items: items,
        item: args.item,
        multiple: multiple,
      }

      App.common_menu_items(common_obj)

      let more_obj = {
        o_items: items,
        item: args.item,
        multiple: multiple,
      }

      App.more_menu_items(more_obj)
    }
  }

  App.show_context({items: items, e: args.e})
}

App.common_menu_items = (args = {}) => {
  let items = []

  if (App.get_media_type(args.item)) {
    items.push(App.item_menu_item({cmd: `view_media`, item: args.item}))
  }

  if (!args.multiple) {
    items.push({
      icon: App.settings_icons.filter,
      text: `Filter`,
      get_items: () => {
        return App.filter_menu_items(args.item)
      },
    })
  }

  if (!args.multiple) {
    let copy_items = []
    copy_items.push(App.item_menu_item({cmd: `copy_item_url`, item: args.item}))
    copy_items.push(App.item_menu_item({cmd: `copy_item_title`, item: args.item}))

    items.push({
      icon: App.clipboard_icon,
      text: `Copy`,
      items: copy_items,
    })
  }

  if (items.length) {
    for (let c of items) {
      args.o_items.push(c)
    }
  }
}

App.more_menu_items = (args = {}) => {
  let items = []

  if (args.item.mode === `tabs`) {
    if (args.some_unmuted) {
      items.push(App.item_menu_item({cmd: `mute_tabs`, item: args.item}))
    }

    if (args.some_muted) {
      items.push(App.item_menu_item({cmd: `unmute_tabs`, item: args.item}))
    }

    if (args.some_loaded) {
      items.push(App.item_menu_item({cmd: `unload_tabs`, item: args.item}))
    }

    items.push(App.item_menu_item({cmd: `duplicate_tabs`, item: args.item}))

    if (App.edited(args.item, false)) {
      items.push(App.item_menu_item({cmd: `remove_item_edits`, item: args.item}))
    }
  }

  items.push(App.item_menu_item({cmd: `bookmark_items`, item: args.item}))

  if (args.item.image && !args.multiple) {
    items.push(App.item_menu_item({cmd: `set_background_image`, item: args.item}))
  }

  if (args.item.mode === `tabs`) {
    if (items.length) {
      App.sep(items)
    }

    let split_used = false

    if (args.some_not_split_top) {
      items.push(App.item_menu_item({cmd: `add_split_top`, item: args.item}))
      split_used = true
    }

    if (args.some_not_split_bottom) {
      items.push(App.item_menu_item({cmd: `add_split_bottom`, item: args.item}))
      split_used = true
    }

    if (args.some_split_top || args.some_split_bottom) {
      items.push(App.item_menu_item({cmd: `remove_split`, item: args.item}))
      split_used = true
    }

    if (split_used) {
      App.sep(items)
    }

    if (App.tabs_normal()) {
      items.push(App.item_menu_item({cmd: `move_tabs_to_top`, item: args.item}))
      items.push(App.item_menu_item({cmd: `move_tabs_to_bottom`, item: args.item}))
      App.sep(items)
    }

    items.push(App.item_menu_item({cmd: `show_windows_menu`, item: args.item}))
  }

  if (args.item.mode === `closed`) {
    items.push(App.item_menu_item({cmd: `forget_closed_item`, item: args.item}))
  }

  if (items.length) {
    args.o_items.push({
      icon: App.command_icon,
      text: `More`,
      items: items,
    })
  }
}

App.extra_menu_items = (o_items) => {
  let mode = App.get_setting(`extra_menu_mode`)

  if (mode === `none`) {
    return
  }

  let items = App.custom_menu_items(`extra_menu`)

  if (mode === `normal`) {
    if (items.length) {
      o_items.push({
        icon: App.command_icon,
        text: `Extra`,
        items: items,
      })
    }
  }
  else if (mode === `flat`) {
    for (let item of items) {
      o_items.push(item)
    }
  }
  else if (mode === `total`) {
    o_items = items
  }
}

App.filter_menu_items = (item) => {
  let items = []

  if (App.get_color(item)) {
    items.push(App.item_menu_item({cmd: `filter_color`, item: item}))
  }

  if (App.tagged(item)) {
    items.push(App.item_menu_item({cmd: `filter_tag`, item: item}))
  }

  items.push(App.item_menu_item({cmd: `filter_domain`, item: item}))
  return items
}

App.item_menu_item = (obj) => {
  obj.from = `item_menu`
  obj.e = App.item_menu_args.e
  return App.cmd_item(obj)
}