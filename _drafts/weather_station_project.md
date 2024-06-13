---
title: "NAS with raspberrypi"
date: 2024-04-04
author: Paweł Frankowski
category: Projects
tags: [raspberry, weather station, project]
---

# Weather Station project 

## The Backstory

My friend gave me a Raspberry Pi 1 for free so that I can tinker a bit. I decided to set up a Network-Attached Storage (NAS) system using OpenMediaVault, I encountered a roadblock when the installation script revealed that my Raspberry Pi 1 model was not supported due to architectural constraints.

```bash
[2024-04-04 20:05:50+0200] [omvinstall] This RPi1 is not supported (not true armhf).  Exiting...
```
![Dog cryin](/docs/assets/images/cryingdog.png)

Yup, I think I need to buy a new one :D

However, this setback led me to discover a plethora of alternative projects and use cases for my trusty, rusty Raspberry Pi 1. While I may not have been able to create a NAS system as initially planned, I found solace in the diverse world of Raspberry Pi projects waiting to be explored.

# The Weather Station

## What do I have?
- Temperature and humidity sensor: DHT11 (module and breadboard jumper wires)
- Raspberry Pi model 1 B+ V1.2
- 5V charger for my raspberry
- Micro SD Card
- 10k ohm resistor (Brown, Black, Orange, Gold)

## DHT11 set up

![DHT11](/docs/assets/images/DHT11–Temperature-Sensor-Pinout.jpg)

## Connecting the cables

![PINS](/docs/assets/images/GPIO-Pinout-Diagram-2.png)

## Packages installation

The packages we are installing are Python 3, its package manager called pip, and finally, the Python virtual environment module.

```bash
sudo apt install python3 python3-pip python3-venv
```

## Future

Maybe create a VPN so I can check the temperature?