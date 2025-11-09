"use client"
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react"

type PhaserModule = typeof import("phaser")
type ArcadeBody = import("phaser").Physics.Arcade.Body
type ArcadeStaticBody = import("phaser").Physics.Arcade.StaticBody

type DialogueStep = "idle" | "drink" | "size" | "milk" | "name" | "summary"

type DialogueState = {
  step: DialogueStep
  selections: {
    drink?: string
    size?: string
    milk?: string
    name?: string
  }
  startedAt?: number
  finishedAt?: number
}

const DRINK_OPTIONS = ["Latte", "Cappuccino", "Cold Brew"]
const SIZE_OPTIONS = ["Small", "Medium", "Large"]
const MILK_OPTIONS = ["Whole", "Oat", "Almond"]

const PANEL_BG = "linear-gradient(180deg, rgba(88, 57, 39, 0.97) 0%, rgba(64, 41, 28, 0.98) 100%)"

const formatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
})

const BaristaSimulator = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<any>(null)
  const ambientSourceRef = useRef<AudioBufferSourceNode | null>(null)

  const [promptVisible, setPromptVisible] = useState(false)
  const [dialogue, setDialogue] = useState<DialogueState>({
    step: "idle",
    selections: {},
  })
  const [nameInput, setNameInput] = useState("")

  const isDialogueActive = dialogue.step !== "idle" && dialogue.step !== "summary"

  const startDialogue = useCallback(() => {
    setDialogue({
      step: "drink",
      selections: {},
      startedAt: performance.now(),
    })
    setNameInput("")
    setPromptVisible(false)
  }, [])

  const closeSummary = () => {
    setDialogue({
      step: "idle",
      selections: {},
    })
    setPromptVisible(false)
  }

  const callbacksRef = useRef({
    startDialogue,
    setPromptVisible,
    isDialogueActive,
    finishAmbient: () => {
      if (ambientSourceRef.current) {
        try {
          ambientSourceRef.current.stop()
        } catch {
          // ignored
        }
        ambientSourceRef.current.disconnect()
        ambientSourceRef.current = null
      }
    },
  })
  callbacksRef.current.startDialogue = startDialogue
  callbacksRef.current.setPromptVisible = setPromptVisible
  callbacksRef.current.isDialogueActive = isDialogueActive

  const ensureAmbientAudio = useCallback((scene: any) => {
    if (!scene.sound.context) {
      return
    }
    const context = scene.sound.context
    const buffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate)
    const channel = buffer.getChannelData(0)
    for (let i = 0; i < buffer.length; i += 1) {
      channel[i] = (Math.random() * 2 - 1) * 0.0008
    }
    const source = context.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.connect(context.destination)
    try {
      source.start()
      ambientSourceRef.current = source
      scene.events.once("shutdown", () => {
        callbacksRef.current.finishAmbient()
      })
    } catch {
      // Autoplay might be blocked; ignore.
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current || gameRef.current) {
      return
    }

    let disposed = false

    const boot = async () => {
      const Phaser: PhaserModule = await import("phaser")
      if (!containerRef.current || gameRef.current || disposed) {
        return
      }

      const createTexture = (
        scene: InstanceType<typeof Phaser.Scene>,
        key: string,
        width: number,
        height: number,
        fillColor: number,
        radius = 8,
      ) => {
        const graphics = scene.add.graphics({ x: 0, y: 0 })
        graphics.setVisible(false)
        graphics.fillStyle(fillColor, 1)
        graphics.fillRoundedRect(0, 0, width, height, radius)
        graphics.generateTexture(key, width, height)
        graphics.destroy()
      }

      const createStickFigure = (
        scene: InstanceType<typeof Phaser.Scene>,
        key: string,
        {
          headColor = 0xfff1d0,
          bodyColor = 0x1f2a2e,
          accentColor = 0x3a6ea5,
        }: { headColor?: number; bodyColor?: number; accentColor?: number },
      ) => {
        const width = 56
        const height = 72
        const graphics = scene.add.graphics({ x: 0, y: 0 })
        graphics.setVisible(false)

        graphics.fillStyle(0x000000, 0)
        graphics.fillRect(0, 0, width, height)

        // Head
        graphics.fillStyle(headColor, 1)
        graphics.fillCircle(width / 2, 16, 12.5)
        graphics.fillStyle(0xffffff, 0.25)
        graphics.fillCircle(width / 2 - 4, 12, 5)

        // Torso outline
        graphics.lineStyle(6, bodyColor, 1)
        graphics.beginPath()
        graphics.moveTo(width / 2, 28)
        graphics.lineTo(width / 2, 50)
        graphics.strokePath()

        // Arms
        graphics.lineStyle(5, bodyColor, 1)
        graphics.beginPath()
        graphics.moveTo(width / 2 - 18, 37)
        graphics.lineTo(width / 2 + 18, 37)
        graphics.strokePath()

        // Waist detail
        graphics.lineStyle(4, accentColor, 0.7)
        graphics.beginPath()
        graphics.moveTo(width / 2 - 12, 43)
        graphics.lineTo(width / 2 + 12, 43)
        graphics.strokePath()

        // Legs
        graphics.lineStyle(6, bodyColor, 1)
        graphics.beginPath()
        graphics.moveTo(width / 2, 50)
        graphics.lineTo(width / 2 - 14, 68)
        graphics.moveTo(width / 2, 50)
        graphics.lineTo(width / 2 + 14, 68)
        graphics.strokePath()

        graphics.generateTexture(key, width, height)
        graphics.destroy()
      }

      const callbacks = callbacksRef
      const PhaserNS = Phaser

      class CafeScene extends PhaserNS.Scene {
        private cursors!: any
        private player!: any
        private barista!: any
        private infoText!: any
        private interactCooldown = 0

        constructor() {
          super("CafeScene")
        }

        preload() {
          createStickFigure(this, "player", {
            headColor: 0xf3c99c,
            bodyColor: 0x27343c,
            accentColor: 0x3f7a9d,
          })
          createStickFigure(this, "barista", {
            headColor: 0xd8a372,
            bodyColor: 0x2a1e15,
            accentColor: 0x5f8e5c,
          })
          createStickFigure(this, "customer", {
            headColor: 0xa16944,
            bodyColor: 0x1f2a30,
            accentColor: 0xb48ac2,
          })
          createTexture(this, "counter", 520, 130, 0x9b6b43, 22)
          createTexture(this, "table", 140, 60, 0xc99e6a, 12)
          const graphics = this.add.graphics({ x: 0, y: 0 })
          graphics.setVisible(false)
          graphics.fillStyle(0xbb9161, 1)
          graphics.fillRoundedRect(0, 0, 360, 70, 16)
          graphics.fillRoundedRect(200, 40, 140, 90, 16)
          graphics.generateTexture("tableL", 360, 120)
          graphics.destroy()
          createTexture(this, "plant", 48, 84, 0x5b8c64, 16)
          createTexture(this, "menu", 160, 110, 0x2f2b28, 12)
          createTexture(this, "window", 200, 120, 0xdfe8f1, 18)
        }

        create() {
          this.cameras.main.setBackgroundColor("#f7f1e3")

          for (let i = 0; i < 6; i += 1) {
            const x = 140 + i * 130
            const y = i % 2 === 0 ? 120 : 420
            this.add.rectangle(x, y, 110, 40, 0xe6d4c2, 0.35).setRotation(0.1)
          }

          this.add.image(200, 110, "window").setAlpha(0.92).setTint(0xd6eefc)

          const menuBoard = this.add.image(750, 95, "menu").setTint(0x1b1713)
          menuBoard.setScale(1.05, 1)
          this.add.text(705, 60, "Cafe Menu", {
            fontSize: "24px",
            color: "#f5d7a1",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
          })

          const menuItems = [
            { name: "Caramel Latte", price: "$4.50" },
            { name: "Cold Brew", price: "$3.80" },
            { name: "Vanilla Oat Capp", price: "$4.75" },
            { name: "Matcha Latte", price: "$4.20" },
          ]
          menuItems.forEach((item, index) => {
            this.add.text(705, 90 + index * 22, item.name, {
              fontSize: "16px",
              color: "#f0e4d2",
              fontFamily: "'Lucida Console', 'Monaco', 'monospace'",
            })
            this.add.text(865, 90 + index * 22, item.price, {
              fontSize: "16px",
              color: "#f6debe",
              fontFamily: "'Lucida Console', 'Monaco', 'monospace'",
            })
          })

          const counter = this.physics.add.staticImage(660, 240, "counter").setOrigin(0.5, 0.6)

          const tableL = this.add.image(340, 210, "tableL").setDepth(2).setAlpha(0.95)
          tableL.setScale(0.9, 0.85)

          this.barista = this.physics.add.staticSprite(340, 195, "barista").setDepth(1)

          const customer1 = this.physics.add.staticSprite(760, 250, "customer")
          const customer2 = this.physics.add.staticSprite(820, 250, "customer")
          customer1.setDepth(3)
          customer2.setDepth(3)
          customer2.setTint(0xb681a8)

          this.player = this.physics.add.sprite(240, 360, "player")
          this.player.setDepth(4)

          this.physics.add.collider(this.player, counter)
          this.physics.add.collider(this.player, customer1)
          this.physics.add.collider(this.player, customer2)
          this.physics.add.collider(this.player, this.barista)

          const playerBody = this.player.body as ArcadeBody | ArcadeStaticBody | null
          if (playerBody) {
            playerBody.setOffset(0, 4)
          }

          const counterBody = counter.body as ArcadeBody | ArcadeStaticBody | null
          if (counterBody) {
            counterBody.setOffset(0, 10)
          }

          this.add.image(210, 145, "plant").setDepth(0.5).setTint(0x4f7b59)

          this.infoText = this.add
            .text(480, 520, "Press E to talk", {
              fontSize: "20px",
              color: "#ffffff",
              fontFamily: "Inter, sans-serif",
            })
            .setOrigin(0.5)
            .setPadding(10, 6, 10, 6)
            .setBackgroundColor("rgba(28, 39, 45, 0.85)")
            .setDepth(20)
            .setVisible(false)

          const keyboard = this.input.keyboard
          if (!keyboard) {
            return
          }

          this.cursors = keyboard.addKeys({
            up: PhaserNS.Input.Keyboard.KeyCodes.W,
            down: PhaserNS.Input.Keyboard.KeyCodes.S,
            left: PhaserNS.Input.Keyboard.KeyCodes.A,
            right: PhaserNS.Input.Keyboard.KeyCodes.D,
            W: PhaserNS.Input.Keyboard.KeyCodes.W,
            A: PhaserNS.Input.Keyboard.KeyCodes.A,
            S: PhaserNS.Input.Keyboard.KeyCodes.S,
            D: PhaserNS.Input.Keyboard.KeyCodes.D,
            E: PhaserNS.Input.Keyboard.KeyCodes.E,
          })

          ensureAmbientAudio(this)
        }

        update(_: number, delta: number) {
          if (!this.player || !this.cursors) {
            return
          }

          const speed = 220
          let velocityX = 0
          let velocityY = 0

          if (this.cursors.W.isDown || this.cursors.up?.isDown) {
            velocityY = -speed
          } else if (this.cursors.S.isDown || this.cursors.down?.isDown) {
            velocityY = speed
          }

          if (this.cursors.A.isDown || this.cursors.left?.isDown) {
            velocityX = -speed
          } else if (this.cursors.D.isDown || this.cursors.right?.isDown) {
            velocityX = speed
          }

          this.player.setVelocity(velocityX, velocityY)
          if (velocityX !== 0 || velocityY !== 0) {
            this.player.setDepth(this.player.y)
          }

          const distance = PhaserNS.Math.Distance.Between(this.player.x, this.player.y, this.barista.x, this.barista.y)
          const inRange = distance < 110 && !callbacks.current.isDialogueActive
          this.infoText.setVisible(inRange)
          callbacks.current.setPromptVisible(inRange)

          if (this.interactCooldown > 0) {
            this.interactCooldown -= delta
          }

          if (inRange && this.interactCooldown <= 0 && PhaserNS.Input.Keyboard.JustDown(this.cursors.E)) {
            callbacks.current.startDialogue()
            this.interactCooldown = 600
            this.infoText.setVisible(false)
          }
        }
      }

      const config: ConstructorParameters<typeof PhaserNS.Game>[0] = {
        type: PhaserNS.AUTO,
        width: 960,
        height: 540,
        parent: containerRef.current as HTMLElement,
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
        scene: [CafeScene],
        backgroundColor: "#f7f1e3",
      }

      const game = new PhaserNS.Game(config)
      gameRef.current = game
    }

    boot()

    return () => {
      disposed = true
      callbacksRef.current.finishAmbient()
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [ensureAmbientAudio])

  const handleOptionSelect = useCallback((value: string) => {
    setDialogue((prev) => {
      if (prev.step === "drink") {
        return {
          ...prev,
          step: "size",
          selections: { ...prev.selections, drink: value },
        }
      }
      if (prev.step === "size") {
        return {
          ...prev,
          step: "milk",
          selections: { ...prev.selections, size: value },
        }
      }
      if (prev.step === "milk") {
        return {
          ...prev,
          step: "name",
          selections: { ...prev.selections, milk: value },
        }
      }
      return prev
    })
  }, [])

  const handleNameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!nameInput.trim()) {
      return
    }
    setDialogue((prev) => {
      const selections = { ...prev.selections, name: nameInput.trim() }
      return {
        step: "summary",
        selections,
        startedAt: prev.startedAt,
        finishedAt: performance.now(),
      }
    })
  }

  const totalSteps =
    dialogue.selections.drink && dialogue.selections.size && dialogue.selections.milk && dialogue.selections.name
      ? 4
      : Object.values(dialogue.selections).filter(Boolean).length
  const totalTime = dialogue.startedAt && dialogue.finishedAt ? (dialogue.finishedAt - dialogue.startedAt) / 1000 : null

  useEffect(() => {
    if (!isDialogueActive || dialogue.step === "name") {
      return
    }

    const options =
      dialogue.step === "drink"
        ? DRINK_OPTIONS
        : dialogue.step === "size"
          ? SIZE_OPTIONS
          : dialogue.step === "milk"
            ? MILK_OPTIONS
            : []

    const handleKeyDown = (event: KeyboardEvent) => {
      const choiceIndex = Number.parseInt(event.key, 10) - 1
      if (Number.isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= options.length) {
        return
      }
      event.preventDefault()
      handleOptionSelect(options[choiceIndex])
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [dialogue.step, handleOptionSelect, isDialogueActive])

  const renderOptions = () => {
    let title = ""
    let options: string[] = []
    if (dialogue.step === "drink") {
      title = "What can I get started for you?"
      options = DRINK_OPTIONS
    } else if (dialogue.step === "size") {
      title = "What size would you like?"
      options = SIZE_OPTIONS
    } else if (dialogue.step === "milk") {
      title = "Which milk do you prefer?"
      options = MILK_OPTIONS
    }

    return (
      <>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-amber-200/70">
          <span className="inline-block h-px w-6 bg-amber-200/30"></span>
          Taking your order
        </div>
        <h3 className="mt-3 font-serif text-2xl font-medium leading-relaxed text-amber-50">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-amber-100/60">Select an option below to continue</p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {options.map((option, index) => (
            <button
              key={option}
              onClick={() => handleOptionSelect(option)}
              className="group flex items-center gap-4 rounded-2xl border border-amber-200/20 bg-linear-to-br from-amber-50/10 to-amber-100/5 px-5 py-4 text-left font-medium text-amber-50 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-amber-200/40 hover:bg-linear-to-br hover:from-amber-50/15 hover:to-amber-100/10 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-300/50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-amber-600 font-bold text-amber-950 shadow-md transition-transform duration-200 group-hover:scale-110">
                {index + 1}
              </span>
              <span className="text-base">{option}</span>
            </button>
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="h-[540px] w-full overflow-hidden rounded-3xl border border-amber-900/20 bg-[#f7f1e3] shadow-2xl"
      />

      {promptVisible && !isDialogueActive && (
        <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center">
          <div className="animate-pulse rounded-full border border-amber-900/30 bg-linear-to-r from-amber-900/90 to-amber-800/90 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-amber-50 shadow-xl backdrop-blur-sm">
            <span className="mr-2 inline-block">☕</span>
            Press E to order
          </div>
        </div>
      )}

      {dialogue.step === "summary" && (
        <div className="absolute inset-x-4 bottom-4 overflow-hidden rounded-3xl border border-amber-300/40 bg-linear-to-br from-amber-900/98 to-amber-950/98 shadow-2xl backdrop-blur-md">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative p-6">
            <div className="flex flex-col gap-5 text-sm text-amber-50 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-amber-300/70">
                  <span className="inline-block h-px w-6 bg-amber-300/30"></span>
                  Order Complete
                </div>
                <h3 className="mt-3 font-serif text-2xl font-medium text-amber-50">
                  {dialogue.selections.name}&apos;s Order
                </h3>
                <p className="mt-2 text-lg leading-relaxed text-amber-100/90">
                  {dialogue.selections.size} {dialogue.selections.drink}
                </p>
                <p className="mt-1 text-sm text-amber-200/60">with {dialogue.selections.milk} milk</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-xs uppercase tracking-widest text-amber-300/70">Steps</div>
                  <div className="mt-1 font-serif text-3xl font-semibold text-amber-100">{totalSteps}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs uppercase tracking-widest text-amber-300/70">Time</div>
                  <div className="mt-1 font-serif text-3xl font-semibold text-amber-100">
                    {totalTime !== null ? `${formatter.format(totalTime)}s` : "—"}
                  </div>
                </div>
                <button
                  onClick={closeSummary}
                  className="rounded-full bg-linear-to-br from-amber-400 to-amber-600 px-6 py-3 text-sm font-bold uppercase tracking-wider text-amber-950 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDialogueActive && (
        <div
          className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-3xl border-t border-amber-200/30 shadow-[0_-20px_60px_rgba(64,41,28,0.6)] backdrop-blur-md"
          style={{ background: PANEL_BG }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative px-6 pb-6 pt-8">
            {dialogue.step === "name" ? (
              <form className="space-y-5" onSubmit={handleNameSubmit} autoComplete="off">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-amber-200/70">
                  <span className="inline-block h-px w-6 bg-amber-200/30"></span>
                  Final step
                </div>
                <h3 className="font-serif text-2xl font-medium leading-relaxed text-amber-50">Name for the order?</h3>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    value={nameInput}
                    onChange={(event) => setNameInput(event.target.value)}
                    className="flex-1 rounded-2xl border border-amber-200/30 bg-amber-950/40 px-5 py-4 text-base text-amber-50 shadow-inner outline-none backdrop-blur-sm placeholder:text-amber-200/40 focus:border-amber-300/60 focus:bg-amber-950/50 focus:ring-2 focus:ring-amber-400/30"
                    placeholder="Enter your name..."
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 px-8 py-4 text-base font-bold uppercase tracking-wide text-amber-950 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-300/70"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            ) : (
              renderOptions()
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BaristaSimulator
