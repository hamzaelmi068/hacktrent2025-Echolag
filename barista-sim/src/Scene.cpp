#include "Scene.hpp"

Scene::Scene(App& app, SceneContext context)
    : app_(app), context_(context) {}

App& Scene::app() {
  return app_;
}

SceneContext& Scene::context() {
  return context_;
}

