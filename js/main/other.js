App.check_first_time = () => {
  if (!App.first_time.date) {
    App.show_alert_2(`Hi there. The main menu is the top-left button. Check the settings for some customizations`)
    App.first_time.date = Date.now()
    App.stor_save_first_time()
  }
}

App.restart_extension = () => {
  browser.runtime.reload()
}

App.print_intro = () => {
  let d = Date.now()
  let s = String.raw`
//_____ __
@ )====// .\___
\#\_\__(_/_\\_/
  / /       \\
`
  App.log(s.trim(), `green`)
  App.log(`Starting ${App.manifest.name} v${App.manifest.version}`)
  App.log(`${App.nice_date(d, true)} | ${d}`)
}

App.show_custom_menu = (e, what) => {
  let items = App.custom_menu_items(`${what}_menu`)
  NeedContext.show(e.clientX, e.clientY, items)
  e.preventDefault()
}

App.custom_menu_items = (name) => {
  let items = []
  let menu = App.get_setting(name)

  if (!menu.length) {
    return items
  }

  for (let obj of menu) {
    let c = App.get_command(obj.cmd)

    if (!c) {
      continue
    }

    items.push({
      text: c.name,
      action: () => {
        App.run_command({cmd: c.cmd, from: name})
      }
    })
  }

  return items
}