import nodemailer, { SendMailOptions } from "nodemailer";
import { NODEMAILER_AUTH_USER, NODEMAILER_AUTH_PASS } from "constants/env";

// to use Gmail  you need to enable `lesssecureapps` option, you can do this here:
// https://myaccount.google.com/lesssecureapps
// but remember that Gmail will disable if after some time anyway so you have to update it once a while
// found here: https://www.youtube.com/watch?v=Va9UKGs1bwI

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
