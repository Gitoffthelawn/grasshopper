App.setup_theme = () => {
  App.colorlib = ColorLib()
  App.start_theme_interval(`auto_theme`)
  App.start_theme_interval(`auto_background`)
}

App.start_theme_interval = (setting) => {
  clearInterval(App[`${setting}_interval`])
  let sett = App.get_setting(setting)

  if (sett === `never` || sett === `domain`) {
    return
  }

  let delay = App.parse_delay(sett)

  if (!delay) {
    return
  }

  if (delay > 0) {
    App[`${setting}_interval`] = setInterval(() => {
      let sett = App.get_setting(setting)

      if (sett === `never` || sett === `domain`) {
        clearInterval(App[`${setting}_interval`])
        return
      }

      if (setting === `auto_theme`) {
        App.random_theme()
      }
      else if (setting === `auto_background`) {
        App.auto_background_action()
      }
    }, delay)

    App.log(`Started ${setting} interval: ${sett}`, `debug`)
  }
}

App.auto_background_action = () => {
  let mode = App.get_setting(`auto_background_mode`)

  if (mode === `pool`) {
    App.background_from_pool()
  }
  else if (mode === `random`) {
    App.random_background()
  }
  else if (mode === `pool_random`) {
    let n = App.random_int(0, 1)

    if (n === 0) {
      App.background_from_pool(true)
    }
    else {
      App.random_background()
    }
  }
}

App.apply_theme = (args) => {
  App.log(`Apply Theme`, `debug`)

  let def_args = {
    check: false,
    safe_mode: false,
  }

  args = Object.assign(def_args, args)

  try {
    if (!args.background_color) {
      args.background_color = App.get_setting(`background_color`)
    }

    if (!args.text_color) {
      args.text_color = App.get_setting(`text_color`)
    }

    if (!args.background_image) {
      args.background_image = App.get_setting(`background_image`)
    }

    if (args.check) {
      if (args.background_color === App.last_background_color && args.text_color === App.last_text_color &&
        (args.background_image && (args.background_image === App.last_background_image))) {
        return
      }
    }

    App.last_background_color = args.background_color
    App.last_text_color = args.text_color
    let bg_image_changed = App.last_background_image !== args.background_image
    App.last_background_image = args.background_image
    App.set_css_var(`background_color`, args.background_color)
    App.set_css_var(`text_color`, args.text_color)
    let main_background = App.colorlib.rgb_to_rgba(args.background_color, 0.93)
    App.set_css_var(`main_background`, main_background)
    let alt_color_0 = App.colorlib.rgb_to_rgba(args.text_color, 0.15)
    App.set_css_var(`alt_color_0`, alt_color_0)
    let alt_color_1 = App.colorlib.rgb_to_rgba(args.text_color, 0.20)
    App.set_css_var(`alt_color_1`, alt_color_1)
    let alt_color_2 = App.colorlib.rgb_to_rgba(args.text_color, 0.50)
    App.set_css_var(`alt_color_2`, alt_color_2)
    let alt_background = App.colorlib.rgb_to_rgba(args.background_color, 0.55)
    App.set_css_var(`alt_background`, alt_background)
    let alt_background_2 = App.colorlib.get_lighter_or_darker(args.background_color, 0.06)
    App.set_css_var(`alt_background_2`, alt_background_2)

    if (args.safe_mode) {
      return
    }

    App.set_css_var(`font_size`, App.get_setting(`font_size`) + `px`)
    App.set_css_var(`font`, `${App.get_setting(`font`)}, sans-serif`)
    let w = `${(App.get_setting(`width`) / 100) * 800}px`
    App.set_css_var(`width`, w)
    let h = `${(App.get_setting(`height`) / 100) * 600}px`
    App.set_css_var(`height`, h)
    let item_height = 2.15
    let height_diff = 0.45

    if (App.get_setting(`item_height`) === `compact`) {
      item_height -= height_diff
    }
    else if (App.get_setting(`item_height`) === `bigger`) {
      item_height += height_diff
    }
    else if (App.get_setting(`item_height`) === `huge`) {
      item_height += (height_diff * 2)
    }

    if (App.get_setting(`text_mode`).includes(`_`)) {
      item_height += 1
    }

    App.set_css_var(`item_height`, `${item_height}rem`)

    if (bg_image_changed) {
      App.animate_background_image(args.background_image)
    }

    if (App.get_setting(`show_scrollbars`)) {
      document.body.classList.remove(`no_scrollbars`)
    }
    else {
      document.body.classList.add(`no_scrollbars`)
    }

    let main = DOM.el(`#main`)

    if (App.get_setting(`show_footer`)) {
      main.classList.remove(`hide_footer`)
    }
    else {
      main.classList.add(`hide_footer`)
    }

    if (App.get_setting(`show_scroller`)) {
      main.classList.remove(`hide_scroller`)
    }
    else {
      main.classList.add(`hide_scroller`)
    }

    let item_border_opts = [`normal`, `bigger`, `huge`]

    for (let b of item_border_opts) {
      main.classList.remove(`item_border_${b}`)
    }

    let item_border = App.get_setting(`item_border`)

    if (item_border_opts.includes(item_border)) {
      main.classList.add(`item_border_${item_border}`)
    }

    let all = DOM.el(`#all`)

    let bg_effect_opts = [`blur`, `grayscale`, `invert`, `rotate_1`, `rotate_2`, `rotate_3`]
    let bg_effect = App.get_setting(`background_effect`)

    for (let eff of bg_effect_opts) {
      all.classList.remove(`background_effect_${eff}`)
    }

    if (bg_effect_opts.includes(bg_effect)) {
      all.classList.add(`background_effect_${bg_effect}`)
    }

    let bg_tiles = App.get_setting(`background_tiles`)

    if (bg_tiles !== `none`) {
      App.set_css_var(`background_tile_width`, bg_tiles)
      all.classList.add(`background_tiles`)
    }
    else {
      all.classList.remove(`background_tiles`)
    }

    if (App.get_setting(`color_transitions`)) {
      App.set_css_var(`color_transition`, `background-color 1400ms, color 800ms`)
    }
    else {
      App.set_css_var(`color_transition`, `none`)
    }

    if (App.get_setting(`rounded_corners`)) {
      App.set_css_var(`border_radius`, `3px`)
      App.set_css_var(`border_radius_2`, `20px`)
    }
    else {
      App.set_css_var(`border_radius`, `0`)
      App.set_css_var(`border_radius_2`, `0`)
    }

    let hover_opts = [`glow`, `underline`, `bold`, `bigger`]
    let hover_effect = App.get_setting(`hover_effect`)

    for (let eff of hover_opts) {
      main.classList.remove(`hover_effect_${eff}`)
    }

    if (hover_opts.includes(hover_effect)) {
      main.classList.add(`hover_effect_${hover_effect}`)
    }

    let selected_opts = [`background`, `underline`, `bold`, `bigger`]
    let selected_effect = App.get_setting(`selected_effect`)

    for (let eff of selected_opts) {
      main.classList.remove(`selected_effect_${eff}`)
    }

    if (selected_opts.includes(selected_effect)) {
      main.classList.add(`selected_effect_${selected_effect}`)
    }
  }
  catch (err) {
    App.log(err, `error`)
    App.theme_safe_mode()
  }
}

