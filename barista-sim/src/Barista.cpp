#include "Barista.hpp"

#include <stdexcept>

Barista::Barista(MenuOptions menu) : menu_(std::move(menu)) {}

void Barista::startConversation() {
  order_.reset();
  state_ = State::AskDrink;
  updatePromptAndOptions();
}

void Barista::resetConversation() {
  state_ = State::Idle;
  options_.clear();
  prompt_.clear();
  order_.reset();
}

void Barista::selectOption(std::size_t index) {
  if (state_ == State::AskDrink) {
    if (index >= menu_.drinks.size()) {
      throw std::out_of_range("Invalid drink option");
    }
    order_.drink = menu_.drinks[index];
    state_ = State::AskSize;
  } else if (state_ == State::AskSize) {
    if (index >= menu_.sizes.size()) {
      throw std::out_of_range("Invalid size option");
    }
    order_.size = menu_.sizes[index];
    state_ = State::AskMilk;
  } else if (state_ == State::AskMilk) {
    if (index >= menu_.milks.size()) {
      throw std::out_of_range("Invalid milk option");
    }
    order_.milk = menu_.milks[index];
    state_ = State::AskName;
  } else if (state_ == State::Confirm) {
    state_ = State::Complete;
  }

  updatePromptAndOptions();
}

void Barista::submitName(const std::string& name) {
  if (state_ != State::AskName) {
    return;
  }
  order_.customerName = name;
  state_ = State::Confirm;
  finalizeOrder();
}

const std::string& Barista::prompt() const {
  return prompt_;
}

const std::vector<std::string>& Barista::options() const {
  return options_;
}

bool Barista::requiresInput() const {
  return state_ == State::AskName;
}

bool Barista::isConversationActive() const {
  return state_ != State::Idle && state_ != State::Complete;
}

const Order& Barista::order() const {
  return order_;
}

Barista::State Barista::state() const {
  return state_;
}

void Barista::advanceState() {
  switch (state_) {
    case State::AskDrink:
      state_ = State::AskSize;
      break;
    case State::AskSize:
      state_ = State::AskMilk;
      break;
    case State::AskMilk:
      state_ = State::AskName;
      break;
    case State::AskName:
      state_ = State::Confirm;
      break;
    case State::Confirm:
      state_ = State::Complete;
      break;
    default:
      break;
  }
}

void Barista::updatePromptAndOptions() {
  options_.clear();

  switch (state_) {
    case State::AskDrink:
      prompt_ = "Welcome! What can I get started for you?";
      options_ = menu_.drinks;
      break;
    case State::AskSize:
      prompt_ = "Great choice! What size would you like?";
      options_ = menu_.sizes;
      break;
    case State::AskMilk:
      prompt_ = "Any milk preference today?";
      options_ = menu_.milks;
      break;
    case State::AskName:
      prompt_ = "Perfect. Name for the order?";
      break;
    case State::Confirm:
      finalizeOrder();
      break;
    case State::Complete:
      prompt_ = "Your order is on its way! Feel free to take a seat.";
      options_.push_back("Thanks!");
      break;
    default:
      break;
  }
}

void Barista::finalizeOrder() {
  prompt_ = "Awesome! A " + order_.size + " " + order_.drink + " with " + order_.milk +
            " for " + order_.customerName + ".";
  options_.clear();
  options_.push_back("Sounds great!");
}

