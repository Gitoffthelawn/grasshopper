App.add_close_button = (item, side) => {
  if (App.is_header(item)) {
    return
  }

  let cb_setting = App.get_setting(`close_button`)

  if (cb_setting === `none`) {
    return
  }

  if (item.mode === `tabs`) {
    if (side !== cb_setting) {
      return
    }

    let hover_side = App.get_setting(`hover_button`)

    if (side === hover_side) {
      return
    }

    let btn = DOM.create(`div`, `close_button ${cb_setting} item_node`)
    btn.title = `Close`
    btn.textContent = App.close_tab_icon
    item.element.append(btn)
  }
}