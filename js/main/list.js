App.setup_lists = function () {
  let list = App.el("#lists")

  // When list items are clicked
  App.ev(list, "click", function (e) {
    if (e.target.closest(".item")) {
      let el = e.target.closest(".item")
      let item = App.get_item_by_id(el.dataset.id)

      if (e.target.closest(".item_icon_container")) {
        App.show_item_menu(item)
      } else if (e.target.closest(".item_text")) {
        App.open_tab(item)
      }      
    }
  })

  // When list items get hovered
  App.ev(list, "mouseover", function (e) {
    if (App.mouse_over_disabled) {
      return
    }
    
    if (e.target.closest(".item")) {
      let el = e.target.closest(".item")
      let item = App.get_item_by_id(el.dataset.id)
      App.select_item(item, false)
    }
  })
}

// Disable mouse over
App.disable_mouse_over = function () {
  App.mouse_over_disabled = true
}

// Enable mouse over with a timeout
App.enable_mouse_over = function () {
  clearTimeout(App.enable_mouse_over_timeout)

  App.enable_mouse_over_timeout = setTimeout(function () {
    App.mouse_over_disabled = false
  }, App.disable_mouse_delay)
}

// Get a list
App.get_list = function (list) {
  return App.el(`#${list}`)
}

// Get and process lists
App.get_lists = async function (history_mode = "slice") {
  let tabs = await App.get_tabs()
  App.tab_items = []
  App.process_items(tabs, "tabs", App.tab_items)

  let history = await App.get_history(history_mode)
  App.history_items = []
  App.process_items(history, "history", App.history_items) 

  App.do_filter()  
}

// Switch to the other list
App.switch_list = function () {
  if (App.selected_item) {
    let list = App.get_other_list(App.selected_item.list)
    let item = App.get_first_visible_item(list)
    
    if (item) {
      App.select_item(item)
    }
  }
}

// Get other list
App.get_other_list = function (list) {
  return list == "tabs" ? "history" : "tabs"
}