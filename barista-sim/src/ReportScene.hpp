#pragma once

#include "Scene.hpp"

#include <SFML/Graphics/RectangleShape.hpp>
#include <SFML/Graphics/Sprite.hpp>
#include <SFML/Graphics/Text.hpp>
#include <string>
#include <vector>

struct OrderReport {
  float timeSeconds{0.0f};
  float pathDistance{0.0f};
  unsigned steps{0};
  bool complete{false};
  std::vector<std::string> missingFields;
  std::string tip;
};

class ReportScene : public Scene {
 public:
  ReportScene(App& app, SceneContext context, OrderReport report);

  void onEnter() override;
  void handleEvent(const sf::Event& event) override;
  void update(float dt) override;
  void draw(sf::RenderTarget& target) override;

 private:
  void buildUI();

  OrderReport report_;
  sf::RectangleShape backdrop_;
  sf::Text titleText_;
  sf::Text statsText_;
  sf::Text tipText_;
  sf::Text promptText_;
};

