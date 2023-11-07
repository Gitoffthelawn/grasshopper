App.init = async () => {
  let win = await browser.windows.getCurrent({populate: false})
  App.window_id = win.id
  App.manifest = browser.runtime.getManifest()
  App.colorlib = ColorLib()
  App.print_intro()
  App.build_settings()
  App.stor_get_settings()
  App.stor_get_command_history()
  App.stor_get_tag_history()
  App.stor_get_title_history()
  App.stor_get_first_time()
  App.setup_commands()
  App.setup_tabs()
  App.setup_bookmarks()
  App.setup_history()
  App.setup_closed()
  App.setup_settings()
  App.setup_keyboard()
  App.setup_window()
  App.setup_gestures()
  App.setup_filter()
  App.setup_modes()
  App.setup_scroll()
  App.setup_items()
  App.setup_theme()
  App.setup_edits()
  App.setup_mouse()
  App.do_apply_theme()
  App.setup_pinline()
  App.setup_footer()
  App.setup_recent_tabs()
  App.setup_active_history()
  App.setup_context()
  await App.clear_show()
  App.make_window_visible()
  App.check_first_time()
  App.start_date = App.now()
}

App.init()