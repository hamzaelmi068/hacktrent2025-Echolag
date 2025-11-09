#pragma once

#include <SFML/System/Vector2.hpp>
#include <cmath>
#include <random>

namespace utils {

template <typename T>
T clamp(const T& value, const T& min, const T& max) {
  return (value < min) ? min : (value > max ? max : value);
}

template <typename T>
T lerp(const T& a, const T& b, float t) {
  return static_cast<T>(a + (b - a) * t);
}

inline float length(const sf::Vector2f& v) {
  return std::sqrt(v.x * v.x + v.y * v.y);
}

inline sf::Vector2f normalize(const sf::Vector2f& v) {
  const float len = length(v);
  if (len <= 0.0001f) {
    return {};
  }
  return {v.x / len, v.y / len};
}

inline float distance(const sf::Vector2f& a, const sf::Vector2f& b) {
  return length(a - b);
}

inline std::mt19937& rng() {
  static std::random_device rd;
  static std::mt19937 gen(rd());
  return gen;
}

inline float randomFloat(float min, float max) {
  std::uniform_real_distribution<float> dist(min, max);
  return dist(rng());
}

}  // namespace utils

