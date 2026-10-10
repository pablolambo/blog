---
title: "Why you shouldn’t store passwords in browsers"
date: 2024-06-17
author: Paweł Frankowski
category: security
tags: [security, password, login, encryption]
---

Saving passwords in a browser is convenient: you log in once and the form is filled in for you from then on. The trade-off is that anyone who gets into your browser profile, or your browser account, can read those passwords too.

## How browsers protect saved passwords

Browsers do encrypt saved passwords, but the key to decrypt them has to be available on the same machine. On Windows, Chromium-based browsers such as Chrome generate a random key, protect it with DPAPI, and store the protected key in the `Local State` file. When the browser starts, it decrypts that key with `CryptUnprotectData`, which works for any process running under your Windows user account. [Chromium source](https://chromium.googlesource.com/chromium/src/+/282cd8a/components/os_crypt/os_crypt_win.cc)

So the encryption protects your passwords from people who only have the files, but not from anything running as you. Malware running under your account can make the same call the browser makes.

Browser sync adds another risk. Your passwords are copied to your browser account and onto every device you sign in on. Anyone who gets into that account, for example with a stolen password or a session on a lost device, can download them. Many people also never sign out of their browser profile, so the passwords stay readable for anyone who sits down at the computer.

## What a password manager does differently

A password manager encrypts your vault with a key derived from your master password. Bitwarden documents this design: the master password never leaves your device, the client derives a master key from it locally using PBKDF2 (600,000 iterations by default) or Argon2id, and only a hash used for authentication is sent to the server. The server stores the encrypted vault and cannot read it. [Bitwarden Security White Paper](https://bitwarden.com/help/bitwarden-security-white-paper/)

That is what “zero knowledge” means: the provider cannot read your passwords. It does not mean nothing can go wrong.

## What you get

- One place for all your passwords, so you don’t need to export them when you switch browsers.
- Secure notes for sensitive information.
- Long, random passwords for each site, so you don’t have to remember any of them.
- Many managers also store two-factor codes.

Bitwarden has a browser extension, a desktop app and a mobile app. They all use the same encrypted vault, so the extension is just one way into it, not a separate product.

## What can go wrong

- **The master password is a single point of failure.** Whoever learns it gets the whole vault. Use a long passphrase and never reuse it anywhere else.
- **A lost master password can mean a lost vault.** Zero-knowledge also means the provider can’t reset it for you. Keep a recovery method written down and stored offline.
- **A manager can’t protect a compromised device.** Malware that runs while your vault is unlocked can still read what you see or copy. Clipboard contents are readable by other programs, so clear them after pasting a password.

## What to do now

1. Export your passwords from the browser if you want to keep them. The export is an unencrypted CSV, so delete the file as soon as it is imported.
2. Import them into a password manager, then check for weak or reused passwords.
3. Delete the saved passwords from the browser and turn off its password saving.
4. Turn on two-factor authentication for important accounts, starting with your email.
5. Lock your computer when you step away from it.

## Why this matters in practice

The threat is rarely a hacker breaking the encryption. It is usually malware that runs as you, or a phished login to the browser account. Infostealer malware is built for exactly this: it looks for the browser’s password store and copies it, and it works because the browser can decrypt its own data. A password manager doesn’t make you immune to that either, but it limits the damage. Malware that copies your browser passwords gets every saved login at once. A manager with a strong master password and two-factor authentication turns the same theft into a much smaller problem.

## Passkeys

Passkeys are a newer option that removes passwords for many sites altogether. A passkey is a key pair: the private key stays on your device or in a password manager that supports passkeys, and the site stores only the public key. There is no shared secret to steal from the server or to phish from you. Where a site offers passkeys, use them, and keep the password manager as the place where they are stored.

## Sources

- [Chromium source: `components/os_crypt/os_crypt_win.cc`](https://chromium.googlesource.com/chromium/src/+/282cd8a/components/os_crypt/os_crypt_win.cc) (pinned revision): the key is encrypted with `CryptProtectData`, stored in Local State, and decrypted with `CryptUnprotectData`.
- [Bitwarden Security White Paper](https://bitwarden.com/help/bitwarden-security-white-paper/): master password handling, key derivation, zero-knowledge design.
