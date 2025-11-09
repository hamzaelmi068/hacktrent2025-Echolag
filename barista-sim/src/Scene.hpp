#pragma once

#include <SFML/Graphics.hpp>
#include <SFML/Window.hpp>

class App;
class ResourceManager;
class AudioManager;
class InputManager;

struct SceneContext {
  sf::RenderWindow& window;
  ResourceManager& resources;
  AudioManager& audio;
  InputManager& input;
};

class Scene {
 public:
  Scene(App& app, SceneContext context);
  virtual ~Scene() = default;

  virtual void onEnter() {}
  virtual void onExit() {}

  virtual void handleEvent(const sf::Event& event) = 0;
  virtual void update(float dt) = 0;
  virtual void draw(sf::RenderTarget& target) = 0;

 protected:
  App& app();
  SceneContext& context();

 private:
  App& app_;
  SceneContext context_;
};

