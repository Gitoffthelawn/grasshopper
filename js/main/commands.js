App.setup_commands = () => {
  let color_filters = []

  for (let color of App.colors) {
    let icon = App.color_icon(color)
    let name = `Filter ${App.capitalize(color)}`

    color_filters.push({name: name, cmd: `filter_${color}`, mode: `items`, icon: icon, action: (args) => {
      App.filter_color(args.mode, color)
    }})
  }

  let color_changers = []

  for (let color of App.colors) {
    let icon = App.color_icon(color)
    let name = `Color ${App.capitalize(color)}`

    color_changers.push({name: name, cmd: `color_${color}`, mode: `items`, icon: icon, action: (args) => {
      App.change_color(args.item, color)
    }})
  }

  let media_filters = []

  for (let media of App.media_types) {
    let icon = App.get_setting(`${media}_icon`) || ``
    let name = `Filter ${App.capitalize(media)}`.trim()

    media_filters.push({name: name, cmd: `filter_${media}`, mode: `items`, icon: icon, action: (args) => {
      App.set_filter_mode(args.mode, media)
    }})
  }

  let show_modes = []

  for (let mode of App.modes) {
    let icon = App.mode_icons[mode]
    let name = `Show ${App.get_mode_name(mode)}`

    show_modes.push({name: name, cmd: `show_${mode}`, icon: icon, action: (args) => {
      App.show_mode(mode)
    }})
  }

  let tabicon =  App.mode_icons.tabs
  let themeicon = App.settings_icons.theme

  App.commands = [
    {name: `Go To Top`, cmd: `go_to_top`, mode: `items`, action: (args) => {
      App.goto_top()
    }},
    {name: `Go To Bottom`, cmd: `go_to_bottom`, mode: `items`, action: (args) => {
      App.goto_bottom()
    }},
    {name: `Step Back`, cmd: `step_back`, mode: `items`, action: (args) => {
      App.step_back()
    }},
    {name: `Select All`, cmd: `select_all`, mode: `items`, action: (args) => {
      App.select_all()
    }},

    {name: App.separator_string},

    {name: `Prev Mode`, cmd: `prev_mode`, mode: `items`, action: (args) => {
      App.cycle_modes(true)
    }},
    {name: `Next Mode`, cmd: `next_mode`, mode: `items`, action: (args) => {
      App.cycle_modes()
    }},
    ...show_modes,
    {name: `Show Main`, cmd: `show_main`, action: (args) => {
      App.show_main_mode()
    }},
    {name: `Show Settings`, cmd: `show_settings`, action: (args) => {
      App.show_settings()
    }},
    {name: `Show About`, cmd: `show_about`, action: (args) => {
      App.show_window(`about`)
    }},
    {name: `Show Palette`, cmd: `show_palette`, action: (args) => {
      App.show_palette()
    }},
    {name: `Item Menu`, cmd: `item_menu`, mode: `items`, action: (args) => {
      App.show_item_menu_2(args.item)
    }},
    {name: `Show All`, cmd: `show_all`, mode: `items`, action: (args) => {
      App.show_all()
    }},

    {name: App.separator_string},

    {name: `Open`, cmd: `open`, mode: `items`, action: (args) => {
      App.open_items(args.item)
    }},
    {name: `Open Single`, cmd: `open_single`, mode: `items`, action: (args) => {
      App.open_items(args.item, false)
    }},
    {name: `Bookmark`, cmd: `bookmark`, mode: `items`, icon: App.mode_icons.bookmarks, action: (args) => {
      App.bookmark_items(args.item)
    }},
    {name: `BMark Active`, cmd: `bookmark_active`, icon: App.mode_icons.bookmarks, action: (args) => {
      App.bookmark_active(args.item)
    }},
    {name: `Copy URL`, cmd: `copy_url`, mode: `items`, icon: App.clipboard_icon, action: (args) => {
      App.copy_url(args.item)
    }},
    {name: `Copy Title`, cmd: `copy_title`, mode: `items`, icon: App.clipboard_icon, action: (args) => {
      App.copy_title(args.item)
    }},

    {name: App.separator_string},

    {name: `Back`, cmd: `browser_back`, action: (args) => {
      App.browser_back()
    }},
    {name: `Forward`, cmd: `browser_forward`, action: (args) => {
      App.browser_forward()
    }},
    {name: `Reload`, cmd: `browser_reload`, action: (args) => {
      App.browser_reload()
    }},

    {name: App.separator_string},

    {name: `New`, cmd: `new`, icon: tabicon, action: (args) => {
      App.new_tab()
    }},
    {name: `Unload`, cmd: `unload`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.unload_tabs(args.item)
    }},
    {name: `Unload Single`, cmd: `unload_single`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.unload_tabs(args.item, false)
    }},
    {name: `Load`, cmd: `load`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.load_tabs(args.item)
    }},
    {name: `Duplicate`, cmd: `duplicate`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.duplicate_tabs(args.item)
    }},
    {name: `Detach`, cmd: `detach`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.detach_tabs(args.item)
    }},
    {name: `Move To Top`, cmd: `move_to_top`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.move_tabs_vertically(`top`)
    }},
    {name: `Move To Bottom`, cmd: `move_to_bottom`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.move_tabs_vertically(`bottom`)
    }},
    {name: `Pin`, cmd: `pin`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.pin_tabs(args.item)
    }},
    {name: `Unpin`, cmd: `unpin`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.unpin_tabs(args.item)
    }},
    {name: `Toggle Pin`, cmd: `toggle_pin`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.toggle_pin_tabs(args.item)
    }},
    {name: `Mute`, cmd: `mute`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.mute_tabs(args.item)
    }},
    {name: `Unmute`, cmd: `unmute`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.unmute_tabs(args.item)
    }},
    {name: `Toggle Mute`, cmd: `toggle_mute`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.toggle_mute_tabs(args.item)
    }},
    {name: `Close`, cmd: `close`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.close_tabs(args.item)
    }},
    {name: `Close Single`, cmd: `close_single`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.close_tabs(args.item, false)
    }},
    {name: `Close Menu`, cmd: `close_menu`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.close_menu()
    }},
    {name: `Close Normal`, cmd: `close_normal`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.close_normal_tabs()
    }},
    {name: `Close Unloaded`, cmd: `close_unloaded`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.close_unloaded_tabs()
    }},
    {name: `Close Duplicates`, cmd: `close_duplicate`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.close_duplicate_tabs()
    }},
    {name: `Close Visible`, cmd: `close_visible`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.close_visible_tabs()
    }},
    {name: `Go To Playing`, cmd: `go_to_playing`, icon: tabicon, action: (args) => {
      App.go_to_playing_tab()
    }},
    {name: `Sort`, cmd: `sort`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.sort_tabs()
    }},
    {name: `Show Info`, cmd: `info`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.show_tabs_info()
    }},
    {name: `Show URLs`, cmd: `show_urls`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.show_urls()
    }},
    {name: `Open URLs`, cmd: `open_urls`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.open_urls()
    }},
    {name: `Reopen`, cmd: `reopen`, icon: tabicon, action: (args) => {
      App.reopen_tab()
    }},
    {name: `Select Pins`, cmd: `select_pins`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.select_tabs(`pins`)
    }},
    {name: `Select Normal`, cmd: `select_normal`, mode: `tabs`, icon: tabicon, action: (args) => {
      App.select_tabs(`normal`)
    }},

    {name: App.separator_string},

    {name: `Filter Domain`, cmd: `filter_domain`, mode: `items`, action: (args) => {
      App.filter_domain(args.item)
    }},
    {name: `Filter Color`, cmd: `filter_color`, mode: `items`, color: true, action: (args) => {
      App.filter_color(args.mode, args.item.color)
    }},
    {name: `Filter Playing`, cmd: `filter_playing`, mode: `tabs`, action: (args) => {
      App.set_filter_mode(args.mode, `playing`)
    }},
    {name: `Filter Edited`, cmd: `filter_edited`, mode: `items`, action: (args) => {
      App.set_filter_mode(args.mode, `edited`)
    }},
    ...media_filters,
    ...color_filters,
    {name: `Filter History`, cmd: `filter_history`, mode: `items`, action: (args) => {
      App.show_filter_history(undefined, args.mode)
    }},
    {name: `Deep Search`, cmd: `deep_search`, mode: `items`, action: (args) => {
      App.deep_search(args.mode)
    }},
    {name: `Search Media`, cmd: `search_media`, mode: `items`, action: (args) => {
      App.search_media(args.mode)
    }},
    {name: `Forget Closed`, cmd: `forget_closed`, mode: `items`, action: (args) => {
      App.forget_closed()
    }},

    {name: App.separator_string},

    {name: `Edit Profiles`, cmd: `edit_profiles`, mode: `items`, action: (args) => {
      App.edit_profiles(args.item)
    }},
    {name: `Add Tags`, cmd: `add_tags`, mode: `items`, action: (args) => {
      App.add_tags(args.item)
    }},
    {name: `Add Notes`, cmd: `add_notes`, mode: `items`, action: (args) => {
      App.add_notes(args.item)
    }},
    ...color_changers,

    {name: App.separator_string},

    {name: `Dark Theme`, cmd: `dark_theme`, icon: themeicon, action: (args) => {
      App.set_dark_theme()
    }},
    {name: `Light Theme`, cmd: `light_theme`, icon: themeicon, action: (args) => {
      App.set_light_theme()
    }},
    {name: `${App.random_text} Theme`, cmd: `random_theme`, icon: themeicon, action: (args) => {
      App.random_theme()
    }},
    {name: `${App.random_text} Background`, cmd: `random_background`, icon: themeicon, action: (args) => {
      App.random_background()
    }},
    {name: `Next Background`, cmd: `next_background`, icon: themeicon, action: (args) => {
      App.background_from_pool()
    }},
    {name: `${App.remove_text} Background`, cmd: `remove_background`, icon: themeicon, action: (args) => {
      App.change_background(``)
    }},
    {name: `Background`, cmd: `change_background`, media: `image`, icon: themeicon, action: (args) => {
      App.change_background(args.item.url)
    }},
    {name: `Add To Pool`, cmd: `add_to_pool`, media: `image`, icon: themeicon, action: (args) => {
      App.add_to_background_pool(args.item.url)
    }},

    {name: App.separator_string},

    {name: `Restart`, cmd: `restart_extension`, icon: App.bot_icon, action: (args) => {
      App.restart_extension()
    }},
  ]

  App.cmds = App.commands.filter(x => !x.name.startsWith(`--`)).map(x => x.cmd)
  App.sort_commands()
}

