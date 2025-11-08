#include "Entity.hpp"

void Entity::update(float dt) {
  sprite_.move(velocity_ * dt);
}

void Entity::draw(sf::RenderTarget& target) const {
  target.draw(sprite_);
}

void Entity::setPosition(const sf::Vector2f& position) {
  sprite_.setPosition(position);
}

void Entity::setVelocity(const sf::Vector2f& velocity) {
  velocity_ = velocity;
}

sf::Vector2f Entity::position() const {
  return sprite_.getPosition();
}

const sf::Vector2f& Entity::velocity() const {
  return velocity_;
}

sf::FloatRect Entity::bounds() const {
  return sprite_.getGlobalBounds();
}

void Entity::setSprite(const sf::Sprite& sprite) {
  sprite_ = sprite;
}

sf::Sprite& Entity::sprite() {
  return sprite_;
}

const sf::Sprite& Entity::sprite() const {
  return sprite_;
}

