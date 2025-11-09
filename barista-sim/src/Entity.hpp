#pragma once

#include <SFML/Graphics.hpp>
#include <SFML/System.hpp>
#include <optional>

class Entity {
 public:
  virtual ~Entity() = default;

  virtual void update(float dt);
  virtual void draw(sf::RenderTarget& target) const;

  void setPosition(const sf::Vector2f& position);
  void setVelocity(const sf::Vector2f& velocity);

  [[nodiscard]] sf::Vector2f position() const;
  [[nodiscard]] const sf::Vector2f& velocity() const;
  [[nodiscard]] sf::FloatRect bounds() const;

  void setSprite(sf::Sprite sprite);
  sf::Sprite& sprite();
  [[nodiscard]] const sf::Sprite& sprite() const;
  [[nodiscard]] bool hasSprite() const;

 protected:
  std::optional<sf::Sprite> sprite_;
  sf::Vector2f velocity_{};
};

