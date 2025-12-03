const express = require('express');
const dotenv = require('dotenv');
const sdk = require("node-appwrite");

const client = new sdk.Client();

dotenv.config();

client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

