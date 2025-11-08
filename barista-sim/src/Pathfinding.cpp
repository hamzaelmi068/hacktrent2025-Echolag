#include "Pathfinding.hpp"

#include <algorithm>

#include "Utils.hpp"

void PathFollower::setPath(std::vector<sf::Vector2f> nodes) {
  nodes_ = std::move(nodes);
  current_ = 0;
}

void PathFollower::setSpeed(float speed) {
  speed_ = speed;
}

void PathFollower::reset() {
  current_ = 0;
}

void PathFollower::update(float dt, sf::Vector2f& position) {
  if (nodes_.empty() || current_ >= nodes_.size()) {
    return;
  }

  const sf::Vector2f target = nodes_[current_];
  sf::Vector2f toTarget = target - position;
  const float distance = utils::length(toTarget);

  if (distance < 4.0f) {
    current_ = std::min(current_ + 1, nodes_.size());
    return;
  }

  toTarget = utils::normalize(toTarget);
  position += toTarget * speed_ * dt;
}

bool PathFollower::isFinished() const {
  return current_ >= nodes_.size();
}

std::size_t PathFollower::currentIndex() const {
  return current_;
}

