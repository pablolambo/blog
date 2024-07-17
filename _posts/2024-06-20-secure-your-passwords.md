---
title: "Why you shouldn’t store passwords in browsers"
date: 2024-06-17
author: Paweł Frankowski
category: security
tags: [security, password, login, encryption]
---

# Why you shouldn’t store passwords in browsers

Storing passwords in browsers might seem convenient, but it poses significant security risks. If someone gains access to your PC, whether you forgot to lock it or through malware, retrieving passwords from the browser is surprisingly easy. Even though browsers encrypt this data, the encryption keys are often stored locally, making it relatively simple for an attacker to decrypt the information.

Most browsers offer account synchronization to keep your data consistent across devices. However, if a hacker gets hold of your browser account, all your synchronized data, including passwords, is at risk. Few users log out of their browser profile after each session, leaving passwords decrypted and accessible to anyone with physical access to the device or through malware.

In contrast, password managers use a master password that users must input to unlock their stored data. All encryption and decryption processes occur locally on the device, ensuring that the master password is never transmitted to the service. Password managers also offer features like two-factor authentication, adding an extra layer of security to protect your accounts from unauthorized access.

# But I need to remember my master password...

Recently, a new feature called "passkeys" has been introduced in many password managers, making it even easier and more secure to log in to your accounts. 

# What Are Passkeys?
Passkeys are a modern authentication method designed to replace traditional passwords. They use cryptographic keys to log you in securely without the need for you to remember a password. Passkeys typically involve user verification methods such as biometrics (fingerprint or facial recognition) or hardware security keys.

# How Do Passkeys Work?
1. Creating a Passkey: When you set up a passkey, the password manager generates a pair of cryptographic keys – a public key and a private key. The public key is stored on the server, while the private key is kept secure on your device.
2. Logging In: When you want to log in, the server sends a challenge to your device. Your device uses the private key to sign this challenge, proving your identity. This signed challenge is sent back to the server, which verifies it using the stored public key. If the verification is successful, you are logged in.
3. User Verification: During this process, you must verify your identity using a biometric factor (like a fingerprint or face scan) or a PIN. This ensures that even if someone has access to your device, they cannot log in without also having your biometric data or PIN.

# Benefits of Using Passkeys
- Enhanced Security: Since passkeys use cryptographic methods and do not rely on passwords that can be guessed or stolen, they provide a higher level of security.
- Convenience: No more remembering complex passwords or changing them regularly. Logging in with a passkey can be as simple as scanning your fingerprint.
- Resistance to Phishing: Passkeys are tied to the specific website they were created for. This makes it much harder for phishing attacks to succeed, as attackers cannot trick you into using your passkey on a fake website.

# Why password manager

1. One place where you store all your passwords. No need to export passwords when switching browsers.
2. You can store important sensitive notes, cool feature.
3. It is impossible to get to your vault without knowing master password.
4. Generate long secure passwords. No need to remember them.

I mean... password manager specifies in storing passwords, right? Why not to use it?