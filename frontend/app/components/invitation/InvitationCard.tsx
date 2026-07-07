"use client"

import { motion } from "framer-motion"

type Props = {
  guest: any
}

export default function InvitationCard({
  guest,
}: Props) {

  return (

    <motion.div

      initial={{
        opacity:0,
        y:60
      }}

      animate={{
        opacity:1,
        y:0
      }}

      transition={{
        duration:1.2
      }}

      className="
      relative
      mx-auto
      w-full
      max-w-[430px]
      rounded-[35px]
      overflow-hidden
      backdrop-blur-xl
      bg-black/35
      border
      border-yellow-400/40
      shadow-[0_0_40px_rgba(255,215,0,.18)]
      "

    >

      {/* Header */}

      <div className="pt-8 px-8 text-center">

        <div className="text-gray-300 text-sm">

          به مراسم ویژه ما خوش آمدید

        </div>

        <div

          className="
          mt-5
          text-yellow-300
          leading-[90px]
          text-5xl
          md:text-6xl
          "

          style={{
            fontFamily:"IranNastaliq"
          }}

        >

          خدمت

        </div>

        <div

          className="
          text-yellow-300
          text-4xl
          md:text-5xl
          leading-[90px]
          "

          style={{
            fontFamily:"IranNastaliq"
          }}

        >

          {guest.title}

        </div>

        <div

          className="
          text-white
          text-3xl
          font-bold
          mt-3
          "

        >

          {guest.name}

        </div>

        <div className="mt-5 text-gray-300 text-sm leading-8">

          با نهایت احترام

          <br/>

          حضور گرم شما را

          <br/>

          در این مراسم ارج می‌نهیم

        </div>

      </div>

      {/* Guest Count */}

      <div className="absolute top-18 right-5">

        <div

          className="
          w-16
          h-16
          rounded-full
          bg-yellow-400
          text-black
          flex
          flex-col
          items-center
          justify-center
          shadow-lg
          "

        >

          <span className="font-bold text-lg">

            {guest.guests_count}

          </span>

          <span className="text-[10px]">

            نفر

          </span>

        </div>

      </div>

    </motion.div>

  )

}