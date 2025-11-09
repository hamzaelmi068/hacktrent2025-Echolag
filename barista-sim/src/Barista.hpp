#pragma once

#include "NPC.hpp"
#include "Order.hpp"

#include <string>
#include <vector>

class Barista : public NPC {
 public:
  enum class State {
    Idle,
    AskDrink,
    AskSize,
    AskMilk,
    AskName,
    Confirm,
    Complete
  };

  explicit Barista(MenuOptions menu);

  void startConversation();
  void resetConversation();

  void selectOption(std::size_t index);
  void submitName(const std::string& name);

  [[nodiscard]] const std::string& prompt() const;
  [[nodiscard]] const std::vector<std::string>& options() const;
  [[nodiscard]] bool requiresInput() const;
  [[nodiscard]] bool isConversationActive() const;
  [[nodiscard]] const Order& order() const;
  [[nodiscard]] State state() const;

 private:
  void advanceState();
  void updatePromptAndOptions();
  void finalizeOrder();

  MenuOptions menu_;
  Order order_;
  State state_{State::Idle};
  std::string prompt_;
  std::vector<std::string> options_;
};

