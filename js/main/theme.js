// Setup theme
App.setup_theme = function () {
  App.colorlib = ColorLib()  
  App.apply_theme()
}

// Apply theme
App.apply_theme = function (tried = false) {
  try {
    App.set_css_var("background_color", App.settings.background_color)
    App.set_css_var("text_color", App.settings.text_color)
    
    let alt_color = App.colorlib.rgb_to_rgba(App.settings.text_color, 0.14)
    App.set_css_var("alt_color", alt_color)
    
    let alt_color_2 = App.colorlib.rgb_to_rgba(App.settings.text_color, 0.22)
    App.set_css_var("alt_color_2", alt_color_2)
  } catch {
    if (tried) {
      return
    }

    let colors = App.fallback_theme()
    App.background_color = colors.background_color
    App.text_color = colors.text_color
    App.stor_save_settings()
    App.apply_theme(true)
  }
}

// Set css variable
App.set_css_var = function (name, value) {
  document.documentElement.style.setProperty(`--${name}`, value)
}

// Change a color
App.do_change_color = function (name, color) {
  App.settings[`${name}_color`] = color
  App.apply_theme()
  App.stor_save_settings()
}

// Pick a random theme
App.random_theme = function (mode) {
  let colors 
  
  if (mode === "dark") {
    colors = App.get_dark_theme()
  } else if (mode === "light") {
    colors = App.get_light_theme()
  }

  App.background_color_picker.setColor(colors.background_color)
  App.text_color_picker.setColor(colors.text_color)

  App.apply_theme()
  App.stor_save_settings()
}

// Get a random dark theme
App.get_dark_theme = function () {
  let background_color = App.colorlib.get_dark_color()
  let text_color = App.colorlib.get_random_hex()
  
  if (App.colorlib.is_dark(text_color)) {
    text_color = App.colorlib.get_lighter_or_darker(text_color, 0.66)
  }

  return {background_color: background_color, text_color: text_color}
}

// Get a random light theme
App.get_light_theme = function () {
  let background_color = App.colorlib.get_light_color()
  let text_color = App.colorlib.get_random_hex()
  
  if (App.colorlib.is_light(text_color)) {
    text_color = App.colorlib.get_lighter_or_darker(text_color, 0.66)
  }

  return {background_color: background_color, text_color: text_color}
}

// Get browser theme
App.get_browser_theme = async function () {
  let theme = await browser.theme.getCurrent()
  let colors

  if (theme.colors.toolbar && theme.colors.toolbar_text) {
    colors = {
      background_color: theme.colors.toolbar,
      text_color: theme.colors.toolbar_text
    }
  } else {
    colors = App.fallback_theme()
  }

  let div = App.create("div", "hidden")
  document.body.append(div)
  
  div.style.color = colors.background_color
  colors.background_color = window.getComputedStyle(div).color
  
  div.style.color = colors.text_color
  colors.text_color = window.getComputedStyle(div).color

  return colors
}

// Return the default theme
App.fallback_theme = function () {
  return {
    background_color: "rgb(37, 41, 51)",
    text_color: "rgb(220, 220, 220)"
  }
}

// Try to detect and apply the browser's theme
App.detect_theme = async function () {
  let colors = await App.get_browser_theme()
  App.background_color_picker.setColor(colors.background_color)
  App.text_color_picker.setColor(colors.text_color)
}