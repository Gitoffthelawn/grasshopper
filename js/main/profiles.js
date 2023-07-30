App.setup_profile_editor = () => {
  App.create_window({id: `profile_editor`, setup: () => {
    DOM.ev(DOM.el(`#profile_editor_save`), `click`, () => {
      App.profile_editor_save()
    })

    DOM.ev(DOM.el(`#profile_editor_remove`), `click`, () => {
      App.profile_editor_remove()
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
  let active = App.get_active_items(item.mode, item)

  if (active.length === 0) {
    return
  }

  App.profile_editor_items = []

  for (let it of active) {
    App.profile_editor_items.push(App.soft_copy_item(it))
  }

  let items = App.profile_editor_items
  let [profiles, added] = App.get_profiles(items)
  App.profile_editor_profiles = profiles
  App.profile_editor_added = added
  App.show_window(`profile_editor`)
  App.profile_editor_shared_tags = undefined
  App.profile_editor_shared_color = undefined

  if (profiles.length) {
    if ((profiles.length > 1) && (profiles.length === items.length)) {
      App.profile_editor_shared_tags = App.get_shared_tags(profiles).join(`\n`)
      App.profile_editor_shared_color = App.get_shared_color(profiles)
    }

    DOM.el(`#profile_editor_remove`).classList.remove(`hidden`)
  }
  else {
    DOM.el(`#profile_editor_remove`).classList.add(`hidden`)
  }

  if (items.length === 1) {
    DOM.el(`#profile_editor_header`).textContent = `Editing 1 Profile`
    DOM.el(`#profile_editor_title_container`).classList.remove(`hidden`)

    if (profiles.length) {
      let profile = profiles[0]
      DOM.el(`#profile_editor_tags`).value = profile.tags.join(`\n`)
      DOM.el(`#profile_editor_title`).value = profile.title
      DOM.el(`#profile_editor_color`).value = profile.color || `none`
    }
    else {
      DOM.el(`#profile_editor_tags`).value = ``
      DOM.el(`#profile_editor_title`).value = ``
      DOM.el(`#profile_editor_color`).value = `none`
    }
  }
  else {
    DOM.el(`#profile_editor_title_container`).classList.add(`hidden`)
    DOM.el(`#profile_editor_header`).textContent = `Editing ${items.length} Profiles`
    DOM.el(`#profile_editor_tags`).value = App.profile_editor_shared_tags || ``
    DOM.el(`#profile_editor_title`).value = ``
    DOM.el(`#profile_editor_color`).value = App.profile_editor_shared_color || `none`
  }

  DOM.el(`#profile_editor_tags`).focus()
}

App.profile_editor_save = () => {
  let items = App.profile_editor_items

  if (items.length === 0) {
    return
  }

  let force = App.check_force(undefined, items.length)

  App.show_confirm(`Save profiles? (${items.length})`, () => {
    App.do_profile_editor_save()
  }, undefined, force)
}

App.do_profile_editor_save = () => {
  let title = DOM.el(`#profile_editor_title`).value.trim()
  let color = DOM.el(`#profile_editor_color`).value
  let tags = App.single_linebreak(DOM.el(`#profile_editor_tags`).value.trim()).split(`\n`)
  let single = App.profile_editor_items.length === 1

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
  let urls = []

  // Added
  if (App.profile_editor_added.length) {
    for (let item of App.profile_editor_added) {
      let obj = {url: item.url, tags: c_tags.slice(0), title: title, color: color}
      App.profiles = App.profiles.filter(x => x.url !== item.url)

      if (App.used_profile(obj)) {
        App.profiles.unshift(obj)
      }

      urls.push(item.url)
    }
  }

  // Edited
  if (App.profile_editor_profiles.length) {
    for (let profile of App.profile_editor_profiles) {
      let n_tags = []

      for (let tag of c_tags) {
        if (!tag) {
          continue
        }

        if (!n_tags.includes(tag)) {
          n_tags.push(tag)
        }
      }

      let m_tags = []

      for (let tag of profile.tags) {
        if (!tag) {
          continue
        }

        // If shared tag is removed don't include it
        if (App.profile_editor_shared_tags) {
          if (App.profile_editor_shared_tags.includes(tag)) {
            if (!n_tags.includes(tag)) {
              continue
            }
          }
        }

        if (!n_tags.includes(tag) && !m_tags.includes(tag)) {
          tag = tag.toLowerCase().trim()
          m_tags.push(tag)
        }
      }

      n_tags.push(...m_tags)
      n_tags.sort()
      let c_title = profile.title

      if (single) {
        c_title = title
      }

      let obj = {url: profile.url, tags: n_tags.slice(0), title: c_title, color: color}
      App.profiles = App.profiles.filter(x => x.url !== profile.url)

      if (App.used_profile(obj)) {
        App.profiles.unshift(obj)
      }

      urls.push(profile.url)
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

  App.refresh_profile_filters()
}

App.profile_editor_remove = () => {
  let items = App.profile_editor_items

  if (items.length === 0) {
    return
  }

  let profiles = App.profile_editor_profiles
  let force = App.check_force(`warn_on_remove_profiles`, profiles.length)

  App.show_confirm(`Remove profiles? (${profiles.length})`, () => {
    for (let profile of profiles) {
      App.profiles = App.profiles.filter(x => x.url !== profile.url)
      App.apply_profiles(profile.url)
    }

    App.stor_save_profiles()
    App.hide_window()
    App.refresh_profile_filters()
  }, undefined, force)
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

App.get_profiles = (items) => {
  let profiles = []
  let add = []

  for (let item of items) {
    let has_profile = false

    for (let profile of App.profiles) {

      if (item.url === profile.url) {
        profiles.push(profile)
        has_profile = true
        break
      }
    }

    if (!has_profile) {
      add.push(item)
    }
  }

  return [profiles, add]
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

  return tags
}

App.get_tag_items = (mode, action = `filter`) => {
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
          if (action === `filter`) {
            App.set_custom_filter_mode(mode, `tag_${tag}`, tag)
          }
          else if (action === `remove`) {
            App.remove_tag(tag)
          }
        }
      })

      if (items.length >= App.max_tag_filters) {
        break
      }
    }
  }

  return items
}

App.get_color_items = (mode, action = `filter`) => {
  let items = []
  let count = App.get_profile_count()

  if (!count.colors) {
    items.push({
      text: `No colors yet`,
      action: () => {}
    })

    return items
  }

  for (let color in App.colors) {
    if (!count[color]) {
      continue
    }

    items.push({
      text: App.capitalize(color),
      action: () => {
        if (action === `filter`) {
          App.set_custom_filter_mode(mode, `color_${color}`, App.capitalize(color))
        }
        else {
          App.remove_color(color)
        }
      }
    })
  }

  return items
}

App.clear_profiles_items = () => {
  let items = []

  if (!App.profiles.length) {
    items.push({
      text: `No profiles yet`,
      action: () => {}
    })

    return items
  }

  let count = App.get_profile_count()

  if (count.colors) {
    items.push({
      text: `Remove Color`,
      get_items: () => {
        return App.get_color_items(App.active_mode, `remove`)
      }
    })

    items.push({
      text: `Remove All Colors`,
      action: () => {
        App.remove_all_colors()
      }
    })
  }

  if (count.tags) {
    items.push({
      text: `Remove Tag`,
      get_items: () => {
        return App.get_tag_items(App.active_mode, `remove`)
      }
    })

    items.push({
      text: `Remove All Tags`,
      action: () => {
        App.remove_all_tags()
      }
    })
  }

  if (App.profiles.length) {
    items.push({
      text: `Remove All`,
      action: () => {
        App.remove_all_profiles()
      }
    })
  }

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

App.remove_tag = (name) => {
  App.show_confirm(`Remove tag? (${name})`, () => {
    for (let profile of App.profiles) {
      if (profile.tags.includes(name)) {
        profile.tags = profile.tags.filter(tag => tag !== name)
      }
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

App.used_profile = (profile) => {
  if (profile.title || profile.tags.length || profile.color) {
    return true
  }

  return false
}

App.clean_profiles = () => {
  let c_profiles = []

  for (let profile of App.profiles) {
    if (App.used_profile(profile)) {
      c_profiles.push(profile)
    }
  }

  App.profiles = c_profiles
}

App.get_shared_tags = (profiles) => {
  let arrays = profiles.map(obj => obj.tags)

  let shared = arrays.reduce((common, current) => {
    return common.filter(value => current.includes(value))
  })

  return shared
}

App.get_shared_color = (profiles) => {
  let first = profiles[0].color

  for (let profile of profiles) {
    if (profile.color !== first) {
      return ``
    }
  }

  return first
}

App.get_profile_count = () => {
  let count = {}
  count.colors = 0
  count.tags = 0

  for (let profile of App.profiles) {
    if (profile.color) {
      if (!count[profile.color]) {
        count[profile.color] = 0
      }

      count[profile.color] += 1
      count.colors += 1
    }

    if (profile.tags.length) {
      count.tags += 1
    }
  }

  return count
}

App.refresh_profile_filters = () => {
  let mode = App.active_mode
  let filter_mode = App.filter_mode(mode)

  if (filter_mode === `edited` || filter_mode.startsWith(`tag_`) || filter_mode.startsWith(`color_`)) {
    App.filter(mode)
    return
  }
}