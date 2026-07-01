import crypto from "crypto"
import rateLimit from "express-rate-limit"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import xlsx from "xlsx"


dotenv.config()

const app = express()

app.use(cors({

  origin: [

    "http://localhost:3000",

    "http://192.168.1.106:3000"

  ],

  methods: [

    "GET",
    "POST",
    "PUT",
    "DELETE"

  ],

  credentials: true
}))

app.use(express.json())

// ========================
// RATE LIMIT
// ========================
const apiLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 100,

  message: {
    success: false,
    message: "Too many requests"
  }
})

app.use("/api", apiLimiter)

// ========================
// SUPABASE
// ========================
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
      process.env.JWT_SECRET
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
// LOGIN
// ========================
app.post("/api/login", async (req, res) => {

  const { password } = req.body

  const validPassword =
    await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD
    )

  if (!validPassword) {

    return res.status(401).json({
      success: false,
      message: "Wrong password"
    })
  }

  const token = jwt.sign(

    {
      role: "admin"
    },

    process.env.JWT_SECRET,

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

    const { data, error } =
      await supabase
        .from("guests")
        .select("*")
        .order(
          "name",
          {
            ascending: true
          }
        )

    if (error) {

      return res.status(500).json({
        success: false,
        error
      })
    }

    res.json(data)
  }
)

// ========================
// CREATE GUEST
// ========================
app.post(
  "/api/guest",
  verifyToken,
  async (req, res) => {

    const {
    name,
    title,
    guests_count,
    max_views
    } = req.body

    // validation
    if (
      !name ||
      name.trim() === ""
    ) {

      return res.status(400).json({
        success: false,
        message:
          "نام مهمان الزامی است"
      })
    }

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

    if (
      !guests_count ||
      guests_count < 1 ||
      guests_count > 99
    ) {

      return res.status(400).json({
        success: false,
        message:
          "تعداد نفرات باید بین 1 تا 99 باشد"
      })
    } 

    // duplicate
    const {
      data: existing
    } = await supabase
      .from("guests")
      .select("*")
      .eq(
        "name",
        name.trim()
      )
      .maybeSingle()

    if (existing) {

      return res.status(400).json({
        success: false,
        message:
          "این مهمان قبلاً ثبت شده است"
      })
    }

    // token
    const token =
      crypto
        .randomBytes(16)
        .toString("hex")

    // insert
    const {
      data,
      error
    } = await supabase
      .from("guests")
      .insert([
        {
        name:
          name.trim(),
        
        title:
          title || "خانواده",  
        
          max_views,
        
          guests_count,

          views: 0,
        
          token,
        
          active: true
        }
      ])
      .select()

    if (error) {

      return res.status(500).json({
        success: false,
        error
      })
    }

    res.json({
      success: true,
      guest: data[0]
    })
  }
)

// ========================
// EDIT GUEST
// ========================
app.put(
  "/api/guest/:id",
  verifyToken,
  async (req, res) => {

    const { id } =
      req.params

    const {
      name,
      title,
      guests_count,
      max_views
    } = req.body

// ========================
// VALIDATION
// ========================
    if (
      !name ||
      name.trim() === ""
    ) {

      return res.status(400).json({
        success: false,
        message:
          "نام مهمان الزامی است"
      })
    }

    if (
      max_views < 1 ||
      max_views > 999
    ) {

      return res.json({
        success: false,
        message:
          "حداکثر بازدید باید بین 1 تا 999 باشد"
      })
    }

    if (
      guests_count < 1 ||
      guests_count > 99
    ) {

      return res.status(400).json({
        success: false,
        message:
          "تعداد نفرات باید بین 1 تا 99 باشد"
      })
    }    
    
// ========================
// DUPLICATE CHECK
// ========================
    const {
      data: duplicate
    } = await supabase
      .from("guests")
      .select("*")
      .eq(
        "name",
        name.trim()
      )
      .neq("id", id)
      .maybeSingle()

    if (duplicate) {

      return res.status(409).json({
        success: false,
        message:
          "این نام قبلاً ثبت شده است"
      })
    }

// ========================
// UPDATE
// ========================
    const {
      data,
      error
    } = await supabase
      .from("guests")
      .update({
        name:
          name.trim(),

        title:
         title || "خانواده",
         
        max_views,

        guests_count
      })
      .eq("id", id)
      .select()

    if (error) {

      return res.status(500).json({
        success: false,
        error
      })
    }

    res.json({
      success: true,
      guest: data[0]
    })
  }
)

