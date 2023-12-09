App.show_tab_list = (what, e) => {
  let tabs

  if (what === `recent`) {
    let max = App.get_setting(`max_recent_tabs`)
    let active = App.get_setting(`recent_active`)
    tabs = App.get_recent_tabs({max: max, active: active})
  }
  else if (what === `pins`) {
    tabs = App.get_pinned_tabs()
  }
	else if (what === `playing`) {
		tabs = App.get_playing_tabs()
	}
	else if (what.startsWith(`color_`)) {
		let color_id = what.split(`_`)[1]
		tabs = App.get_color_tabs(color_id)
	}
	else if (what.startsWith(`tag_`)) {
		let tag = what.split(`_`)[1]
		tabs = App.get_tag_tabs(tag)
	}
	else if (what.startsWith(`icon_`)) {
		let id = what.split(`_`)[1]
		tabs = App.get_icon_tabs(id)
	}

	let items = []
  let playing_icon = App.get_setting(`playing_icon`) || App.audio_icon

  for (let tab of tabs) {
    let title = App.title(tab)

    if (tab.audible) {
      title = `${playing_icon} ${title}`
    }

    let obj = {
      image: tab.favicon,
      text: title,
      action: async () => {
        await App.check_on_tabs()
        App.tabs_action(tab, `tab_list`)
      },
      alt_action: () => {
        App.close_tabs(tab)
      },
      context_action: (e) => {
        App.show_item_menu({item: tab, e: e})
      },
    }

    if (tab.active) {
      obj.bold = true
    }

    items.push(obj)
  }

  App.show_context({items: items, e: e})
}