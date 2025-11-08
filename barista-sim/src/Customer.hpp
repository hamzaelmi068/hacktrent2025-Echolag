#pragma once

#include "NPC.hpp"
#include "Pathfinding.hpp"

#include <vector>

class Customer : public NPC {
 public:
  Customer();

  void setPath(const std::vector<sf::Vector2f>& nodes);
  void update(float dt) override;
  void reset();

 private:
  PathFollower follower_;
  float shuffleTimer_{0.0f};
};

