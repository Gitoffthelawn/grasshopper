// For internal checks
App.mouse_over_disabled = true
App.modal_open = false
App.configure_ready = false
App.help_ready = false
App.info_ready = false
App.info_window_ready = false
App.initial_items = 100

// Local storage paths
App.ls_recent = "recent_v1"
App.ls_config = "config_v1"

App.init = async function () {
  await App.get_config()
  App.setup_windows()
  App.setup_items()
  App.setup_filter()
  App.setup_list()
  App.setup_keyboard()
  App.start_items()
}

App.init()