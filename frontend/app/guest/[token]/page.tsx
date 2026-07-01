'use client'

import { use } from "react"
import { useEffect, useState } from "react"

import {
  getGuestByToken,
  increaseView
} from "@/lib/api"

import { TypeAnimation } from "react-type-animation"

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
        data?.message === "Link blocked"
      ) {

        setError(
          "این لینک مسدود شده است"
        )

      } else {

        setError(
          "لینک معتبر نیست"
        )
      }

      return null
    }
    
    if (
      data.views >= data.max_views
    ) {

      setError(
        "تعداد بازدید این لینک به پایان رسیده است"
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
  // INIT
  // ========================
  useEffect(() => {

    const run = async () => {

      try {

        const data =
          await loadGuest()

        if (data) {

          await addView()
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

      <div className="min-h-screen bg-black flex items-center justify-center p-6">

        <div className="invite-card p-10 text-center max-w-xl w-full">

          <div className="text-2xl text-red-400 font-bold">

            {error}

          </div>

        </div>

      </div>
    )
  }

  // ========================
  // UI
  // ========================
  return (

  <div className="invitation-page relative min-h-screen overflow-hidden flex flex-col items-center justify-start py-10 px-4 bg-black">

      {/* GOLD SNOW */}
      <div className="gold-snow"></div>

      {/* INTRO */}
      <div className="relative z-10 text-center mb-10">

        <div className="gold-text text-3xl md:text-5xl font-bold leading-[70px]">

          <TypeAnimation
            sequence={[
              'به نام ایزد مهرآفرین'
            ]}
            speed={40}
            cursor={false}
          />

        </div>

        <div className="text-white text-2xl mt-4">

          <TypeAnimation
            sequence={[
              '',
              2500,
              'دعوتنامه اختصاصی'
            ]}
            speed={50}
            cursor={false}
          />

        </div>

      </div>

      {/* MAIN CARD */}
      <div
        className="
          invite-card
          card-enter
          gold-border
          relative
          z-10
          w-full
          max-w-lg
          p-6
          text-center
          backdrop-blur-xl
          bg-white/5
          border
          border-yellow-500/30
          shadow-[0_0_40px_rgba(255,215,0,0.25)]
          rounded-[35px]
        "
      >

        {/* WELCOME */}
        <div className="mb-8">

          <div className="text-gray-200 text-xl mb-6 min-h-[40px]">

            <TypeAnimation
              sequence={[
                '',
                4000,
                'به مراسم ویژه ما خوش آمدید'
              ]}
              speed={50}
              cursor={false}
            />

          </div>

          {/* NAME */}
          <div
            className="gold-text text-4xl md:text-6xl leading-[80px] md:leading-[110px]"
            style={{
              fontFamily: "IranNastaliq"
            }}
          >

            <TypeAnimation
              sequence={[
                '',
                6000,
                `خدمت ${guest.title || ""} ${guest.name}`
              ]}
              speed={35}
              cursor={false}
            />

          </div>

          {/* MESSAGE */}
          <div className="text-white text-2xl mt-6 min-h-[60px]">

            <TypeAnimation
              sequence={[
                '',
                8500,
                'بااحترام حضور گرم شمارا دراین مراسم ارج می نهیم'
              ]}
              speed={45}
              cursor={false}
            />

          </div>

        </div>

        {/* VIDEO */}
        <div className="relative z-20">

          <video
            className="
              invite-video
              w-full
              aspect-[9/16]
              object-cover
              rounded-[28px]
              border-2
              border-yellow-400/40
              shadow-[0_0_18px_rgba(255,215,0,0.22)]
            "
            controls
            playsInline
          >

            <source
              src="/videos/invite.mp4"
              type="video/mp4"
            />

          </video>

        </div>

      </div>

    </div>
  )
}