App.theme_safe_mode = () => {
  App.apply_theme({
    background_color: `rgb(33, 33, 33)`,
    text_color: `rgb(222, 222, 222)`,
    check: false,
    safe_mode: true,
  })

  if (!App.theme_safe_mode_msg) {
    App.show_alert_2(`Theme settings are invalid. Using safe mode`)
    App.theme_safe_mode_msg = true
  }
}

App.set_css_var = (name, value) => {
  document.documentElement.style.setProperty(`--${name}`, value)
}

App.dark_theme = () => {
  App.set_theme(App.dark_theme_colors.background, App.dark_theme_colors.text)
}

App.light_theme = () => {
  App.set_theme(App.light_theme_colors.background, App.light_theme_colors.text)
}

App.random_theme = () => {
  let c1, c2
  let type = App.get_color_type()

  if (type === `light`) {
    c1 = App.colorlib.get_light_color()
  }
  else if (type === `dark`) {
    c1 = App.colorlib.get_dark_color()
  }

  c2 = App.colorlib.get_lighter_or_darker(c1, App.color_contrast)
  c1 = App.colorlib.hex_to_rgb(c1)
  c2 = App.colorlib.hex_to_rgb(c2)
  App.set_theme(c1, c2)
}

App.set_theme = (c1, c2) => {
  App.set_setting(`background_color`, c1)
  App.set_setting(`text_color`, c2)

  if (App.window_mode === `profile_editor`) {
    // Don't apply theme
  }
  else {
    App.apply_theme({background_color: c1, text_color: c2, check: true})
  }

  App.check_theme_refresh()
}

App.set_default_theme = () => {
  let background = App.get_setting(`background_color`)
  let text = App.get_setting(`text_color`)
  App.apply_theme({background_color: background, text_color: text, check: true})
}

App.set_color_auto = (background, text, background_image) => {
  if (background) {
    background = App.parse_color(background)
  }

  if (!text) {
    if (background) {
      text = App.colorlib.get_lighter_or_darker(background, App.color_contrast)
    }
  }
  else {
    text = App.parse_color(text)
  }

  App.apply_theme({background_color: background,
    text_color: text, background_image: background_image, check: true})
}

App.parse_color = (color) => {
  color = color.toLowerCase()

  if (color.startsWith(`rgb`)) {
    // Do nothing
  }
  else if (color.startsWith(`#`)) {
    try {
      color = App.colorlib.hex_to_rgb(color)
    }
    catch (err) {
      return
    }
  }
  else {
    let c = App.color_names[color]

    if (c) {
      color = App.colorlib.hex_to_rgb(c)
    }
    else {
      return
    }
  }

  return color
}

App.random_background = async () => {
  let history_1 = await App.get_history(`.jpg`)
  let history_2 = await App.get_history(`.png`)
  let history_3 = []

  if (App.get_setting(`random_background_gifs`)) {
    history_3 = await App.get_history(`.gif`)
  }

  let history = [...history_1, ...history_2, ...history_3]
  App.shuffle_array(history)

  for (let h of history) {
    if (App.is_image(h.url)) {
      App.apply_background(h.url)
      break
    }
  }
}

