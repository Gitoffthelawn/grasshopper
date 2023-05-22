App.setup_stars = () => {
  function on_close () {
    let mode = App.last_window_mode

    if (App[`${mode}_filter_mode`] === `star`) {
      App.do_item_filter(App.last_window_mode)
    }

    App.show_last_window()
  }

  App.stars_actions = [
    {text: `--separator--`},

    {text: `Export Data`, action: () => {
      App.export_stars()
    }},

    {text: `Import Data`, action: () => {
      App.import_stars()
    }},
  ]

  App.setup_item_window(`stars`)

  App.create_window({id: `star_editor`, setup: () => {
    DOM.ev(DOM.el(`#star_editor_save`), `click`, () => {
      App.star_editor_save()
    })

    DOM.ev(DOM.el(`#star_editor_remove`), `click`, () => {
      App.remove_star()
    })
  },
  on_x: () => {
    on_close()
  },
  after_show: () => {
    App.update_star_editor_info()
  },
  on_hide: () => {
    on_close()
  }})
}

App.hide_star_editor = () => {
  App.windows.star_editor.hide()
}

App.stars_action = (item) => {
  App.item_action(item)
}

App.stars_action_alt = (item) => {
  App.item_action(item, false)
}

App.open_star = (item, close = true) => {
  let star = App.get_star_by_id(item.id)
  App.update_star(star)
  App.focus_or_open_item(item, close)
}

App.launch_star = (item) => {
  let star = App.get_star_by_id(item.id)
  App.update_star(star)
  App.launch_item(item, false)
}

App.get_stars = () => {
  let stars = structuredClone(App.stars)
  stars.sort((a, b) => (a.date_last_visit < b.date_last_visit) ? 1 : -1)
  return stars
}

App.update_star = (item, add_visit = true) => {
  item.date_last_visit = Date.now()

  if (add_visit) {
    item.visits += 1
  }

  App.stor_save_stars()
}

App.star_item = (item, save = true) => {
  let old = App.get_star_by_url(item.url)

  if (old) {
    old.title = item.title
    old.url = item.url
    App.update_star(old, false)
    return
  }

  let obj = {
    id: `${Date.now()}_${App.star_counter}`,
    url: item.url,
    title: item.title,
    date_added: Date.now(),
    date_last_visit: Date.now(),
    visits: 0
  }

  App.star_counter += 1
  App.stars.unshift(obj)

  if (App.stars.length > App.max_stars) {
    App.stars = App.stars.slice(0, App.max_stars)
  }

  if (save) {
    App.stor_save_stars()
  }

  return obj
}

App.remove_star = () => {
  if (!App.star_edited) {
    return
  }

  App.show_confirm(`Remove this star?`, () => {
    App.do_remove_stars([App.star_edited.id])
    App.hide_star_editor()
  })
}

App.do_remove_stars = (ids) => {
  for (let id of ids) {
    if (App.get_items(`stars`)) {
      let item = App.get_item_by_id(`stars`, id)

      if (item) {
        App.remove_item(item)
      }
    }
  }

  App.stars = App.stars.filter(x => !ids.includes(x.id))
  App.stor_save_stars()
}

App.show_star_editor = (item) => {
  App.star_edited = App.get_star_by_id(item.id)
  DOM.el(`#star_editor_url`).value = item.url
  DOM.el(`#star_editor_title`).value = item.title
  App.show_window(`star_editor`)
  DOM.el(`#star_editor_title`).focus()
}

App.star_editor_save = () => {
  let title = DOM.el(`#star_editor_title`).value.trim()
  let url = DOM.el(`#star_editor_url`).value.trim()

  if (!title || !url) {
    return
  }

  try {
    new URL(url)
  }
  catch (err) {
    App.show_alert(`Invalid URL`)
    return
  }

  if (App.star_edited) {
    let star = App.get_star_by_id(App.star_edited.id)

    if (star) {
      star.title = title
      star.url = url
      App.update_star(star, false)

      if (App.get_items(`stars`)) {
        App.update_item(`stars`, App.star_edited.id, star)
      }

      App.hide_star_editor()
      return
    }
  }

  App.star_item({
    title: title,
    url: url
  })

  if (App.last_window_mode === `stars`) {
    App.show_item_window(`stars`)
  }
  else {
    App.hide_star_editor()
  }
}

