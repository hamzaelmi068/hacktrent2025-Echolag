#include "HUD.hpp"

#include <iomanip>
#include <sstream>

#include "Order.hpp"
#include "Resources.hpp"

void HUD::initialize(const ResourceManager& resources) {
  const auto& font = resources.font("ui");

  clockText_.setFont(font);
  clockText_.setCharacterSize(24);
  clockText_.setFillColor(sf::Color::White);
  clockText_.setPosition(24.0f, 20.0f);

  promptText_.setFont(font);
  promptText_.setCharacterSize(20);
  promptText_.setFillColor(sf::Color(255, 214, 153));
  promptText_.setPosition(24.0f, 56.0f);
  promptText_.setString("WASD to move, E to interact");

  checklistText_.setFont(font);
  checklistText_.setCharacterSize(20);
  checklistText_.setFillColor(sf::Color(200, 220, 255));
  checklistText_.setPosition(980.0f, 20.0f);

  hintText_.setFont(font);
  hintText_.setCharacterSize(18);
  hintText_.setFillColor(sf::Color(200, 200, 200));
  hintText_.setPosition(980.0f, 120.0f);
  hintText_.setString("E to interact");
}

void HUD::update(float elapsedSeconds, const Order& order, bool interacting) {
  std::ostringstream oss;
  oss << "Time: " << std::fixed << std::setprecision(1) << elapsedSeconds << "s";
  clockText_.setString(oss.str());

  checklistText_.setString(buildChecklist(order));

  if (!hasCustomHint_) {
    if (interacting) {
      hintText_.setString("1-4 to select • Enter to confirm");
    } else {
      hintText_.setString("E to interact");
    }
  }
}

void HUD::draw(sf::RenderTarget& target) const {
  target.draw(clockText_);
  target.draw(promptText_);
  target.draw(checklistText_);
  target.draw(hintText_);
}

void HUD::setPrompt(const std::string& prompt) {
  promptText_.setString(prompt);
}

void HUD::setHint(const std::string& hint) {
  hintText_.setString(hint);
  hasCustomHint_ = true;
}

void HUD::clearHint() {
  hasCustomHint_ = false;
  hintText_.setString("");
}

std::string HUD::buildChecklist(const Order& order) const {
  auto check = [](bool value) -> std::string { return value ? "✅" : "⬜"; };

  std::ostringstream oss;
  oss << check(!order.drink.empty()) << " Drink\n"
      << check(!order.size.empty()) << " Size\n"
      << check(!order.milk.empty()) << " Milk\n"
      << check(!order.customerName.empty()) << " Name";
  return oss.str();
}

