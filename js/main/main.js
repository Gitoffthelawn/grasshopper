// Max favorites to store
App.max_favorites = 1000

// Max history results
App.history_max_results = 3000

// How deep to search in history
App.history_months = 12

// For internal checks
App.favorites_need_refresh = false

// Setup functions
App.setup_items()
App.setup_favorites()
App.setup_events()
App.setup_list()
App.setup_ui()
App.set_version()

// Start
if (App.favorites.length > 0) {
  App.show_favorites()
} else {
  App.get_history()
}