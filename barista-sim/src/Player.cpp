#include "Player.hpp"

#include <algorithm>

#include "Audio.hpp"
#include "Utils.hpp"

#include <SFML/Window/Keyboard.hpp>

Player::Player() {
  resetStats();
}

void Player::update(float dt, const InputManager& input, AudioManager& audio) {
  sf::Vector2f direction{};
  if (input.isKeyDown(sf::Keyboard::W)) {
    direction.y -= 1.0f;
  }
  if (input.isKeyDown(sf::Keyboard::S)) {
    direction.y += 1.0f;
  }
  if (input.isKeyDown(sf::Keyboard::A)) {
    direction.x -= 1.0f;
  }
  if (input.isKeyDown(sf::Keyboard::D)) {
    direction.x += 1.0f;
  }

  float speed = baseSpeed_;
  if (input.isKeyDown(sf::Keyboard::LShift) || input.isKeyDown(sf::Keyboard::RShift)) {
    speed *= sprintMultiplier_;
  }

  if (direction.x != 0.0f || direction.y != 0.0f) {
    direction = utils::normalize(direction);
    velocity_ = direction * speed;
  } else {
    velocity_ = {};
  }

  lastPosition_ = position();
  Entity::update(dt);

  const float moved = utils::distance(position(), lastPosition_);
  lastMovement_ = moved;
  if (moved > 0.0f) {
    distanceTraveled_ += moved;
    stepTimer_ += dt;
    if (stepTimer_ >= 0.35f) {
      steps_ += 1;
      audio.playSound("step", 35.0f);
      stepTimer_ = 0.0f;
    }
  } else {
    stepTimer_ = 0.3f;
  }
}

float Player::interactionRadius() const {
  return interactionRadius_;
}

float Player::distanceTraveled() const {
  return distanceTraveled_;
}

unsigned Player::stepCount() const {
  return steps_;
}

void Player::resetStats() {
  distanceTraveled_ = 0.0f;
  steps_ = 0;
  stepTimer_ = 0.0f;
  lastPosition_ = {};
  lastMovement_ = 0.0f;
}

void Player::revertPosition(const sf::Vector2f& position) {
  Entity::setPosition(position);
  distanceTraveled_ = std::max(0.0f, distanceTraveled_ - lastMovement_);
  lastMovement_ = 0.0f;
  lastPosition_ = position;
}

