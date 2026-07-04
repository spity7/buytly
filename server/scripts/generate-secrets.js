#!/usr/bin/env node
import { randomBytes } from "crypto";

const secret = () => randomBytes(48).toString("base64url");

console.log("# Add these to your .env file (never commit real secrets)\n");
console.log(`JWT_ACCESS_SECRET=${secret()}`);
console.log(`JWT_REFRESH_SECRET=${secret()}`);
