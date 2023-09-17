App.create_menubutton = (args = {}) => {
  let def_args = {
    wrap: true,
  }

  args = Object.assign(def_args, args)

  if (!args.button) {
    args.button = DOM.create(`div`, `menubutton button`, args.id)
  }

  args.container = DOM.create(`div`, `menubutton_container`)
  let prev = DOM.create(`div`, `button`)
  prev.textContent = `<`
  let next = DOM.create(`div`, `button`)
  next.textContent = `>`

  DOM.ev(args.button, `click`, () => {
    let items = []

    for (let opt of args.opts) {
      if (opt.text === App.separator_string) {
        App.sep(items)
        continue
      }

      items.push({
        icon: opt.icon,
        text: opt.text,
        info: opt.info,
        image: opt.image,
        action: () => {
          App.menubutton_set_text(args, opt)

          if (args.on_change) {
            args.on_change(args, opt)
          }
        },
      })
    }

    NeedContext.show_on_element(args.button, items, true, args.button.clientHeight)
  })

  args.set = (value, on_change = true) => {
    let opt = App.menubutton_opt(args, value)
    App.menubutton_set_text(args, opt)

    if (on_change && args.on_change) {
      args.on_change(args, opt)
    }
  }

  args.prev = () => {
    App.menubutton_cycle(args, `prev`)
  }

  args.next = () => {
    App.menubutton_cycle(args, `next`)
  }

  if (args.selected) {
    for (let opt of args.opts) {
      if (args.selected === opt.value) {
        App.menubutton_set_text(args, opt)
        break
      }
    }
  }

  DOM.ev(prev, `click`, args.prev)
  DOM.ev(next, `click`, args.next)
  args.container.append(prev)
  args.container.append(next)
  args.button.after(args.container)
  prev.after(args.button)
  return args
}

App.menubutton_set_text = (args, opt) => {
  if (opt.icon) {
    args.button.innerHTML = `<div>` + (opt.icon || ``) + `</div>` + opt.text
  }
  else {
    args.button.textContent = opt.text
  }

  args.value = opt.value
}

App.menubutton_cycle = (args, dir) => {
  let waypoint = false
  let opts = args.opts.slice(0)

  if (dir === `prev`) {
    opts.reverse()
  }

  let opt

  if (args.wrap) {
    opt = opts[0]
  }

  for (let o of opts) {
    if (o.text === App.separator_string) {
      continue
    }

    if (waypoint) {
      opt = o
      break
    }

    if (o.value === args.value) {
      waypoint = true
    }
  }

  if (opt) {
    App.menubutton_set_text(args, opt)

    if (args.on_change) {
      args.on_change(args, opt)
    }
  }
}

App.menubutton_opt = (args, value) => {
  for (let opt of args.opts) {
    if (opt.value === value) {
      return opt
    }
  }
}