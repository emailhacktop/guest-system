import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import xlsx from "xlsx"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// ========================
// LOGIN (SIMPLE ADMIN)
// ========================
app.post("/api/login", (req, res) => {
  const { password } = req.body

  if (password === process.env.ADMIN_PASSWORD) {
    return res.json({ success: true, token: "admin-token" })
  }

  return res.status(401).json({ success: false })
})

// ========================
// GET ALL GUESTS
// ========================
app.get("/api/guests", async (req, res) => {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return res.status(500).json(error)
  res.json(data)
})

// ========================
// CREATE GUEST
// ========================
app.post("/api/guest", async (req, res) => {
  const { name, max_views } = req.body

  const token = Math.random().toString(36).substring(2, 12)

  const { data, error } = await supabase
    .from("guests")
    .insert([{ name, max_views, views: 0, token, active: true }])
    .select()

  if (error) return res.status(500).json(error)
  res.json(data[0])
})

// ========================
// EDIT GUEST
// ========================
app.put("/api/guest/:id", async (req, res) => {
  const { id } = req.params
  const { name, max_views } = req.body

  const { data, error } = await supabase
    .from("guests")
    .update({ name, max_views })
    .eq("id", id)
    .select()

  if (error) return res.status(500).json(error)
  res.json(data[0])
})

// ========================
// BLOCK / UNBLOCK
// ========================
app.patch("/api/guest/block/:id", async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from("guests")
    .update({ active: false })
    .eq("id", id)

  if (error) return res.status(500).json(error)
  res.json({ success: true })
})

app.patch("/api/guest/unblock/:id", async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from("guests")
    .update({ active: true })
    .eq("id", id)

  if (error) return res.status(500).json(error)
  res.json({ success: true })
})

// ========================
// RESET VIEWS
// ========================
app.post("/api/guest/reset/:id", async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from("guests")
    .update({ views: 0 })
    .eq("id", id)

  if (error) return res.status(500).json(error)
  res.json({ success: true })
})
// ========================
// TOGGLE ACTIVE
// ========================
app.post("/api/guest/toggle/:id", async (req, res) => {

  const { id } = req.params
  const { active } = req.body

  const { error } = await supabase
    .from("guests")
    .update({ active })
    .eq("id", id)

  if (error) {
    return res.status(500).json(error)
  }

  res.json({
    success: true
  })
})

// ========================
// INCREASE VIEW
// ========================
app.post("/api/guest/view/:token", async (req, res) => {
  const { token } = req.params

  const { data } = await supabase
    .from("guests")
    .select("*")
    .eq("token", token)
    .single()

  if (!data) return res.status(404).json({ error: "not found" })

  if (data.views >= data.max_views)
    return res.status(403).json({ error: "limit reached" })

  await supabase
    .from("guests")
    .update({ views: data.views + 1 })
    .eq("token", token)

  res.json({ success: true })
})

// ========================
// EXPORT EXCEL
// ========================
app.get("/api/guests/export", async (req, res) => {
  const { data } = await supabase.from("guests").select("*")

  const wb = xlsx.utils.book_new()
  const ws = xlsx.utils.json_to_sheet(data)

  xlsx.utils.book_append_sheet(wb, ws, "guests")

  const file = xlsx.write(wb, { type: "buffer", bookType: "xlsx" })

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=guests.xlsx"
  )

  res.send(file)
})

app.listen(3001, () => console.log("Server running"))