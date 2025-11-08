#pragma once

#include <SFML/Graphics/Sprite.hpp>
#include <SFML/Graphics/RenderTarget.hpp>
#include <SFML/System/Vector2.hpp>

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

  void setSprite(const sf::Sprite& sprite);
  sf::Sprite& sprite();
  [[nodiscard]] const sf::Sprite& sprite() const;

 protected:
  sf::Sprite sprite_;
  sf::Vector2f velocity_{};
};

