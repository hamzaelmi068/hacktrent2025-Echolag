#pragma once

#include <SFML/Graphics.hpp>
#include <string>
#include <vector>

class ResourceManager;

class DialogueUI {
 public:
  DialogueUI();

  void initialize(const ResourceManager& resources);
  void setVisible(bool visible);
  [[nodiscard]] bool isVisible() const;

  void setDialogue(const std::string& speaker, const std::string& message,
                   const std::vector<std::string>& options, bool requiresInput);
  void setInputText(const std::string& text);

  void update(float dt);
  void draw(sf::RenderTarget& target) const;

  void skipReveal();
  [[nodiscard]] bool isRevealed() const;

  void highlightOption(std::size_t index);
  [[nodiscard]] std::size_t highlightedOption() const;
  [[nodiscard]] std::size_t optionCount() const;
  [[nodiscard]] bool requiresTextInput() const;

 private:
  void refreshOptionText();

  bool visible_{false};
  bool requiresInput_{false};

  sf::RectangleShape panel_;
  sf::Text speakerText_;
  sf::Text messageText_;
  sf::Text hintText_;
  std::vector<sf::Text> optionTexts_;

  std::string fullMessage_;
  std::string displayedMessage_;
  float revealTimer_{0.0f};
  float charsPerSecond_{45.0f};
  std::size_t revealedCount_{0};
  std::size_t highlightedIndex_{0};
  std::string inputText_;
};

