#include "ReportScene.hpp"

#include <SFML/Window/Keyboard.hpp>
#include <iomanip>
#include <sstream>

#include "App.hpp"
#include "Resources.hpp"

ReportScene::ReportScene(App& app, SceneContext context, OrderReport report)
    : Scene(app, context), report_(std::move(report)) {
  buildUI();
}

void ReportScene::onEnter() {
  context().audio.playSound("ding", 60.0f);
}

void ReportScene::handleEvent(const sf::Event& event) {
  if (event.type == sf::Event::KeyPressed) {
    if (event.key.code == sf::Keyboard::Enter || event.key.code == sf::Keyboard::Space) {
      app().restartSimulation();
    } else if (event.key.code == sf::Keyboard::Escape) {
      app().window().close();
    }
  }
}

void ReportScene::update(float /*dt*/) {
  // No animated elements yet.
}

void ReportScene::draw(sf::RenderTarget& target) {
  target.draw(backdrop_);
  target.draw(titleText_);
  target.draw(statsText_);
  target.draw(tipText_);
  target.draw(promptText_);
}

void ReportScene::buildUI() {
  auto& resources = context().resources;
  const auto& font = resources.font("ui");

  backdrop_.setSize({800.0f, 420.0f});
  backdrop_.setFillColor(sf::Color(20, 20, 30, 240));
  backdrop_.setOrigin(backdrop_.getSize() * 0.5f);
  backdrop_.setPosition(640.0f, 360.0f);
  backdrop_.setOutlineColor(sf::Color(255, 255, 255, 80));
  backdrop_.setOutlineThickness(2.0f);

  titleText_.setFont(font);
  titleText_.setCharacterSize(36);
  titleText_.setFillColor(sf::Color::White);
  titleText_.setString("Order Summary");
  titleText_.setPosition(backdrop_.getPosition().x - 200.0f, backdrop_.getPosition().y - 150.0f);

  std::ostringstream stats;
  stats << std::fixed << std::setprecision(1);
  stats << "Time to order: " << report_.timeSeconds << "s\n";
  stats << "Path distance: " << report_.pathDistance << " px\n";
  stats << "Steps taken: " << report_.steps << "\n";
  stats << "Order complete: " << (report_.complete ? "Yes" : "No");

  if (!report_.missingFields.empty()) {
    stats << "\nMissing: ";
    for (std::size_t i = 0; i < report_.missingFields.size(); ++i) {
      stats << report_.missingFields[i];
      if (i + 1 < report_.missingFields.size()) {
        stats << ", ";
      }
    }
  }

  statsText_.setFont(font);
  statsText_.setCharacterSize(24);
  statsText_.setFillColor(sf::Color(220, 220, 220));
  statsText_.setString(stats.str());
  statsText_.setPosition(backdrop_.getPosition().x - 200.0f, backdrop_.getPosition().y - 80.0f);

  tipText_.setFont(font);
  tipText_.setCharacterSize(20);
  tipText_.setFillColor(sf::Color(180, 220, 255));
  tipText_.setString("Tip: " + (report_.tip.empty() ? "Great work! Keep refining your flow." : report_.tip));
  tipText_.setPosition(backdrop_.getPosition().x - 200.0f, backdrop_.getPosition().y + 90.0f);

  promptText_.setFont(font);
  promptText_.setCharacterSize(18);
  promptText_.setFillColor(sf::Color(200, 200, 200));
  promptText_.setString("Enter/Space – Replay  •  Esc – Quit");
  promptText_.setPosition(backdrop_.getPosition().x - 200.0f, backdrop_.getPosition().y + 150.0f);
}