App.apply_background = (url) => {
  App.set_setting(`background_image`, url)
  App.apply_theme()
  App.check_theme_refresh()
}

App.change_background = (url) => {
  App.set_setting(`background_image`, url)
  App.apply_theme()
  App.check_theme_refresh()
}

App.add_to_background_pool = (url) => {
  if (!url) {
    url = App.get_setting(`background_image`)
  }

  let pool = App.get_setting(`background_pool`)

  if (!pool.includes(url)) {
    pool.push(url)

    if (pool.length > App.background_pool_max) {
      pool = pool.slice(0 - App.background_pool_max)
    }

    App.set_setting(`background_pool`, pool)
    App.check_theme_refresh()
  }
}

App.check_theme_refresh = () => {
  if (App.on_settings()) {
    if (App.settings_category === `theme`) {
      App.refresh_theme_settings()
    }
  }
}

App.refresh_theme_settings = () => {
  App.background_color.setColor(App.get_setting(`background_color`))
  App.text_color.setColor(App.get_setting(`text_color`))
  DOM.el(`#settings_background_image`).value = App.get_setting(`background_image`)
  DOM.el(`#settings_background_pool`).value = App.get_textarea_setting_value(`background_pool`)
}

App.seeded_theme = (item) => {
  let url = item.hostname || item.path
  let hc = App.hostname_colors[url]
  let background

  if (hc) {
    App.set_color_auto(hc)
    return
  }

  let rand = App.seeded_random(url)
  let type = App.get_color_type(rand)

  if (type === `dark`) {
    background = App.colorlib.get_dark_color(rand)
  }
  else if (type === `light`) {
    background = App.colorlib.get_light_color(rand)
  }

  App.hostname_colors[url] = background
  App.set_color_auto(background)
}

App.check_item_theme_debouncer = App.create_debouncer(() => {
  App.do_check_item_theme()
}, App.check_item_theme_delay)

App.check_item_theme = () => {
  App.check_item_theme_debouncer.call()
}

App.do_check_item_theme = () => {
  App.check_item_theme_debouncer.cancel()
  let item = App.get_active_tab_item()

  if (!item || !item.path) {
    App.set_default_theme()
    return
  }

  if (item.theme_enabled) {
    App.set_color_auto(item.background_color, item.text_color, item.background_image)
    return
  }

  if (App.get_setting(`auto_theme`) === `domain`) {
    App.seeded_theme(item)
    return
  }

  App.set_default_theme()
}

App.get_color_type = (rand) => {
  let types = []
  let type = App.get_setting(`random_themes`)

  if (type === `dark` || type === `both`) {
    types.push(`dark`)
  }

  if (type === `light` || type === `both`) {
    types.push(`light`)
  }

  if (types.length === 0) {
    return
  }

  return App.random_choice(types, rand)
}

App.background_from_pool = (random = false) => {
  let bi = App.get_setting(`background_image`)
  let next_image
  let waypoint = false
  let images = App.get_setting(`background_pool`)

  if (images.length === 0) {
    return
  }

  if (random) {
    let choices = images.filter(x => x !== bi)

    if (choices.length > 0) {
      next_image = App.random_choice(choices)
    }
  }
  else {
    for (let image of images) {
      if (waypoint) {
        next_image = image
        break
      }

      if (bi === image) {
        waypoint = true
      }
    }

    if (!next_image) {
      next_image = images[0]
    }
  }

  if (next_image) {
    App.apply_background(next_image)
  }
}

App.animate_background_image = (url) => {
  clearTimeout(App.background_animation_1)
  clearInterval(App.background_animation_2)

  let newnum, oldnum

  if (App.active_background === 1) {
    oldnum = 1
    newnum = 2
  }
  else {
    oldnum = 2
    newnum = 1
  }

  let new_el = DOM.el(`#background_${newnum}`)
  let old_el = DOM.el(`#background_${oldnum}`)

  if (url) {
    App.set_css_var(`background_image_${newnum}`, `url(${url})`)
  }
  else {
    App.set_css_var(`background_image_${newnum}`, `unset`)
  }


  if (!App.get_setting(`background_transitions`) || !App.first_bg_image) {
    new_el.style.opacity = 1
    old_el.style.opacity = 0
    App.first_bg_image = true
    return
  }

  let op_new = 0
  let op_old = 1
  let amount = 0.1
  new_el.style.opacity = op_new
  old_el.style.opacity = op_old
  App.first_bg_image = true

  App.background_animation_1 = setTimeout(() => {
    App.background_animation_2 = setInterval(() => {
      op_new += amount
      op_old -= amount
      new_el.style.opacity = op_new
      old_el.style.opacity = op_old

      if ((op_new >= 1) && (op_old <= 0)) {
        new_el.style.opacity = 1
        old_el.style.opacity = 0
        clearInterval(App.background_animation_2)
      }
    }, 100)
  }, 250)

  App.active_background = newnum
}