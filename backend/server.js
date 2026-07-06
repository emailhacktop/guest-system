import helmet from "helmet"
import crypto from "crypto"
import rateLimit from "express-rate-limit"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import xlsx from "xlsx"


function handleSupabaseError(res, error) {

console.error("SUPABASE ERROR:", error)

return res.status(500).json({
success: false,
message: "ارتباط با سرور برقرار نشد، دوباره تلاش کنید"
})

}

dotenv.config()

const app = express()

//اضافه کردن Helmet برای Security Headers
app.use(
helmet({
crossOriginResourcePolicy: false
})
)

app.use(cors({

origin: process.env.CLIENT_URLS?.split(",") || [],

  methods: [

    "GET",
    "POST",
    "PUT",
    "DELETE"
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization"
  ],

  credentials: true
}))

app.use(express.json({ limit: "20mb" }))

app.use((err, req, res, next) => {

// فایل خیلی بزرگ
if (err.type === "entity.too.large") {

return res.status(413).json({
  success: false,
  message: "حجم فایل بکاپ بیش از حد مجاز است"
})

}

// JSON خراب
if (
  err instanceof SyntaxError &&
  "body" in err
) {

return res.status(400).json({
  success: false,
  message: "فرمت فایل بکاپ معتبر نیست"
})

}

next(err)
})

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
// SUPABASE اگر رکوردها زیاد شد و کند شد9خط { پاک شود}
// ========================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    global: {
      fetch: (url, options = {}) =>
        fetch(url, {
          ...options,
          compress: false
        })
    }
  }
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

  if (
    !password ||
      password.trim() === ""
  ) {

      return res.status(400).json({
        success: false,
        message: "Password required"
    })
  }

  const validPassword =
    await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD
    )

  if (!validPassword) {

    return res.status(401).json({
      success: false,
      message: "رمز اشتباه است"
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
      typeof max_views !== "number" ||
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
      typeof guests_count !== "number" ||
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

    // token برا هر مهمان
    const token =
      crypto
        .randomBytes(24)
        .toString("base64url")

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
      typeof max_views !== "number" ||
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
      typeof guests_count !== "number" ||
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

      return res.status(500).json({
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

// LIMIT REACHED تعداد بازدید منقض بشه
//  لینک غیر غعال اتومات
 if (
    data.views >= data.max_views
  ) {

    await supabase
      .from("guests")
      .update({
        active: false
      })
      .eq("id", data.id)

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

      await supabase
        .from("guests")
        .update({
          active: false
        })
        .eq("id", guest.id)

      return res.status(403).json({
        success: false,
        message: 
          "Limit reached"
      })
    }

    // increase
      const newViews = guest.views + 1

      const {
        data: updatedGuest,
        error: updateError
      } = await supabase
        .from("guests")
        .update({
          views: newViews
        })
        .eq("token", token)
        .eq("views", guest.views) // جلوگیری از race condition
        .limit(1)
        .select()
        .single()

      if (
        updateError ||
        !updatedGuest
      ) {

        return res.status(409).json({
          success: false,
          retry: true,
          message:
            "بازدید همزمان تشخیص داده شد، دوباره تلاش کنید"
        })
      }

      res.json({
        success: true,
        views: updatedGuest.views
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
    .select(`
      title,
      name,
      guests_count,
      token,
      views,
      max_views,
      active
    `)

// ترتیب دلخواه ستون‌ها
const formatted =
  data.map((g) => ({
    "عنوان": g.title,
    "نام مهمان": g.name,
    "تعداد نفرات": g.guests_count,
    "توکن": g.token,
    "بازدید": g.views,
    "حداکثر": g.max_views,
    "وضعیت":
      g.active
        ? "فعال"
        : "مسدود"
  }))

const wb =
  xlsx.utils.book_new()

const ws =
  xlsx.utils.json_to_sheet(
    formatted
  )

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
// BACKUP JSON
// ========================
app.get("/api/backup", verifyToken, async (req, res) => {

  const { data, error } = await supabase
    .from("guests")
    .select("*")

  if (error) {
    return res.status(500).json({
      success: false,
      error
    })
  }

  res.setHeader("Content-Type", "application/json")
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=backup.json"
  )

  return res.status(200).send(JSON.stringify(data, null, 2))
})

// ========================
// RESTORE JSON
// ========================

app.post(
"/api/restore",
verifyToken,
async (req, res) => {

const guests = req.body

// ========================
// VALIDATION
// ========================
if (!Array.isArray(guests)) {

  return res.status(400).json({
    success: false,
    message: "Invalid backup file"
  })
}

if (guests.length === 0) {

  return res.status(400).json({
    success: false,
    message: "Backup file is empty"
  })
}

try {

  // ========================
  // DELETE ALL OLD DATA
  // ========================
  const { error: deleteError } =
   await supabase
     .from("guests")
     .delete()
     .not("id", "is", null)

  if (deleteError) {

    return res.status(500).json({
      success: false,
      error: deleteError
    })
  }

  // ========================
  // CLEAN BACKUP DATA
  // ========================
  // پاکسازی داده‌ها قبل از restore
  const cleanedGuests =
  guests.map((g) => ({

  name:
    g.name || "",

  title:
    g.title || "خانواده",

  token:
    g.token ||
    crypto.randomBytes(24).toString("base64url"),

  guests_count:
    Number(g.guests_count || 1),

  max_views:
    Number(g.max_views || 1),

  views:
    Number(g.views || 0),

  active:
    g.active ?? true

  // عمداً id و created_at ریستور نمی‌شوند

  }))

  // ========================
  // INSERT BACKUP
  // ========================
for (let i = 0; i < cleanedGuests.length; i += 20) {

const chunk =
cleanedGuests.slice(i, i + 20)

const { error: insertError } =
await supabase
.from("guests")
.insert(chunk)

if (insertError) {

return res.status(500).json({
  success: false,
  error: insertError
})

}
}

  // ========================
  // SUCCESS
  // ========================
  res.json({
    success: true
  })

} catch (err) {

  console.error(
    "Restore error:",
    err
  )

  return res.status(500).json({
    success: false,
    message: "Restore failed"
  })
}

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

      return res.status(401).json({
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

      return res.status(400).json({
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
const PORT =
  process.env.PORT || 3001

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    
    console.log(
      `Server running on port ${PORT}`
    )
  }
)