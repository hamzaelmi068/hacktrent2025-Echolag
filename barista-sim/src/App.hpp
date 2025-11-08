#pragma once

#include <SFML/Graphics/RenderWindow.hpp>
#include <functional>
#include <memory>

#include "Audio.hpp"
#include "Input.hpp"
#include "Resources.hpp"
#include "Scene.hpp"

class CafeScene;
class ReportScene;
struct OrderReport;

class App {
 public:
  App();
  ~App();

  void run();

  void showReport(const OrderReport& report);
  void restartSimulation();

  ResourceManager& resources();
  AudioManager& audio();
  InputManager& input();
  sf::RenderWindow& window();

 private:
  using SceneFactory = std::function<std::unique_ptr<Scene>()>;

  void processEvents();
  void update(float dt);
  void render();

  void requestScene(SceneFactory factory);
  void applyPendingScene();
  SceneContext createContext();

  sf::RenderWindow window_;
  ResourceManager resources_;
  AudioManager audio_;
  InputManager input_;

  std::unique_ptr<Scene> currentScene_;
  SceneFactory pendingScene_;
  bool running_{true};
};

