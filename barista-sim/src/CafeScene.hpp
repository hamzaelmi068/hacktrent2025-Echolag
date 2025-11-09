#pragma once

#include <SFML/Graphics.hpp>
#include <SFML/System/Clock.hpp>
#include <SFML/System/Vector2.hpp>
#include <string>
#include <vector>

#include "Barista.hpp"
#include "Customer.hpp"
#include "DialogueUI.hpp"
#include "HUD.hpp"
#include "Player.hpp"
#include "Scene.hpp"
#include "Timer.hpp"

class CafeScene : public Scene {
 public:
  CafeScene(App& app, SceneContext context);

  void onEnter() override;
  void onExit() override;

  void handleEvent(const sf::Event& event) override;
  void update(float dt) override;
  void draw(sf::RenderTarget& target) override;

 private:
  void setupWorld();
  void beginConversation();
  void refreshDialogue();
  void handleOptionSelection(std::size_t index);
  void submitName();
  void finalizeOrder();
  void updateCustomers(float dt);
  void updateCollisions(const sf::Vector2f& previousPos);
  void updateQueuePenalty(float dt);

  sf::Sprite background_;
  Player player_;
  Barista barista_;
  std::vector<Customer> customers_;
  std::vector<std::vector<sf::Vector2f>> customerPaths_;

  std::vector<sf::FloatRect> colliders_;

  DialogueUI dialogue_;
  HUD hud_;

  bool inConversation_{false};
  std::string nameBuffer_;
  float idleTimer_{0.0f};
  bool penaltyTriggered_{false};

  sf::Clock orderClock_;
  float penaltyTime_{0.0f};
  float distanceAtConversationStart_{0.0f};
  unsigned stepsAtConversationStart_{0};

  float totalElapsed_{0.0f};
};

