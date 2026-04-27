App.get_tab_value = async (tab_id, key) => {
  let ext_api = App.browser()

  // Firefox handles this natively
  if (ext_api.sessions && ext_api.sessions.getTabValue) {
    return await ext_api.sessions.getTabValue(tab_id, key)
  }

  // Chrome requires session storage
  if (ext_api.storage && ext_api.storage.session) {
    let storage_key = `tab_${tab_id}_${key}`
    let result = await ext_api.storage.session.get(storage_key)
    return result[storage_key]
  }

  return undefined
}

App.set_tab_value = async (tab_id, key, value) => {
  let ext_api = App.browser()

  if (ext_api.sessions && ext_api.sessions.setTabValue) {
    await ext_api.sessions.setTabValue(tab_id, key, value)
  }

  else if (ext_api.storage && ext_api.storage.session) {
    let storage_key = `tab_${tab_id}_${key}`
    await ext_api.storage.session.set({[storage_key]:value})
  }
}

App.remove_tab_value = async (tab_id, key) => {
  let ext_api = App.browser()

  if (ext_api.sessions && ext_api.sessions.removeTabValue) {
    await ext_api.sessions.removeTabValue(tab_id, key)
  }

  else if (ext_api.storage && ext_api.storage.session) {
    let storage_key = `tab_${tab_id}_${key}`
    await ext_api.storage.session.remove(storage_key)
  }
}

App.load_session = async (item, create = true) => {
  if (item.session_loaded) {
    return
  }

  let keys = Object.keys(App.edit_props)

  let promises = keys.map(async (key) => {
    try {
      let value = await App.get_tab_value(item.id, `custom_${key}`)

      if (value !== undefined || force) {
        App.apply_edit({what: key, item, value})
      }
    }
    catch (err) {
      //
    }

    await Promise.all(promises)
    item.session_loaded = true

    if (item.element_ready) {
      App.refresh_item_element(item)
    }
  })

  if (create) {
    if (!item.element_ready) {
      App.create_item_element(item)
    }
  }
}