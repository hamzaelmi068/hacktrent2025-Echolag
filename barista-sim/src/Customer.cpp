#include "Customer.hpp"

#include <random>

#include "Utils.hpp"

Customer::Customer() {
  follower_.setSpeed(80.0f);
}

void Customer::setPath(const std::vector<sf::Vector2f>& nodes) {
  follower_.setPath(nodes);
  if (!nodes.empty()) {
    setPosition(nodes.front());
  }
}

void Customer::update(float dt) {
  if (!hasSprite()) {
    return;
  }

  sf::Vector2f pos = sprite().getPosition();
  follower_.update(dt, pos);
  sprite().setPosition(pos);

  shuffleTimer_ -= dt;
  if (shuffleTimer_ <= 0.0f) {
    shuffleTimer_ = utils::randomFloat(2.0f, 4.0f);
    sprite().move(utils::randomFloat(-2.0f, 2.0f), utils::randomFloat(-1.0f, 1.0f));
  }
}

void Customer::reset() {
  follower_.reset();
}

