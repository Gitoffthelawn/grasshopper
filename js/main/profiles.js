App.setup_profile_editor = () => {
  App.create_window({id: `profile_editor`, setup: () => {
    DOM.ev(DOM.el(`#profile_editor_save`), `click`, () => {
      App.profile_editor_save()
    })

    DOM.ev(DOM.el(`#profile_editor_remove`), `click`, () => {
      App.remove_profile()
    })

    DOM.ev(DOM.el(`#profile_editor_close`), `click`, () => {
      App.hide_window()
    })

    let color_select = DOM.el(`#profile_editor_color`)
    let colors = [`none`, ...Object.keys(App.colors)]

    for (let color of colors) {
      let option = DOM.create(`option`)
      option.value = color
      option.textContent = App.capitalize(color)
      color_select.append(option)
    }
  },
  colored_top: true})
}

App.show_profile_editor = (item) => {
  let items = App.get_active_items(item.mode, item)

  if (items.length === 0) {
    return
  }

  App.profile_editor_items = []

  for (let it of items) {
    App.profile_editor_items.push(App.soft_copy_item(it))
  }

  let remove = DOM.el(`#profile_editor_remove`)
  let save = DOM.el(`#profile_editor_save`)
  let profile, single

  if (items.length === 1) {
    profile = App.get_profile(item.url)
    DOM.el(`#profile_editor_title_container`).classList.remove(`hidden`)
    single = true
  }
  else {
    DOM.el(`#profile_editor_title_container`).classList.add(`hidden`)
    single = false
  }

  if (single) {
    if (profile) {
      save.textContent = `Update`
      DOM.el(`#profile_editor_title`).value = profile.title
      DOM.el(`#profile_editor_tags`).value = profile.tags.join(`\n`)
      DOM.el(`#profile_editor_color`).value = profile.color
      remove.classList.remove(`hidden`)
    }
    else {
      save.textContent = `Save`
      DOM.el(`#profile_editor_title`).value = ``
      DOM.el(`#profile_editor_tags`).value = ``
      DOM.el(`#profile_editor_color`).value = `none`
      remove.classList.add(`hidden`)
    }
  }
  else {
    save.textContent = `Save`
    DOM.el(`#profile_editor_tags`).value = ``
    DOM.el(`#profile_editor_color`).value = `none`
    remove.classList.remove(`hidden`)
  }

  App.show_window(`profile_editor`)
  DOM.el(`#profile_editor_tags`).focus()
}

App.profile_editor_save = () => {
  if (App.profile_editor_items.length === 0) {
    return
  }

  let title = DOM.el(`#profile_editor_title`).value.trim()
  let color = DOM.el(`#profile_editor_color`).value
  let tags = App.single_linebreak(DOM.el(`#profile_editor_tags`).value.trim()).split(`\n`)

  if (color === `none`) {
    color = ``
  }

  let c_tags = []

  for (let tag of tags) {
    if (!tag) {
      continue
    }

    let t = tag.toLowerCase().trim()

    if (!c_tags.includes(t)) {
      c_tags.push(t)
    }
  }

  c_tags.sort()
  let single = App.profile_editor_items.length === 1
  let urls = []

  if (single) {
    let item = App.profile_editor_items[0]
    App.profiles = App.profiles.filter(x => x.url !== item.url)
    App.profiles.unshift({url: item.url, title: title, tags: c_tags.slice(0), color: color})
    urls.push(item.url)
  }
  else {
    for (let item of App.profile_editor_items) {
      let profile = App.get_profile(item.url)

      if (profile) {
        let n_tags = []

        for (let tag of c_tags) {
          if (!tag) {
            continue
          }

          if (!n_tags.includes(tag)) {
            n_tags.push(tag)
          }
        }

        n_tags.sort()

        for (let tag of profile.tags) {
          if (!tag) {
            continue
          }

          if (!n_tags.includes(tag)) {
            n_tags.push(tag)
          }
        }

        App.profiles = App.profiles.filter(x => x.url !== profile.url)
        App.profiles.unshift({url: profile.url, title: profile.title, tags: n_tags.slice(0), color: color})
        urls.push(profile.url)
      }
      else {
        App.profiles = App.profiles.filter(x => x.url !== item.url)
        App.profiles.unshift({url: item.url, title: ``, tags: c_tags.slice(0), color: color})
        urls.push(item.url)
      }
    }
  }

  if (App.profiles.length > App.max_profiles) {
    App.profiles = App.profiles.slice(0, App.max_profiles)
  }

  App.clean_profiles()
  App.stor_save_profiles()
  App.hide_window()

  for (let url of urls) {
    App.apply_profiles(url)
  }
}

App.remove_profile = () => {
  let items = App.profile_editor_items

  App.show_confirm(`Remove profiles? (${items.length})`, () => {
    for (let item of items) {
      App.profiles = App.profiles.filter(x => x.url !== item.url)
      App.apply_profiles(item.url)
    }

    App.stor_save_profiles()
    App.hide_window()
  }, undefined, !App.get_setting(`warn_on_remove_profiles`))
}

