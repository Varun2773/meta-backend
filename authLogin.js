// require("dotenv").config();
// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const router = express.Router();

// const app = express();
// app.use(cors());

// const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
// const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
// const CALLBACK_URL = "http://localhost:3000/auth/facebook/callback";

// router.get("/auth/facebook", (req, res) => {
//   const url = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${CALLBACK_URL}&scope=email`;
//   res.redirect(url);
// });

// router.get("/auth/facebook/callback", async (req, res) => {
//   try {
//     const { code } = req.query;

//     const token = await axios.get(
//       `https://graph.facebook.com/v18.0/oauth/access_token?`,
//       {
//         params: {
//           client_id: FACEBOOK_CLIENT_ID,
//           client_secret: FACEBOOK_CLIENT_SECRET,
//           redirect_uri: CALLBACK_URL,
//           code,
//         },
//       }
//     );

//     const accessToken = token.data.access_token;
//     console.log(accessToken);

//     const userRes = await axios.get(`https://graph.facebook.com/me?`, {
//       params: {
//         fields: "id,name,email,picture",
//         access_token: accessToken,
//       },
//     });

//     user = userRes.data;
//     console.log(user);

//     const jwtToken = jwt.sign(
//       {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.json({ user, token: jwtToken });
//   } catch (error) {
//     console.error("Error:", error.response?.data || error.message);
//     res.status(500).json({ error: error.message });
//   }
// });


