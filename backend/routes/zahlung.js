require("dotenv").config();
const express = require("express");
const querystring = require("querystring");
const mongoose = require("mongoose");
const Unternehmen = require("../models/Unternehmen");

const router = express.Router();

// optional Mollie API usage if module is installed
let mollie = null;
try {
  const createMollieClient = require("@mollie/api-client");
  mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
} catch (e) {
  // module might not be installed in offline environment
}

const CLIENT_ID = process.env.MOLLIE_CLIENT_ID;
const CLIENT_SECRET = process.env.MOLLIE_CLIENT_SECRET;
const DOMAIN = process.env.DOMAIN || "";

// Konto erstellen und in der Datenbank verknüpfen
router.post("/create-account", async (req, res) => {
  const { firebaseUid, name, email } = req.body || {};
  if (!firebaseUid || !name || !email) {
    return res.status(400).json({ error: "firebaseUid, name und email erforderlich" });
  }
  try {
    let unternehmen = await Unternehmen.findOne({ firebaseUid });
    if (!unternehmen) {
      unternehmen = new Unternehmen({ firebaseUid, name, email });
    }
    if (!unternehmen.mollieAccountId) {
      unternehmen.mollieAccountId = new mongoose.Types.ObjectId().toString();
    }
    await unternehmen.save();
    res.json({ accountId: unternehmen.mollieAccountId });
  } catch (err) {
    console.error("create-account error", err);
    res.status(500).json({ error: err.message });
  }
});

// OAuth Authorize URL für das Onboarding erzeugen
router.get("/onboard/:accountId", (req, res) => {
  const { accountId } = req.params;
  const redirectUri = `${DOMAIN}/api/zahlung/oauth/callback`;
  const query = querystring.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "organizations.read organizations.write payments.write onboarding.read",
    state: accountId,
  });
  const url = `https://my.mollie.com/oauth2/authorize?${query}`;
  res.json({ url });
});

// OAuth Callback zum Tauschen des Codes gegen Tokens
router.get("/oauth/callback", async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) {
    return res.status(400).send("Missing code or state");
  }
  try {
    const body = querystring.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${DOMAIN}/api/zahlung/oauth/callback`,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
    const resp = await fetch("https://api.mollie.com/oauth2/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await resp.json();
    await Unternehmen.findOneAndUpdate(
      { mollieAccountId: state },
      { mollieAccessToken: data.access_token, mollieRefreshToken: data.refresh_token }
    );
    res.redirect(`${DOMAIN}/success?mollie=connected`);
  } catch (err) {
    console.error("OAuth callback error", err);
    res.status(500).send("OAuth error");
  }
});

// Accountdaten abrufen
router.get("/account/:uid", async (req, res) => {
  try {
    const unternehmen = await Unternehmen.findOne({ firebaseUid: req.params.uid });
    if (unternehmen && unternehmen.mollieAccountId) {
      return res.json({ accountId: unternehmen.mollieAccountId });
    }
    res.json({});
  } catch (err) {
    console.error("account lookup error", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/create-payment", async (req, res) => {
  const { amount, customerEmail, method } = req.body;
  if (amount == null || !customerEmail || !method) {
    return res.status(400).json({ error: "amount, customerEmail und method sind erforderlich" });
  }
  if (!mollie) {
    return res.status(501).json({ error: "Mollie client not available" });
  }
  try {
    const payment = await mollie.payments.create({
      amount: { value: (amount / 100).toFixed(2), currency: "EUR" },
      description: "Gutschein",
      redirectUrl: `${process.env.DOMAIN}/success`,
      webhookUrl: `${process.env.DOMAIN}/api/webhook`,
      method,
      metadata: { customerEmail }
    });
    res.json({ paymentUrl: payment._links.checkout.href });
  } catch (err) {
    console.error("Mollie-Fehler:", err);
    res.status(500).json({ error: err.message });
  }
  });

module.exports = router;