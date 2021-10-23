import nodemailer, { SendMailOptions } from "nodemailer";
import { NODEMAILER_AUTH_USER, NODEMAILER_AUTH_PASS } from "constants/env";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: NODEMAILER_AUTH_USER,
    pass: NODEMAILER_AUTH_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export type { SendMailOptions };
