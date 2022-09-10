// Get items from history
App.get_history = async function (type = "slice") {
  App.log(`Getting history: ${type}`)
  
  let max

  if (type === "slice") {
    max = App.history_slice_results
    App.full_history = false
  } else if (type === "full") {
    max = App.history_max_results
    App.full_history = true
  }

  let items = await browser.history.search({
    text: "",
    maxResults: max,
    startTime: App.history_months()
  })

  App.history_items = []
  App.process_items(items, "history", App.history_items) 
  App.do_filter("history")
}

// Get history months date
App.history_months = function () {
  return Date.now() - (1000 * 60 * 60 * 24 * 30 * App.history_max_months)
}