#include "Input.hpp"

#include <SFML/Window/Keyboard.hpp>
#include <algorithm>

InputManager::InputManager() {
  current_.fill(false);
  previous_.fill(false);
}

void InputManager::beginFrame() {
  previous_ = current_;
  textBuffer_.clear();
}

void InputManager::handleEvent(const sf::Event& event) {
  if (event.type == sf::Event::KeyPressed) {
    if (event.key.code >= 0 && event.key.code < sf::Keyboard::KeyCount) {
      current_[event.key.code] = true;
    }
  } else if (event.type == sf::Event::KeyReleased) {
    if (event.key.code >= 0 && event.key.code < sf::Keyboard::KeyCount) {
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

