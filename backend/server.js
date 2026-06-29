import jwt from "jsonwebtoken"
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
// JWT VERIFY
// ========================
function verifyToken(
  req,
  res,
  next
) {

  const auth =
    req.headers.authorization

  if (!auth) {

    return res.status(401).json({
      success: false,
      message: "No token"
    })
  }

  const token =
    auth.split(" ")[1]

  try {

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret123"
    )

    next()

  } catch {

    return res.status(401).json({
      success: false,
      message: "Invalid token"
    })
  }
}

// ========================
// LOGIN JWT
// ========================
app.post("/api/login", (req, res) => {

  const { password } = req.body

  if (
    password !== process.env.ADMIN_PASSWORD
  ) {

    return res.status(401).json({
      success: false,
      message: "Wrong password"
    })
  }

  // ساخت JWT
  const token = jwt.sign(

    {
      role: "admin"
    },

    process.env.JWT_SECRET || "secret123",

    {
      expiresIn: "7d"
    }
  )

  res.json({
    success: true,
    token
  })
})

// ========================
// GET ALL GUESTS
// ========================
app.get(
  "/api/guests",
  verifyToken,
  async (req, res) => {
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
app.post(
  "/api/guest",
  verifyToken,
  async (req, res) => {

const { name, max_views } = req.body

// ========================
// VALIDATION
// ========================

if (!name || name.trim() === "") {

return res.status(400).json({
  success: false,
  message: "نام مهمان الزامی است"
})

}

// محدودیت بازدید
if (
!max_views ||
max_views < 1 ||
max_views > 999
) {

return res.status(400).json({
  success: false,
  message:
    "حداکثر بازدید باید بین 1 تا 999 باشد"
})

}

// ========================
// DUPLICATE CHECK
// ========================

const { data: existing } =
await supabase
.from("guests")
.select("*")
.eq("name", name.trim())
.maybeSingle()

if (existing) {

return res.status(400).json({
  success: false,
  message:
    "این مهمان قبلاً ثبت شده است"
})

}

// ========================
// TOKEN
// ========================

const token =
Math.random()
.toString(36)
.substring(2, 12)

// ========================
// INSERT
// ========================

const { data, error } =
await supabase
.from("guests")
.insert([
{
name: name.trim(),
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
  message:
    "Failed to create guest"
})

}

res.json(data[0])
})

// ========================
// EDIT GUEST
// ========================
app.put(
  "/api/guest/:id",
  verifyToken,
  async (req, res) => {
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
// GET GUEST BY TOKEN
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

  // اگر غیرفعال بود
  if (!data.active) {
    return res.status(403).json({
      success: false,
      message: "Link blocked"
    })
  }

  res.json(data)
})

// ========================
// INCREASE VIEW
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
      success: false
    })
  }

  // غیرفعال
  if (!data.active) {

    return res.status(403).json({
      success: false
    })
  }

  // پایان بازدید
  if (data.views >= data.max_views) {

    return res.status(403).json({
      success: false
    })
  }

  // افزایش بازدید
  const newViews = data.views + 1

  await supabase
    .from("guests")
    .update({
      views: newViews
    })
    .eq("token", token)

  res.json({
    success: true,
    views: newViews
  })
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

// ========================
// DELETE GUEST
// ========================
app.delete(
  "/api/guest/:id",
  verifyToken,
  async (req, res) => {

  const { id } = req.params

  const { error } = await supabase
    .from("guests")
    .delete()
    .eq("id", id)

  if (error) {
    return res.status(500).json(error)
  }

  res.json({
    success: true
  })
})

//
// ========================
// CHANGE ADMIN PASSWORD
// ========================
//

app.post(
  "/api/change-password",
  async (req, res) => {

    const {
      oldPassword,
      newPassword
    } = req.body

    // بررسی رمز فعلی
    if (
      oldPassword !==
      process.env.ADMIN_PASSWORD
    ) {

      return res.json({
        success: false,
        message: "رمز فعلی اشتباه است"
      })
    }

    // اعتبار رمز جدید
    if (
      !newPassword ||
      newPassword.length < 4
    ) {

      return res.json({
        success: false,
        message:
          "رمز جدید حداقل 4 کاراکتر باشد"
      })
    }

    // تغییر در حافظه
    process.env.ADMIN_PASSWORD =
      newPassword

    return res.json({
      success: true
    })
  }
)

app.listen(3001, () => console.log("Server running"))