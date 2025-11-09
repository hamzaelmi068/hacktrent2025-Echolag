cmake_minimum_required(VERSION 3.21)

project(barista-sim
  VERSION 1.0.0
  DESCRIPTION "2D Barista Ordering Simulator built with C++20 and SFML 2.6"
  LANGUAGES CXX
)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/cmake")

# Try SFML 3.x first (Homebrew currently ships 3.0.2), then fall back to 2.6.x.
set(SFML_COMPONENTS Graphics Window System Audio)
find_package(SFML 3 COMPONENTS ${SFML_COMPONENTS} QUIET)
if (NOT SFML_FOUND)
  find_package(SFML 2.6 COMPONENTS ${SFML_COMPONENTS} REQUIRED)
endif()

file(GLOB_RECURSE BARISTA_SIM_SOURCES CONFIGURE_DEPENDS
  "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp"
)

add_executable(barista-sim ${BARISTA_SIM_SOURCES})
target_include_directories(barista-sim PRIVATE
  "${CMAKE_CURRENT_SOURCE_DIR}/src"
)

if (TARGET SFML::Graphics)
  set(SFML_LINK_TARGETS SFML::Graphics SFML::Window SFML::System SFML::Audio)
else()
  set(SFML_LINK_TARGETS sfml-graphics sfml-window sfml-system sfml-audio)
endif()

target_link_libraries(barista-sim PRIVATE ${SFML_LINK_TARGETS})

if (MSVC)
  target_compile_options(barista-sim PRIVATE /W4 /permissive- /Zc:preprocessor /EHsc)
else()
  target_compile_options(barista-sim PRIVATE -Wall -Wextra -Wpedantic)
endif()

# Copy assets next to the executable for easy running from the build directory.
set(ASSETS_SOURCE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/assets")
set(ASSETS_TARGET_DIR "${CMAKE_CURRENT_BINARY_DIR}/assets")

add_custom_command(TARGET barista-sim POST_BUILD
  COMMAND ${CMAKE_COMMAND} -E copy_directory
  "${ASSETS_SOURCE_DIR}"
  "${ASSETS_TARGET_DIR}"
  COMMENT "Copying assets to build directory"
)

