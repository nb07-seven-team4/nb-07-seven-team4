import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";  // prisma client import

dotenv.config();

// BigInt 직렬화 처리 (맨 위에 추가!)
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Express + Prisma + PostgreSQL API Running");
});

app.get("/participants", async (req, res) => {
  try {
    const data = await prisma.participant.findMany({
      include: {
        group: true
      }
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load participants" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
