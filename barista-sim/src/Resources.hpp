#pragma once

#include <SFML/Audio/SoundBuffer.hpp>
#include <SFML/Graphics/Font.hpp>
#include <SFML/Graphics/Texture.hpp>
#include <string>
#include <unordered_map>

class ResourceManager {
 public:
  void loadTexture(const std::string& id, const std::string& path);
  void loadFont(const std::string& id, const std::string& path);
  void loadSoundBuffer(const std::string& id, const std::string& path);

  [[nodiscard]] const sf::Texture& texture(const std::string& id) const;
  [[nodiscard]] const sf::Font& font(const std::string& id) const;
  [[nodiscard]] const sf::SoundBuffer& soundBuffer(const std::string& id) const;

  void clear();

 private:
  std::unordered_map<std::string, sf::Texture> textures_;
  std::unordered_map<std::string, sf::Font> fonts_;
  std::unordered_map<std::string, sf::SoundBuffer> sounds_;
};

