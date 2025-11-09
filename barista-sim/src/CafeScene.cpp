#include "CafeScene.hpp"

#include <SFML/Config.hpp>
#include <SFML/Window/Keyboard.hpp>
#include <algorithm>

#include "App.hpp"
#include "Audio.hpp"
#include "Order.hpp"
#include "ReportScene.hpp"
#include "Resources.hpp"
#include "Utils.hpp"

namespace {
const char* kAmbientTrack = "assets/audio/ambience.ogg";

bool isPrintable(sf::Uint32 code) {
  return code >= 32 && code <= 126;
}

std::string toPrintableString(const std::string& source, std::size_t maxLength) {
  if (source.size() <= maxLength) {
    return source;
  }
  return source.substr(0, maxLength);
}
}  // namespace

CafeScene::CafeScene(App& app, SceneContext context)
    : Scene(app, context),
      barista_({{"Latte", "Americano", "Cappuccino", "Mocha"},
                {"Small", "Medium", "Large"},
                {"Whole Milk", "Oat Milk", "Almond Milk", "No Milk"}}) {
  dialogue_.initialize(context.resources);
  hud_.initialize(context.resources);
  setupWorld();
}

void CafeScene::onEnter() {
  context().audio.playMusic(kAmbientTrack, true, 35.0f);
  inConversation_ = false;
  nameBuffer_.clear();
  idleTimer_ = 0.0f;
  penaltyTriggered_ = false;
  penaltyTime_ = 0.0f;
  totalElapsed_ = 0.0f;
  player_.resetStats();
  dialogue_.setVisible(false);
  hud_.clearHint();
}

void CafeScene::onExit() {
  context().audio.stopMusic();
}

void CafeScene::handleEvent(const sf::Event& event) {
  auto handleKeyPress = [&](sf::Keyboard::Key key) {
    if (key == sf::Keyboard::Escape) {
      app().window().close();
      return;
    }

    if (!inConversation_) {
      if (key == sf::Keyboard::E) {
        const float distance = utils::distance(player_.position(), barista_.position());
        if (distance <= player_.interactionRadius()) {
          beginConversation();
        }
      }
    } else {
      if (!barista_.requiresInput()) {
        if (key >= sf::Keyboard::Num1 && key <= sf::Keyboard::Num4) {
          const std::size_t index = static_cast<std::size_t>(key - sf::Keyboard::Num1);
          handleOptionSelection(index);
        } else if (key == sf::Keyboard::Enter) {
          if (barista_.state() == Barista::State::Confirm || barista_.state() == Barista::State::Complete) {
            finalizeOrder();
          }
        }
      } else {
        if (key == sf::Keyboard::Enter && !nameBuffer_.empty()) {
          submitName();
        }
      }
    }
  };

  auto handleTextInput = [&](char32_t unicode) {
    if (!inConversation_ || !barista_.requiresInput()) {
      return;
    }

    if (unicode == 8) {  // backspace
      if (!nameBuffer_.empty()) {
        nameBuffer_.pop_back();
        dialogue_.setInputText(nameBuffer_);
      }
    } else if (unicode == 13) {
      if (!nameBuffer_.empty()) {
        submitName();
      }
    } else if (isPrintable(unicode)) {
      nameBuffer_.push_back(static_cast<char>(unicode));
      nameBuffer_ = toPrintableString(nameBuffer_, 16U);
      dialogue_.setInputText(nameBuffer_);
    }
  };

#if SFML_VERSION_MAJOR >= 3
  if (const auto* key = event.getIf<sf::Event::KeyPressed>()) {
    handleKeyPress(key->code);
  } else if (const auto* text = event.getIf<sf::Event::TextEntered>()) {
    handleTextInput(text->unicode);
  }
#else
  if (event.type == sf::Event::KeyPressed) {
    handleKeyPress(event.key.code);
  } else if (event.type == sf::Event::TextEntered) {
    handleTextInput(event.text.unicode);
  }
#endif
}

void CafeScene::update(float dt) {
  totalElapsed_ += dt;

  const sf::Vector2f previous = player_.position();
  player_.update(dt, context().input, context().audio);
  updateCollisions(previous);

  updateCustomers(dt);

  if (inConversation_) {
    idleTimer_ += dt;
    updateQueuePenalty(dt);
  }

  dialogue_.update(dt);
  hud_.update(totalElapsed_, barista_.order(), inConversation_);
}

void CafeScene::draw(sf::RenderTarget& target) {
  target.draw(background_);

  for (auto& customer : customers_) {
    customer.draw(target);
  }

  barista_.draw(target);
  player_.draw(target);

  hud_.draw(target);
  dialogue_.draw(target);
}

