const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🏃 SEVEN API Server is running!     ║
  ║                                        ║
  ║   PORT: ${PORT}                        ║
  ║   ENV:  ${process.env.NODE_ENV || 'development'}              ║
  ║                                        ║
  ║   http://localhost:${PORT}             ║
  ╚════════════════════════════════════════╝
  `);
});
