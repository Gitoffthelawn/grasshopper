App.setup_gestures = () => {
  App.refresh_gestures()
  let obj = {}

  for (let gesture of App.gestures) {
    obj[gesture] = (e) => {
      App.gesture_action(e, gesture)
    }
  }

  obj.default = (e) => {
    App.mouse_middle_action(App.window_mode, e)
  }

  NiceGesture.start(DOM.el(`#main`), obj)
}

App.gesture_action = (e, gesture) => {
  if (App.screen_locked) {
    return
  }

  App.reset_triggers()
  let cmd = App.get_setting(`gesture_${gesture}`)
  App.run_command({cmd, from: `gesture`, e})
}

App.refresh_gestures = () => {
  NiceGesture.enabled = App.get_setting(`gestures_enabled`)
  NiceGesture.threshold = App.get_setting(`gestures_threshold`)
}

App.settings_gestures = (el) => {
  let obj = {
    up: () => {
      App.settings_top()
    },
    down: () => {
      App.settings_bottom()
    },
    left: () => {
      App.show_prev_settings()
    },
    right: () => {
      App.show_next_settings()
    },
    default: () => {
      //
    }
  }

  NiceGesture.start(el, obj)
}