{
  description = "A basic flake for my AoC 2024";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    slc-flake = {
      url = "github:alexjercan/stack-lang-c";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    slc-flake,
  }: (
    flake-utils.lib.eachDefaultSystem
    (system: let
      pkgs = import nixpkgs {
        inherit system;

        config = {
          allowUnfree = true;
        };
      };
      pygyat = pkgs.python3Packages.buildPythonPackage rec {
          pname = "pygyat";
          version = "1.0.6b0";
          src = pkgs.python3Packages.fetchPypi {
            inherit pname version;
            sha256 = "sha256-b8aWyxAG/jDI/0Etk+zRtr/YJC5O+u1YPoyzQi0ZMs8=";
          };
        };
    in {
      devShells.default =
        pkgs.mkShell
        {
          name = "env-shell";

          nativeBuildInputs = [
            slc-flake.packages.${system}.default
            pkgs.fasm
            pkgs.ghc
            pkgs.jdk
            pkgs.odin
            pkgs.ocaml
            pkgs.opam
            pkgs.swi-prolog
            pkgs.nodejs
            pkgs.pnpm
            pkgs.vlang
            pkgs.rustc pkgs.cargo pkgs.gcc pkgs.rustfmt pkgs.clippy
            pkgs.rust-analyzer
            pkgs.zig
            pkgs.c3c pkgs.c3-lsp
            pkgs.python3 pygyat
            pkgs.elixir pkgs.elixir-ls
            pkgs.clang
            pkgs.lua54Packages.lua
            pkgs.ruby
            pkgs.typescript
            pkgs.go
            pkgs.yarn
            pkgs.yarn2nix
            pkgs.groovy
            pkgs.kotlin
            pkgs.nim
            pkgs.julia_19
            pkgs.sbcl
          ];

          RUST_SRC_PATH = "${pkgs.rust.packages.stable.rustPlatform.rustLibSrc}";

          shellHook = ''
            # Needed for stack to find it's standard library
            export STACK_HOME=${slc-flake.packages.${system}.default}

            # Tells pip to put packages into $PIP_PREFIX instead of the usual locations.
            # See https://pip.pypa.io/en/stable/user_guide/#environment-variables.
            export PIP_PREFIX=$(pwd)/_build/pip_packages
            export PYTHONPATH="$PIP_PREFIX/${pkgs.python3.sitePackages}:$PYTHONPATH"
            export PATH="$PIP_PREFIX/bin:$PATH"
            unset SOURCE_DATE_EPOCH
          '';
        };
      packages.aoc2024-day01 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day01";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)" "STACK_HOME=${slc-flake.packages.${system}.default}"];

        nativeBuildInputs = [
          slc-flake.packages.${system}.default
          pkgs.fasm
        ];

        src = ./day01-stack;
      };
      packages.aoc2024-day02 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day02";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.ghc
        ];

        src = ./day02-haskell;
      };
      packages.aoc2024-day03 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day03";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.jdk
          pkgs.makeWrapper
        ];

        postInstall = ''
          makeWrapper ${pkgs.jre}/bin/java $out/bin/aoc2024-day03 --add-flags "-cp $out/bin/aoc2024-day03.jar Main"
        '';

        src = ./day03-java;
      };
      packages.aoc2024-day04 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day04";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.odin
        ];

        src = ./day04-odin;
      };
      packages.aoc2024-day05 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day05";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.swi-prolog
          pkgs.makeWrapper
        ];

        postInstall = ''
          makeWrapper ${pkgs.swi-prolog}/bin/swipl $out/bin/aoc2024-day05 --add-flags "-g main -t halt $out/bin/main.pl"
        '';

        src = ./day05-prolog;
      };
      packages.aoc2024-day06 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day06";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.nodejs
          pkgs.makeWrapper
        ];

        postInstall = ''
          makeWrapper ${pkgs.nodejs}/bin/node $out/bin/aoc2024-day06 --add-flags "$out/bin/main.js"
        '';

        src = ./day06-javascript;
      };
      packages.aoc2024-day07 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day07";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)" "HOME=$(TMP)"];

        nativeBuildInputs = [
          pkgs.vlang
        ];

        src = ./day07-vlang;
      };
      packages.aoc2024-day08 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day08";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.ocaml
        ];

        src = ./day08-ocaml;
      };
      packages.aoc2024-day09 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day09";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
            pkgs.rustc
        ];

        src = ./day09-rust;
      };
      packages.aoc2024-day10 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day10";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)" "HOME=$(TMP)"];

        nativeBuildInputs = [
            pkgs.zig
        ];

        src = ./day10-zig;
      };
      packages.aoc2024-day11 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day11";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
            pkgs.c3c
        ];

        src = ./day11-c3;
      };
      packages.aoc2024-day12 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day12";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.python3
          pygyat
          pkgs.makeWrapper
        ];

        postInstall = ''
          makeWrapper ${pygyat}/bin/pygyat $out/bin/aoc2024-day12 --add-flags "$out/bin/main.gyat"
        '';

        src = ./day12-pygyat;
      };
      packages.aoc2024-day13 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day13";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.gcc
        ];

        src = ./day13-cpp;
      };
      packages.aoc2024-day14 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day14";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.elixir
          pkgs.makeWrapper
        ];

        postInstall = ''
          makeWrapper ${pkgs.elixir}/bin/elixir $out/bin/aoc2024-day14 --add-flags "$out/bin/main.exs"
        '';

        src = ./day14-elixir;
      };
      packages.aoc2024-day15 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day15";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.clang
        ];

        src = ./day15-c;
      };
      packages.aoc2024-day15-game = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day15-game";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.clang
        ];

        src = ./day15-c;
      };
      packages.aoc2024-day16 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day16";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.python3
          pkgs.makeWrapper
        ];

        postInstall = ''
          makeWrapper ${pkgs.python3}/bin/python3 $out/bin/aoc2024-day16 --add-flags "$out/bin/main.py"
        '';

        src = ./day16-python;
      };
      packages.aoc2024-day17 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day17";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.lua54Packages.lua
          pkgs.makeWrapper
        ];

        postInstall = ''
          makeWrapper ${pkgs.lua54Packages.lua}/bin/lua $out/bin/aoc2024-day17 --add-flags "$out/bin/main.lua"
        '';

        src = ./day17-lua;
      };
      packages.aoc2024-day18 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day18";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.ruby
          pkgs.makeWrapper
        ];

        postInstall = ''
          makeWrapper ${pkgs.ruby}/bin/ruby $out/bin/aoc2024-day18 --add-flags "$out/bin/main.rb"
        '';

        src = ./day18-ruby;
      };
      packages.aoc2024-day19 =
      let
        pname = "aoc2024-day19";
        version = "1.0.0";
        nodePackages = pkgs.mkYarnModules {
            inherit pname version;
            packageJSON = ./day19-typescript/package.json;
            yarnLock = ./day19-typescript/yarn.lock;
            yarnNix = ./day19-typescript/yarn.nix;
        };
      in pkgs.stdenv.mkDerivation {
        inherit pname version;

        nativeBuildInputs = [
          pkgs.typescript
          pkgs.nodejs
          pkgs.makeWrapper
          pkgs.yarn
          nodePackages
        ];

        buildPhase = ''
            ln -s ${nodePackages}/node_modules .
            yarn build
        '';

        installPhase = ''
          mkdir -p $out/bin
          cp -r ./main.js $out/bin
          makeWrapper ${pkgs.nodejs}/bin/node $out/bin/aoc2024-day19 --add-flags "$out/bin/main.js"
        '';

        src = ./day19-typescript;
      };
      packages.aoc2024-day20 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day20";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)" "HOME=$(TMP)"];

        nativeBuildInputs = [
          pkgs.go
        ];

        src = ./day20-go;
      };
      packages.aoc2024-day21 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day21";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.groovy
          pkgs.makeWrapper
        ];

        postInstall = ''
          makeWrapper ${pkgs.groovy}/bin/groovy $out/bin/aoc2024-day21 --add-flags "$out/bin/main.groovy"
        '';

        src = ./day21-groovy;
      };
      packages.aoc2024-day22 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day22";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.kotlin
          pkgs.makeWrapper
        ];

        postInstall = ''
          makeWrapper ${pkgs.jdk}/bin/java $out/bin/aoc2024-day22 --add-flags "-jar $out/bin/main.jar"
        '';

        src = ./day22-kotlin;
      };
      packages.aoc2024-day23 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day23";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)" "HOME=$(TMP)"];

        nativeBuildInputs = [
          pkgs.nim
        ];

        src = ./day23-nim;
      };
      packages.aoc2024-day24 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day24";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.julia_19
          pkgs.makeWrapper
        ];

        postInstall = ''
          makeWrapper ${pkgs.julia_19}/bin/julia $out/bin/aoc2024-day24 --add-flags "$out/bin/main.jl"
        '';

        src = ./day24-julia;
      };
      packages.aoc2024-day25 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day25";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.sbcl
          pkgs.makeWrapper
        ];

        postInstall = ''
          makeWrapper ${pkgs.sbcl}/bin/sbcl $out/bin/aoc2024-day25 --add-flags "--script $out/bin/main.lisp"
        '';

        src = ./day25-common-lisp;
      };
      packages.aoc2024 = pkgs.writeShellApplication {
        name = "aoc2024";
        runtimeInputs = [
          self.packages.${system}.aoc2024-day01
          self.packages.${system}.aoc2024-day02
          self.packages.${system}.aoc2024-day03
          self.packages.${system}.aoc2024-day04
          self.packages.${system}.aoc2024-day05
          self.packages.${system}.aoc2024-day06
          self.packages.${system}.aoc2024-day07
          self.packages.${system}.aoc2024-day08
          self.packages.${system}.aoc2024-day09
          self.packages.${system}.aoc2024-day10
          self.packages.${system}.aoc2024-day11
          self.packages.${system}.aoc2024-day12
          self.packages.${system}.aoc2024-day13
          self.packages.${system}.aoc2024-day14
          self.packages.${system}.aoc2024-day15
          self.packages.${system}.aoc2024-day16
          self.packages.${system}.aoc2024-day17
          self.packages.${system}.aoc2024-day18
          self.packages.${system}.aoc2024-day19
          self.packages.${system}.aoc2024-day20
          self.packages.${system}.aoc2024-day21
          self.packages.${system}.aoc2024-day22
          self.packages.${system}.aoc2024-day23
          self.packages.${system}.aoc2024-day24
          self.packages.${system}.aoc2024-day25
        ];
        text =
          /*
          bash
          */
          ''
            set +o errexit
            set +o pipefail

            Color_Off='\033[0m'

            IRed='\033[0;91m'
            IGreen='\033[0;92m'
            IYellow='\033[0;93m'

            BIGreen='\033[1;92m'

            echo -e "$BIGreen""Advent of Code 2024$Color_Off"

            star="\e[5;33m*\e[0m\e[1;32m"
            o="\e[0m\e[1;31mo\e[0m\e[1;32m"

            echo -e "
                    $star
                   /.\\
                  /$o..\\
                  /..$o\\
                 /.$o..$o\\
                 /...$o.\\
                /..$o....\\
                ^^^[_]^^^
            "

            echo -e "$IRed""--- Day 1: Historian Hysteria (Stack) ---""$Color_Off"
            aoc2024-day01 < ./input/day01.input

            echo -e "$IGreen""--- Day 2: Red-Nosed Reports (Haskell) ---""$Color_Off"
            aoc2024-day02 < ./input/day02.input

            echo -e "$IYellow""--- Day 3: Mull It Over (Java) ---""$Color_Off"
            aoc2024-day03 < ./input/day03.input

            echo -e "$IRed""--- Day 4: Ceres Search (Odin) ---""$Color_Off"
            aoc2024-day04 < ./input/day04.input

            echo -e "$IGreen""--- Day 5: Print Queue (Prolog) ---""$Color_Off"
            aoc2024-day05 < ./input/day05.input

            echo -e "$IYellow""--- Day 6: Guard Gallivant (JavaScript) ---""$Color_Off"
            aoc2024-day06 < ./input/day06.input

            echo -e "$IRed""--- Day 7: Bridge Repair (VLang) ---""$Color_Off"
            aoc2024-day07 < ./input/day07.input

            echo -e "$IGreen""--- Day 8: Resonant Collinearity (OCaml) ---""$Color_Off"
            aoc2024-day08 < ./input/day08.input

            echo -e "$IYellow""--- Day 9: Disk Fragmenter (Rust) ---""$Color_Off"
            aoc2024-day09 < ./input/day09.input

            echo -e "$IRed""--- Day 10: Hoof It (Zig) ---""$Color_Off"
            aoc2024-day10 < ./input/day10.input

            echo -e "$IGreen""--- Day 11: Plutonian Pebbles (C3) ---""$Color_Off"
            aoc2024-day11 < ./input/day11.input

            echo -e "$IYellow""--- Day 12: Garden Groups (PyGyat) ---""$Color_Off"
            aoc2024-day12 < ./input/day12.input

            echo -e "$IRed""--- Day 13: Claw Contraption (C++) ---""$Color_Off"
            aoc2024-day13 < ./input/day13.input

            echo -e "$IGreen""--- Day 14: Restroom Redoubt (Elixir) ---""$Color_Off"
            aoc2024-day14 < ./input/day14.input

            echo -e "$IYellow""--- Day 15: Warehouse Woes (C) ---""$Color_Off"
            aoc2024-day15 < ./input/day15.input

            echo -e "$IRed""--- Day 16: Reindeer Maze (Python) ---""$Color_Off"
            aoc2024-day16 < ./input/day16.input

            echo -e "$IGreen""--- Day 17: Chronospatial Computer (Lua) ---""$Color_Off"
            aoc2024-day17 < ./input/day17.input

            echo -e "$IYellow""--- Day 18: RAM Run (Ruby) ---""$Color_Off"
            aoc2024-day18 < ./input/day18.input

            echo -e "$IRed""--- Day 19: Linen Layout (TypeScript) ---""$Color_Off"
            aoc2024-day19 < ./input/day19.input

            echo -e "$IGreen""--- Day 20: Race Condition (Go) ---""$Color_Off"
            aoc2024-day20 < ./input/day20.input

            echo -e "$IYellow""--- Day 21: Keypad Conundrum (Groovy) ---""$Color_Off"
            aoc2024-day21 < ./input/day21.input

            echo -e "$IRed""--- Day 22: Monkey Market (Kotlin) ---""$Color_Off"
            aoc2024-day22 < ./input/day22.input

            echo -e "$IGreen""--- Day 23: LAN Party (Nim) ---""$Color_Off"
            aoc2024-day23 < ./input/day23.input

            echo -e "$IYellow""--- Day 24: Crossed Wires (Julia) ---""$Color_Off"
            aoc2024-day24 < ./input/day24.input

            echo -e "$IRed""--- Day 25: (Common Lisp) ---""$Color_Off"
            aoc2024-day25 < ./input/day25.input
          '';
      };
      packages.aoc2024-get = pkgs.writeShellApplication {
        name = "aoc2024-get";
        runtimeInputs = [pkgs.curl];
        text =
          /*
          bash
          */
          ''
            set +o errexit
            set +o pipefail
            set +o nounset

            usage() {
                echo "Usage: $0 [-h | --help] [--year <year>] <day>"
                echo
                echo "Options:"
                echo "  -h, --help      Show this help message and exit."
                echo "  --year <year>   Choose the year to download the input for; default 2024."
                echo "  day             Download the given day."
                echo
                echo "Environment:"
                echo "  AOC_SESSION=... The Set-Cookie from the AoC Website"
            }

            day=0
            year=2024
            while [[ $# -gt 0 ]]; do
                case "$1" in
                    -h|--help)
                        usage
                        exit 0
                        ;;
                    --year)
                        if [ -z "$2" ]; then
                            echo "$1"
                            echo "$2"
                            usage
                            exit 1
                        fi
                        year="$2"
                        shift
                        shift
                        ;;
                    *)
                        day="$1"
                        shift
                        ;;
                esac
            done

            if [ -z "$day" ]; then
                usage
                exit 1
            fi

            if [ -z "$AOC_SESSION" ]; then
                usage
                exit 1
            fi

            mkdir -p input
            filename=input/day$(printf "%02d" "$day").input

            curl -sS -o "$filename" -b "session=$AOC_SESSION" https://adventofcode.com/"$year"/day/"$day"/input
          '';
      };
    })
  );
}
