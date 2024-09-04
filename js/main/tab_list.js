App.show_tab_list = (what, e) => {
  let tabs, title, title_icon

  if (what === `recent`) {
    let max = App.get_setting(`max_recent_tabs`)
    let active = App.get_setting(`recent_active`)
    tabs = App.get_recent_tabs({max: max, active: active})
    title = `Recent`
  }
  else if (what === `pins`) {
    tabs = App.get_pinned_tabs()
    title = `Pinned`
  }
  else if (what === `playing`) {
    tabs = App.get_playing_tabs()
    title = `Playing`
  }
  else if (what.startsWith(`color_`)) {
    let color_id = what.split(`_`)[1]
    let color = App.get_color_by_id(color_id)

    if (!color) {
      return
    }

    tabs = App.get_color_tabs(color_id)
    title = color.name
    title_icon = App.color_icon(color_id)
  }
  else if (what.startsWith(`tag_`)) {
    let tag = what.split(`_`)[1]
    tabs = App.get_tag_tabs(tag)
    title = `Tag: ${tag}`
  }
  else if (what.startsWith(`icon_`)) {
    let icon = what.split(`_`)[1]
    tabs = App.get_icon_tabs(icon)
    title = `Icon: ${icon}`
  }

  let items = []
  let playing_icon = App.get_setting(`playing_icon`) || App.audio_icon
  let muted_icon = App.get_setting(`muted_icon`) || App.muted_icon

  for (let tab of tabs) {
    let title = App.title(tab)
    let icon

    if (tab.muted) {
      icon = muted_icon
    }
    else if (tab.playing) {
      icon = playing_icon
    }

    let favicon = tab.favicon

    if (!favicon) {
      favicon = `img/favicon.jpg`
    }

    let obj = {
      image: favicon,
      icon: icon,
      text: title,
      info: tab.url,
      action: async () => {
        await App.check_on_tabs()
        App.tabs_action(tab, `tab_list`)
      },
      alt_action: () => {
        App.close_tab_or_tabs(tab.id)
      },
      context_action: (e) => {
        App.show_item_menu({item: tab, e: e})
      },
      icon_action: async (e, icon) => {
        if (tab.muted) {
          await App.unmute_tab(tab.id)

          if (!tab.playing) {
            icon.innerHTML = ``
          }
          else {
            icon.innerHTML = playing_icon
          }
        }
        else if (tab.playing) {
          await App.mute_tab(tab.id)
          icon.innerHTML = muted_icon
        }
      },
    }

    if (tab.active) {
      obj.bold = true
    }

    items.push(obj)
  }

  App.show_context({
    items: items, e: e,
    title: title,
    title_icon: title_icon,
    alt_action_remove: true,
    title_number: true,
  })
}