App.update_command_history = (cmd) => {
  App.command_history = App.command_history.filter(x => x !== cmd)

  // Remove non-existent commands
  App.command_history = App.command_history.filter(x => {
    return App.commands.some(y => y.cmd === x)
  })

  App.command_history.unshift(cmd)
  App.stor_save_command_history()
  App.sort_commands()
}

App.sort_commands = () => {
  App.sorted_commands = App.commands.filter(x => !x.name.startsWith(`--`)).slice(0)

  if (!App.get_setting(`sort_commands`)) {
    return
  }

  App.sorted_commands.sort((a, b) => {
    let ia = App.command_history.indexOf(a.cmd)
    let ib = App.command_history.indexOf(b.cmd)

    if (ia !== -1 && ib !== -1) {
      return ia - ib
    }

    if (ia !== -1) {
      return -1
    }

    if (ib !== -1) {
      return 1
    }
  })
}

App.get_command = (cmd) => {
  for (let c of App.commands) {
    if (c.cmd === cmd) {
      return c
    }
  }
}

App.run_command = (args) => {
  let command = App.get_command(args.cmd)

  if (command) {
    if (!App.check_command(command, args)) {
      return
    }

    command.action(args)
  }
}

App.check_command = (command, args) => {
  args.mode = App.window_mode
  args.on_items = App.on_items()
  args.on_media = App.on_media()

  if (!args.item) {
    if (args.on_items) {
      args.item = App.get_selected()
    }
    else if (args.on_media) {
      args.item = App.current_media_item()
    }
  }

  if (args.item) {
    for (let media of App.media_types) {
      if (args.item[media]) {
        args.media = media
        break
      }
    }

    if (args.item.color) {
      args.color = args.item.color
    }
  }

  let valid = true

  if (command) {
    if (valid) {
      if (command.media) {
        if (command.media !== args.media) {
          valid = false
        }
      }
    }

    if (valid) {
      if (command.color) {
        if (!args.color) {
          valid = false
        }
      }
    }

    if (valid) {
      if (command.mode) {
        if (command.mode === `items`) {
          if (!args.on_items) {
            valid = false
          }
        }
        else if (command.mode !== args.mode) {
          valid = false
        }
      }
    }
  }

  return valid
}