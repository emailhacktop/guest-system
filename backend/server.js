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

// 🔵 گرفتن همه مهمان‌ها
app.get("/api/guests", async (req, res) => {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return res.status(500).json(error)

  res.json(data)
})

// 🟢 ساخت مهمان
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

  if (error) return res.status(500).json(error)

  res.json(data)
})

app.listen(3001, () => {
  console.log("Server running on port 3001")
})