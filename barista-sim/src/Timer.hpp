#pragma once

#include <SFML/System/Clock.hpp>

class Timer {
 public:
  Timer() = default;

  void reset() {
    clock_.restart();
    elapsed_ = sf::Time::Zero;
  }

  void update() {
    elapsed_ = clock_.getElapsedTime();
  }

  [[nodiscard]] float getSeconds() const {
    return elapsed_.asSeconds();
  }

 private:
  sf::Clock clock_;
  sf::Time elapsed_{};
};

