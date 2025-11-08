#include "DialogueUI.hpp"

#include <algorithm>
#include <SFML/Graphics/RenderTarget.hpp>
#include "Resources.hpp"

DialogueUI::DialogueUI() = default;

void DialogueUI::initialize(const ResourceManager& resources) {
  const auto& font = resources.font("ui");

  panel_.setSize(sf::Vector2f(1200.0f, 220.0f));
  panel_.setFillColor(sf::Color(20, 20, 26, 200));
  panel_.setOutlineColor(sf::Color(255, 255, 255, 60));
  panel_.setOutlineThickness(2.0f);
  panel_.setOrigin(panel_.getSize() * 0.5f);
  panel_.setPosition(640.0f, 620.0f);

  speakerText_.setFont(font);
  speakerText_.setCharacterSize(20);
  speakerText_.setFillColor(sf::Color(255, 214, 153));
  speakerText_.setPosition(panel_.getPosition().x - panel_.getSize().x / 2.0f + 24.0f,
                           panel_.getPosition().y - panel_.getSize().y / 2.0f + 16.0f);

  messageText_.setFont(font);
  messageText_.setCharacterSize(24);
  messageText_.setFillColor(sf::Color::White);
  messageText_.setPosition(speakerText_.getPosition().x,
                           speakerText_.getPosition().y + 36.0f);

  hintText_.setFont(font);
  hintText_.setCharacterSize(18);
  hintText_.setFillColor(sf::Color(200, 200, 200));
  hintText_.setPosition(panel_.getPosition().x + panel_.getSize().x / 2.0f - 260.0f,
                        panel_.getPosition().y + panel_.getSize().y / 2.0f - 40.0f);
}

void DialogueUI::setVisible(bool visible) {
  visible_ = visible;
}

bool DialogueUI::isVisible() const {
  return visible_;
}

void DialogueUI::setDialogue(const std::string& speaker, const std::string& message,
                             const std::vector<std::string>& options, bool requiresInput) {
  speakerText_.setString(speaker);
  fullMessage_ = message;
  displayedMessage_.clear();
  revealedCount_ = 0;
  revealTimer_ = 0.0f;
  requiresInput_ = requiresInput;
  optionTexts_.clear();
  highlightedIndex_ = 0;
  inputText_.clear();

  optionTexts_.reserve(options.size());
  for (std::size_t i = 0; i < options.size(); ++i) {
    sf::Text option;
    option.setFont(*messageText_.getFont());
    option.setCharacterSize(22);
    option.setFillColor(sf::Color(180, 180, 180));
    option.setString(std::to_string(i + 1) + ". " + options[i]);
    option.setPosition(messageText_.getPosition().x,
                       messageText_.getPosition().y + 120.0f + static_cast<float>(i) * 32.0f);
    optionTexts_.push_back(option);
  }

  hintText_.setString(requiresInput_ ? "Type name, Enter to confirm"
                                     : "Press number keys or click to choose");
  refreshOptionText();
  visible_ = true;
}

void DialogueUI::setInputText(const std::string& text) {
  inputText_ = text;
  refreshOptionText();
}

void DialogueUI::update(float dt) {
  if (!visible_) {
    return;
  }

  if (revealedCount_ < fullMessage_.size()) {
    revealTimer_ += dt * charsPerSecond_;
    const std::size_t newCount = static_cast<std::size_t>(revealTimer_);
    if (newCount > revealedCount_) {
      revealedCount_ = std::min(fullMessage_.size(), newCount);
      displayedMessage_ = fullMessage_.substr(0, revealedCount_);
      messageText_.setString(displayedMessage_);
    }
  } else {
    messageText_.setString(fullMessage_);
  }

  refreshOptionText();
}

void DialogueUI::draw(sf::RenderTarget& target) const {
  if (!visible_) {
    return;
  }

  target.draw(panel_);
  target.draw(speakerText_);
  target.draw(messageText_);
  for (const auto& option : optionTexts_) {
    target.draw(option);
  }
  target.draw(hintText_);
}

void DialogueUI::skipReveal() {
  revealedCount_ = fullMessage_.size();
  displayedMessage_ = fullMessage_;
  messageText_.setString(fullMessage_);
}

bool DialogueUI::isRevealed() const {
  return revealedCount_ >= fullMessage_.size();
}

void DialogueUI::highlightOption(std::size_t index) {
  if (optionTexts_.empty()) {
    highlightedIndex_ = 0;
    return;
  }
  highlightedIndex_ = std::min(index, optionTexts_.size() - 1);
  refreshOptionText();
}

std::size_t DialogueUI::highlightedOption() const {
  return highlightedIndex_;
}

std::size_t DialogueUI::optionCount() const {
  return optionTexts_.size();
}

bool DialogueUI::requiresTextInput() const {
  return requiresInput_;
}

void DialogueUI::refreshOptionText() {
  for (std::size_t i = 0; i < optionTexts_.size(); ++i) {
    optionTexts_[i].setFillColor(i == highlightedIndex_ ? sf::Color::White
                                                        : sf::Color(180, 180, 180));
  }

  if (requiresInput_) {
    if (optionTexts_.empty()) {
      sf::Text option;
      option.setFont(*messageText_.getFont());
      option.setCharacterSize(22);
      option.setPosition(messageText_.getPosition().x,
                         messageText_.getPosition().y + 120.0f);
      optionTexts_.push_back(option);
    }
    optionTexts_[0].setString("Name: " + inputText_ + "_");
    optionTexts_[0].setFillColor(sf::Color::White);
  }
}

