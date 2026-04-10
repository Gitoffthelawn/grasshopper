{pkgs ? import <nixpkgs> {}}:

let
  rubyEnv = pkgs.ruby.withPackages (ps: [
    ps.git
  ]);
in
pkgs.mkShell {
  packages = [
    pkgs.nodejs
    pkgs.zip
    rubyEnv
  ];

  shellHook = ''
    echo "Environment loaded."
    echo "Node version: $(node --version)"
    echo "Ruby version: $(ruby --version)"
  '';
}