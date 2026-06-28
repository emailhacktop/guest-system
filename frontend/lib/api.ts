const BASE_URL = "http://localhost:3001/api"

// 🔵 گرفتن همه مهمان‌ها
export async function getGuests() {
  try {
    const res = await fetch(`${BASE_URL}/guests`)

    if (!res.ok) {
      throw new Error("Failed to fetch guests")
    }

    return await res.json()
  } catch (error) {
    console.error("getGuests error:", error)
    return []
  }
}

// 🟢 ساخت مهمان
export async function createGuest(data: {
  name: string
  max_views: number
}) {
  try {
    const res = await fetch(`${BASE_URL}/guest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    if (!res.ok) {
      throw new Error("Failed to create guest")
    }

    return await res.json()
  } catch (error) {
    console.error("createGuest error:", error)
    return null
  }
}

// 🟣 گرفتن مهمان با token (برای مرحله بعد)
export async function getGuestByToken(token: string) {
  try {
    const res = await fetch(`${BASE_URL}/guest/${token}`)

    if (!res.ok) {
      throw new Error("Guest not found")
    }

    return await res.json()
  } catch (error) {
    console.error("getGuestByToken error:", error)
    return null
  }
}

// 🟠 افزایش view
export async function increaseView(token: string) {
  try {
    const res = await fetch(`${BASE_URL}/guest/view/${token}`, {
      method: "POST"
    })

    if (!res.ok) {
      throw new Error("Failed to increase view")
    }

    return await res.json()
  } catch (error) {
    console.error("increaseView error:", error)
    return null
  }
}