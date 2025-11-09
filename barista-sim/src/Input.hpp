#pragma once

#include <SFML/Window/Event.hpp>
#include <SFML/Window/Keyboard.hpp>
#include <array>

class InputManager {
 public:
  InputManager();

  void beginFrame();
  void handleEvent(const sf::Event& event);
  void endFrame();

  [[nodiscard]] bool isKeyDown(sf::Keyboard::Key key) const;
  [[nodiscard]] bool isKeyPressed(sf::Keyboard::Key key) const;
  [[nodiscard]] bool isKeyReleased(sf::Keyboard::Key key) const;

  [[nodiscard]] const std::u32string& textBuffer() const;
  void clearTextBuffer();

 private:
  std::array<bool, sf::Keyboard::KeyCount> current_{};
  std::array<bool, sf::Keyboard::KeyCount> previous_{};

  std::u32string textBuffer_;
};

