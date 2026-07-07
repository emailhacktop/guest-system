"use client"

import { motion } from "framer-motion"

export default function InviteVideo() {

  return (

    <motion.div

      initial={{
        opacity:0,
        scale:.95
      }}

      animate={{
        opacity:1,
        scale:1
      }}

      transition={{
        duration:1
      }}

      className="
      w-full
      mt-8
      flex
      justify-center
      "

    >

      <div

        className="
        relative
        rounded-[28px]
        overflow-hidden
        border-2
        border-yellow-300/40
        shadow-[0_0_25px_rgba(255,215,0,.25)]
        "

      >

        <video

          controls

          autoPlay

          playsInline

          className="
          w-full
          max-w-[430px]
          aspect-[9/16]
          object-cover
          bg-black
          "

        >

          <source

            src="/videos/invite.mp4"

            type="video/mp4"

          />

        </video>

      </div>

    </motion.div>

  )

}