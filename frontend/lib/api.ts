const BASE_URL = "http://localhost:3001/api"
function authHeaders() {

  const token =
    localStorage.getItem(
      "admin-token"
    )

  return {
    Authorization:
      `Bearer ${token}`
  }
}

// ========================
// GET ALL GUESTS
// ========================
export async function getGuests() {
  try {
    const res = await fetch(`${BASE_URL}/guests`,{headers: authHeaders()})
    return await res.json()
  } catch (error) {
    console.error("getGuests error:", error)
    return []
  }
}

// ========================
// CREATE GUEST
// ========================
export async function createGuest(data: {
  name: string
  max_views: number
}) {
  try {
    const res = await fetch(`${BASE_URL}/guest`, {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        ...authHeaders()
      },
      body: JSON.stringify(data)
    })

    return await res.json()
  } catch (error) {
    console.error("createGuest error:", error)
    return null
  }
}

// ========================
// GET GUEST BY TOKEN
// ========================
export async function getGuestByToken(token: string) {
  try {
    const res = await fetch(`${BASE_URL}/guest/${token}`)
    return await res.json()
  } catch (error) {
    console.error("getGuestByToken error:", error)
    return null
  }
}

// ========================
// INCREASE VIEW
// ========================
export async function increaseView(token: string) {
  try {
    const res = await fetch(`${BASE_URL}/guest/view/${token}`, {
      method: "POST"
    })

    return await res.json()
  } catch (error) {
    console.error("increaseView error:", error)
    return null
  }
}