App.apply_profiles = (url) => {
  for (let item of App.get_items(App.active_mode)) {
    if (item.url === url) {
      App.update_item(App.active_mode, item.id, {})
      return
    }
  }
}

App.get_profile = (item_url) => {
  for (let profile of App.profiles) {
    if (item_url === profile.url) {
      return profile
    }
  }
}

App.get_profile_items = () => {
  let items = []

  items.push({
    text: `Export`,
    action: () => {
      App.export_profiles()
    }
  })

  items.push({
    text: `Import`,
    action: () => {
      App.import_profiles()
    }
  })

  items.push({
    text: `Remove`,
    get_items: () => {
      return App.clear_profiles_items()
    }
  })

  return items
}

App.export_profiles = () => {
  App.export_data(App.profiles)
}

App.import_profiles = () => {
  App.import_data((json) => {
    App.profiles = json
    App.check_profiles()
    App.stor_save_profiles()
    App.show_mode(App.active_mode)
  })
}

App.check_profiles = () => {
  let changed = false

  for (let profile of App.profiles) {
    if (profile.url === undefined) {
      profile.url = `https://empty.profile`
      changed = true
    }

    if (profile.tags === undefined) {
      profile.tags = []
      changed = true
    }

    if (profile.title === undefined) {
      profile.title = ``
      changed = true
    }

    if (profile.color === undefined) {
      profile.color = ``
      changed = true
    }
  }

  if (changed) {
    App.stor_save_profiles()
  }
}

App.get_tags = () => {
  let tags = []

  for (let profile of App.profiles) {
    for (let tag of profile.tags) {
      if (tag && !tags.includes(tag)) {
        tags.push(tag)
      }
    }
  }

  return tags.slice(0, App.max_tag_filters)
}

App.get_tag_items = (mode) => {
  let items = []
  let tags = App.get_tags()

  if (tags.length === 0) {
    items.push({
      text: `No tags yet`,
      action: () => {}
    })
  }
  else {
    for (let tag of tags) {
      items.push({
        text: tag,
        action: () => {
          App.set_filter_mode(mode, `all`, false)
          App.set_filter(mode, `tag: ${tag}`)
        }
      })
    }
  }

  return items
}

App.get_color_items = (mode) => {
  let items = []

  for (let color in App.colors) {
    items.push({
      text: App.capitalize(color),
      action: () => {
        App.set_filter_mode(mode, `all`, false)
        App.set_filter(mode, `color: ${color}`)
      }
    })
  }

  return items
}

App.clear_profiles_items = () => {
  let items = []

  for (let color in App.colors) {
    items.push({
      text: `Remove ${App.capitalize(color)}`,
      action: () => {
        App.remove_color(color)
      }
    })
  }

  items.push({
    text: `Remove All Colors`,
    action: () => {
      App.remove_all_colors()
    }
  })

  items.push({
    text: `Remove All Tags`,
    action: () => {
      App.remove_all_tags()
    }
  })

  items.push({
    text: `Remove All`,
    action: () => {
      App.remove_all_profiles()
    }
  })

  return items
}

App.remove_color = (color) => {
  let profiles = []

  for (let profile of App.profiles) {
    if (profile.color === color) {
      profiles.push(profile)
    }
  }

  if (profiles.length === 0) {
    return
  }

  if (profiles.length === 0) {
    App.show_alert(`No profiles found`)
    return
  }

  App.show_confirm(`Remove ${color}? (${profiles.length})`, () => {
    for (let profile of profiles) {
      profile.color = ``
    }

    App.after_profile_remove()
  })
}

App.remove_all_colors = () => {
  let profiles = []

  for (let profile of App.profiles) {
    if (profile.color) {
      profiles.push(profile)
    }
  }

  if (profiles.length === 0) {
    return
  }

  App.show_confirm(`Remove all colors? (${profiles.length})`, () => {
    for (let profile of App.profiles) {
      profile.color = ``
    }

    App.after_profile_remove()
  })
}

App.remove_all_tags = () => {
  let tags = App.get_tags()

  if (tags.length === 0) {
    return
  }

  App.show_confirm(`Remove all tags? (${tags.length})`, () => {
    for (let profile of App.profiles) {
      profile.tags = []
    }

    App.after_profile_remove()
  })
}

App.remove_all_profiles = () => {
  if (App.profiles.length === 0) {
    return
  }

  App.show_confirm(`Remove all profiles? (${App.profiles.length})`, () => {
    App.profiles = []
    App.after_profile_remove()
  })
}

App.after_profile_remove = () => {
  App.clean_profiles()
  App.stor_save_profiles()
  App.show_mode(App.active_mode)
}

App.clean_profiles = () => {
  let c_profiles = []

  for (let profile of App.profiles) {
    if (profile.title || profile.tags.length || profile.color) {
      c_profiles.push(profile)
    }
  }

  App.profiles = c_profiles
}