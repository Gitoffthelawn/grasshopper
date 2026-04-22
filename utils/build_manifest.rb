#!/usr/bin/env ruby
require "json"

base_file = "manifest_base.json"
output_file = "manifest.json"

raw_data = File.read(base_file)
manifest = JSON.parse(raw_data)

target = ARGV[0]

# Clean the base state
manifest.delete("optional_host_permissions")

if target == "chrome"
  manifest["background"] = {
    "service_worker" => "background/background.js",
    "type" => "module"
  }

  manifest.delete("sidebar_action")
  manifest["optional_host_permissions"] = []

  # 1. Remove Firefox-only permissions
  manifest["permissions"]&.delete("contextualIdentities")
  manifest["permissions"]&.delete("cookies")

  # 2. Strip Firefox-specific settings (Gecko ID)
  # Chrome will throw an "Unrecognized manifest key" warning if this is left in.
  manifest.delete("browser_specific_settings")
else # Firefox
  manifest["background"] = {
    "scripts" => ["background/background.js"],
    "type" => "module"
  }

  manifest["permissions"]&.delete("sidePanel")
  manifest.delete("side_panel")

  # Ensure the array exists before pushing
  manifest["optional_permissions"] ||= []
end

File.write(output_file, JSON.pretty_generate(manifest))
puts "Generated manifest for #{target}"