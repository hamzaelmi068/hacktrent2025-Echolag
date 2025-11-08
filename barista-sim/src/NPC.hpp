#pragma once

#include "Entity.hpp"

#include <SFML/System/Vector2.hpp>
#include <string>

class NPC : public Entity {
 public:
  NPC() = default;
  explicit NPC(std::string name);

  void setName(std::string name);
  [[nodiscard]] const std::string& name() const;

  void setIdleOffset(float amplitude, float speed);
  void setPosition(const sf::Vector2f& position);
  void updateIdle(float dt);

 private:
  std::string name_;
  float idleAmplitude_{4.0f};
  float idleSpeed_{2.0f};
  float idlePhase_{0.0f};
  sf::Vector2f basePosition_{};
};

