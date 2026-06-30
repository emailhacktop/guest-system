'use client'

import { use } from "react"
import { useEffect, useState } from "react"

import {
  getGuestByToken,
  increaseView
} from "@/lib/api"

import { motion } from "framer-motion"

import { TypeAnimation }
from "react-type-animation"

import Particles
from "react-tsparticles"

type ParamsType = Promise<{
  token: string
}>

export default function GuestPage({
  params,
}: {
  params: ParamsType
}) {

  const { token } = use(params)

  const [guest, setGuest] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [blocked, setBlocked] =
    useState(false)

  // ========================
  // LOAD GUEST
  // ========================
  async function loadGuest() {

    const data =
      await getGuestByToken(token)

    if (
      !data ||
      data.success === false
    ) {

      if (
        data?.message ===
        "Link blocked"
      ) {

        setBlocked(true)

        setError(
          "🚫 این لینک غیرفعال شده است"
        )

      } else {

        setError(
          "❌ مهمان یافت نشد"
        )
      }

      return null
    }

    // پایان بازدید
    if (
      data.views >= data.max_views
    ) {

      setBlocked(true)

      setError(
        "🚫 تعداد بازدید این لینک به پایان رسیده است"
      )

      return null
    }

    setGuest(data)

    return data
  }

  // ========================
  // ADD VIEW
  // ========================
  async function addView() {

    await increaseView(token)
  }

  // ========================
  // FLOW
  // ========================
  useEffect(() => {

    const run = async () => {

      setLoading(true)

      setError(null)

      setGuest(null)

      setBlocked(false)

      try {

        const data =
          await loadGuest()

        if (data) {

          await addView()

          const updated =
            await loadGuest()

          if (updated) {

            setGuest(updated)
          }
        }

      } finally {

        setLoading(false)
      }
    }

    run()

  }, [token])

  // ========================
  // LOADING
  // ========================
  if (loading) {

    return (

      <div className="min-h-screen bg-black flex items-center justify-center text-white text-2xl">

        در حال بارگذاری...

      </div>
    )
  }

  // ========================
  // ERROR
  // ========================
  if (error || !guest) {

    return (

      <div className="min-h-screen bg-black flex items-center justify-center p-5">

        <div className="invite-card p-10 text-center max-w-xl">

          <div className="text-3xl text-red-500 font-bold">

            {error}

          </div>

        </div>

      </div>
    )
  }

  // ========================
  // MAIN UI
  // ========================
  return (

    <div className="relative min-h-screen bg-black overflow-hidden">

      {/* PARTICLES */}
      <Particles
        options={{
          background: {
            color: {
              value: "#000000"
            }
          },

          fpsLimit: 60,

          particles: {

            number: {
              value: 70
            },

            color: {
              value: "#d4af37"
            },

            size: {
              value: {
                min: 1,
                max: 4
              }
            },

            move: {
              enable: true,
              speed: 1
            },

            opacity: {
              value: 0.7
            }
          }
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 py-20">

        <motion.div

          initial={{
            opacity: 0,
            scale: .8
          }}

          animate={{
            opacity: 1,
            scale: 1
          }}

          transition={{
            duration: 1.5
          }}

          className="invite-card gold-border p-10 w-full max-w-3xl text-center space-y-10"
        >

          {/* TITLE */}
          <div className="space-y-5">

            <TypeAnimation
              sequence={[
                "به مراسم ویژه خوش آمدید",
                2000
              ]}
              wrapper="div"
              speed={50}
              className="text-2xl md:text-4xl font-bold gold-text"
              repeat={0}
            />

            {/* NAME */}
            <motion.div

              initial={{
                opacity: 0,
                y: 20
              }}

              animate={{
                opacity: 1,
                y: 0
              }}

              transition={{
                delay: 3
              }}

              className="nastaliq gold-text text-5xl md:text-7xl"
            >

              {guest.name}

            </motion.div>

            {/* WELCOME */}
            <motion.div

              initial={{
                opacity: 0
              }}

              animate={{
                opacity: 1
              }}

              transition={{
                delay: 4
              }}

              className="text-xl md:text-2xl text-gray-200"
            >

              حضور شما زینت‌بخش محفل ماست

            </motion.div>

          </div>

          {/* VIDEO */}
          <motion.div

            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            transition={{
              delay: 5
            }}

            className="space-y-5"
          >

            <video
              controls
              autoPlay
              className="w-full rounded-2xl border-2 border-yellow-600 shadow-2xl"
            >

              <source
                src="/video/invite.mp4"
                type="video/mp4"
              />

            </video>

          </motion.div>

        </motion.div>

      </div>

    </div>
  )
}