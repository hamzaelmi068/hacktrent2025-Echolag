#include "Input.hpp"

#include <SFML/Config.hpp>
#include <SFML/Window/Keyboard.hpp>
#include <algorithm>

namespace {
[[nodiscard]] bool isKeyIndexValid(sf::Keyboard::Key key) {
  return key >= 0 && key < sf::Keyboard::KeyCount;
}
}  // namespace

InputManager::InputManager() {
  current_.fill(false);
  previous_.fill(false);
}

void InputManager::beginFrame() {
  previous_ = current_;
  textBuffer_.clear();
}

void InputManager::handleEvent(const sf::Event& event) {
#if SFML_VERSION_MAJOR >= 3
  if (const auto* keyPressed = event.getIf<sf::Event::KeyPressed>()) {
    if (isKeyIndexValid(keyPressed->code)) {
      current_[keyPressed->code] = true;
    }
  } else if (const auto* keyReleased = event.getIf<sf::Event::KeyReleased>()) {
    if (isKeyIndexValid(keyReleased->code)) {
      current_[keyReleased->code] = false;
    }
  } else if (const auto* textEntered = event.getIf<sf::Event::TextEntered>()) {
    const char32_t unicode = textEntered->unicode;
    if (unicode >= 32 && unicode <= 126) {
      textBuffer_.push_back(unicode);
    } else if (unicode == 8) {  // backspace
      if (!textBuffer_.empty()) {
        textBuffer_.pop_back();
      }
    }
  }
#else
  if (event.type == sf::Event::KeyPressed) {
    if (isKeyIndexValid(event.key.code)) {
      current_[event.key.code] = true;
    }
  } else if (event.type == sf::Event::KeyReleased) {
    if (isKeyIndexValid(event.key.code)) {
      current_[event.key.code] = false;
    }
  } else if (event.type == sf::Event::TextEntered) {
    if (event.text.unicode >= 32 && event.text.unicode <= 126) {
      textBuffer_.push_back(static_cast<char32_t>(event.text.unicode));
    } else if (event.text.unicode == 8) {  // backspace
      if (!textBuffer_.empty()) {
        textBuffer_.pop_back();
      }
    }
  }
#endif
}

void InputManager::endFrame() {
  // No-op for now
}

bool InputManager::isKeyDown(sf::Keyboard::Key key) const {
  return current_.at(key);
}

bool InputManager::isKeyPressed(sf::Keyboard::Key key) const {
  return current_.at(key) && !previous_.at(key);
}

bool InputManager::isKeyReleased(sf::Keyboard::Key key) const {
  return !current_.at(key) && previous_.at(key);
}

const std::u32string& InputManager::textBuffer() const {
  return textBuffer_;
}

void InputManager::clearTextBuffer() {
  textBuffer_.clear();
}

