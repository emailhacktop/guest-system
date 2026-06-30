const BASE_URL =
  "http://localhost:3001/api"

// ========================
// AUTH HEADER
// ========================
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
// HANDLE RESPONSE
// ========================
async function handleResponse(
  res: Response
) {

  const data =
    await res.json()

  // اگر خطا بود
  if (!res.ok) {

    return {
      success: false,
      message:
        data?.message ||
        "API Error"
    }
  }

  return data
}

// ========================
// GET ALL GUESTS
// ========================
export async function getGuests() {

  try {

    const res =
      await fetch(
        `${BASE_URL}/guests`,
        {
          headers: {
            ...authHeaders()
          },

          cache: "no-store"
        }
      )

    return await handleResponse(
      res
    )

  } catch (error) {

    console.error(
      "getGuests error:",
      error
    )

    return []
  }
}

// ========================
// CREATE GUEST
// ========================
export async function createGuest(
data: {
name: string
title: string
max_views: number
}
) {

try {

const res =
  await fetch(
    `${BASE_URL}/guest`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        ...authHeaders()
      },
      body: JSON.stringify(data)
    }
  )

return await handleResponse(
  res
)

} catch (error) {

console.error(
  "createGuest error:",
  error
)

return {
  success: false
}

}
}

// ========================
// EDIT GUEST
// ========================
export async function editGuestApi(
  id: string,
  data: {
    name: string
    max_views: number
  }
) {

  try {

    const res =
      await fetch(
        `${BASE_URL}/guest/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            ...authHeaders()
          },
          body: JSON.stringify(data)
        }
      )

    return await handleResponse(
      res
    )

  } catch (error) {

    console.error(
      "editGuestApi error:",
      error
    )

    return {
      success: false
    }
  }
}

// ========================
// DELETE GUEST
// ========================
export async function deleteGuestApi(
  id: string
) {

  try {

    const res =
      await fetch(
        `${BASE_URL}/guest/${id}`,
        {
          method: "DELETE",
          headers: {
            ...authHeaders()
          }
        }
      )

    return await handleResponse(
      res
    )

  } catch (error) {

    console.error(
      "deleteGuestApi error:",
      error
    )

    return {
      success: false
    }
  }
}

// ========================
// RESET VIEWS
// ========================
export async function resetViewsApi(
  id: string
) {

  try {

    const res =
      await fetch(
        `${BASE_URL}/guest/reset/${id}`,
        {
          method: "POST",
          headers: {
            ...authHeaders()
          }
        }
      )

    return await handleResponse(
      res
    )

  } catch (error) {

    console.error(
      "resetViewsApi error:",
      error
    )

    return {
      success: false
    }
  }
}

// ========================
// TOGGLE ACTIVE
// ========================
export async function toggleGuestApi(
  id: string,
  active: boolean
) {

  try {

    const res =
      await fetch(
        `${BASE_URL}/guest/toggle/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            ...authHeaders()
          },
          body: JSON.stringify({
            active
          })
        }
      )

    return await handleResponse(
      res
    )

  } catch (error) {

    console.error(
      "toggleGuestApi error:",
      error
    )

    return {
      success: false
    }
  }
}

// ========================
// GET GUEST BY TOKEN
// ========================
export async function getGuestByToken(
  token: string
) {

  try {

    const res =
      await fetch(
        `${BASE_URL}/guest/${token}`
      )

    const data =
      await res.json()

    // اگر خطا بود
    if (!res.ok) {

      return {
        success: false,
        message:
          data?.message ||
          "Guest not found"
      }
    }

    return data

  } catch (error) {

    console.error(
      "getGuestByToken error:",
      error
    )

    return {
      success: false,
      message:
        "Network error"
    }
  }
}

// ========================
// INCREASE VIEW
// ========================
export async function increaseView(
  token: string
) {

  try {

    const res =
      await fetch(
        `${BASE_URL}/guest/view/${token}`,
        {
          method: "POST"
        }
      )

    return await handleResponse(
      res
    )

  } catch (error) {

    console.error(
      "increaseView error:",
      error
    )

    return null
  }
}

// ========================
// CHANGE PASSWORD
// ========================
export async function changePassword(
  oldPassword: string,
  newPassword: string
) {

  try {

    const res =
      await fetch(
        `${BASE_URL}/change-password`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            ...authHeaders()
          },

          body: JSON.stringify({
            oldPassword,
            newPassword
          })
        }
      )

    return await handleResponse(
      res
    )

  } catch (error) {

    console.error(
      "changePassword error:",
      error
    )

    return {
      success: false,
      message:
        "خطا در تغییر رمز"
    }
  }
}