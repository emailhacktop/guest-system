"use client"

import { motion } from "framer-motion"

type Props = {
  onFinish: () => void
}

export default function IntroScreen({
  onFinish,
}: Props) {

  return (

    <motion.div

      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}

      className="
      fixed
      inset-0
      z-[999]
      bg-black
      flex
      items-center
      justify-center
      "

      onClick={onFinish}

    >

      <div className="relative">

        <img

          src="/videos/cover.jpg"

          className="
          w-screen
          h-screen
          object-cover
          "

        />

        <div

          className="
          absolute
          inset-0
          bg-black/40
          flex
          flex-col
          items-center
          justify-center
          "

        >

          <motion.h1

            initial={{
              opacity: 0,
              y: 40
            }}

            animate={{
              opacity: 1,
              y: 0
            }}

            transition={{
              duration: 1.4
            }}

            className="
            text-4xl
            md:text-7xl
            text-yellow-300
            drop-shadow-lg
            "

            style={{
              fontFamily: "IranNastaliq"
            }}

          >

            به نام ایزد مهرآفرین

          </motion.h1>

          <motion.div

            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            transition={{
              delay: 1.5
            }}

            className="
            mt-8
            text-white
            tracking-[8px]
            text-sm
            md:text-xl
            "

          >

            دعوتنامه اختصاصی

          </motion.div>

          <motion.button

            whileHover={{
              scale: 1.05
            }}

            whileTap={{
              scale: .95
            }}

            onClick={onFinish}

            className="
            mt-20
            px-10
            py-4
            rounded-full
            border
            border-yellow-300
            text-yellow-300
            backdrop-blur
            "

          >

            ورود

          </motion.button>

        </div>

      </div>

    </motion.div>

  )

}