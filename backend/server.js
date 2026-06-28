import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)


// ========================
// GET ALL GUESTS
// ========================
app.get("/api/guests", async (req, res) => {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch guests",
      detail: error.message
    })
  }

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
    .insert([
      {
        name,
        max_views,
        views: 0,
        token,
        active: true
      }
    ])
    .select()

  if (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create guest",
      detail: error.message
    })
  }

  res.json(data[0])
})


// ========================
// GET GUEST BY TOKEN (LOCK LOGIC)
// ========================
app.get("/api/guest/:token", async (req, res) => {
  const { token } = req.params

  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("token", token)
    .single()

  if (error || !data) {
    return res.status(404).json({
      success: false,
      message: "Guest not found"
    })
  }

  // 🔥 LOCK CHECK
  if (data.views >= data.max_views) {
    return res.status(403).json({
      success: false,
      message: "This link is expired (max views reached)"
    })
  }

  res.json(data)
})


// ========================
// INCREASE VIEW (SAFE VERSION)
// ========================
app.post("/api/guest/view/:token", async (req, res) => {
  const { token } = req.params

  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("token", token)
    .single()

  if (error || !data) {
    return res.status(404).json({
      success: false,
      message: "Guest not found"
    })
  }

  // 🔥 جلوگیری از افزایش بیشتر از حد
  if (data.views >= data.max_views) {
    return res.status(403).json({
      success: false,
      message: "Max views reached"
    })
  }

  const { error: updateError } = await supabase
    .from("guests")
    .update({ views: data.views + 1 })
    .eq("token", token)

  if (updateError) {
    return res.status(500).json({
      success: false,
      message: "Failed to update views"
    })
  }

  res.json({
    success: true,
    views: data.views + 1
  })
})


// ========================
// DELETE GUEST
// ========================
app.delete("/api/guest/:id", async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from("guests")
    .delete()
    .eq("id", id)

  if (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete guest"
    })
  }

  res.json({ success: true })
})


// ========================
// START SERVER
// ========================
app.listen(3001, () => {
  console.log("Server running on port 3001")
})