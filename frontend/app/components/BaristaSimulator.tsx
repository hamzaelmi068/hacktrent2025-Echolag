"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useConversation } from "../context/ConversationContext"

type PhaserModule = typeof import("phaser")
type ArcadeBody = import("phaser").Physics.Arcade.Body
type ArcadeStaticBody = import("phaser").Physics.Arcade.StaticBody

type DialogueStep = "idle" | "drink" | "size" | "milk" | "name" | "summary"

type ActiveOrderStep = Exclude<DialogueStep, "idle" | "summary">

type DialogueState = {
  step: DialogueStep
  startedAt?: number
  finishedAt?: number
}

const ORDER_SEQUENCE: Array<{
  key: ActiveOrderStep
  title: string
  prompt: string
}> = [
  {
    key: "drink",
    title: "Drink Preference",
    prompt: "Ask what drink the customer would like.",
  },
  {
    key: "size",
    title: "Drink Size",
    prompt: "Confirm the size the customer prefers.",
  },
  {
    key: "milk",
    title: "Milk Choice",
    prompt: "Ask about their milk or dairy preference.",
  },
  {
    key: "name",
    title: "Pickup Name",
    prompt: "Get the name to call out when the drink is ready.",
  },
]

const PANEL_BG = "linear-gradient(140deg, rgba(255, 255, 255, 0.92) 0%, rgba(238, 241, 255, 0.86) 100%)"

const formatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
})

