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
          ];

          RUST_SRC_PATH = "${pkgs.rust.packages.stable.rustPlatform.rustLibSrc}";

          shellHook = ''
            export STACK_HOME=${slc-flake.packages.${system}.default}
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

        src = ./day01;
      };
      packages.aoc2024-day02 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day02";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.ghc
        ];

        src = ./day02;
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

        src = ./day03;
      };
      packages.aoc2024-day04 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day04";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.odin
        ];

        src = ./day04;
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

        src = ./day05;
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

        src = ./day06;
      };
      packages.aoc2024-day07 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day07";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)" "HOME=$(TMP)"];

        nativeBuildInputs = [
          pkgs.vlang
        ];

        src = ./day07;
      };
      packages.aoc2024-day08 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day08";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
          pkgs.ocaml
        ];

        src = ./day08;
      };
      packages.aoc2024-day09 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day09";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)"];

        nativeBuildInputs = [
            pkgs.rustc
        ];

        src = ./day09;
      };
      packages.aoc2024-day10 = pkgs.stdenv.mkDerivation {
        pname = "aoc2024-day10";
        version = "1.0.0";

        makeFlags = ["PREFIX=$(out)" "HOME=$(TMP)"];

        nativeBuildInputs = [
            pkgs.zig
        ];

        src = ./day10;
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
