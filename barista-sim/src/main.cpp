#include "App.hpp"
#include <iostream>

int main() {
  try {
    App app;
    app.run();
  } catch (const std::exception& ex) {
    std::cerr << "Fatal error: " << ex.what() << '\n';
    return 1;
  }

  return 0;
}

