#pragma once

#include <SFML/System/Vector2.hpp>
#include <vector>

class PathFollower {
 public:
  void setPath(std::vector<sf::Vector2f> nodes);
  void setSpeed(float speed);
  void reset();

  void update(float dt, sf::Vector2f& position);
  [[nodiscard]] bool isFinished() const;
  [[nodiscard]] std::size_t currentIndex() const;

 private:
  std::vector<sf::Vector2f> nodes_;
  std::size_t current_{0};
  float speed_{60.0f};
};

