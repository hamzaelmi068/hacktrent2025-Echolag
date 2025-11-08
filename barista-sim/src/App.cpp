#include "App.hpp"

#include <algorithm>
#include <iostream>

#include "CafeScene.hpp"
#include "ReportScene.hpp"
#include "Resources.hpp"

namespace {
constexpr unsigned kWindowWidth = 1280;
constexpr unsigned kWindowHeight = 720;
constexpr float kFixedTimeStep = 1.0f / 60.0f;
}  // namespace

App::App()
    : window_(sf::VideoMode(kWindowWidth, kWindowHeight), "Barista Ordering Simulator",
              sf::Style::Titlebar | sf::Style::Close) {
  window_.setVerticalSyncEnabled(false);
  window_.setFramerateLimit(60);

  audio_.setResources(&resources_);

  try {
    resources_.loadTexture("cafe_bg", "assets/textures/cafe_bg.png");
    resources_.loadTexture("player", "assets/textures/player.png");
    resources_.loadTexture("barista", "assets/textures/barista.png");
    resources_.loadTexture("customer", "assets/textures/customer.png");
    resources_.loadTexture("ui_panel", "assets/textures/ui_panel.png");

    resources_.loadFont("ui", "assets/fonts/ui_font.ttf");

    resources_.loadSoundBuffer("ding", "assets/audio/ding.ogg");
    resources_.loadSoundBuffer("step", "assets/audio/step.ogg");
    resources_.loadSoundBuffer("ui_click", "assets/audio/ui_click.ogg");
  } catch (const std::exception& ex) {
    std::cerr << "Failed to load resources: " << ex.what() << '\n';
    throw;
  }

  restartSimulation();
}

App::~App() {
  audio_.stopMusic();
  resources_.clear();
}

void App::run() {
  sf::Clock clock;
  float accumulator = 0.0f;

  while (running_ && window_.isOpen()) {
    input_.beginFrame();
    processEvents();

    applyPendingScene();
    if (!currentScene_) {
      running_ = false;
      continue;
    }

    const float frameTime = clock.restart().asSeconds();
    accumulator += std::min(frameTime, 0.25f);

    while (accumulator >= kFixedTimeStep) {
      update(kFixedTimeStep);
      accumulator -= kFixedTimeStep;
    }

    render();
    input_.endFrame();
  }
}

void App::showReport(const OrderReport& report) {
  requestScene([this, report]() {
    return std::make_unique<ReportScene>(*this, createContext(), report);
  });
}

void App::restartSimulation() {
  requestScene([this]() {
    return std::make_unique<CafeScene>(*this, createContext());
  });
}

ResourceManager& App::resources() {
  return resources_;
}

AudioManager& App::audio() {
  return audio_;
}

InputManager& App::input() {
  return input_;
}

sf::RenderWindow& App::window() {
  return window_;
}

void App::processEvents() {
  sf::Event event{};
  while (window_.pollEvent(event)) {
    if (event.type == sf::Event::Closed) {
      running_ = false;
      window_.close();
      break;
    }

    input_.handleEvent(event);

    if (currentScene_) {
      currentScene_->handleEvent(event);
    }
  }
}

void App::update(float dt) {
  if (currentScene_) {
    currentScene_->update(dt);
  }
}

void App::render() {
  window_.clear(sf::Color(26, 26, 26));

  if (currentScene_) {
    currentScene_->draw(window_);
  }

  window_.display();
}

void App::requestScene(SceneFactory factory) {
  pendingScene_ = std::move(factory);
}

void App::applyPendingScene() {
  if (!pendingScene_) {
    return;
  }

  if (currentScene_) {
    currentScene_->onExit();
  }

  currentScene_ = pendingScene_();
  pendingScene_ = SceneFactory{};

  if (currentScene_) {
    currentScene_->onEnter();
  }
}

SceneContext App::createContext() {
  return SceneContext{
      window_,
      resources_,
      audio_,
      input_,
  };
}

