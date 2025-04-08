require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cookiesParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookiesParser());

const FACEBOOK_CLIENT_ID = 1272868310644432;
const FACEBOOK_CLIENT_SECRET = "676b03cf8fe59848cc1c4a1cd26db249";
const CALLBACK_URL = "https://meta-backend-kp8u.onrender.com/auth/facebook/callback";
const CLIENT_URL = "http://localhost:5173";

app.get("/auth/facebook", (req, res) => {
  const url = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${CALLBACK_URL}&scopes=email,public_profile`;
  res.redirect(url);
});

app.get("/auth/facebook/callback", async (req, res) => {
  try {
    const { code } = req.query;

    // code excchanging for access token
    const token = await axios.get(
      `https://graph.facebook.com/v22.0/oauth/access_token?`,
      {
        params: {
          client_id: FACEBOOK_CLIENT_ID,
          client_secret: FACEBOOK_CLIENT_SECRET,
          redirect_uri: CALLBACK_URL,
          code,
        },
      }
    );

    const accessToken = token.data.access_token;
    console.log(accessToken);

    // Fetching the data from Facebook
    const userRes = await axios.get(`https://graph.facebook.com/me?`, {
      params: {
        fields: "email",
        access_token: accessToken,
      },
    });

    const { email } = userRes.data;
    console.log(email);

    if (!email)
      return res.status(400).json({ message: "Email permission not granted" });

    // genrating the jwt token

    const accessjwtToken = jwt.sign(
      {
        email,
      },
      "DEV@RHINON$325",
      { expiresIn: "1h" }
    );

    const refreshjwtToken = jwt.sign(
      {
        email,
      },
      "RHINON$12",
      {
        expiresIn: "7d",
      }
    );

    console.log("AccessToken", accessjwtToken);
    console.log("RefreshToken", refreshjwtToken);

    // storing the jwt in httponly

    res.cookie("token", accessjwtToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshjwtToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${CLIENT_URL}/dashboard`);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

// Refresh token api to generate the new access token if it expires

app.post("/refreshtoken", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log("Refresh", refreshToken);

  if (!refreshToken)
    return res.status(401).json({ message: "Refresh Token Missing" });

  jwt.verify(refreshToken, "RHINON$12", (err, decoded) => {
    if (err) return res.status(404).json({ message: "Invalid Refresh Token" });

    const newAccessToken = jwt.sign(
      { email: decoded.email },
      "DEV@RHINON$325",
      {
        expiresIn: "1h",
      }
    );

    res.cookie(newAccessToken, {
      httpOnly: true,
    });

    res.json({ message: "Refreshed Token" });
  });
});

// to get the user details
app.get("/auth/user", async (req, res) => {
  const token = req.cookies.token;
  console.log("user Token", token);

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, "DEV@RHINON$325");
    res.json({ user: { email: decoded.email } });
  } catch (error) {
    res.status(403).json({ message: "Invalid Token" });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("AccessToken");
  res.clearCookie("RefreshToken");
  res.json({ message: "Logout Successfully" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
