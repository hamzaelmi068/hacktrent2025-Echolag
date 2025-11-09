#include "NPC.hpp"

#include <cmath>
#include <utility>

NPC::NPC(std::string name) : name_(std::move(name)) {}

void NPC::setName(std::string name) {
  name_ = std::move(name);
}

const std::string& NPC::name() const {
  return name_;
}

void NPC::setIdleOffset(float amplitude, float speed) {
  idleAmplitude_ = amplitude;
  idleSpeed_ = speed;
}

void NPC::setPosition(const sf::Vector2f& position) {
  basePosition_ = position;
  Entity::setPosition(position);
}

void NPC::updateIdle(float dt) {
  idlePhase_ += idleSpeed_ * dt;
  const float offset = std::sin(idlePhase_) * idleAmplitude_;
  if (hasSprite()) {
    sprite().setPosition(basePosition_.x, basePosition_.y + offset);
  }
}

