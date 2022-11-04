// Setup tabs
App.setup_tabs = function () {
  App.setup_item_window("tabs")

  App.ev(App.el("#tabs_playing_button"), "click", function () {
    App.go_to_playing_tab()
  })

  App.ev(App.el("#tabs_clean_button"), "click", function () {
    App.clean_tabs()
  })

  App.ev(App.el("#tabs_wipe_button"), "click", function () {
    App.wipe_tabs()
  })  

  App.ev(App.el("#tabs_new_button"), "click", function () {
    App.new_tab()
  })

  browser.tabs.onUpdated.addListener(function (id) {
    if (App.window_mode === "tabs") {
      App.refresh_tab(id)
    }
  })

  browser.tabs.onRemoved.addListener(function (id) {
    if (App.window_mode === "tabs") {
      App.clean_closed_tab(id)
    }
  })
}

// Get open tabs
App.get_tabs = async function () {
  let tabs = await browser.tabs.query({currentWindow: true})
  App.sort_tabs_by_access(tabs)
  return tabs
}

// Sort tabs by access
App.sort_tabs_by_access = function (tabs) {
  tabs.sort((a, b) => (a.lastAccessed < b.lastAccessed) ? 1 : -1)
}

// Sort tabs by index
App.sort_tabs_by_index = function (tabs) {
  tabs.sort((a, b) => (a.index > b.index) ? 1 : -1)
}

// Open a new tab
App.focus_tab = function (tab) {
  browser.tabs.update(tab.id, {active: true})
  window.close()
}

// Close tab with possible confirm
App.confirm_close_tab = function (tab) {
  if (App.settings.warn_on_close) {
    if (tab.audible) {
      if (confirm("Close playing tab?")) {
        App.close_tab(tab)
      }
    } else if (tab.pinned) {
      if (confirm("Close pinned tab?")) {
        App.close_tab(tab)
      }
    } else {
      App.close_tab(tab)
    }
  } else {
    App.close_tab(tab)
  }
}

// Close a tab
App.close_tab = function (tab) {
  if (!tab) {
    return
  }

  browser.tabs.remove(tab.id)
}

// Open a new tab
App.new_tab = function () {
  browser.tabs.create({active: true})
  window.close()
}

// Refresh tabs
App.refresh_tab = async function (id) {
  let tab = App.get_item_by_id("tabs", id)

  if (!tab) {
    App.tabs_items.push({
      id: id,
      empty: true
    })
  }

  let info = await browser.tabs.get(id)

  if (tab) {
    App.update_tab(tab, info)
  } else {
    App.prepend_tab(info)
  }
}

// Update a tab
App.update_tab = function (o_tab, info) {
  for (let [i, it] of App.tabs_items.entries()) {
    if (it.id === o_tab.id) {
      let selected = App.selected_tabs_item === it
      let tab = App.process_item("tabs", info)

      if (!tab) {
        break
      }

      App.create_item_element("tabs", tab)
      App.tabs_items[i].element.replaceWith(tab.element)
      App.tabs_items[i] = tab

      if (selected) {
        App.select_item("tabs", tab)
      }

      App.do_item_filter("tabs", false)
      break
    }
  }
}

// Prepend tab to the top
App.prepend_tab = function (info) {
  for (let [i, it] of App.tabs_items.entries()) {
    if (it.id === info.id) {
      if (it.empty) {
        App.tabs_items.splice(i, 1)
        break
      }
    }
  }
  
  let tab = App.process_item("tabs", info)
  
  if (!tab) {
    return
  }
  
  App.tabs_items.unshift(tab)
  App.create_item_element("tabs", tab)
  App.el("#tabs_container").prepend(tab.element)
  App.do_item_filter("tabs", false)
}

// Close all tabs except pinned and audible tabs
App.clean_tabs = function () {
  App.show_confirm("Clean Tabs", "Close all normal tabs keeping only pins and playing tabs", function () {
    for (let tab of App.tabs_items) {
      if (tab.pinned || tab.audible) {
        continue
      }
  
      App.close_tab(tab)
    }
  })
}

// Close all tabs except the current one
App.wipe_tabs = function () {
  App.show_confirm("Wipe Tabs", "Close ALL tabs except the current one", function () {
    for (let tab of App.tabs_items) {
      if (tab.active) {
        continue
      }
      
      App.close_tab(tab)
    }
  })
}

// Pin a tab
App.pin_tab = function (tab) {
  browser.tabs.update(tab.id, {pinned: true})
}

// Unpin a tab
App.unpin_tab = function (tab) {
  browser.tabs.update(tab.id, {pinned: false})
}

// Mute a tab
App.mute_tab = function (tab) {
  browser.tabs.update(tab.id, {muted: true})
}

// Unmute a tab
App.unmute_tab = function (tab) {
  browser.tabs.update(tab.id, {muted: false})
}

// Go the a tab emitting sound
// Traverse in tab index order
App.go_to_playing_tab = function () {
  let tabs = App.tabs_items.slice(0)
  App.sort_tabs_by_index(tabs)
  let waypoint = false
  let first

  for (let tab of tabs) {
    if (tab.audible) {
      if (!first) {
        first = tab
      }

      if (waypoint) {
        App.focus_tab(tab)
        return
      }
    }

    if (!waypoint && tab.active) {
      waypoint = true
      continue
    }
  }

  // If none found then pick the first one
  if (first) {
    App.focus_tab(first)
  }
}

// Return pinned tabs
App.get_pinned_tabs = function () {
  return App.tabs_items.filter(x => x.pinned)
}

// Remove a closed tab
App.clean_closed_tab = function (id) {
  let tab = App.get_item_by_id("tabs", id)

  if (tab) {
    App.remove_item("tabs", tab)
  }
}

// Tabs action
App.tabs_action = function () {
  App.focus_tab(App.selected_tabs_item)
}

// Show information about tabs
App.show_tabs_info = async function () {
  let all = App.tabs_items.length
  let pins = App.tabs_items.filter(x => x.pinned).length  
  let s = App.plural(all, "tab", "tabs")
  let p = App.plural(pins, "pin", "pins")
  alert(`${s} open (${p})`)
}