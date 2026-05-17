import express from "express"
import fs from "fs"
import path from "path"
import csv from "csv-parser"

const app = express()

const PORT = 3000

const RESULT_FOLDER = path.join(process.cwd(), "result")

// ==========================================
// GET STAGE
// ==========================================

app.get("/stage", async (req, res) => {
  try {
    const { symbol, month } = req.query

    if (!symbol || !month) {
      return res.status(400).json({
        error: "Usage: /stage?symbol=RELIANCE&month=05-2026",
      })
    }

    const filePath = path.join(RESULT_FOLDER, `${month}.csv`)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: `File not found for ${month}`,
      })
    }

    let found = false

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        if (row.Symbol?.toUpperCase() === symbol.toUpperCase()) {
          found = true
          return res.json({
            symbol: symbol.toUpperCase(),
            month,
            stage: row.Stage,
          })
        }
      })
      .on("end", () => {
        if (!found) {
          return res.status(404).json({
            error: `Symbol '${symbol}' not found`,
          })
        }
      })
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    })
  }
})

// ==========================================
// HEALTH
// ==========================================

app.get("/", (req, res) => {
  res.json({
    service: "Stage API",
    stage: "/stage?symbol=RELIANCE&month=05-2026",
  })
})

// ==========================================
// START
// ==========================================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app