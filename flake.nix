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
          ];

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
      packages.aoc2024 = pkgs.writeShellApplication {
        name = "aoc2024";
        runtimeInputs = [
          self.packages.${system}.aoc2024-day01
          self.packages.${system}.aoc2024-day02
          self.packages.${system}.aoc2024-day03
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
