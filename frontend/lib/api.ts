const BASE_URL = "http://localhost:3001/api"

export async function getGuests() {
  const res = await fetch(`${BASE_URL}/guests`)
  return res.json()
}

export async function createGuest(data: {
  name: string
  max_views: number
}) {
  const res = await fetch(`${BASE_URL}/guest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  return res.json()
}