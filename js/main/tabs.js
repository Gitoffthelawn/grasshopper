// Setup tabs
App.setup_tabs = function () {
  App.setup_item_window("tabs")

  App.ev(App.el("#tabs_playing_button"), "click", function () {
    App.go_to_playing_tab()
  })

  App.ev(App.el("#tabs_clean_button"), "click", function () {
    App.clean_tabs()
  })  

  App.ev(App.el("#tabs_more_button"), "click", function () {
    App.show_tabs_menu()
  })

  App.ev(App.el("#tabs_new_button"), "click", function () {
    App.new_tab()
  })

  browser.tabs.onUpdated.addListener(function (id) {
    if (App.window_mode === "tabs") {
      App.refresh_tab(id)
    }
  })

  browser.tabs.onActivated.addListener(function (ans) {
    if (App.window_mode === "tabs") {
      for (let tab of App.tabs_items) {
        tab.active = false
      }

      App.refresh_tab(ans.tabId)
    }
  })  
  
  browser.tabs.onRemoved.addListener(function (id) {
    if (App.window_mode === "tabs") {
      App.remove_closed_tab(id)
    }
  })
}

// Get open tabs
App.get_tabs = async function () {
  let tabs = []

  if (!App.settings.all_windows) {
    tabs = await browser.tabs.query({currentWindow: true})
  } else {
    let wins = await browser.windows.getAll({populate: true})

    for (let win of wins) {
      for (let tab of win.tabs) {
        tabs.push(tab)
      }
    }
  }

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
App.focus_tab = async function (tab, close = true) {
  if (tab.window_id) {
    await browser.windows.update(tab.window_id, {focused: true})
  }

  await browser.tabs.update(tab.id, {active: true})

  if (close) {
    window.close()
  }
}

// Close tab with possible confirm
App.confirm_close_tab = function (tab) {
  if (App.settings.warn_on_tab_close) {
    if (tab.audible) {
      if (confirm("Close playing tab?")) {
        App.close_tab(tab.id)
      }
    } else if (tab.pinned) {
      if (confirm("Close pinned tab?")) {
        App.close_tab(tab.id)
      }
    } else {
      App.close_tab(tab.id)
    }
  } else {
    App.close_tab(tab.id)
  }
}

// Close a tab
App.close_tab = function (id) {
  browser.tabs.remove(id)
}

// Open a new tab
App.new_tab = function () {
  browser.tabs.create({active: true})
  window.close()
}

// Refresh tabs
App.refresh_tab = async function (id) {
  let tab = App.get_item_by_id("tabs", id)

  if (tab) {
    if (tab.closed) {
      return
    }
  } else {
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
      let tab = App.process_item("tabs", info)
      
      if (!tab) {
        break
      }

      if (!App.item_is_visible(it)) {
        App.hide_item(tab)
      }
      
      let selected = App.selected_tabs_item === it
      App.create_item_element("tabs", tab)
      App.tabs_items[i].element.replaceWith(tab.element)
      App.tabs_items[i] = tab

      if (selected) {
        App.select_item("tabs", tab)
      }

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
  App.update_info("tabs")
  App.el("#tabs_container").prepend(tab.element)
}

// Close all tabs except pinned and audible tabs
App.clean_tabs = function () {
  let ids = []

  for (let tab of App.tabs_items) {
    if (tab.pinned || tab.audible) {
      continue
    }

    if (tab.active && !App.settings.clean_active_tab) {
      continue
    }

    if (tab.discarded && !App.settings.clean_suspended_tabs) {
      continue
    }
    
    ids.push(tab.id)
  }

  if (ids.length === 0) {
    return
  }
  
  let s = App.plural(ids.length, "tab", "tabs")

  if (confirm(`Close all normal tabs? (${s})`)) {
    for (let id of ids) {
      App.close_tab(id)
    }

    console.info("Cleaned tabs")
  }
}

// Pin a tab
App.pin_tab = function (id) {
  browser.tabs.update(id, {pinned: true})
}

// Unpin a tab
App.unpin_tab = function (id) {
  browser.tabs.update(id, {pinned: false})
}

// Mute a tab
App.mute_tab = function (id) {
  browser.tabs.update(id, {muted: true})
}

// Unmute a tab
App.unmute_tab = function (id) {
  browser.tabs.update(id, {muted: false})
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
App.remove_closed_tab = function (id) {
  let tab = App.get_item_by_id("tabs", id)

  if (tab) {
    App.remove_item("tabs", tab)
  }

  App.update_info("tabs")
}

// Tabs action
App.tabs_action = function (item) {
  App.focus_tab(item)
}

// Tabs action alt
App.tabs_action_alt = function (item) {
  App.confirm_close_tab(item)
}

// Open tab in new window
App.detach_tab = async function (tab) {
  browser.windows.create({tabId: tab.id})
  window.close()
}

// Move tab to another existing window
App.move_tab = async function (tab, window_id) {
  await browser.tabs.move(tab.id, {index: -1, windowId: window_id})
  browser.tabs.update(tab.id, {active: true})
  window.close()
}

// Duplicate a tab
App.duplicate_tab = function (tab) {
  browser.tabs.create({active: true, url: tab.url})
  window.close()
}

// Suspend a tab
App.suspend_tab = async function (tab) {
  if (tab.active) {
    await browser.tabs.create({active: true})
  }

  browser.tabs.discard(tab.id)
}

// Show tabs menu
App.show_tabs_menu = function () {
  let items = []

  items.push({
    text: "Pin all tabs",
    action: function () {
      App.pin_all_tabs()
    }
  })  

  items.push({
    text: "Unpin all tabs",
    action: function () {
      App.unpin_all_tabs()
    }
  })

  items.push({
    text: "Suspend all tabs",
    action: function () {
      App.suspend_all_tabs()
    }
  })  

  items.push({
    text: "Suspend normal tabs",
    action: function () {
      App.suspend_normal_tabs()
    }
  })    

  NeedContext.show_on_element(App.el("#tabs_more_button"), items)
}

// Pin all the tabs
App.pin_all_tabs = function () {
  let ids = []

  for (let tab of App.tabs_items) {
    if (tab.pinned) {
      continue
    }
    
    ids.push(tab.id)
  }

  if (ids.length === 0) {
    return
  }
  
  let s = App.plural(ids.length, "tab", "tabs")

  if (confirm(`Pin all tabs? (${s})`)) {
    for (let id of ids) {
      App.pin_tab(id)
    }

    console.info("Pinned all tabs")
  }  
}

// Unpin all the tabs
App.unpin_all_tabs = function () {
  let ids = []

  for (let tab of App.tabs_items) {
    if (!tab.pinned) {
      continue
    }
    
    ids.push(tab.id)
  }

  if (ids.length === 0) {
    return
  }
  
  let s = App.plural(ids.length, "tab", "tabs")

  if (confirm(`Unpin all tabs? (${s})`)) {
    for (let id of ids) {
      App.unpin_tab(id)
    }

    console.info("Unpinned all tabs")
  }  
}

// Suspend all the tabs
App.suspend_all_tabs = function () {
  let tabs = []

  for (let tab of App.tabs_items) {
    if (tab.zzz) {
      continue
    }
    
    tabs.push(tab)
  }

  if (tabs.length === 0) {
    return
  }
  
  let s = App.plural(tabs.length, "tab", "tabs")

  if (confirm(`Suspend all tabs? (${s})`)) {
    for (let tab of tabs) {
      App.suspend_tab(tab)
    }

    console.info("Suspended all tabs")
  }  
}

// Suspend normal tabs
App.suspend_normal_tabs = function () {
  let tabs = []

  for (let tab of App.tabs_items) {
    if (tab.zzz || tab.pinned || tab.audible) {
      continue
    }
    
    tabs.push(tab)
  }

  if (tabs.length === 0) {
    return
  }
  
  let s = App.plural(tabs.length, "tab", "tabs")

  if (confirm(`Suspend normal tabs? (${s})`)) {
    for (let tab of tabs) {
      App.suspend_tab(tab)
    }

    console.info("Suspended all normal tabs")
  }  
}