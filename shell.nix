{pkgs ? import <nixpkgs> {}}:

pkgs.mkShell {
  packages = [
    pkgs.nodejs
    pkgs.ruby
    pkgs.zip
  ];

  shellHook = ''
    echo "Environment loaded."
    echo "Node version: $(node --version)"
    echo "Ruby version: $(ruby --version)"
  '';
}