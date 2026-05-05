App.show_photo = async () => {
  let image = await App.get_photo() || `img/bfg.jpg`

  App.show_textarea({
    title: `Photo`,
    title_icon: App.photo_icon,
    image,
    only_image: true,
    image_size: `big`,
    buttons: [
      {
        text: `Close`,
        action: () => {
          App.close_textarea()
        },
      },
      {
        text: `Change`,
        action: () => {
          App.upload_photo()
          App.close_textarea()
        },
      },
    ],
    on_drop: (e) => {
      let files = e.dataTransfer.files

      if (files.length > 0) {
        let file = files[0]

        if (!file.type.includes(`image/`)) {
          return
        }

        App.upload_photo(e, file)
      }
    }
  })
}

App.upload_photo = (e, file) => {
  App.upload_image({
    file,
    key_name: `storedPhoto`,
    command: `show_photo`,
    set_function: () => {
      App.show_photo()
    },
  })
}

App.get_photo = async () => {
  try {
    return await App.local_get(`storedPhoto`, null)
  }
  catch (error) {
    return null
  }
}