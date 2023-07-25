App.setup_theme = () => {
  App.colorlib = ColorLib()
  App.apply_theme()
}

App.apply_theme = () => {
  try {
    let background = App.get_setting(`background_color`)
    let text = App.get_setting(`text_color`)

    App.set_css_var(`background_color`, background)
    App.set_css_var(`text_color`, text)

    let main_background = App.colorlib.rgb_to_rgba(background, 0.93)
    App.set_css_var(`main_background`, main_background)

    let alt_color_0 = App.colorlib.rgb_to_rgba(text, 0.15)
    App.set_css_var(`alt_color_0`, alt_color_0)

    let alt_color_1 = App.colorlib.rgb_to_rgba(text, 0.20)
    App.set_css_var(`alt_color_1`, alt_color_1)

    let alt_color_2 = App.colorlib.rgb_to_rgba(text, 0.50)
    App.set_css_var(`alt_color_2`, alt_color_2)

    let alt_background = App.colorlib.rgb_to_rgba(background, 0.55)
    App.set_css_var(`alt_background`, alt_background)

    let alt_background_2 = App.colorlib.get_lighter_or_darker(background, 0.06)
    App.set_css_var(`alt_background_2`, alt_background_2)

    App.set_css_var(`font_size`, App.get_setting(`font_size`) + `px`)
    App.set_css_var(`font`, `${App.get_setting(`font`)}, sans-serif`)

    let w = `${(App.get_setting(`width`) / 100) * 800}px`
    App.set_css_var(`width`, w)

    let h = `${(App.get_setting(`height`) / 100) * 600}px`
    App.set_css_var(`height`, h)

    let density = App.get_setting(`density`)
    let item_height = 2.15

    if (density === `compact`) {
      item_height = 1.7
    }
    else if (density === `bigger`) {
      item_height = 2.6
    }

    if (App.get_setting(`text_mode`).includes(`_`)) {
      item_height += 1.1
    }

    App.set_css_var(`item_height`, `${item_height}rem`)

    if (App.get_setting(`background_image`)) {
      App.set_css_var(`background_image`, `url(${App.get_setting(`background_image`)})`)
    }
    else {
      App.set_css_var(`background_image`, `unset`)
    }

    if (App.get_setting(`scrollbars`)) {
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

    let borders = [`normal`, `bigger`]

    for (let b of borders) {
      main.classList.remove(`borders_${b}`)
    }

    let border = App.get_setting(`borders`)

    if (border !== `none`) {
      main.classList.add(`borders_${border}`)
    }

    let bg = DOM.el(`#background`)
    let bg_effects = [`blur`, `grayscale`, `invert`, `rotate_1`, `rotate_2`, `rotate_3`]
    let bg_effect = App.get_setting(`background_effect`)

    for (let eff of bg_effects) {
      bg.classList.remove(eff)
    }

    if (bg_effects.includes(bg_effect)) {
      bg.classList.add(bg_effect)
    }

    let bg_tiles = App.get_setting(`background_tiles`)

    if (bg_tiles !== `none`) {
      App.set_css_var(`background_tile_width`, bg_tiles)
      bg.classList.add(`tiles`)
    }
    else {
      bg.classList.remove(`tiles`)
    }
  }
  catch (err) {
    App.log(err, `error`)
    App.settings_default_category(`theme`)
    App.stor_save_settings()
  }
}

App.set_css_var = (name, value) => {
  document.documentElement.style.setProperty(`--${name}`, value)
}