const BaristaSimulator = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<any>(null)
  const ambientSourceRef = useRef<AudioBufferSourceNode | null>(null)

  const { orderState, isSpeaking, messages, assistantAudioUrl } = useConversation()

  const [promptVisible, setPromptVisible] = useState(false)
  const [dialogue, setDialogue] = useState<DialogueState>({
    step: "idle",
  })

  const isDialogueActive = dialogue.step !== "idle" && dialogue.step !== "summary"
  const movePlayerToBaristaRef = useRef<() => void>(() => {})

  const startDialogue = useCallback(() => {
    movePlayerToBaristaRef.current()
    setDialogue({
      step: "drink",
      startedAt: performance.now(),
      finishedAt: undefined,
    })
    setPromptVisible(false)
  }, [])

  const closeSummary = () => {
    setDialogue({
      step: "idle",
      startedAt: undefined,
      finishedAt: undefined,
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
    registerMovePlayer: (handler: () => void) => {
      movePlayerToBaristaRef.current = handler
    },
  })
  callbacksRef.current.startDialogue = startDialogue
  callbacksRef.current.setPromptVisible = setPromptVisible
  callbacksRef.current.isDialogueActive = isDialogueActive
  callbacksRef.current.registerMovePlayer = (handler: () => void) => {
    movePlayerToBaristaRef.current = handler
  }

  const isOrderComplete = orderState.drink && orderState.size && orderState.milk && orderState.name
  const completedSteps = [orderState.drink, orderState.size, orderState.milk, orderState.name].filter(Boolean).length

  useEffect(() => {
    if (dialogue.step === "idle") {
      return
    }

    const targetStep: DialogueStep = !orderState.drink
      ? "drink"
      : !orderState.size
        ? "size"
        : !orderState.milk
          ? "milk"
          : !orderState.name
            ? "name"
            : "summary"

    setDialogue((prev) => {
      if (prev.step === "idle") {
        return prev
      }
      if (prev.step === targetStep) {
        if (targetStep === "summary" && !prev.finishedAt) {
          return {
            ...prev,
            finishedAt: performance.now(),
          }
        }
        return prev
      }

      if (targetStep === "summary") {
        return {
          ...prev,
          step: "summary",
          finishedAt: prev.finishedAt ?? performance.now(),
        }
      }

      return {
        ...prev,
        step: targetStep,
      }
    })
  }, [dialogue.step, orderState.drink, orderState.size, orderState.milk, orderState.name])

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

          const menuBoard = this.add.image(750, 130, "menu").setTint(0x1b1713)
          menuBoard.setScale(1.85, 1.8)
          const backing = this.add.rectangle(750, 130, 320, 260, 0x000000, 0.45).setDepth(menuBoard.depth - 1)
          backing.setStrokeStyle(4, 0x2c2c2c, 0.6)
          const menuTitle = this.add.text(680, 72, "Cafe Menu", {
            fontSize: "28px",
            color: "#f5d7a1",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
          })
          menuTitle.setScale(1.05, 1)

          const menuItems = [
            { name: "Caramel Latte", price: "$4.50" },
            { name: "Cold Brew", price: "$3.80" },
            { name: "Vanilla Oat Capp", price: "$4.75" },
            { name: "Matcha Latte", price: "$4.20" },
          ]
          menuItems.forEach((item, index) => {
            this.add.text(650, 112 + index * 32, item.name, {
              fontSize: "18px",
              color: "#f0e4d2",
              fontFamily: "'Lucida Console', 'Monaco', 'monospace'",
              wordWrap: { width: 180 },
            })
            this.add.text(835, 112 + index * 32, item.price, {
              fontSize: "18px",
              color: "#f6debe",
              fontFamily: "'Lucida Console', 'Monaco', 'monospace'",
            })
          })

        //   const counter = this.physics.add.staticImage(660, 240, "counter").setOrigin(0.5, 0.6)

          this.barista = this.physics.add.staticSprite(160, 160, "barista").setDepth(12)

          const welcomeStation = this.add.container(160, 160).setDepth(11)

          const stationBase = this.add.rectangle(0, 70, 200, 90, 0x6f4328, 1).setOrigin(0.5)
          const stationInset = this.add.rectangle(0, 70, 150, 60, 0x8b5128, 0.9).setOrigin(0.5)
          const stationLabel = this.add
            .text(0, 64, "COFFEE SHOP", {
              fontFamily: "Georgia, serif",
              fontSize: "16px",
              color: "#f0d9b5",
              fontStyle: "bold",
            })
            .setOrigin(0.5)

          const machineBase = this.add.rectangle(-70, 0, 46, 78, 0xf3b487, 1).setOrigin(0.5)
          const machineGlass = this.add.rectangle(-70, -18, 36, 34, 0xffffff, 0.85).setOrigin(0.5)
          const grinderHopper = this.add.rectangle(-70, -48, 40, 22, 0xb8d5ed, 0.8).setOrigin(0.5)
          const grinderHead = this.add.rectangle(-70, -60, 28, 8, 0x3d4a5a, 1).setOrigin(0.5)

          const pourOverStand = this.add.rectangle(-10, -6, 26, 44, 0x3d4a5a, 1).setOrigin(0.5)
          const pourOverCup = this.add.triangle(0, -28, -12, 10, 12, 10, 0, -12, 0xff8f45, 1).setOrigin(0.5)
          const pourOverTop = this.add.rectangle(0, -36, 34, 10, 0xffffff, 0.9).setOrigin(0.5)

          const cupsGroup = this.add.container(90, 10)
          for (let i = 0; i < 4; i += 1) {
            cupsGroup.add(
              this.add.rectangle(i * 18, 0, 12, 40, 0xff8f45, 1).setOrigin(0.5).setStrokeStyle(2, 0xe06f2e, 0.6),
            )
          }

          welcomeStation.add([
            stationBase,
            stationInset,
            stationLabel,
            machineBase,
            machineGlass,
            grinderHopper,
            grinderHead,
            pourOverStand,
            pourOverCup,
            pourOverTop,
            cupsGroup,
          ])

          this.player = this.physics.add.sprite(240, 360, "player")
          this.player.setDepth(4)

          callbacks.current.registerMovePlayer(() => {
            if (!this.player || !this.barista) {
              return
            }

            const approachX = this.barista.x - 16
            const approachY = this.barista.y + 80

            this.tweens.add({
              targets: this.player,
              x: approachX,
              y: approachY,
              duration: 400,
              ease: PhaserNS.Math.Easing.Quadratic.Out,
              onComplete: () => {
                this.player.setVelocity(0, 0)
                this.player.setDepth(this.player.y)
              },
            })
          })

        //   this.physics.add.collider(this.player, counter)
          this.physics.add.collider(this.player, this.barista)

          const playerBody = this.player.body as ArcadeBody | ArcadeStaticBody | null
          if (playerBody) {
            playerBody.setOffset(0, 4)
          }

        //   const counterBody = counter.body as ArcadeBody | ArcadeStaticBody | null
        //   if (counterBody) {
        //     counterBody.setOffset(0, 10)
        //   }

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

  const totalSteps = completedSteps
  const totalTime = dialogue.startedAt && dialogue.finishedAt ? (dialogue.finishedAt - dialogue.startedAt) / 1000 : null

  const renderVoiceGuidance = () => {
    if (dialogue.step === "summary" || dialogue.step === "idle") {
      return null
    }

    const activeStep =
      ORDER_SEQUENCE.find((step) => step.key === dialogue.step) ??
      ORDER_SEQUENCE.find((step) => !orderState[step.key]) ??
      ORDER_SEQUENCE[ORDER_SEQUENCE.length - 1]

    // return (
    //   <div className="space-y-6">
    //     <div className="space-y-2">
    //       <h3 className="text-3xl font-semibold text-[#1c1b33]">{activeStep.prompt}</h3>
    //       <p className="text-sm text-[#50506a]">
    //         Speak naturally—each segment below fills in automatically as soon as you cover it in conversation.
    //       </p>
    //     </div>
    //     <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    //       {ORDER_SEQUENCE.map((step) => {
    //         const status = orderState[step.key]
    //           ? "complete"
    //           : activeStep?.key === step.key
    //             ? "active"
    //             : "pending"

    //         const statusText =
    //           status === "complete"
    //             ? "Captured"
    //             : status === "active"
    //               ? "Listening now"
    //               : "Waiting for voice input"

    //         const ringColor =
    //           status === "complete"
    //             ? "border-[#3ec66d] bg-[#dff9e7]"
    //             : status === "active"
    //               ? "border-[#53b6ff] bg-[#e4f3ff]"
    //               : "border-[#d1d4e5] bg-white/90"

    //         const textColor =
    //           status === "complete"
    //             ? "text-[#137c35]"
    //             : status === "active"
    //               ? "text-[#1c4c8a]"
    //               : "text-[#7b7f96]"

    //         return (
    //           <div
    //             key={step.key}
    //             className={`flex flex-col gap-2 rounded-3xl border-2 px-5 py-4 shadow-md shadow-black/5 transition-all duration-200 ${ringColor}`}
    //           >
    //             <span className="text-sm font-bold uppercase tracking-wide text-[#1b2140]">{step.title}</span>
    //             <span className={`text-xs font-semibold ${textColor}`}>{statusText}</span>
    //           </div>
    //         )
    //       })}
    //     </div>
    //   </div>
    // )
  }

  const lastUserMessage = useMemo(
    () => messages.slice().reverse().find((msg) => msg.role === "user")?.content ?? null,
    [messages],
  )

  const lastAssistantMessage = useMemo(
    () => messages.slice().reverse().find((msg) => msg.role === "assistant")?.content ?? null,
    [messages],
  )

  const renderCustomerOverlay = () => {
    if (!isDialogueActive) {
      return null
    }

    const completionRatio = ORDER_SEQUENCE.length > 0 ? completedSteps / ORDER_SEQUENCE.length : 0
    const score = Math.round(completionRatio * 100)

    return (
      <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center pt-6">
        <div className="relative flex w-[640px] max-w-[90vw] flex-col gap-6 rounded-[48px] border-8 border-[#f4c267] bg-[#fff6e6] p-10 shadow-[0_40px_120px_rgba(43,24,6,0.25)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="relative mx-auto h-48 w-48 lg:mx-0">
              <div className="absolute inset-0 rounded-full bg-[#f7d8ab]" />
              <div className="absolute -top-6 left-1/2 h-20 w-40 -translate-x-1/2 rounded-[60px] bg-[#582c15] shadow-[0_12px_0_rgba(0,0,0,0.12)]" />
              {/* <div className="absolute -top-8 left-1/2 flex -translate-x-1/2 gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <span
                    key={`hair-${index}`}
                    className="h-10 w-10 rounded-full bg-[#3c1c0c] shadow-[0_4px_0_rgba(0,0,0,0.15)]"
                    style={{ transform: `translateY(${index % 2 === 0 ? 0 : 6}px)` }}
                  />
                ))}
              </div> */}
              <div className="absolute top-[42%] left-1/2 flex w-36 -translate-x-1/2 justify-between">
                <div className="relative h-14 w-14 rounded-full border-[6px] border-[#f4c267] bg-[#ffe8a2]/70">
                  <div className="absolute left-1/2 top-1/2 h-7 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3a210f]/70" />
                </div>
                <div className="relative h-14 w-14 rounded-full border-[6px] border-[#f4c267] bg-[#ffe8a2]/70">
                  <div className="absolute left-1/2 top-1/2 h-7 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3a210f]/70" />
                </div>
              </div>
              <div className="absolute top-[52%] left-1/2 h-2.5 w-10 -translate-x-1/2 rounded-full bg-[#f4c267]" />
              <div className="absolute top-[68%] left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-[#f4c267]" />
              <div className="absolute top-[76%] left-1/2 h-6 w-20 -translate-x-1/2 rounded-full border-b-[7px] border-[#9a4526]"></div>
              {/* <div className="absolute -bottom-6 left-1/2 h-24 w-48 -translate-x-1/2 rounded-[44px] bg-[#2f374a]" />
              <div className="absolute -bottom-12 left-1/2 h-24 w-52 -translate-x-1/2 rounded-[44px] bg-[#f28b2f]" /> */}
            </div>

            <div className="flex-1 space-y-5">
              <div className="flex flex-col gap-3 rounded-[32px] border-4 border-[#f4dba8] bg-white/90 px-6 py-5 text-[#5a3713] shadow-inner">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-xs font-bold uppercase tracking-[0.4em] text-[#c17b2a]">Barista</div>
                </div>
                <div className="text-4xl font-black text-[#352115]">Trent</div>
                
              </div>
              
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="flex-1 rounded-[32px] border-4 border-[#f4dba8] bg-white/95 px-6 py-5 shadow-inner text-[#5a3713]">
              <div className="text-xs font-black uppercase tracking-[0.4em] text-[#c17b2a]">Your Response</div>
              <p className="mt-3 text-sm leading-6">
                {lastUserMessage ?? "Waiting for your first line..."}
              </p>
            </div>
            <div className="flex-1 rounded-[32px] border-4 border-[#f4dba8] bg-white/95 px-6 py-5 shadow-inner text-[#5a3713]">
              <div className="text-xs font-black uppercase tracking-[0.4em] text-[#c17b2a]">Barista Reply</div>
              <p className="mt-3 text-sm leading-6">
                {isSpeaking ? (
                  <span className="inline-flex items-center gap-1">
                    Brewing response
                    <span className="ml-1 inline-flex animate-pulse">...</span>
                  </span>
                ) : (
                  lastAssistantMessage ?? "Your AI barista is standing by."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="h-[540px] w-full overflow-hidden rounded-3xl border border-amber-900/20 bg-[#f7f1e3] shadow-2xl"
      />

      {renderCustomerOverlay()}

      {promptVisible && !isDialogueActive && (
        <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border border-white/40 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-600 shadow-lg backdrop-blur">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-400 font-semibold text-white shadow-sm">
              E
            </span>
            Step up to start your voice order
          </div>
        </div>
      )}

      {dialogue.step === "summary" && (
        <div className="absolute inset-x-4 bottom-4">
          <div className="flex flex-col gap-6 rounded-3xl border border-white/60 bg-white/85 px-6 py-6 text-slate-700 shadow-[0_24px_80px_rgba(15,18,35,0.18)] backdrop-blur">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  Voice Session Complete
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-slate-900">Order captured successfully</h3>
                <p className="text-sm text-slate-500">
                  Every step was confirmed via your voice responses. Great job staying in flow.
                </p>
              </div>
              <div className="flex gap-6">
                <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-center shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">Steps</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">{totalSteps}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-center shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">Time</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">
                    {totalTime !== null ? `${formatter.format(totalTime)}s` : "—"}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ORDER_SEQUENCE.map((step) => (
                <div
                  key={step.key}
                  className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-800 shadow-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-base font-bold text-emerald-950">
                    ✓
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold">{step.title}</span>
                    <span className="text-xs text-emerald-700/70">Confirmed via voice</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={closeSummary}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Finish Session
              </button>
            </div>
          </div>
        </div>
      )}

      {isDialogueActive && (
        <div className="absolute inset-x-4 bottom-4">
        <div
            className="rounded-3xl border border-white/60 bg-white/80 px-6 py-6 shadow-[0_24px_80px_rgba(15,18,35,0.18)] backdrop-blur"
          style={{ background: PANEL_BG }}
        >
            {renderVoiceGuidance()}
          </div>
        </div>
      )}
    </div>
  )
}

export default BaristaSimulator
