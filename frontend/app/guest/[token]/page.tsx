'use client'

import { use } from "react"
import { useEffect, useState } from "react"
import {
getGuestByToken,
increaseView
} from "@/lib/api"

type ParamsType = Promise<{
token: string
}>

export default function GuestPage({
params,
}: {
params: ParamsType
}) {

const { token } = use(params)

const [guest, setGuest] = useState<any>(null)

const [loading, setLoading] =
useState(true)

const [error, setError] =
useState<string | null>(null)

const [blocked, setBlocked] =
useState(false)

// FIXED
const VIEW_KEY = `view_${token}`

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
    "Link expired"
  ) {

    setError("لینک منقضی شده")

  } else if (
    data?.message ===
    "Link blocked"
  ) {

    setError("لینک غیرفعال شده")

  } else {

    setError("Guest not found")
  }

  return null
}

if (!data.active) {

  setBlocked(true)

  setError("لینک غیرفعال شده")

  return null
}

setGuest(data)

setBlocked(
  data.views >= data.max_views
)

return data

}

// ========================
// INCREASE VIEW
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

    if (
      data &&
      data.active
    ) {

      const alreadyViewed =
        localStorage.getItem(
          VIEW_KEY
        )

      if (
        !alreadyViewed &&
        data.views < data.max_views
      ) {

        await addView()

        localStorage.setItem(
          VIEW_KEY,
          "true"
        )

        const updated =
          await loadGuest()

        if (updated) {

          setBlocked(
            updated.views >=
            updated.max_views
          )
        }
      }
    }

  } catch (err) {

    console.error(
      "Load guest error:",
      err
    )

    setError(
      "Failed to load guest"
    )

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
  <div className="p-10">
    Loading...
  </div>
)

}

// ========================
// ERROR
// ========================
if (error || !guest) {

return (
  <div className="p-10">

    <div className="bg-red-100 text-red-700 p-5 rounded">

      {error || "Guest not found"}

    </div>

  </div>
)

}

// ========================
// UI
// ========================
return (
<div className="min-h-screen bg-gray-100 flex items-center justify-center">

  <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-xl space-y-5">

    <h1 className="text-4xl font-bold text-center">

      {guest.name}

    </h1>

    <div className="text-center text-gray-700 text-lg">

      👁 بازدید:
      {" "}
      {guest.views}

    </div>

    <div className="text-center text-gray-700 text-lg">

      🎯 حداکثر بازدید:
      {" "}
      {guest.max_views}

    </div>

    {blocked ? (

      <div className="bg-red-100 text-red-700 p-4 rounded text-center font-bold">

        🚫 لینک غیرفعال شده

      </div>

    ) : (

      <div className="bg-green-100 text-green-700 p-4 rounded text-center font-bold">

        ✅ لینک فعال است

      </div>
    )}

  </div>

</div>

)
}