App.get_tab_value = async (tab_id, key) => {
  let ext_api = App.browser()
  let grasshopper = await ext_api.sessions.getTabValue(tab_id, `grasshopper`)

  if (grasshopper) {
    return grasshopper[key]
  }

  return undefined
}

App.set_tab_value = async (tab_id, key, value) => {
  let ext_api = App.browser()
  let grasshopper = await ext_api.sessions.getTabValue(tab_id, `grasshopper`)

  if (!grasshopper) {
    grasshopper = {}
  }

  grasshopper[key] = value
  await ext_api.sessions.setTabValue(tab_id, `grasshopper`, grasshopper)
}

App.remove_tab_value = async (tab_id, key) => {
  let ext_api = App.browser()
  let grasshopper = await ext_api.sessions.getTabValue(tab_id, `grasshopper`)

  if (grasshopper && (grasshopper[key] !== undefined)) {
    delete grasshopper[key]
    await ext_api.sessions.setTabValue(tab_id, `grasshopper`, grasshopper)
  }
}

App.load_session = async (item, force = false) => {
  let created = false

  if (!item.element_ready) {
    App.create_item_element(item)
    created = true
  }

  if (item.session_loaded || (item.mode !== `tabs`)) {
    return
  }

  let keys = Object.keys(App.edit_props)
  let ext_api = App.browser()
  let grasshopper = await ext_api.sessions.getTabValue(item.id, `grasshopper`)

  if (!grasshopper) {
    grasshopper = {}
    let needs_migration = false

    let promises = keys.map(async (key) => {
      let legacy_key = `custom_${key}`
      let value = undefined

      try {
        value = await ext_api.sessions.getTabValue(item.id, legacy_key)

        if (value !== undefined) {
          await ext_api.sessions.removeTabValue(item.id, legacy_key)
        }

        if (value !== undefined) {
          grasshopper[key] = value
          needs_migration = true
        }
      }
      catch (err) {
        //
      }
    })

    await Promise.all(promises)

    if (needs_migration) {
      try {
        await ext_api.sessions.setTabValue(item.id, `grasshopper`, grasshopper)
      }
      catch (err) {
        App.error(err)
      }

      App.log(`Tab values migrated`)
    }
  }

  for (let key of keys) {
    let value = grasshopper[key]

    if ((value !== undefined) || force) {
      App.apply_edit({what: key, item, value})
    }
  }

  item.session_loaded = true

  if (!created) {
    App.refresh_item_element(item)
  }
}