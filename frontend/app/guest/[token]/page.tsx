'use client'

import { AnimatePresence, motion } from "framer-motion"
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

type Guest = {
  name: string
  title: string
  token: string
  guests_count: number
  max_views: number
  views: number
  active?: boolean
  success?: boolean
  message?: string
}

export default function GuestPage({
  params,
}: {
  params: ParamsType
}) {

  const { token } = use(params)

  const [guest, setGuest] =
    useState<Guest | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [showIntro, setShowIntro] =
    useState(true)

  const [showMain, setShowMain] =
    useState(false)

  const [showWelcome, setShowWelcome] = useState(false)
  const [showTitle, setShowTitle] = useState(false)
  const [showName, setShowName] = useState(false)
  const [showText, setShowText] = useState(false)  

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

        setError("این لینک مسدود شده است")

      } else if (
        data?.message === "Limit reached"
      ) {

        setError("تعداد بازدید این لینک به پایان رسیده است")

      } else {

        setError("لینک معتبر نیست")

      }

      return null
    }

    if (
      data.views >= data.max_views
    ) {

      setError("تعداد بازدید این لینک به پایان رسیده است")

      return null

    }

    return data as Guest
  }

  useEffect(() => {

    const run = async () => {

      try {

        const data =
          await loadGuest()

        if (data) {

          try {

            const result: any =
              await increaseView(token)

            if (result?.success) {

              setGuest({

                ...data,

                views: result.views

              })

            } else {

              setGuest(data)

            }

          } catch {

            setGuest(data)

          }

        }

      } finally {

        setLoading(false)

      }

    }

    run()

  }, [token])

  useEffect(() => {

    if (!loading) {

      const timer = setTimeout(() => {

        setShowIntro(false)

        setTimeout(() => {

          setShowMain(true)

        },800)

      },7000)

      return () => clearTimeout(timer)

    }

  }, [loading])

  useEffect(() => {

    if (!showMain) return

    const t1 = setTimeout(() => {

      setShowWelcome(true)

    },500)

    const t2 = setTimeout(() => {

      setShowTitle(true)

    },2500)

    const t3 = setTimeout(() => {

      setShowName(true)

    },4200)

    const t4 = setTimeout(() => {

      setShowText(true)

    },6500)

    return () => {

      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)

    }

  }, [showMain])

  if (loading) {

    return (

      <div className="loading-screen">

        درحال بارگذاری...

      </div>

    )

  }

  if(error || !guest){

    return(

      <div className="loading-screen">

        {error}

      </div>

    )

  }

    return (

    <div className="relative min-h-screen overflow-hidden bg-black">

      {/* GOLD PARTICLES */}

      <div className="gold-snow"></div>

      {/* INTRO */}

      <AnimatePresence>

        {showIntro && (

          <motion.div

            initial={{ opacity:0 }}

            animate={{ opacity:1 }}

            exit={{ opacity:0 }}

            transition={{ duration:1 }}

            className="fixed inset-0 z-50 flex items-center justify-center bg-black"

          >

            <div className="absolute inset-0 flex items-center justify-center">
              
                <div
                  className="
                    intro-frame
                    gold-border
                    w-[90vw]
                    max-w-[620px]
                    mx-4
                  "
                >

                <video
                  autoPlay
                  muted
                  playsInline
                  className="block w-full h-auto rounded-[24px] object-contain"
                >
                  <source
                    src="/videos/opening.mp4"
                    type="video/mp4"
                  />
                </video>

              </div>

            </div>
            
            <div className="absolute inset-0 bg-black/15"/>

            <motion.div

              initial={{

                opacity:0,

                scale:.85,

                y:40

              }}

              animate={{

                opacity:1,

                scale:1,

                y:0

              }}

              transition={{

                delay:.8,

                duration:1.5

              }}

              className="absolute z-20 text-center"

            >

              <h1 className="gold-text text-5xl md:text-7xl font-bold">

                به نام ایزد مهرآفرین

              </h1>

              <p className="mt-8 text-white text-2xl tracking-[6px]">

                دعوتنامه اختصاصی

              </p>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

      {/* MAIN */}

      <AnimatePresence>

      {showMain && (

      <motion.div

      initial={{

      opacity:0,

      scale:.9,

      y:40

      }}

      animate={{

      opacity:1,

      scale:1,

      y:0

      }}

      transition={{

      duration:1.3

      }}

      className="relative z-20 flex flex-col items-center py-8 px-4"

      >

      {/* CARD ابعاد صفحه دوم*/}

      <div

      className="

      invite-card

      gold-border

      max-w-[560px]

      w-full

      rounded-[35px]

      
      "

      >

      {/* HEADER */}

      <div className="px-6 pt-8">

        {/* خوش آمدید */}
        <div className="text-center text-yellow-200/80 text-sm tracking-[4px] h-8">

          {showWelcome && (

            <TypeAnimation
              sequence={[
                "به مراسم ویژه ما خوش آمدید"
              ]}
              speed={60}
              cursor={false}
            />

          )}

        </div>

        {/* خدمت */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={showTitle ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mt-10 text-yellow-300 text-xl"
        >
          خدمت {guest.title}
        </motion.div>

        {/* نام مهمان */}
        <div className="flex justify-center mt-3">



            <div
              className="gold-text nastaliq text-center leading-[90px] text-[58px]"
              style={{
                fontFamily: "IranNastaliq"
              }}
            >

              {showName && (

                <TypeAnimation
                  sequence={[
                    guest.name
                  ]}
                  speed={45}
                  cursor={false}
                />

              )}

            </div>



        </div>

        {/* خط */}
        <motion.div
          initial={{ opacity:0, scaleX:0 }}
          animate={showText ? { opacity:1, scaleX:1 } : {}}
          transition={{ duration:.8 }}
          className="flex justify-center my-6"
        >

          <div className="w-44 h-[2px] rounded-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent"/>

        </motion.div>

        {/* متن پایین */}
        <div
          className="text-center text-white/80 text-xl leading-[48px] mt-8 whitespace-pre-line"
        >

          {showText && (

            <TypeAnimation
              sequence={[
                "با نهایت احترام حضور گرم شما را دراین مراسم\n ارج می نهیم ومشتاق دیدار شما هستیم"
              ]}
              speed={55}
              cursor={false}
            />

          )}

        </div>

      </div>

      {/* VIDEOبرا عرض ویدئو "p-5" */}

      <div className="px-1 pb-5">

      <div className="relative rounded-[28px] overflow-hidden video-frame">

      <video

      controls

      playsInline

      className="invite-video w-full aspect-[9/16] object-cover"

      >

      <source

      src="/videos/invite.mp4"

      type="video/mp4"

      />

      </video>

      </div>

      </div>

      {/* FOOTER */}

      <div className="relative z-10 flex justify-between items-center px-6 pb-5 text-gray-300 text-sm">

      <div>

      <span
        className="
          rounded-full
          bg-yellow-500/10
          px-4
          py-2
          border
          border-yellow-500/30
          whitespace-nowrap
        "
      >
        دعوت برای {guest.guests_count} نفر
      </span>

      </div>

      <div>

      دعوتنامه اختصاصی

      </div>

      </div>

      </div>

      </motion.div>

      )}

      </AnimatePresence>

    </div>

  )

}