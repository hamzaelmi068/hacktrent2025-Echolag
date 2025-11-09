#include <utility>
#include "Entity.hpp"

void Entity::update(float dt) {
  if (sprite_) {
    sprite_->move(velocity_ * dt);
  }
}

void Entity::draw(sf::RenderTarget& target) const {
  if (sprite_) {
    target.draw(*sprite_);
  }
}

void Entity::setPosition(const sf::Vector2f& position) {
  if (sprite_) {
    sprite_->setPosition(position);
  }
}

void Entity::setVelocity(const sf::Vector2f& velocity) {
  velocity_ = velocity;
}

sf::Vector2f Entity::position() const {
  return sprite_ ? sprite_->getPosition() : sf::Vector2f{};
}

const sf::Vector2f& Entity::velocity() const {
  return velocity_;
}

sf::FloatRect Entity::bounds() const {
  return sprite_ ? sprite_->getGlobalBounds() : sf::FloatRect{};
}

void Entity::setSprite(sf::Sprite sprite) {
  sprite_ = std::move(sprite);
}

sf::Sprite& Entity::sprite() {
  return sprite_.value();
}

const sf::Sprite& Entity::sprite() const {
  return sprite_.value();
}

bool Entity::hasSprite() const {
  return sprite_.has_value();
}