App.get_star_by_id = (id) => {
  for (let it of App.stars) {
    if (it.id === id) {
      return it
    }
  }
}

App.get_star_by_url = (url) => {
  for (let it of App.stars) {
    if (App.urls_equal(it.url, url)) {
      return it
    }
  }
}

App.new_star = (title = ``, url = ``) => {
  App.star_edited = undefined
  DOM.el(`#star_editor_title`).value = title
  DOM.el(`#star_editor_url`).value = url
  App.show_window(`star_editor`)
  DOM.el(`#star_editor_title`).focus()
}

App.new_star_from_active = async () => {
  let tab = await App.get_active_tab()

  if (!tab) {
    return
  }

  let item = App.get_star_by_url(tab.url)

  if (item) {
    App.add_or_edit_star(item)
  }
  else {
    App.new_star(tab.title, tab.url)
  }
}

App.add_or_edit_star = (item) => {
  let star

  if (item.mode === `stars`) {
    star = App.get_star_by_id(item.id)
  }
  else{
    star = App.get_star_by_url(item.url)
  }

  if (star) {
    App.show_star_editor(star)
  }
  else {
    App.new_star(item.title, item.url)
  }
}

App.update_star_editor_info = () => {
  let info = DOM.el(`#star_editor_info`)
  let visits = DOM.el(`#star_editor_visits`)
  let visited = DOM.el(`#star_editor_visited`)
  let added = DOM.el(`#star_editor_added`)
  let save = DOM.el(`#star_editor_save`)
  let remove = DOM.el(`#star_editor_remove`)
  let icon = DOM.el(`#star_editor_icon`)

  if (App.star_edited) {
    save.textContent = `Update`
    visits.textContent = App.star_edited.visits.toLocaleString()
    visited.textContent = App.nice_date(App.star_edited.date_last_visit)
    added.textContent = App.nice_date(App.star_edited.date_added)
    info.classList.remove(`hidden`)
    remove.classList.remove(`hidden`)
    DOM.el(`use`, icon).href.baseVal = `#star_solid_icon`
  }
  else {
    save.textContent = `Save`
    info.classList.add(`hidden`)
    remove.classList.add(`hidden`)
    DOM.el(`use`, icon).href.baseVal = `#star_icon`
  }
}

App.remove_stars = (item, force = false) => {
  let active = App.get_active_items(`stars`, item)
  let ids = active.map(x => x.id)

  App.show_confirm(`Remove these stars? (${ids.length})`, () => {
    App.do_remove_stars(ids)
    App.dehighlight(`stars`)
  }, () => {
    App.dehighlight(`stars`)
  }, force)
}

App.export_stars = () => {
  App.show_textarea(`Copy this to import it later`, JSON.stringify(App.stars, null, 2))
}

App.import_stars = () => {
  App.show_input(`Paste the data text here`, `Import`, (text) => {
    if (!text) {
      return
    }

    let json

    try {
      json = JSON.parse(text)
    }
    catch (err) {
      App.show_alert(`Invalid JSON`)
      return
    }

    if (json) {
      App.show_confirm(`Use this data?`, () => {
        App.stars = json
        App.stor_save_stars()
        App.show_window(`stars`)
      })
    }
  })
}

App.star_items = (item) => {
  let items = []
  let active = App.get_active_items(item.mode, item)

  if (active.length === 1) {
    App.add_or_edit_star(active[0])
    App.dehighlight(item.mode)
    return
  }

  for (let item of active) {
    let exists = App.get_star_by_url(item.url)

    if (exists) {
      continue
    }

    items.push(item)
  }

  if (items.length === 0) {
    App.dehighlight(item.mode)
    return
  }

  App.show_confirm(`Star these items? (${items.length})`, () => {
    for (let item of items) {
      App.star_item(item, false)
    }

    App.stor_save_stars()
    App.dehighlight(item.mode)
  }, () => {
    App.dehighlight(item.mode)
  })
}

App.toggle_star = (item, prepend = false) => {
  let star = App.get_star_by_url(item.url)

  if (star) {
    App.do_remove_stars([star.id])
    return false
  }
  else {
    let obj = App.star_item(item)

    if (prepend) {
      App.insert_item(`stars`, obj)
    }

    return true
  }
}