#include <algorithm>
#include "Audio.hpp"

#include "Resources.hpp"

#include <stdexcept>

void AudioManager::setResources(ResourceManager* resources) {
  resources_ = resources;
}

void AudioManager::playMusic(const std::string& path, bool loop, float volume) {
  if (!music_.openFromFile(path)) {
    throw std::runtime_error("Failed to open music: " + path);
  }
  music_.setLoop(loop);
  musicBaseVolume_ = volume;
  music_.setVolume(musicBaseVolume_ * (masterVolume_ / 100.0f));
  music_.play();
}

void AudioManager::stopMusic() {
  music_.stop();
}

void AudioManager::playSound(const std::string& bufferId, float volume) {
  if (!resources_) {
    return;
  }

  auto& entry = sounds_[bufferId];
  entry.baseVolume = volume;
  entry.sound.stop();
  entry.sound.setBuffer(resources_->soundBuffer(bufferId));
  entry.sound.setVolume(entry.baseVolume * (masterVolume_ / 100.0f));
  entry.sound.play();
}

void AudioManager::setMasterVolume(float volume) {
  masterVolume_ = std::clamp(volume, 0.0f, 100.0f);
  music_.setVolume(musicBaseVolume_ * (masterVolume_ / 100.0f));
  for (auto& [_, entry] : sounds_) {
    entry.sound.setVolume(entry.baseVolume * (masterVolume_ / 100.0f));
  }
}

float AudioManager::masterVolume() const {
  return masterVolume_;
}

