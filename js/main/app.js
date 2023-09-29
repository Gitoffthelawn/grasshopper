const App = {}

NeedContext.min_width = `4.5rem`
NeedContext.center_top = `22%`

App.stor_settings_name = `settings_v100`
App.stor_profiles_name = `profiles_v100`
App.stor_command_history_name = `command_history_v1`
App.stor_filter_history_name = `filter_history_v1`
App.stor_first_time_name = `first_time_v1`

App.modes = [`tabs`, `history`, `bookmarks`, `closed`]
App.gestures = [`up`, `down`, `left`, `right`, `up_and_down`, `left_and_right`]
App.default_setting_string = `__default__`
App.separator_string = `--separator--`
App.windows = {}
App.popups = {}
App.previous_tabs = []
App.max_closed = 25
App.icon_size = 50
App.max_profiles = 1000 * 5
App.max_text_length = 200
App.scroll_amount = 150
App.double_tap_date = 0
App.scroller_max_top = 10
App.dragging = false
App.new_tab_urls = [`about:newtab`]
App.search_modes = [`history`, `bookmarks`]
App.media_scroll = 33
App.media_types = [`image`, `video`, `audio`]
App.max_warn_limit = 20
App.max_tag_filters = 50
App.colors = [`red`, `green`, `blue`, `yellow`, `purple`, `orange`]
App.theme_safe_mode_msg = false
App.persistent_modes = [`tabs`]
App.close_text = `Close`
App.filter_search_date = 0
App.backgrounds_dir = `/img/backgrounds/`
App.num_backgrounds = 3
App.settings_done = false
App.settings_ready = false
App.settings_addlist_ready = false
App.media_image_ready = false
App.media_video_ready = false
App.media_audio_ready = false
App.profile_editor_ready = false
App.about_ready = false
App.popups_ready = false
App.palette_ready = false
App.tabs_popups_ready = false

App.settings_save_delay = 250
App.double_tap_delay = 300
App.empty_previous_tabs_delay = 2000
App.alert_autohide_delay = 1600
App.filter_delay_2 = 50
App.footer_delay = 100
App.scroller_delay = 100
App.pinline_delay = 100
App.wheel_delay = 100
App.show_mode_delay = 100

App.settings_icons = {
  general: `⚙️`,
  theme: `🎨`,
  colors: `🎨`,
  icons: `🖼️`,
  media: `📷`,
  icons: `👁️`,
  show: `👁️`,
  gestures: `🖱️`,
  auxclick: `🖱️`,
  menus: `🖱️`,
  keyboard: `⌨️`,
  warns: `🚨`,
  more: `💠`,
}

App.mode_icons = {
  tabs: `📚`,
  history: `⏳`,
  bookmarks: `⭐`,
  closed: `🔃`,
}

App.clipboard_icon = `📋`
App.bot_icon = `🤖`
App.icon_placeholder = `Icon`

App.dark_colors = {
  background: `rgb(45, 45, 55)`,
  text: `rgb(233, 233, 233)`,
}

App.light_colors = {
  background: `rgb(200, 200, 200)`,
  text: `rgb(50, 50, 55)`,
}

App.effects = [
  {text: `None`, value: `none`},
  {text: `Glow`, value: `glow`},
  {text: `Opacity`, value: `opacity`},
  {text: `Background`, value: `background`},
  {text: `Underline`, value: `underline`},
  {text: `Bold`, value: `bold`},
  {text: `Bigger`, value: `bigger`},
]

App.background_effects = [
  {text: `None`, value: `none`},
  {text: `Gray`, value: `grayscale`},
  {text: `Invert`, value: `invert`},
  {text: `Rotate 1`, value: `rotate_1`},
  {text: `Rotate 2`, value: `rotate_2`},
  {text: `Rotate 3`, value: `rotate_3`},
  {text: `Blur`, value: `blur`},
]