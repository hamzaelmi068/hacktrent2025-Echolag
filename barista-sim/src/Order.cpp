#include "Order.hpp"

void Order::reset() {
  drink.clear();
  size.clear();
  milk.clear();
  customerName.clear();
}

bool Order::isComplete() const {
  return !drink.empty() && !size.empty() && !milk.empty() && !customerName.empty();
}

std::vector<std::string> Order::missingFields() const {
  std::vector<std::string> missing;
  if (drink.empty()) {
    missing.emplace_back("drink");
  }
  if (size.empty()) {
    missing.emplace_back("size");
  }
  if (milk.empty()) {
    missing.emplace_back("milk");
  }
  if (customerName.empty()) {
    missing.emplace_back("name");
  }
  return missing;
}

OrderValidation validateOrder(const Order& order) {
  OrderValidation result;
  result.missing = order.missingFields();
  result.complete = result.missing.empty();
  return result;
}

