# 2D Barista Ordering Simulator

A compact yet production-clean 2D café ordering simulator built with **C++20**, **SFML 2.6**, and **CMake**. Practice taking a coffee order by walking up to a barista, answering questions about the drink, and receiving a performance report.

## Features

- Top-down café scene (1280×720) with collision, ambient audio, and animated sprites.
- Player movement via keyboard with interact radius and step sound effects.
- Barista dialogue system with branching finite-state machine and typewriter UI.
- Queue of customers that shuffle along a simple path while you order.
- HUD with timer, checklists, and prompts to guide interaction.
- Order validation and post-interaction report screen (time, steps, completeness, tips).

## Requirements

- C++20-compatible compiler (MSVC 2022+, Clang 14+, GCC 11+)
- CMake 3.21 or newer
- SFML 2.6 (graphics, window, system, audio)

On Windows, install SFML 2.6 binaries or build from source. On macOS and Linux, SFML can be installed via package managers or built manually.

## Building

```bash
git clone <repo-url>
cd barista-sim
cmake -S . -B build
cmake --build build
```

The build step copies the `assets/` directory into the build output, so running from `build/` works out-of-the-box.

### SFML lookup tips

- **macOS (Homebrew)**:
  ```bash
  brew install sfml
  cmake -S . -B build -DSFML_DIR=/opt/homebrew/Cellar/sfml/2.6.1/lib/cmake/SFML
  ```
- **Windows (vcpkg)**:
  ```powershell
  vcpkg install sfml
  cmake -S . -B build -DCMAKE_TOOLCHAIN_FILE=C:/path/to/vcpkg.cmake -DSFML_DIR=C:/path/to/vcpkg/installed/x64-windows/share/sfml
  ```
- **Linux**: Install via your package manager (`apt install libsfml-dev`) or build from source and point `SFML_DIR` to the provided CMake package.

## Running

```bash
./build/barista-sim      # macOS/Linux
.\build\barista-sim.exe  # Windows
```

## Controls

- `WASD` – Move
- `Shift` – Walk faster
- `E` – Interact with barista when close
- `1-4` – Select dialogue options
- `Enter` – Confirm typed name
- `Esc` – Pause/quit prompt

## Assets

Stub assets are provided for immediate execution:

- Textures: procedurally generated flat-color PNGs located in `assets/textures/`. Update with your own artwork as desired.
- Audio: simple sine-wave cues rendered programmatically (Wave/OGG-compatible) in `assets/audio/`.
- Font: `Noto Sans Sundanese` (SIL Open Font License 1.1) copied from macOS system distribution for convenience. Replace with any preferred UI font or adjust the attribution if redistributed.

Replace any asset with higher fidelity versions as needed; filenames are referenced from `assets/`.

## Directory Layout

```
barista-sim/
  assets/
    audio/
    fonts/
    textures/
  src/
    App.cpp/.hpp
    CafeScene.cpp/.hpp
    ...
  CMakeLists.txt
  README.md
```

## Notes

- The simulator uses a simple fixed timestep (1/60 s) for updates to keep movement deterministic.
- Collision volumes and customer paths are defined directly in `CafeScene`.
- Extendable scene stack allows adding new screens with minimal boilerplate.

Enjoy practicing your café order! Contributions and enhancements are welcome.