// ========================
// DELETE GUEST
// ========================
app.delete(
  "/api/guest/:id",
  verifyToken,
  async (req, res) => {

    const { id } =
      req.params

    const { error } =
      await supabase
        .from("guests")
        .delete()
        .eq("id", id)

    if (error) {

      return res.json({
        success: false,
        error
      })
    }

    res.json({
      success: true
    })
  }
)

// ========================
// RESET VIEWS
// ========================
app.post(
  "/api/guest/reset/:id",
  verifyToken,
  async (req, res) => {

    const { id } =
      req.params

    const {
      data,
      error
    } = await supabase
      .from("guests")
      .update({
        views: 0
      })
      .eq("id", id)
      .select()

    if (error) {

      return res.json({
        success: false,
        error
      })
    }

    res.json({
      success: true,
      guest: data[0]
    })
  }
)

// ========================
// TOGGLE ACTIVE
// ========================
app.post(
  "/api/guest/toggle/:id",
  verifyToken,
  async (req, res) => {

    const { id } =
      req.params

    const { active } =
      req.body

    const {
      data,
      error
    } = await supabase
      .from("guests")
      .update({ active })
      .eq("id", id)
      .select()

    if (error) {

      return res.json({
        success: false,
        error
      })
    }

    res.json({
      success: true,
      guest: data[0]
    })
  }
)

// ========================
// GET GUEST BY TOKEN
// ========================
app.get(
  "/api/guest/:token",
  async (req, res) => {

    const { token } =
      req.params

    const {
      data,
      error
    } = await supabase
      .from("guests")
      .select("*")
      .eq("token", token)
      .single()

    if (
      error ||
      !data
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Guest not found"
      })
    }

    if (!data.active) {

      return res.status(403).json({
        success: false,
        message:
          "Link blocked"
      })
    }

    // LIMIT REACHED
    if (
      data.views >= data.max_views
    ) {

      return res.status(403).json({
        success: false,
        message:
          "Limit reached"
      })
    }

    res.json(data)
  }
)


// ========================
// INCREASE VIEW
// ========================
app.post(
  "/api/guest/view/:token",
  async (req, res) => {

    const { token } =
      req.params

    // guest
    const {
      data: guest,
      error
    } = await supabase
      .from("guests")
      .select("*")
      .eq("token", token)
      .single()

    if (
      error ||
      !guest
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Guest not found"
      })
    }

    // blocked
    if (!guest.active) {

      return res.status(403).json({
        success: false,
        message:
          "Link blocked"
      })
    }

    // max views
    if (
      guest.views >=
      guest.max_views
    ) {

      return res.status(403).json({
        success: false,
        message:
          "Limit reached"
      })
    }

    // increase
    const newViews =
      guest.views + 1

    const {
      error: updateError
    } = await supabase
      .from("guests")
      .update({
        views: newViews
      })
      .eq("token", token)

    if (updateError) {

      return res.status(500).json({
        success: false
      })
    }

    res.json({
      success: true,
      views: newViews
    })
  }
)

// ========================
// EXPORT EXCEL
// ========================
app.get(
  "/api/guests/export",
  verifyToken,
  async (req, res) => {

    const { data } =
      await supabase
        .from("guests")
        .select("*")

    const wb =
      xlsx.utils.book_new()

    const ws =
      xlsx.utils.json_to_sheet(data)

    xlsx.utils.book_append_sheet(
      wb,
      ws,
      "guests"
    )

    const file =
      xlsx.write(
        wb,
        {
          type: "buffer",
          bookType: "xlsx"
        }
      )

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=guests.xlsx"
    )

    res.send(file)
  }
)

// ========================
// CHANGE PASSWORD
// ========================
app.post(
  "/api/change-password",
  verifyToken,
  async (req, res) => {

    const {
      oldPassword,
      newPassword
    } = req.body

    // check old
    const validOldPassword =
      await bcrypt.compare(
        oldPassword,
        process.env.ADMIN_PASSWORD
      )

    if (!validOldPassword) {

      return res.json({
        success: false,
        message:
          "رمز فعلی اشتباه است"
      })
    }
    
    // validation
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

    // temp memory change
    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      )

    res.json({
      success: true,
      hashedPassword
    })
  }
)

// ========================
// START SERVER
// ========================
app.listen(
  3001,
  () => {

    console.log(
      "Server running on port 3001"
    )
  }
)