void CafeScene::setupWorld() {
  auto& resources = context().resources;

  const auto& bgTexture = resources.texture("cafe_bg");
  background_.setTexture(bgTexture);
  background_.setPosition(0.0f, 0.0f);
  const auto bgSize = bgTexture.getSize();
  if (bgSize.x > 0 && bgSize.y > 0) {
    background_.setScale(1280.0f / static_cast<float>(bgSize.x),
                         720.0f / static_cast<float>(bgSize.y));
  }

  sf::Sprite playerSprite(resources.texture("player"));
  playerSprite.setOrigin(playerSprite.getLocalBounds().width / 2.0f,
                         playerSprite.getLocalBounds().height / 2.0f);
  const auto playerSize = playerSprite.getTexture()->getSize();
  if (playerSize.x > 0 && playerSize.y > 0) {
    playerSprite.setScale(72.0f / static_cast<float>(playerSize.x),
                          120.0f / static_cast<float>(playerSize.y));
  }
  player_.setSprite(playerSprite);
  player_.setPosition({360.0f, 540.0f});

  sf::Sprite baristaSprite(resources.texture("barista"));
  baristaSprite.setOrigin(baristaSprite.getLocalBounds().width / 2.0f,
                          baristaSprite.getLocalBounds().height);
  const auto baristaSize = baristaSprite.getTexture()->getSize();
  if (baristaSize.x > 0 && baristaSize.y > 0) {
    baristaSprite.setScale(80.0f / static_cast<float>(baristaSize.x),
                           140.0f / static_cast<float>(baristaSize.y));
  }
  barista_.setSprite(baristaSprite);
  barista_.setPosition({640.0f, 260.0f});

  sf::Sprite customerSprite(resources.texture("customer"));
  customerSprite.setOrigin(customerSprite.getLocalBounds().width / 2.0f,
                           customerSprite.getLocalBounds().height);
  const auto customerSize = customerSprite.getTexture()->getSize();
  if (customerSize.x > 0 && customerSize.y > 0) {
    customerSprite.setScale(70.0f / static_cast<float>(customerSize.x),
                            110.0f / static_cast<float>(customerSize.y));
  }

  customers_.clear();
  customerPaths_.clear();
  const std::vector<sf::Vector2f> queueTargets = {
      {720.0f, 420.0f},
      {780.0f, 470.0f},
      {840.0f, 520.0f},
  };

  for (std::size_t i = 0; i < queueTargets.size(); ++i) {
    Customer customer;
    customer.setSprite(customerSprite);
    std::vector<sf::Vector2f> path = {
        {1100.0f + static_cast<float>(i) * 40.0f, 710.0f},
        queueTargets[i]};
    customer.setPath(path);
    customers_.push_back(customer);
    customerPaths_.push_back(path);
  }

  colliders_.clear();
  colliders_.push_back({0.0f, 180.0f, 1280.0f, 160.0f});   // Counter row
  colliders_.push_back({120.0f, 360.0f, 240.0f, 120.0f});  // Tables
  colliders_.push_back({420.0f, 380.0f, 160.0f, 120.0f});
  colliders_.push_back({980.0f, 360.0f, 200.0f, 140.0f});
}

void CafeScene::beginConversation() {
  context().audio.playSound("ui_click", 50.0f);
  barista_.startConversation();
  inConversation_ = true;
  nameBuffer_.clear();
  idleTimer_ = 0.0f;
  penaltyTriggered_ = false;
  penaltyTime_ = 0.0f;
  orderClock_.restart();
  distanceAtConversationStart_ = player_.distanceTraveled();
  stepsAtConversationStart_ = player_.stepCount();
  hud_.clearHint();
  refreshDialogue();
}

void CafeScene::refreshDialogue() {
  dialogue_.setDialogue("Barista", barista_.prompt(), barista_.options(), barista_.requiresInput());
  if (barista_.requiresInput()) {
    dialogue_.setInputText(nameBuffer_);
  }
}

void CafeScene::handleOptionSelection(std::size_t index) {
  if (index >= barista_.options().size()) {
    return;
  }
  context().audio.playSound("ui_click", 45.0f);
  barista_.selectOption(index);
  idleTimer_ = 0.0f;
  penaltyTriggered_ = false;
  hud_.clearHint();
  refreshDialogue();

  if (barista_.state() == Barista::State::Complete) {
    finalizeOrder();
  }
}

void CafeScene::submitName() {
  barista_.submitName(nameBuffer_);
  context().audio.playSound("ui_click", 45.0f);
  idleTimer_ = 0.0f;
  penaltyTriggered_ = false;
  hud_.clearHint();
  refreshDialogue();
  if (barista_.state() == Barista::State::Confirm) {
    // wait for player to acknowledge with Enter / option
  }
}

void CafeScene::finalizeOrder() {
  const auto validation = validateOrder(barista_.order());
  OrderReport report;
  report.complete = validation.complete;
  report.missingFields = validation.missing;
  report.timeSeconds = orderClock_.getElapsedTime().asSeconds() + penaltyTime_;
  report.pathDistance = std::max(0.0f, player_.distanceTraveled() - distanceAtConversationStart_);
  report.steps = player_.stepCount() - stepsAtConversationStart_;
  report.tip = validation.complete ? "Consider approaching from the left aisle for a shorter path."
                                   : "Make sure to fill in every field before confirming.";

  inConversation_ = false;
  dialogue_.setVisible(false);
  hud_.clearHint();

  app().showReport(report);
}

void CafeScene::updateCustomers(float dt) {
  for (std::size_t i = 0; i < customers_.size(); ++i) {
    customers_[i].update(dt);
  }
}

void CafeScene::updateCollisions(const sf::Vector2f& previousPos) {
  for (const auto& collider : colliders_) {
    if (player_.bounds().intersects(collider)) {
      player_.revertPosition(previousPos);
      break;
    }
  }
}

void CafeScene::updateQueuePenalty(float dt) {
  if (!penaltyTriggered_ && idleTimer_ > 6.0f && !customers_.empty()) {
    penaltyTriggered_ = true;
    penaltyTime_ += 3.0f;
    context().audio.playSound("ui_click", 30.0f);
    hud_.setHint("Take your time! Queue is waiting...");
  }
}

