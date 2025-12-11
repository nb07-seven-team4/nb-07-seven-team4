import express from "express";
import * as dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import multer from "multer";

import groupRoutes from "./routes/groupRoutes.js";
// import participantRoutes from "./routes/participantRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import rankRoutes from "./routes/rankRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";

// BigInt → JSON 직렬화
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/groups", groupRoutes);
// app.use("/groups/:groupId/participants", participantRoutes);
app.use("/groups/:groupId/records", recordRoutes);
/**
 * rank및 img기능확인 위한 위의 30,31,32 주석화 하였습니다.
*/
app.use("/groups/:groupId/rank", rankRoutes);
app.use("/images", imageRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({
    message: "SEVEN API Server is running! 🏃",
    version: "1.0.0",
    status: "healthy",
  });
});

// 404 Not Found
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Multer 에러 처리
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "파일 크기가 제한을 초과했습니다 (최대 5MB)",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        error: "예상치 못한 파일 필드입니다",
      });
    }
    return res.status(400).json({
      error: err.message,
    });
  }
  next(err);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  //express global error handler에서 오류 객체의 status를 statusCode로 변경하여 숫자 HTTP 코드만 처리하도록 개선
  res.status(err.statusCode || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Server Start
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🏃 SEVEN API Server is running!      ║
  ║                                        ║
  ║   PORT: ${PORT}                        
  ║   ENV:  ${process.env.NODE_ENV || "development"}              
  ║                                        ║
  ║   http://localhost:${PORT}             
  ╚════════════════════════════════════════╝
  `);
});

// ESM에서 export default
export default app;
