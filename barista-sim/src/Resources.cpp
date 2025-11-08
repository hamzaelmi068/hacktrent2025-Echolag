#include "Resources.hpp"

#include <stdexcept>

void ResourceManager::loadTexture(const std::string& id, const std::string& path) {
  sf::Texture texture;
  if (!texture.loadFromFile(path)) {
    throw std::runtime_error("Failed to load texture: " + path);
  }
  textures_.insert_or_assign(id, std::move(texture));
}

void ResourceManager::loadFont(const std::string& id, const std::string& path) {
  sf::Font font;
  if (!font.loadFromFile(path)) {
    throw std::runtime_error("Failed to load font: " + path);
  }
  fonts_.insert_or_assign(id, std::move(font));
}

void ResourceManager::loadSoundBuffer(const std::string& id, const std::string& path) {
  sf::SoundBuffer buffer;
  if (!buffer.loadFromFile(path)) {
    throw std::runtime_error("Failed to load sound: " + path);
  }
  sounds_.insert_or_assign(id, std::move(buffer));
}

const sf::Texture& ResourceManager::texture(const std::string& id) const {
  const auto it = textures_.find(id);
  if (it == textures_.end()) {
    throw std::runtime_error("Missing texture: " + id);
  }
  return it->second;
}

const sf::Font& ResourceManager::font(const std::string& id) const {
  const auto it = fonts_.find(id);
  if (it == fonts_.end()) {
    throw std::runtime_error("Missing font: " + id);
  }
  return it->second;
}

const sf::SoundBuffer& ResourceManager::soundBuffer(const std::string& id) const {
  const auto it = sounds_.find(id);
  if (it == sounds_.end()) {
    throw std::runtime_error("Missing sound buffer: " + id);
  }
  return it->second;
}

void ResourceManager::clear() {
  textures_.clear();
  fonts_.clear();
  sounds_.clear();
}

