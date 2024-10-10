App.process_info_list = (mode, info_list) => {
  let container = DOM.el(`#${mode}_container`)
  App[`${mode}_idx`] = 0

  if (!App.persistent_modes.includes(mode)) {
    App.clear_items(mode)
  }

  let items = App.get_items(mode)
  let exclude = []

  if (mode === `bookmarks`) {
    if (App.get_setting(`include_bookmark_folders`)) {
      if (App.get_setting(`bookmark_folders_above`)) {
        info_list.sort((a, b) => a.type === `folder` ? -1 : b.type === `folder`)
      }
    }
  }

  for (let info of info_list) {
    let item = App.process_info({mode, info, exclude, list: true, add_parent: false})

    if (!item) {
      continue
    }

    if (mode !== `tabs`) {
      exclude.push(item.url)
    }

    items.push(item)
    container.append(item.element)
  }

  if (mode === `tabs`) {
    for (let item of items) {
      App.add_tab_parent(item)
    }
  }

  App.update_footer_count()
  App.do_check_pinline()

  if (mode === `tabs`) {
    App.check_tab_session()
    App.update_tab_box()
  }
}

App.process_info = (args = {}) => {
  let def_args = {
    exclude: [],
    list: false,
    add_parent: true,
  }

  App.def_args(def_args, args)

  if (!args.info) {
    return false
  }

  if (args.o_item) {
    if (!args.url) {
      args.info = {...args.o_item.original_data, ...args.info}
    }

    args.o_item.original_data = args.info
  }
  else if (args.mode === `bookmarks`) {
    if (args.info.type === `folder`) {
      args.info = {...args.info}
      args.info.url = `${App.bookmarks_folder_url}/${args.info.id}`
      args.info.favIconUrl = `img/folder.jpg`
      args.info.title = `Folder: ${args.info.title}`
    }
  }

  let decoded_url

  if (args.info.url) {
    try {
      // Check if valid URL
      decoded_url = decodeURI(args.info.url)
    }
    catch (err) {
      return false
    }
  }

  let url = App.format_url(args.info.url || ``)

  if (args.exclude.includes(url)) {
    return false
  }

  let path = App.get_path(decoded_url)
  let protocol = App.get_protocol(url)
  let hostname = App.get_hostname(url)
  let title = args.info.title || ``
  let image = App.is_image(url)
  let video = App.is_video(url)
  let audio = App.is_audio(url)

  let item = {
    title,
    url,
    path,
    protocol,
    hostname,
    favicon: args.info.favIconUrl,
    mode: args.mode,
    window_id: args.info.windowId,
    session_id: args.info.sessionId,
    decoded_url,
    image,
    video,
    audio,
    is_item: true,
  }

  if (args.mode === `tabs`) {
    item.active = args.info.active
    item.pinned = args.info.pinned
    item.playing = args.info.audible
    item.muted = args.info.mutedInfo.muted
    item.unloaded = args.info.discarded
    item.last_access = args.info.lastAccessed
    item.status = args.info.status
    item.parent = args.info.openerTabId
  }
  else if (args.mode === `history`) {
    item.last_visit = args.info.lastVisitTime
  }
  else if (args.mode === `bookmarks`) {
    item.parent_id = args.info.parentId
    item.date_added = args.info.dateAdded
    item.type = args.info.type
  }

  App.check_rules(item)

  if (args.o_item) {
    args.o_item = Object.assign(args.o_item, item)
    App.refresh_item_element(args.o_item)
    App.refresh_tab_box_element(args.o_item)

    if (App.get_selected(args.mode) === args.o_item) {
      App.update_footer_info(args.o_item)
    }
  }
  else {
    if (!args.list) {
      if ((args.mode === `tabs`) && !item.active && item.parent) {
        item.unread = true
      }
    }

    for (let key in App.edit_props) {
      item[`custom_${key}`] = App.edit_default(key)
    }

    item.original_data = args.info
    item.id = args.info.id || App[`${args.mode}_idx`]
    item.visible = true
    item.selected = false
    item.header = false
    item.tab_box = false
    item.last_scroll = 0
    App.create_item_element(item)

    if (args.mode === `tabs`) {
      if (args.add_parent) {
        App.add_tab_parent(item)
      }
    }

    App[`${args.mode}_idx`] += 1
  }

  return item
}

App.process_search_item = (info) => {
  info.path = App.get_path(info.url || `https://no.url`)
}