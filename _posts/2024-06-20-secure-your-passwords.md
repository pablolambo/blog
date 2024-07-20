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

# Why password manager

1. One place where you store all your passwords. No need to export passwords when switching browsers.
2. You can store important sensitive notes, cool feature.
3. It is impossible to get to your vault without knowing master password.
4. Generate long secure passwords. No need to remember them.

I recommend using browser extensions like Bitwarden because they offer enhanced security. Hackers cannot easily intercept the data you copy and paste, making it more secure. Although both password managers and browser extensions provide robust security for your passwords.

I mean... password manager specifies in storing passwords, right? Why not to use it?