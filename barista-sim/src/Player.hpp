#pragma once

#include "Entity.hpp"
#include "Input.hpp"

class AudioManager;

class Player : public Entity {
 public:
  Player();

  void update(float dt, const InputManager& input, AudioManager& audio);

  [[nodiscard]] float interactionRadius() const;
  [[nodiscard]] float distanceTraveled() const;
  [[nodiscard]] unsigned stepCount() const;

  void resetStats();
  void revertPosition(const sf::Vector2f& position);

 private:
  float baseSpeed_{180.0f};
  float sprintMultiplier_{1.35f};
  float interactionRadius_{96.0f};

  float distanceTraveled_{0.0f};
  unsigned steps_{0};
  float stepTimer_{0.0f};
  sf::Vector2f lastPosition_{};
  float lastMovement_{0.0f};
};

