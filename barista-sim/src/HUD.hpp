#pragma once

#include <SFML/Graphics.hpp>
#include <string>

class ResourceManager;
struct Order;

class HUD {
 public:
  void initialize(const ResourceManager& resources);
  void update(float elapsedSeconds, const Order& order, bool interacting);
  void draw(sf::RenderTarget& target) const;

  void setPrompt(const std::string& prompt);
  void setHint(const std::string& hint);
  void clearHint();

 private:
  std::string buildChecklist(const Order& order) const;

  sf::Text clockText_;
  sf::Text promptText_;
  sf::Text checklistText_;
  sf::Text hintText_;
  bool hasCustomHint_{false};
};

