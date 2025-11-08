#pragma once

#include <string>
#include <vector>

struct Order {
  std::string drink;
  std::string size;
  std::string milk;
  std::string customerName;

  void reset();
  [[nodiscard]] bool isComplete() const;
  [[nodiscard]] std::vector<std::string> missingFields() const;
};

struct MenuOptions {
  std::vector<std::string> drinks;
  std::vector<std::string> sizes;
  std::vector<std::string> milks;
};

struct OrderValidation {
  bool complete{false};
  std::vector<std::string> missing;
};

OrderValidation validateOrder(const Order& order);

