#pragma once

#include <SFML/Audio/Music.hpp>
#include <SFML/Audio/Sound.hpp>
#include <string>
#include <unordered_map>

class ResourceManager;

class AudioManager {
 public:
  void setResources(ResourceManager* resources);

  void playMusic(const std::string& path, bool loop = true, float volume = 50.0f);
  void stopMusic();

  void playSound(const std::string& bufferId, float volume = 100.0f);
  void setMasterVolume(float volume);
  [[nodiscard]] float masterVolume() const;

 private:
  ResourceManager* resources_{nullptr};
  struct SoundEntry {
    SoundEntry(const sf::SoundBuffer& buffer, float volume);

    sf::Sound sound;
    float baseVolume{100.0f};
  };

  sf::Music music_;
  std::unordered_map<std::string, SoundEntry> sounds_;
  float masterVolume_{100.0f};
  float musicBaseVolume_{50.0f};
};

